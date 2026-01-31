package com.jobnest.backend.modules.jobs.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.jobnest.backend.shared.domain.Account;

@Entity
@Table(name = "job_views")
@Data
public class JobView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "viewer_id")
    private Long viewerId;

    @Column(name = "viewer_ip", length = 45)
    private String viewerIp;

    @Column(name = "viewed_at", nullable = false, updatable = false)
    private LocalDateTime viewedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", insertable = false, updatable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewer_id", insertable = false, updatable = false)
    private Account viewer;
}
