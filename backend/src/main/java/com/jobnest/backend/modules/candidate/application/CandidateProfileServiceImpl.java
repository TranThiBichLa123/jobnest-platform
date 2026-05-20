package com.jobnest.backend.modules.candidate.application;

import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.auth.infrastructure.UserRepository;
import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileResponse;
import com.jobnest.backend.modules.candidate.domain.CandidateProfile;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    @Override
    public CandidateProfileResponse getProfile(Long userId) {
        Account user = getCandidateAccount(userId);

        CandidateProfile profile = candidateProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        return new CandidateProfileResponse(profile);
    }

    @Override
    @Transactional
    public CandidateProfileResponse createOrUpdateProfile(Long userId, CandidateProfileRequest request) {
        Account user = getCandidateAccount(userId);

        if (request == null) {
            throw new BadRequestException("Candidate profile request is required");
        }

        CandidateProfile profile = candidateProfileRepository.findByUser_Id(userId)
                .orElse(new CandidateProfile());

        if (profile.getUser() == null) {
            profile.setUser(user);
        }

        profile.setFullName(clean(request.getFullName()));
        profile.setPhoneNumber(clean(request.getPhoneNumber()));
        profile.setDateOfBirth(request.getDateOfBirth());

        if (request.getGender() != null && !request.getGender().isBlank()) {
            try {
                profile.setGender(CandidateProfile.Gender.valueOf(request.getGender().trim().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Gender must be MALE, FEMALE, or OTHER");
            }
        }

        profile.setCurrentPosition(clean(request.getCurrentPosition()));
        profile.setYearsOfExperience(clean(request.getYearsOfExperience()));

        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            profile.setSkills(String.join(",", request.getSkills()));
        } else {
            profile.setSkills(null);
        }

        profile.setAboutMe(clean(request.getAboutMe()));

        return new CandidateProfileResponse(candidateProfileRepository.save(profile));
    }

    private Account getCandidateAccount(Long userId) {
        Account user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (user.getRole() != Account.Role.CANDIDATE) {
            throw new AccessDeniedException("Only candidate accounts can manage candidate profile");
        }

        return user;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}