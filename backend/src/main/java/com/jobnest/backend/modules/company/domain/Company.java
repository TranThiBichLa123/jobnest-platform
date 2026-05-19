package com.jobnest.backend.modules.company.domain;

import com.jobnest.backend.modules.auth.domain.Account;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Data
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employer_id", nullable = false)
    private Long employerId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;

    @Column(length = 150)
    private String industry;

    @Column(length = 255)
    private String address;

    @Column(nullable = false)
    private Boolean verified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CompanyStatus status = CompanyStatus.PENDING_REVIEW;

    @Column(name = "verification_document_path", length = 1000)
    private String verificationDocumentPath;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", insertable = false, updatable = false)
    private Account employer;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum CompanyStatus {
        PENDING_REVIEW,
        VERIFIED,
        REJECTED
    }
}