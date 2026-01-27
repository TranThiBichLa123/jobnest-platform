package com.jobnest.backend.service.job;

import com.jobnest.backend.dto.response.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SavedJobService {
    void saveJob(Long userId, Long jobId);
    void unsaveJob(Long userId, Long jobId);
    boolean isSaved(Long userId, Long jobId);
    Page<JobResponse> getSavedJobs(Long userId, Pageable pageable);
}
