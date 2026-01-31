package com.jobnest.backend.modules.notification.api.dto;

import lombok.Data;

@Data
public class NotificationPreferenceResponse {
    private Long id;
    private Long accountId;
    private Boolean applicationStatus;
    private Boolean newApplication;
    private Boolean newMessage;
    private Boolean jobExpired;
    private Boolean system;
}
