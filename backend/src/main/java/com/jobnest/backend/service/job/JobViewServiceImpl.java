package com.jobnest.backend.service.job;

import com.jobnest.backend.dto.response.JobResponse;
import com.jobnest.backend.entities.job.JobView;
import com.jobnest.backend.repository.job.JobViewRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class JobViewServiceImpl implements JobViewService {

    @Autowired
    private JobViewRepository jobViewRepository;

    @Override
    @Transactional
    public void recordView(Long jobId, Long viewerId, String viewerIp) {
        // Check if user already viewed this job recently (within 1 hour)
        if (viewerId != null) {
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            Optional<JobView> recentView = jobViewRepository
                    .findFirstByJobIdAndViewerIdAndViewedAtAfterOrderByViewedAtDesc(
                            jobId, viewerId, oneHourAgo);
            if (recentView.isPresent()) {
                return;
            }
        }

        JobView jobView = new JobView();
        jobView.setJobId(jobId);
        jobView.setViewerId(viewerId);
        jobView.setViewerIp(viewerIp);
        jobViewRepository.save(jobView);
    }
@Override
public Page<JobResponse> getViewedJobs(Long viewerId, Pageable pageable) {

    Page<JobView> jobViews =
            jobViewRepository.findByViewerIdWithJob(viewerId, pageable);

    return jobViews.map(jv -> new JobResponse(jv.getJob()));
}


    @Override
    public Long getViewCount(Long jobId) {
        return jobViewRepository.countByJobId(jobId);
    }
}
