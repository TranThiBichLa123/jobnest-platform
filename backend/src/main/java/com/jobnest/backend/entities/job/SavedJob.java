package com.jobnest.backend.entities.job;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.jobnest.backend.entities.auth.Account;

@Entity
@Table(name = "saved_jobs")
@Data
public class SavedJob {
    @EmbeddedId
    private SavedJobId id;

    @Column(name = "saved_at", nullable = false, updatable = false)
    private LocalDateTime savedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private Account user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("jobId")
    @JoinColumn(name = "job_id")
    private Job job;

    @Embeddable
    @Data
    public static class SavedJobId implements java.io.Serializable {
        @Column(name = "user_id")
        private Long userId;

        @Column(name = "job_id")
        private Long jobId;
    }
}
