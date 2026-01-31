package com.jobnest.backend.modules.candidate.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_cvs")
@Data
public class CandidateCV {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(nullable = false, length = 200)
    private String title; // e.g., "Software Engineer CV", "Marketing CV"

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl; // URL or base64 of the CV file

    @Column(name = "file_name", length = 255)
    private String fileName; // Original file name

    @Column(name = "file_size")
    private Long fileSize; // File size in bytes

    @Column(name = "is_default")
    private Boolean isDefault = false; // Default CV for applications

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", insertable = false, updatable = false)
    private CandidateProfile candidate;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
