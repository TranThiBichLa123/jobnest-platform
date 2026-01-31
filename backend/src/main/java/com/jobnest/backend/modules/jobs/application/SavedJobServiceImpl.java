package com.jobnest.backend.modules.jobs.application;

import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.modules.jobs.domain.SavedJob;
import com.jobnest.backend.modules.jobs.infrastructure.SavedJobRepository;
import com.jobnest.backend.shared.repository.UserRepository;
import com.jobnest.backend.modules.jobs.infrastructure.JobRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SavedJobServiceImpl implements SavedJobService {

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void saveJob(Long userId, Long jobId) {
        if (savedJobRepository.existsByIdUserIdAndIdJobId(userId, jobId)) {
            return; // Already saved
        }

        SavedJob savedJob = new SavedJob();
        SavedJob.SavedJobId id = new SavedJob.SavedJobId();
        id.setUserId(userId);
        id.setJobId(jobId);
        savedJob.setId(id);
        
        savedJob.setUser(userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found")));
        savedJob.setJob(jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found")));
        
        savedJobRepository.save(savedJob);
    }

    @Override
    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        savedJobRepository.deleteByIdUserIdAndIdJobId(userId, jobId);
    }

    @Override
    public boolean isSaved(Long userId, Long jobId) {
        return savedJobRepository.existsByIdUserIdAndIdJobId(userId, jobId);
    }

    @Override
public Page<JobResponse> getSavedJobs(Long userId, Pageable pageable) {

    Page<SavedJob> savedJobs =
            savedJobRepository.findByUserIdWithJob(userId, pageable);

    return savedJobs.map(sj -> new JobResponse(sj.getJob()));
}

}
