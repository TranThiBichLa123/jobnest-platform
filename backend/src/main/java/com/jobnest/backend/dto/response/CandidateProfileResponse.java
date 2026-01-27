package com.jobnest.backend.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import com.jobnest.backend.entities.candidate.CandidateProfile;

@Data
@NoArgsConstructor
public class CandidateProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String currentPosition;
    private String yearsOfExperience;
    private List<String> skills;
    private String aboutMe;
    private String avatarUrl;

    public CandidateProfileResponse(CandidateProfile profile) {
        this.id = profile.getId();
        this.userId = profile.getUser() != null ? profile.getUser().getId() : null;
        this.fullName = profile.getFullName();
        this.phoneNumber = profile.getPhoneNumber();
        this.dateOfBirth = profile.getDateOfBirth();
        this.gender = profile.getGender() != null ? profile.getGender().name() : null;
        this.currentPosition = profile.getCurrentPosition();
        this.yearsOfExperience = profile.getYearsOfExperience();
        this.skills = profile.getSkills() != null && !profile.getSkills().isEmpty() 
            ? Arrays.asList(profile.getSkills().split(",")) 
            : List.of();
        this.aboutMe = profile.getAboutMe();
        this.avatarUrl = profile.getUser() != null ? profile.getUser().getAvatarUrl() : null;
    }
}
