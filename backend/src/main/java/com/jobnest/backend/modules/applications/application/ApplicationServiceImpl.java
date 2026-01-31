package com.jobnest.backend.modules.applications.application;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import com.jobnest.backend.modules.applications.domain.Application;
import com.jobnest.backend.modules.applications.infrastructure.ApplicationRepository;
import com.jobnest.backend.modules.candidate.domain.CandidateProfile;
import com.jobnest.backend.modules.jobs.domain.Job;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import com.jobnest.backend.modules.jobs.infrastructure.JobRepository;
import com.jobnest.backend.modules.notification.application.NotificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ApplicationResponse applyForJob(Long jobId, Long candidateId, ApplicationRequest request) {
        //  CHỈ CHO APPLY LẠI NẾU ĐƠN GẦN NHẤT ĐÃ RÚT (WITHDRAWN)
        Optional<Application> latestApp =
            applicationRepository.findTopByJobIdAndCandidateIdOrderByAppliedAtDesc(jobId, candidateId);

        if (latestApp.isPresent()) {
            Application app = latestApp.get();
            if (!app.getStatus().equals(Application.ApplicationStatus.WITHDRAWN)) {
                throw new RuntimeException(
                    "You have already applied for this job and cannot apply again."
                );
            }
        }

        // Get job
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        // Get candidate profile
        CandidateProfile candidate = candidateProfileRepository.findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        // Create application
        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setCvId(request.getCvId());
        application.setCoverLetter(request.getCoverLetter());
        application.setResumeUrl(request.getResumeUrl());
        application.setStatus(Application.ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());

        Application saved = applicationRepository.save(application);

        // CREATE NOTIFICATION FOR EMPLOYER
        Long employerId = job.getEmployer().getId();
        notificationService.createNotification(
            employerId,
            "New CV Submitted",
            "A new candidate has applied for your job: " + job.getTitle(),
            "NEW_APPLICATION",
            saved.getId()
        );

        // Notify candidate
        notificationService.createNotification(
            // Lấy đúng account của candidate profile
            candidate.getUser(), // hoặc candidate.getAccount(), tuỳ entity của bạn
            "Application Submitted",
            "You have successfully applied for the position: " + job.getTitle(),
            "APPLICATION_SUBMITTED",
            saved.getId()
        );

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
                Application.ApplicationStatus.ACCEPTED
            )
        );
    }

    @Override
    public Page<ApplicationResponse> getJobApplications(Long jobId, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByJobId(jobId, pageable);
        return applications.map(ApplicationResponse::new);
    }

    @Override
    public Page<ApplicationResponse> getCandidateApplications(Long candidateId, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByCandidateIdWithDetails(candidateId, pageable);
        return applications.map(ApplicationResponse::new);
    }

    @Override
    public ApplicationResponse getApplicationById(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        return new ApplicationResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, String status, String notes) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(Application.ApplicationStatus.valueOf(status.toUpperCase()));
        application.setNotes(notes);
        application.setReviewedAt(LocalDateTime.now());

        Application updated = applicationRepository.save(application);

        //  MISSING PART – BỔ SUNG Ở ĐÂY
        notificationService.notifyApplicationStatusChanged(
            application.getCandidate().getUser(), // Account của candidate
            application
        );

        // Send WebSocket notification to candidate
        Long candidateId = application.getCandidate().getId();
        String notification = "Your application status has been updated to: " + status;
        messagingTemplate.convertAndSend("/topic/notifications/" + candidateId, notification);

        return new ApplicationResponse(updated);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, Long candidateId) {
        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        //  Không cho rút đơn của người khác
        if (!app.getCandidate().getId().equals(candidateId)) {
            throw new AccessDeniedException("Not your application");
        }

        //  CHẶN RÚT KHI ĐÃ ĐƯỢC XỬ LÝ
        if (!app.getStatus().equals(Application.ApplicationStatus.PENDING)) {
            throw new IllegalStateException(
                "Only pending applications can be withdrawn"
            );
        }

        //  RÚT MỀM (soft delete)
        app.setStatus(Application.ApplicationStatus.WITHDRAWN);
        app.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(app);
    }

    @Override
    public long countApplications(Long jobId) {
        return applicationRepository.countByJobId(jobId);
    }
}
