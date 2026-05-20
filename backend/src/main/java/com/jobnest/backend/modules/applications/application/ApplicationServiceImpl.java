package com.jobnest.backend.modules.applications.application;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import com.jobnest.backend.modules.applications.domain.Application;
import com.jobnest.backend.modules.applications.infrastructure.ApplicationRepository;
import com.jobnest.backend.modules.candidate.domain.CandidateCV;
import com.jobnest.backend.modules.candidate.domain.CandidateProfile;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateCVRepository;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import com.jobnest.backend.modules.jobs.domain.Job;
import com.jobnest.backend.modules.jobs.infrastructure.JobRepository;
import com.jobnest.backend.modules.notification.application.NotificationService;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateCVRepository candidateCVRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ApplicationResponse applyForJob(Long jobId, Long candidateId, ApplicationRequest request) {
        if (request == null) {
            throw new BadRequestException("Application request is required");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new BadRequestException("Only active jobs can receive applications");
        }

        if (job.getExpiresAt() != null && job.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This job has expired");
        }

        CandidateProfile candidate = candidateProfileRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        if (request.getCvId() == null) {
            throw new BadRequestException("CV is required when applying for a job");
        }

        CandidateCV cv = candidateCVRepository.findById(request.getCvId())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new AccessDeniedException("You can only apply using your own CV");
        }

        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            throw new BadRequestException("You have already applied for this job");
        }

        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setCvId(cv.getId());
        application.setCoverLetter(clean(request.getCoverLetter()));
        application.setResumeUrl(cv.getFileUrl());
        application.setStatus(Application.ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());

        Application saved = applicationRepository.save(application);

        notifyApplyBestEffort(saved, job, candidate);

        return new ApplicationResponse(saved);
    }

    @Override
    public boolean hasApplied(Long jobId, Long candidateId) {
        return applicationRepository.existsByJobIdAndCandidateIdAndStatusIn(
                jobId,
                candidateId,
                List.of(
                        Application.ApplicationStatus.PENDING,
                        Application.ApplicationStatus.REVIEWED,
                        Application.ApplicationStatus.SHORTLISTED,
                        Application.ApplicationStatus.ACCEPTED,
                        Application.ApplicationStatus.REJECTED
                )
        );
    }

    @Override
    public String getCandidateApplicationStatusForJob(Long jobId, Long candidateId) {
        return applicationRepository
                .findTopByJobIdAndCandidateIdOrderByAppliedAtDesc(jobId, candidateId)
                .map(application -> application.getStatus().name())
                .orElse(null);
    }

    @Override
    public Page<ApplicationResponse> getJobApplications(Long jobId, Long employerId, Pageable pageable) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new AccessDeniedException("You can only view applications for your own jobs");
        }

        return applicationRepository.findByJobId(jobId, pageable)
                .map(ApplicationResponse::new);
    }

    @Override
    public Page<ApplicationResponse> getCandidateApplications(Long candidateId, Pageable pageable) {
        return applicationRepository.findByCandidateId(candidateId, pageable)
                .map(ApplicationResponse::new);
    }

    @Override
    public ApplicationResponse getApplicationByIdForCandidate(Long applicationId, Long candidateId) {
        Application application = applicationRepository.findWithDetailsById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getCandidate().getId().equals(candidateId)) {
            throw new AccessDeniedException("You can only view your own applications");
        }

        return new ApplicationResponse(application);
    }

    @Override
    public ApplicationResponse getApplicationByIdForEmployer(Long applicationId, Long employerId) {
        Application application = applicationRepository.findWithDetailsById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getJob().getEmployerId().equals(employerId)) {
            throw new AccessDeniedException("You can only view applications for your own jobs");
        }

        return new ApplicationResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(
            Long applicationId,
            Long employerId,
            String status,
            String notes
    ) {
        Application application = applicationRepository.findWithDetailsById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getJob().getEmployerId().equals(employerId)) {
            throw new AccessDeniedException("You can only update applications for your own jobs");
        }

        if (status == null || status.isBlank()) {
            throw new BadRequestException("Application status is required");
        }

        Application.ApplicationStatus newStatus;
        try {
            newStatus = Application.ApplicationStatus.valueOf(status.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid application status");
        }

        if (application.getStatus() == Application.ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Withdrawn applications cannot be updated");
        }

        application.setStatus(newStatus);
        application.setNotes(clean(notes));
        application.setReviewedAt(LocalDateTime.now());

        Application updated = applicationRepository.save(application);

        notifyStatusChangedBestEffort(updated, newStatus);

        return new ApplicationResponse(updated);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, Long candidateId) {
        Application application = applicationRepository.findWithDetailsById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getCandidate().getId().equals(candidateId)) {
            throw new AccessDeniedException("You can only withdraw your own applications");
        }

        if (application.getStatus() != Application.ApplicationStatus.PENDING) {
            throw new BadRequestException("Only pending applications can be withdrawn");
        }

        application.setStatus(Application.ApplicationStatus.WITHDRAWN);
        application.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(application);
    }

    @Override
    public long countApplications(Long jobId, Long employerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new AccessDeniedException("You can only count applications for your own jobs");
        }

        return applicationRepository.countByJobId(jobId);
    }

    private void notifyApplyBestEffort(Application saved, Job job, CandidateProfile candidate) {
        try {
            notificationService.createNotification(
                    job.getEmployerId(),
                    "New application received",
                    "A candidate has applied for your job: " + job.getTitle(),
                    "NEW_APPLICATION",
                    saved.getId()
            );
        } catch (Exception ex) {
            log.warn("Best-effort notification failed for employer. applicationId={}", saved.getId(), ex);
        }

        try {
            notificationService.createNotification(
                    candidate.getUser(),
                    "Application submitted",
                    "You have successfully applied for: " + job.getTitle(),
                    "APPLICATION_SUBMITTED",
                    saved.getId()
            );
        } catch (Exception ex) {
            log.warn("Best-effort notification failed for candidate. applicationId={}", saved.getId(), ex);
        }
    }

    private void notifyStatusChangedBestEffort(Application application, Application.ApplicationStatus newStatus) {
        try {
            notificationService.notifyApplicationStatusChanged(
                    application.getCandidate().getUser(),
                    application
            );
        } catch (Exception ex) {
            log.warn("Best-effort notification failed when status changed. applicationId={}", application.getId(), ex);
        }

        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + application.getCandidate().getId(),
                    "Your application status has been updated to: " + newStatus.name()
            );
        } catch (Exception ex) {
            log.warn("Best-effort websocket notification failed. applicationId={}", application.getId(), ex);
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}