package com.jobnest.backend.dto.request;

import lombok.Data;

@Data
public class NotificationPreferenceRequest {
    private Boolean applicationStatus;
    private Boolean newApplication;
    private Boolean newMessage;
    private Boolean jobExpired;
    private Boolean system;
}
