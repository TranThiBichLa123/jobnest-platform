package com.jobnest.backend.controllers.notification;

import com.jobnest.backend.dto.response.NotificationResponse;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.dto.response.NotificationPreferenceResponse;
import com.jobnest.backend.dto.request.NotificationPreferenceRequest;
import com.jobnest.backend.service.notification.NotificationPreferenceService;
import com.jobnest.backend.service.notification.NotificationService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Notification", description = "Notification APIs")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationPreferenceService notificationPreferenceService;

    // GET /notifications
    @GetMapping
    public Page<NotificationResponse> getMyNotifications(
        Authentication authentication,
        Pageable pageable
    ) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return notificationService.getNotificationsByRecipient(user.getId(), pageable);
    }

    // GET /notifications/{id}
    @GetMapping("/{id}")
    public NotificationResponse getDetail(
        @PathVariable Long id,
        Authentication authentication
    ) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return notificationService.getNotificationDetail(id, user.getId());
    }

    // POST /notifications/{id}/read
    @PostMapping("/{id}/read")
    public void markAsRead(
        @PathVariable Long id,
        Authentication authentication
    ) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        notificationService.markAsRead(id, user.getId());
    }

    // POST /notifications/read-all
    @PostMapping("/read-all")
    public void markAllAsRead(
        Authentication authentication
    ) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        notificationService.markAllAsRead(user.getId());
    }

    // DELETE /notifications/{id}
    @DeleteMapping("/{id}")
    public void deleteNotification(
        @PathVariable Long id,
        Authentication authentication
    ) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        notificationService.deleteNotification(id, user.getId());
    }

    // GET /notifications/unread-count
    @GetMapping("/unread-count")
    public long countUnread(
        Authentication authentication
    ) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return notificationService.countUnread(user.getId());
    }

    // POST /notifications/preferences
    @PostMapping("/preferences")
    public NotificationPreferenceResponse updatePreference(
        @RequestBody NotificationPreferenceRequest request,
        Authentication authentication
    ) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return notificationPreferenceService.update(user.getId(), request);
    }

    // API lấy notification cho candidate (không phân trang)
    @GetMapping("/all")
    public List<NotificationResponse> getMyNotificationsAll(Authentication authentication) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return notificationService.getNotificationsByUser(user.getAccount());
    }
}
