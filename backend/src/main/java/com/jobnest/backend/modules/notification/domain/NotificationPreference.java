package com.jobnest.backend.modules.notification.domain;

import com.jobnest.backend.shared.domain.Account;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "notification_preferences")
@Data
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "application_status", nullable = false)
    private Boolean applicationStatus = true;

    @Column(name = "new_application", nullable = false)
    private Boolean newApplication = true;

    @Column(name = "new_message", nullable = false)
    private Boolean newMessage = true;

    @Column(name = "job_expired", nullable = false)
    private Boolean jobExpired = true;

    @Column(name = "system", nullable = false)
    private Boolean system = true;
}
