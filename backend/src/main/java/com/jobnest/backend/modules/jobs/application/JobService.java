package com.jobnest.backend.modules.jobs.application;

import com.jobnest.backend.modules.jobs.api.dto.response.JobCategoryResponse;
import com.jobnest.backend.modules.jobs.api.dto.request.ExtendJobRequest;
import com.jobnest.backend.modules.jobs.api.dto.request.JobCategoryRequest;
import com.jobnest.backend.modules.jobs.api.dto.request.JobRequest;
import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobService {
    
    // Candidate operations
    Page<JobResponse> getAllActiveJobs(Pageable pageable);
    Page<JobResponse> searchActiveJobs(String keyword, Pageable pageable);
    JobResponse getJobById(Long id, Long viewerId, String viewerIp);
    
    // Category stats
    List<JobCategoryResponse> getCategoryStats();
    JobCategoryResponse createCategory(JobCategoryRequest request);

    // Employer operations
    JobResponse createJob(Long employerId, JobRequest request);
    JobResponse updateJob(Long employerId, Long jobId, JobRequest request);
    void hideJob(Long employerId, Long jobId);
    void unhideJob(Long employerId, Long jobId);
    void extendJob(Long employerId, Long jobId, ExtendJobRequest request);
    Page<JobResponse> getEmployerJobs(Long employerId, Pageable pageable);
    List<JobResponse> getAllEmployerJobs(Long employerId);
    
    // Admin operations
    Page<JobResponse> getAllJobs(Pageable pageable);
    void approveJob(Long adminId, Long jobId);
    void rejectJob(Long adminId, Long jobId);
    void adminHideJob(Long adminId, Long jobId);
    void restoreJob(Long adminId, Long jobId);
    
    // Saved jobs
    void saveJob(Long userId, Long jobId);
    void unsaveJob(Long userId, Long jobId);
    List<JobResponse> getSavedJobs(Long userId);
}
