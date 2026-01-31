package com.jobnest.backend.modules.candidate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.jobnest.backend.modules.candidate.domain.CandidateCV;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCVResponse {
    private Long id;
    private Long candidateId;
    private String title;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CandidateCVResponse(CandidateCV cv) {
        this.id = cv.getId();
        this.candidateId = cv.getCandidateId();
        this.title = cv.getTitle();
        this.fileUrl = cv.getFileUrl();
        this.fileName = cv.getFileName();
        this.fileSize = cv.getFileSize();
        this.isDefault = cv.getIsDefault();
        this.createdAt = cv.getCreatedAt();
        this.updatedAt = cv.getUpdatedAt();
    }
}
