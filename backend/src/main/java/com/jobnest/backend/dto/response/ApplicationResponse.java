package com.jobnest.backend.dto.response;

import com.jobnest.backend.entities.Application;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long cvId;
    private String cvTitle;
    private String cvFileName;
    private String coverLetter;
    private String resumeUrl;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private String notes;

    public ApplicationResponse(Application application) {
        this.id = application.getId();
        this.jobId = application.getJob().getId();
        this.jobTitle = application.getJob().getTitle();
        this.candidateId = application.getCandidate().getId();
        this.candidateName = application.getCandidate().getFullName();
        this.candidateEmail = application.getCandidate().getUser().getEmail();
        this.cvId = application.getCvId();
        if (application.getCv() != null) {
            this.cvTitle = application.getCv().getTitle();
            this.cvFileName = application.getCv().getFileName();
        }
        this.coverLetter = application.getCoverLetter();
        this.resumeUrl = application.getResumeUrl();
        this.status = application.getStatus().name();
        this.appliedAt = application.getAppliedAt();
        this.reviewedAt = application.getReviewedAt();
        this.notes = application.getNotes();
    }
}
