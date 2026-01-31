package com.jobnest.backend.modules.jobs.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.jobnest.backend.modules.company.domain.Company;
import com.jobnest.backend.shared.domain.Account;


@Entity
@Table(name = "jobs")
@Data
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employer_id", nullable = false)
    private Long employerId;

    @Column(name = "company_id")
    private Long companyId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(nullable = false, length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType type;

    @Column(name = "min_salary")
    private Integer minSalary;

    @Column(name = "max_salary")
    private Integer maxSalary;

    @Column(length = 50)
    private String experience;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(length = 100)
    private String education;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "is_urgent")
    private Boolean isUrgent = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.ACTIVE;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private LocalDateTime postedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", insertable = false, updatable = false)
    private Account employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", insertable = false, updatable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private JobCategory category;

    public enum JobType {
        FULLTIME, PARTTIME, INTERNSHIP, CONTRACT;

    }

    public enum JobStatus {
        ACTIVE, HIDDEN, EXPIRED
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
