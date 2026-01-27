package com.jobnest.backend.service.job;

import com.jobnest.backend.dto.response.JobCategoryResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jobnest.backend.dto.request.ExtendJobRequest;
import com.jobnest.backend.dto.request.JobCategoryRequest;
import com.jobnest.backend.dto.request.JobRequest;
import com.jobnest.backend.dto.response.JobResponse;
import com.jobnest.backend.entities.*;
import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.entities.job.Job;
import com.jobnest.backend.entities.job.Job.JobStatus;
import com.jobnest.backend.entities.job.JobCategory;
import com.jobnest.backend.entities.job.JobView;
import com.jobnest.backend.entities.job.SavedJob;
import com.jobnest.backend.entities.system.AuditLog;
import com.jobnest.backend.repository.*;
import com.jobnest.backend.repository.auth.UserRepository;
import com.jobnest.backend.repository.company.CompanyRepository;
import com.jobnest.backend.repository.job.JobCategoryRepository;
import com.jobnest.backend.repository.job.JobRepository;
import com.jobnest.backend.repository.job.JobViewRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobViewRepository jobViewRepository;
    private final SavedJobRepository savedJobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final JobCategoryRepository jobCategoryRepository;

    // ==================== CANDIDATE OPERATIONS ====================

    @Override
    public Page<JobResponse> getAllActiveJobs(Pageable pageable) {
        // Use fetch join to avoid LazyInitializationException
        List<Job> jobs = jobRepository.findByStatusWithCategory(Job.JobStatus.ACTIVE);
        List<JobResponse> responses = jobs.stream().map(this::convertToResponse).collect(Collectors.toList());
        // Manually create a Page from the list (since fetch join disables pagination)
        int pageSize = pageable.getPageSize();
        int currentPage = pageable.getPageNumber();
        int startItem = currentPage * pageSize;
        List<JobResponse> pageContent;
        if (jobs.size() < startItem) {
            pageContent = List.of();
        } else {
            int toIndex = Math.min(startItem + pageSize, jobs.size());
            pageContent = responses.subList(startItem, toIndex);
        }
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, jobs.size());
    }

    @Override
    public Page<JobResponse> searchActiveJobs(String keyword, Pageable pageable) {
        return jobRepository.searchActiveJobs(keyword, pageable)
                .map(this::convertToResponse);
    }

    
    @Override
    @Transactional
    public JobResponse getJobById(Long id, Long viewerId, String viewerIp) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Record view if not already viewed
        boolean alreadyViewed = false;
        if (viewerId != null) {
            alreadyViewed = jobViewRepository.existsByJobIdAndViewerId(id, viewerId);
        } else if (viewerIp != null) {
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
            response.setIsSaved(savedJobRepository.existsByUserIdAndJobId(viewerId, id));
        }
        return response;
    }

    @Override
    public List<JobCategoryResponse> getCategoryStats() {
        List<Object[]> results =jobRepository.countActiveJobsByCategory(JobStatus.ACTIVE);

        return results.stream()
                .map(row -> new JobCategoryResponse(
                        (Long) row[0], // id
                        (String) row[1], // name
                        (String) row[2], // slug
                        (String) row[3], // iconUrl
                        null, // description (not needed for stats)
                        (Long) row[4] // openPositions
                ))
                .collect(Collectors.toList());
    }

    // ==================== EMPLOYER OPERATIONS ====================

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, JobRequest request) {
        // Verify employer exists
        userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        // Verify company exists and belongs to employer (if companyId is provided)
        if (request.getCompanyId() != null) {
            companyRepository.findByEmployerIdAndId(employerId, request.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found or does not belong to this employer"));
        }

        // Verify category exists
        jobCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Job job = new Job();
        job.setEmployerId(employerId);
        job.setCompanyId(request.getCompanyId());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCategoryId(request.getCategoryId());
        job.setLocation(request.getLocation());
        job.setType(request.getType());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setExperience(request.getExperience());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setEducation(request.getEducation());
        job.setSkills(request.getSkills());
        job.setIsUrgent(request.getIsUrgent());
        job.setStatus(Job.JobStatus.ACTIVE);
        job.setExpiresAt(LocalDateTime.now().plusDays(30)); // Default 30 days

        Job saved = jobRepository.save(job);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long employerId, Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized to update this job");
        }

        // Verify company exists and belongs to employer (if companyId is provided)
        if (request.getCompanyId() != null) {
            companyRepository.findByEmployerIdAndId(employerId, request.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found or does not belong to this employer"));
        }

        // Verify category exists
        if (request.getCategoryId() != null) {
            jobCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        job.setCompanyId(request.getCompanyId());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCategoryId(request.getCategoryId());
        job.setLocation(request.getLocation());
        job.setType(request.getType());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setExperience(request.getExperience());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setEducation(request.getEducation());
        job.setSkills(request.getSkills());
        job.setIsUrgent(request.getIsUrgent());

        Job updated = jobRepository.save(job);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void hideJob(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized to hide this job");
        }

        job.setStatus(Job.JobStatus.HIDDEN);
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void unhideJob(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized to unhide this job");
        }

        job.setStatus(Job.JobStatus.ACTIVE);
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void extendJob(Long employerId, Long jobId, ExtendJobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Not authorized to extend this job");
        }

        LocalDateTime newExpiresAt = job.getExpiresAt() != null
                ? job.getExpiresAt().plusDays(request.getDays())
                : LocalDateTime.now().plusDays(request.getDays());

        job.setExpiresAt(newExpiresAt);
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
        .map(this::convertToResponse)
        .collect(Collectors.toList());}


    // ==================== ADMIN OPERATIONS ====================

    @Override
    public Page<JobResponse> getAllJobs(Pageable pageable) {
        return jobRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    @Override
    @Transactional
    public void approveJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus(Job.JobStatus.ACTIVE);
        jobRepository.save(job);

        logAdminAction(adminId, "APPROVE_JOB", "Job", jobId,
                "Approved job: " + job.getTitle());
    }

    @Override
    @Transactional
    public void rejectJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus(Job.JobStatus.HIDDEN);
        jobRepository.save(job);

        logAdminAction(adminId, "REJECT_JOB", "Job", jobId,
                "Rejected job: " + job.getTitle());
    }

    @Override
    @Transactional
    public void adminHideJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus(Job.JobStatus.HIDDEN);
        jobRepository.save(job);

        logAdminAction(adminId, "HIDE_JOB", "Job", jobId,
                "Hidden job: " + job.getTitle());
    }

    @Override
    @Transactional
    public void restoreJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus(Job.JobStatus.ACTIVE);
        jobRepository.save(job);

        logAdminAction(adminId, "RESTORE_JOB", "Job", jobId,
                "Restored job: " + job.getTitle());
    }

    // ==================== SAVED JOBS ====================

    @Override
    @Transactional
    public void saveJob(Long userId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Account user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SavedJob.SavedJobId id = new SavedJob.SavedJobId();
        id.setUserId(userId);
        id.setJobId(jobId);

        if (!savedJobRepository.existsById(id)) {
            SavedJob savedJob = new SavedJob();
            savedJob.setId(id);
            savedJob.setUser(user); // Set the user entity
            savedJob.setJob(job); // Set the job entity
            savedJobRepository.save(savedJob);
        }
    }

    @Override
    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        SavedJob.SavedJobId id = new SavedJob.SavedJobId();
        id.setUserId(userId);
        id.setJobId(jobId);
        savedJobRepository.deleteById(id);
    }

    @Override
    public List<JobResponse> getSavedJobs(Long userId) {
        return savedJobRepository.findByUserIdWithJob(userId, Pageable.unpaged()).stream()
                .map(savedJob -> {
                    Job job = savedJob.getJob();
                    JobResponse response = convertToResponse(job);
                    response.setIsSaved(true);
                    return response;
                })
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    private JobResponse convertToResponse(Job job) {
        JobResponse response = new JobResponse(job);

        // Get employer name
        userRepository.findById(job.getEmployerId()).ifPresent(account -> {
            response.setEmployerName(account.getUsername());
        });

        // Get company info if companyId exists
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
            String message) {
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

    @Override
    @Transactional
    public JobCategoryResponse createCategory(JobCategoryRequest request) {

        // 1. Check trùng name
        if (jobCategoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Job category already exists");
        }

        // 2. Sinh slug từ name
        String slug = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        // 3. Check trùng slug (PHẢI CÓ)
        if (jobCategoryRepository.existsBySlug(slug)) {
            throw new RuntimeException("Job category slug already exists");
        }

        // 4. Build entity (ĐẦY ĐỦ FIELD BẮT BUỘC)
        JobCategory category = JobCategory.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .build();

        // 5. Save
        JobCategory savedCategory = jobCategoryRepository.save(category);

        // 6. Response
        return JobCategoryResponse.builder()
                .id(savedCategory.getId())
                .name(savedCategory.getName())
                .slug(savedCategory.getSlug())
                .description(savedCategory.getDescription())
                .build();
    }

}
