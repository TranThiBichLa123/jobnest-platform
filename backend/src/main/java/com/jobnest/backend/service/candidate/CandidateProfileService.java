package com.jobnest.backend.service.candidate;

import com.jobnest.backend.dto.request.CandidateProfileRequest;
import com.jobnest.backend.dto.response.CandidateProfileResponse;

public interface CandidateProfileService {
    CandidateProfileResponse getProfile(Long userId);
    CandidateProfileResponse createOrUpdateProfile(Long userId, CandidateProfileRequest request);
}
