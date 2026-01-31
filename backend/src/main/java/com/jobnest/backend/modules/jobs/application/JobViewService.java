package com.jobnest.backend.modules.jobs.application;

import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobViewService {
    void recordView(Long jobId, Long viewerId, String viewerIp);
    Page<JobResponse> getViewedJobs(Long viewerId, Pageable pageable);
    Long getViewCount(Long jobId);
}
