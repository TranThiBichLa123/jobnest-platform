package com.jobnest.backend.modules.company.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.jobnest.backend.shared.domain.Account;

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

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean verified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", insertable = false, updatable = false)
    private Account employer;
}
