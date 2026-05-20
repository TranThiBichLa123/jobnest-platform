package com.jobnest.backend.modules.jobs.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.auth.infrastructure.UserRepository;
import com.jobnest.backend.modules.company.domain.Company;
import com.jobnest.backend.modules.company.infrastructure.CompanyRepository;
import com.jobnest.backend.modules.jobs.api.dto.request.ExtendJobRequest;
import com.jobnest.backend.modules.jobs.api.dto.request.JobCategoryRequest;
import com.jobnest.backend.modules.jobs.api.dto.request.JobRequest;
import com.jobnest.backend.modules.jobs.api.dto.response.JobCategoryResponse;
import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.modules.jobs.domain.Job;
import com.jobnest.backend.modules.jobs.domain.Job.JobStatus;
import com.jobnest.backend.modules.jobs.domain.JobCategory;
import com.jobnest.backend.modules.jobs.domain.JobView;
import com.jobnest.backend.modules.jobs.domain.SavedJob;
import com.jobnest.backend.modules.jobs.infrastructure.JobCategoryRepository;
import com.jobnest.backend.modules.jobs.infrastructure.JobRepository;
import com.jobnest.backend.modules.jobs.infrastructure.JobViewRepository;
import com.jobnest.backend.modules.jobs.infrastructure.SavedJobRepository;
import com.jobnest.backend.shared.audit.domain.AuditLog;
import com.jobnest.backend.shared.audit.infrastructure.AuditLogRepository;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private static final int DEFAULT_JOB_DURATION_DAYS = 30;

    private final JobRepository jobRepository;
    private final JobViewRepository jobViewRepository;
    private final SavedJobRepository savedJobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final JobCategoryRepository jobCategoryRepository;

    @Override
    public Page<JobResponse> getAllActiveJobs(Pageable pageable) {
        return jobRepository.findByStatus(JobStatus.ACTIVE, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public Page<JobResponse> searchActiveJobs(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return getAllActiveJobs(pageable);
        }

        return jobRepository.searchActiveJobs(keyword.trim(), pageable)
                .map(this::convertToResponse);
    }

    @Override
    public Page<JobResponse> searchActiveJobsAdvanced(
            String keyword,
            String location,
            Job.JobType type,
            Long categoryId,
            Integer minSalary,
            Integer maxSalary,
            String experienceLevel,
            Pageable pageable
    ) {
        validateSalaryRange(minSalary, maxSalary);

        return jobRepository.searchActiveJobsAdvanced(
                clean(keyword),
                clean(location),
                type,
                categoryId,
                minSalary,
                maxSalary,
                clean(experienceLevel),
                pageable
        ).map(this::convertToResponse);
    }

    @Override
    @Transactional
    public JobResponse getJobById(Long id, Long viewerId, String viewerIp) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() != JobStatus.ACTIVE || isExpired(job)) {
            throw new ResourceNotFoundException("Job not found or not available");
        }

        boolean alreadyViewed = false;

        if (viewerId != null) {
            alreadyViewed = jobViewRepository.existsByJobIdAndViewerId(id, viewerId);
        } else if (viewerIp != null && !viewerIp.isBlank()) {
            alreadyViewed = jobViewRepository.existsByJobIdAndViewerIp(id, viewerIp);
        }

        if (!alreadyViewed) {
            JobView jobView = new JobView();
            jobView.setJobId(id);
            jobView.setViewerId(viewerId);
            jobView.setViewerIp(viewerIp);
            jobViewRepository.save(jobView);
        }

        JobResponse response = convertToResponse(job);
        response.setViewCount(jobViewRepository.countByJobId(id));

        if (viewerId != null) {
            response.setIsSaved(savedJobRepository.existsByIdUserIdAndIdJobId(viewerId, id));
        }

        return response;
    }

    @Override
    public List<JobCategoryResponse> getCategoryStats() {
        return jobRepository.countActiveJobsByCategory(JobStatus.ACTIVE)
                .stream()
                .map(row -> new JobCategoryResponse(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        null,
                        (Long) row[4]
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, JobRequest request) {
        Account employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        if (employer.getRole() != Account.Role.EMPLOYER) {
            throw new BadRequestException("Only employer can create job");
        }

        validateJobRequest(request);

        Company company = companyRepository.findByEmployerIdAndId(employerId, request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found or does not belong to this employer"));

        if (!Boolean.TRUE.equals(company.getVerified()) || company.getStatus() != Company.CompanyStatus.VERIFIED) {
            throw new BadRequestException("Company must be verified by admin before posting jobs");
        }

        jobCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Job job = new Job();
        applyRequestToJob(job, request);
        job.setEmployerId(employerId);
        job.setStatus(JobStatus.PENDING_REVIEW);
        job.setExpiresAt(LocalDateTime.now().plusDays(DEFAULT_JOB_DURATION_DAYS));

        return convertToResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long employerId, Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        ensureJobOwner(job, employerId);
        validateJobRequest(request);

        Company company = companyRepository.findByEmployerIdAndId(employerId, request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found or does not belong to this employer"));

        if (!Boolean.TRUE.equals(company.getVerified()) || company.getStatus() != Company.CompanyStatus.VERIFIED) {
            throw new BadRequestException("Company must be verified by admin before posting jobs");
        }

        jobCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        applyRequestToJob(job, request);

        if (job.getStatus() != JobStatus.HIDDEN && job.getStatus() != JobStatus.EXPIRED) {
            job.setStatus(JobStatus.PENDING_REVIEW);
        }

        return convertToResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public void hideJob(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        ensureJobOwner(job, employerId);

        job.setStatus(JobStatus.HIDDEN);
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void unhideJob(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        ensureJobOwner(job, employerId);

        job.setStatus(JobStatus.PENDING_REVIEW);
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void extendJob(Long employerId, Long jobId, ExtendJobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        ensureJobOwner(job, employerId);

        if (request == null || request.getDays() == null || request.getDays() <= 0) {
            throw new BadRequestException("Extend days must be greater than 0");
        }

        LocalDateTime base = job.getExpiresAt() != null && job.getExpiresAt().isAfter(LocalDateTime.now())
                ? job.getExpiresAt()
                : LocalDateTime.now();

        job.setExpiresAt(base.plusDays(request.getDays()));
        job.setStatus(JobStatus.PENDING_REVIEW);
        jobRepository.save(job);
    }

    @Override
    public Page<JobResponse> getEmployerJobs(Long employerId, Pageable pageable) {
        return jobRepository.findByEmployerId(employerId, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public List<JobResponse> getAllEmployerJobs(Long employerId) {
        return jobRepository.findByEmployerIdWithCategory(employerId)
                .stream()
                .filter(job -> job.getStatus() == JobStatus.ACTIVE && !isExpired(job))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<JobResponse> getJobsForAdmin(JobStatus status, String keyword, Pageable pageable) {
        return jobRepository.searchJobsForAdmin(status, clean(keyword), pageable)
                .map(this::convertToResponse);
    }

    @Override
    @Transactional
    public void approveJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        Company company = companyRepository.findById(job.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (!Boolean.TRUE.equals(company.getVerified()) || company.getStatus() != Company.CompanyStatus.VERIFIED) {
            throw new BadRequestException("Cannot approve job because company is not verified");
        }

        if (isExpired(job)) {
            throw new BadRequestException("Cannot approve expired job");
        }

        job.setStatus(JobStatus.ACTIVE);
        jobRepository.save(job);

        logAdminAction(adminId, "APPROVE_JOB", "Job", jobId, "Approved job: " + job.getTitle());
    }

    @Override
    @Transactional
    public void rejectJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        job.setStatus(JobStatus.REJECTED);
        jobRepository.save(job);

        logAdminAction(adminId, "REJECT_JOB", "Job", jobId, "Rejected job: " + job.getTitle());
    }

    @Override
    @Transactional
    public void adminHideJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        job.setStatus(JobStatus.HIDDEN);
        jobRepository.save(job);

        logAdminAction(adminId, "HIDE_JOB", "Job", jobId, "Hidden job: " + job.getTitle());
    }

    @Override
    @Transactional
    public void restoreJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (isExpired(job)) {
            throw new BadRequestException("Cannot restore expired job");
        }

        job.setStatus(JobStatus.PENDING_REVIEW);
        jobRepository.save(job);

        logAdminAction(adminId, "RESTORE_JOB", "Job", jobId, "Restored job to pending review: " + job.getTitle());
    }

    @Override
    @Transactional
    public void saveJob(Long userId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() != JobStatus.ACTIVE || isExpired(job)) {
            throw new BadRequestException("Only active jobs can be saved");
        }

        Account user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Account.Role.CANDIDATE) {
            throw new BadRequestException("Only candidate can save job");
        }

        if (savedJobRepository.existsByIdUserIdAndIdJobId(userId, jobId)) {
            return;
        }

        SavedJob.SavedJobId id = new SavedJob.SavedJobId();
        id.setUserId(userId);
        id.setJobId(jobId);

        SavedJob savedJob = new SavedJob();
        savedJob.setId(id);
        savedJob.setUser(user);
        savedJob.setJob(job);

        savedJobRepository.save(savedJob);
    }

    @Override
    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        savedJobRepository.deleteByIdUserIdAndIdJobId(userId, jobId);
    }

    @Override
    public List<JobResponse> getSavedJobs(Long userId) {
        return savedJobRepository.findByUserIdWithJob(userId, Pageable.unpaged())
                .stream()
                .map(savedJob -> {
                    JobResponse response = convertToResponse(savedJob.getJob());
                    response.setIsSaved(true);
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobCategoryResponse createCategory(JobCategoryRequest request) {
        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Category name is required");
        }

        if (jobCategoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Job category already exists");
        }

        String slug = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        if (jobCategoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Job category slug already exists");
        }

        JobCategory category = JobCategory.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .build();

        JobCategory savedCategory = jobCategoryRepository.save(category);

        return JobCategoryResponse.builder()
                .id(savedCategory.getId())
                .name(savedCategory.getName())
                .slug(savedCategory.getSlug())
                .description(savedCategory.getDescription())
                .build();
    }

    private void applyRequestToJob(Job job, JobRequest request) {
        job.setCompanyId(request.getCompanyId());
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());
        job.setCategoryId(request.getCategoryId());
        job.setLocation(request.getLocation().trim());
        job.setType(request.getType());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setExperience(clean(request.getExperience()));
        job.setExperienceLevel(clean(request.getExperienceLevel()));
        job.setEducation(clean(request.getEducation()));
        job.setSkills(clean(request.getSkills()));
        job.setIsUrgent(Boolean.TRUE.equals(request.getIsUrgent()));
    }

    private void validateJobRequest(JobRequest request) {
        if (request == null) {
            throw new BadRequestException("Job request is required");
        }

        if (request.getCompanyId() == null) {
            throw new BadRequestException("Verified company is required before posting a job");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Job title is required");
        }

        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new BadRequestException("Job description is required");
        }

        if (request.getCategoryId() == null) {
            throw new BadRequestException("Job category is required");
        }

        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new BadRequestException("Job location is required");
        }

        if (request.getType() == null) {
            throw new BadRequestException("Job type is required");
        }

        validateSalaryRange(request.getMinSalary(), request.getMaxSalary());
    }

    private void validateSalaryRange(Integer minSalary, Integer maxSalary) {
        if (minSalary != null && minSalary < 0) {
            throw new BadRequestException("Minimum salary must be >= 0");
        }

        if (maxSalary != null && maxSalary < 0) {
            throw new BadRequestException("Maximum salary must be >= 0");
        }

        if (minSalary != null && maxSalary != null && minSalary > maxSalary) {
            throw new BadRequestException("Minimum salary must be <= maximum salary");
        }
    }

    private void ensureJobOwner(Job job, Long employerId) {
        if (!Objects.equals(job.getEmployerId(), employerId)) {
            throw new BadRequestException("Not authorized to manage this job");
        }
    }

    private boolean isExpired(Job job) {
        return job.getExpiresAt() != null && job.getExpiresAt().isBefore(LocalDateTime.now());
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private JobResponse convertToResponse(Job job) {
        JobResponse response = new JobResponse(job);

        userRepository.findById(job.getEmployerId()).ifPresent(account ->
                response.setEmployerName(account.getUsername())
        );

        if (job.getCompanyId() != null) {
            companyRepository.findById(job.getCompanyId()).ifPresent(company -> {
                response.setCompanyName(company.getName());
                response.setCompanyLogo(company.getLogoUrl());
            });
        }

        return response;
    }

    private void logAdminAction(
            Long adminId,
            String action,
            String targetType,
            Long targetId,
            String message
    ) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode details = mapper.createObjectNode();
        details.put("message", message);
        details.put("time", LocalDateTime.now().toString());

        AuditLog log = new AuditLog();
        log.setAdminId(adminId);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);

        auditLogRepository.save(log);
    }
}