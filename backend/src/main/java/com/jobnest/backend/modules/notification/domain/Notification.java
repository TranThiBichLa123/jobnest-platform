package com.jobnest.backend.modules.notification.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Where;

import com.jobnest.backend.shared.domain.Account;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Where(clause = "deleted_at IS NULL")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Account recipient;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum NotificationType {
        NEW_APPLICATION,
        APPLICATION_SUBMITTED, 
        APPLICATION_STATUS_CHANGED,
        SYSTEM
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
