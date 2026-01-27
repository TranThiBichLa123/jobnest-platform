package com.jobnest.backend.service.notification;

import com.jobnest.backend.dto.response.NotificationResponse;
import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.entities.job.Job;
import com.jobnest.backend.entities.notification.Notification;
import com.jobnest.backend.entities.Application;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.jobnest.backend.repository.auth.UserRepository;
import com.jobnest.backend.repository.notification.NotificationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public Page<NotificationResponse> getNotificationsByRecipient(
            Long recipientId, Pageable pageable
    ) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable)
                .map(this::toDto);
    }

    @Override
    public NotificationResponse getNotificationDetail(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return toDto(notification);
    }

    @Override
    public void markAsRead(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long recipientId) {
        notificationRepository.markAllAsReadByRecipientId(recipientId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setDeletedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    public long countUnread(Long recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    @Override
    public void createNotification(
            Long recipientId,
            String title,
            String message,
            String type,
            Long referenceId
    ) {
        Account recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(parseNotificationType(type));
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    @Override
    public void createNotification(
            Account recipient,
            String title,
            String message,
            String type,
            Long referenceId
    ) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(parseNotificationType(type));
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    @Override
    public void notifyCandidateAppliedJob(Account candidate, Job job) {
        Notification notification = new Notification();
        notification.setRecipient(candidate);
        notification.setTitle("Application Submitted");
        notification.setMessage(
            "You have successfully applied for the position "
            + job.getTitle()
            + " at "
            + job.getCompany().getName()
        );
        notification.setType(Notification.NotificationType.APPLICATION_SUBMITTED);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        NotificationResponse notificationResponse = toDto(notification);
        messagingTemplate.convertAndSendToUser(
            candidate.getId().toString(),
            "/queue/notifications",
            notificationResponse
        );
    }

    @Override
    public void notifyApplicationStatusChanged(Account candidate, Application application) {
        Notification notification = new Notification();
        notification.setRecipient(candidate);
        notification.setTitle("Application Status Updated");
        notification.setMessage(
            "Your application status for the position "
            + application.getJob().getTitle()
            + " has been updated to: "
            + application.getStatus().name()
        );
        notification.setType(Notification.NotificationType.APPLICATION_STATUS_CHANGED);
        notification.setReferenceId(application.getId());
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);

        // Gửi real-time notification qua WebSocket
        NotificationResponse notificationResponse = toDto(notification);
        messagingTemplate.convertAndSendToUser(
            candidate.getId().toString(),
            "/queue/notifications",
            notificationResponse
        );
    }

    @Override
    public List<NotificationResponse> getNotificationsByUser(Account account) {
        return notificationRepository.findByRecipient(account)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private NotificationResponse toDto(Notification notification) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(notification.getId());
        dto.setRecipientId(notification.getRecipient().getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType().name());
        dto.setReferenceId(notification.getReferenceId());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }

    /**
     * Chuyển đổi type string sang enum NotificationType an toàn, không phân biệt hoa thường, thay thế dấu _
     */
    private Notification.NotificationType parseNotificationType(String type) {
        if (type == null) throw new IllegalArgumentException("Notification type is required");
        String normalized = type.trim().toUpperCase().replace(' ', '_');
        for (Notification.NotificationType t : Notification.NotificationType.values()) {
            if (t.name().equalsIgnoreCase(normalized)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Invalid notification type: " + type);
    }
}
