package com.jobnest.backend.modules.applications.api.dto;

import lombok.Data;

@Data
public class ApplicationRequest {
    private Long cvId; // Selected CV ID
    private String coverLetter;
    private String resumeUrl; // Optional: for backward compatibility
}
