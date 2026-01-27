package com.jobnest.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private Long recipientId;
    private String title;
    private String message;
    private String type;
    private Long referenceId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
