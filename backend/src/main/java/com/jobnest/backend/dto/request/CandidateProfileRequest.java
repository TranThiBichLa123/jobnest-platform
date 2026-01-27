package com.jobnest.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CandidateProfileRequest {
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender; // MALE, FEMALE, OTHER
    private String currentPosition;
    private String yearsOfExperience;
    private List<String> skills; // Will be converted to comma-separated string
    private String aboutMe;
}
