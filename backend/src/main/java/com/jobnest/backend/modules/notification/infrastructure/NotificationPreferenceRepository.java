package com.jobnest.backend.modules.notification.infrastructure;

import com.jobnest.backend.shared.domain.Account;
import com.jobnest.backend.modules.notification.domain.NotificationPreference;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByAccount(Account account);
}
