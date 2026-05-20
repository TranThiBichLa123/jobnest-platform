package com.jobnest.backend.modules.applications.api.dto;

import com.jobnest.backend.modules.applications.domain.Application;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {

    private Long id;

    private Long jobId;
    private String jobTitle;
    private Long employerId;
    private Long companyId;

    private Long candidateId;
    private String candidateName;
    private String candidateEmail;

    private Long cvId;
    private String cvTitle;
    private String cvFileName;
    private String cvFileUrl;

    private String coverLetter;
    private String resumeUrl;
    private String status;

    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private String notes;

    public ApplicationResponse(Application application) {
        this.id = application.getId();

        if (application.getJob() != null) {
            this.jobId = application.getJob().getId();
            this.jobTitle = application.getJob().getTitle();
            this.employerId = application.getJob().getEmployerId();
            this.companyId = application.getJob().getCompanyId();
        }

        if (application.getCandidate() != null) {
            this.candidateId = application.getCandidate().getId();
            this.candidateName = application.getCandidate().getFullName();

            if (application.getCandidate().getUser() != null) {
                this.candidateEmail = application.getCandidate().getUser().getEmail();
            }
        }

        this.cvId = application.getCvId();

        if (application.getCv() != null) {
            this.cvTitle = application.getCv().getTitle();
            this.cvFileName = application.getCv().getFileName();
            this.cvFileUrl = application.getCv().getFileUrl();
        }

        this.coverLetter = application.getCoverLetter();
        this.resumeUrl = application.getResumeUrl();
        this.status = application.getStatus() != null ? application.getStatus().name() : null;
        this.appliedAt = application.getAppliedAt();
        this.reviewedAt = application.getReviewedAt();
        this.notes = application.getNotes();
    }
}