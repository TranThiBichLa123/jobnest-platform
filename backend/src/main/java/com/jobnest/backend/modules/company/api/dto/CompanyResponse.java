package com.jobnest.backend.modules.company.api.dto;

import com.jobnest.backend.modules.company.domain.Company;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class CompanyResponse {
    private Long id;
    private Long employerId;
    private String name;
    private String logoUrl;
    private String industry;
    private String address;
    private Boolean verified;
    private String status;
    private String verificationDocumentPath;
    private String rejectionReason;
    private LocalDateTime reviewedAt;
    private Long reviewedBy;
    private Long openPositions;

    public CompanyResponse(Company company) {
        this.id = company.getId();
        this.employerId = company.getEmployerId();
        this.name = company.getName();
        this.logoUrl = company.getLogoUrl();
        this.industry = company.getIndustry();
        this.address = company.getAddress();
        this.verified = company.getVerified();
        this.status = company.getStatus() != null ? company.getStatus().name() : null;
        this.verificationDocumentPath = company.getVerificationDocumentPath();
        this.rejectionReason = company.getRejectionReason();
        this.reviewedAt = company.getReviewedAt();
        this.reviewedBy = company.getReviewedBy();
    }

    public CompanyResponse(Long id, String name, String logoUrl, String industry, String address, Boolean verified, Long openPositions) {
        this.id = id;
        this.name = name;
        this.logoUrl = logoUrl;
        this.industry = industry;
        this.address = address;
        this.verified = verified;
        this.status = Boolean.TRUE.equals(verified) ? Company.CompanyStatus.VERIFIED.name() : Company.CompanyStatus.PENDING_REVIEW.name();
        this.openPositions = openPositions;
    }
}