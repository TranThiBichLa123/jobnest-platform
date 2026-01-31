package com.jobnest.backend.modules.candidate.application;

import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileResponse;

public interface CandidateProfileService {
    CandidateProfileResponse getProfile(Long userId);

    CandidateProfileResponse createOrUpdateProfile(Long userId, CandidateProfileRequest request);
}
