package com.jobnest.backend.modules.jobs.application;

import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SavedJobService {
    void saveJob(Long userId, Long jobId);
    void unsaveJob(Long userId, Long jobId);
    boolean isSaved(Long userId, Long jobId);
    Page<JobResponse> getSavedJobs(Long userId, Pageable pageable);
}
