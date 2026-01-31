package com.jobnest.backend.modules.candidate.application;

import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileResponse;
import com.jobnest.backend.modules.candidate.domain.CandidateProfile;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import com.jobnest.backend.shared.domain.Account;
import com.jobnest.backend.shared.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    @Override
    public CandidateProfileResponse getProfile(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUser_Id(userId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        return new CandidateProfileResponse(profile);
    }

    @Override
    @Transactional
    public CandidateProfileResponse createOrUpdateProfile(Long userId, CandidateProfileRequest request) {
        Account user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUser_Id(userId)
            .orElse(new CandidateProfile());

        if (profile.getUser() == null) {
            profile.setUser(user);
        }

        profile.setFullName(request.getFullName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setDateOfBirth(request.getDateOfBirth());
        
        if (request.getGender() != null) {
            profile.setGender(CandidateProfile.Gender.valueOf(request.getGender().toUpperCase()));
        }
        
        profile.setCurrentPosition(request.getCurrentPosition());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        
        // Convert skills list to comma-separated string
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            profile.setSkills(String.join(",", request.getSkills()));
        }
        
        profile.setAboutMe(request.getAboutMe());

        CandidateProfile savedProfile = candidateProfileRepository.save(profile);
        return new CandidateProfileResponse(savedProfile);
    }
}
