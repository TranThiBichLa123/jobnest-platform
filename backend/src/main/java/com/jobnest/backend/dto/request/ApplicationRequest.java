package com.jobnest.backend.dto.request;

import lombok.Data;

@Data
public class ApplicationRequest {
    private Long cvId; // Selected CV ID
    private String coverLetter;
    private String resumeUrl; // Optional: for backward compatibility
}
