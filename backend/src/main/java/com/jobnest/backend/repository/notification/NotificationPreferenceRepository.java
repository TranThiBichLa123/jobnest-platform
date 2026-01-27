package com.jobnest.backend.repository.notification;

import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.entities.notification.NotificationPreference;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByAccount(Account account);
}
