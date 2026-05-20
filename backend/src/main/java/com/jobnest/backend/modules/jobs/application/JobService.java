package com.jobnest.backend.modules.jobs.application;

import com.jobnest.backend.modules.jobs.api.dto.request.ExtendJobRequest;
import com.jobnest.backend.modules.jobs.api.dto.request.JobCategoryRequest;
import com.jobnest.backend.modules.jobs.api.dto.request.JobRequest;
import com.jobnest.backend.modules.jobs.api.dto.response.JobCategoryResponse;
import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.modules.jobs.domain.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobService {

    Page<JobResponse> getAllActiveJobs(Pageable pageable);

    Page<JobResponse> searchActiveJobs(String keyword, Pageable pageable);

    Page<JobResponse> searchActiveJobsAdvanced(
            String keyword,
            String location,
            Job.JobType type,
            Long categoryId,
            Integer minSalary,
            Integer maxSalary,
            String experienceLevel,
            Pageable pageable
    );

    JobResponse getJobById(Long id, Long viewerId, String viewerIp);

    List<JobCategoryResponse> getCategoryStats();

    JobCategoryResponse createCategory(JobCategoryRequest request);

    JobResponse createJob(Long employerId, JobRequest request);

    JobResponse updateJob(Long employerId, Long jobId, JobRequest request);

    void hideJob(Long employerId, Long jobId);

    void unhideJob(Long employerId, Long jobId);

    void extendJob(Long employerId, Long jobId, ExtendJobRequest request);

    Page<JobResponse> getEmployerJobs(Long employerId, Pageable pageable);

    List<JobResponse> getAllEmployerJobs(Long employerId);

    Page<JobResponse> getJobsForAdmin(Job.JobStatus status, String keyword, Pageable pageable);

    void approveJob(Long adminId, Long jobId);

    void rejectJob(Long adminId, Long jobId);

    void adminHideJob(Long adminId, Long jobId);

    void restoreJob(Long adminId, Long jobId);

    void saveJob(Long userId, Long jobId);

    void unsaveJob(Long userId, Long jobId);

    List<JobResponse> getSavedJobs(Long userId);
}