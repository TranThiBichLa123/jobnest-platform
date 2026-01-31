package com.jobnest.backend.modules.applications.application;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApplicationService {
    
    // Apply for a job
    ApplicationResponse applyForJob(Long jobId, Long candidateId, ApplicationRequest request);
    
    // Check if candidate already applied
    boolean hasApplied(Long jobId, Long candidateId);
    
    // Get all applications for a job (employer view)
    Page<ApplicationResponse> getJobApplications(Long jobId, Pageable pageable);
    
    // Get all applications by a candidate
    Page<ApplicationResponse> getCandidateApplications(Long candidateId, Pageable pageable);
    
    // Get application details
    ApplicationResponse getApplicationById(Long applicationId);
    
    // Update application status (employer action)
    ApplicationResponse updateApplicationStatus(Long applicationId, String status, String notes);
    
    // Withdraw application (candidate action)
    void withdrawApplication(Long applicationId, Long candidateId);
    
    // Count applications for a job
    long countApplications(Long jobId);
}
