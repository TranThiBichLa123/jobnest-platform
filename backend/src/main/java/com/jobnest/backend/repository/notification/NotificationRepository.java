package com.jobnest.backend.repository.notification;

import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.entities.notification.Notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(
            Long recipientId, Pageable pageable
    );

    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.recipient.id = :recipientId")
    void markAllAsReadByRecipientId(Long recipientId);

    java.util.List<Notification> findByRecipient(Account recipient);

    @Modifying
    @Transactional
    @Query("""
       update Notification n
       set n.deletedAt = CURRENT_TIMESTAMP
       where n.recipient.id = :userId
         and n.deletedAt IS NULL
    """)
    void clearAllByUser(@Param("userId") Long userId);
}
