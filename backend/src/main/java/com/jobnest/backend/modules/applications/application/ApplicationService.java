package com.jobnest.backend.modules.applications.application;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApplicationService {

    ApplicationResponse applyForJob(Long jobId, Long candidateId, ApplicationRequest request);

    boolean hasApplied(Long jobId, Long candidateId);

    String getCandidateApplicationStatusForJob(Long jobId, Long candidateId);

    Page<ApplicationResponse> getJobApplications(Long jobId, Long employerId, Pageable pageable);

    Page<ApplicationResponse> getCandidateApplications(Long candidateId, Pageable pageable);

    ApplicationResponse getApplicationByIdForCandidate(Long applicationId, Long candidateId);

    ApplicationResponse getApplicationByIdForEmployer(Long applicationId, Long employerId);

    ApplicationResponse getApplicationByIdForAdmin(Long applicationId);

    Page<ApplicationResponse> getApplicationsForAdmin(String status, Pageable pageable);

    ApplicationResponse updateApplicationStatus(Long applicationId, Long employerId, String status, String notes);

    void withdrawApplication(Long applicationId, Long candidateId);

    long countApplications(Long jobId, Long employerId);
}