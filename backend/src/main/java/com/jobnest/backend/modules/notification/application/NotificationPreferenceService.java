package com.jobnest.backend.modules.notification.application;

import com.jobnest.backend.modules.notification.api.dto.NotificationPreferenceRequest;
import com.jobnest.backend.modules.notification.api.dto.NotificationPreferenceResponse;

public interface NotificationPreferenceService {
    NotificationPreferenceResponse getByAccountId(Long accountId);
    NotificationPreferenceResponse update(Long accountId, NotificationPreferenceRequest request);
}
