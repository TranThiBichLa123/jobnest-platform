package com.jobnest.backend.service.notification;

import com.jobnest.backend.dto.request.NotificationPreferenceRequest;
import com.jobnest.backend.dto.response.NotificationPreferenceResponse;
import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.entities.notification.NotificationPreference;
import com.jobnest.backend.repository.auth.UserRepository;
import com.jobnest.backend.repository.notification.NotificationPreferenceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public NotificationPreferenceResponse getByAccountId(Long accountId) {
        Account account = userRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        NotificationPreference pref = preferenceRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Preference not found"));
        return toDto(pref);
    }

    @Override
    public NotificationPreferenceResponse update(Long accountId, NotificationPreferenceRequest request) {
        Account account = userRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        NotificationPreference pref = preferenceRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Preference not found"));

        pref.setApplicationStatus(request.getApplicationStatus());
        pref.setNewApplication(request.getNewApplication());
        pref.setNewMessage(request.getNewMessage());
        pref.setJobExpired(request.getJobExpired());
        pref.setSystem(request.getSystem());

        preferenceRepository.save(pref);
        return toDto(pref);
    }

    private NotificationPreferenceResponse toDto(NotificationPreference pref) {
        NotificationPreferenceResponse dto = new NotificationPreferenceResponse();
        dto.setId(pref.getId());
        dto.setAccountId(pref.getAccount().getId());
        dto.setApplicationStatus(pref.getApplicationStatus());
        dto.setNewApplication(pref.getNewApplication());
        dto.setNewMessage(pref.getNewMessage());
        dto.setJobExpired(pref.getJobExpired());
        dto.setSystem(pref.getSystem());
        return dto;
    }
}
