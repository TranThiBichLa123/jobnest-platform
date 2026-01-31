package com.jobnest.backend.modules.jobs.api.dto.request;

import com.jobnest.backend.modules.jobs.domain.Job;

import lombok.Data;

@Data
public class JobRequest {
    private Long companyId;
    private String title;
    private String description;
    private Long categoryId;
    private String location;
    private Job.JobType type;
    private Integer minSalary;
    private Integer maxSalary;
    private String experience;
    private String experienceLevel;
    private String education;
    private String skills; // Comma-separated or JSON string
    private Boolean isUrgent;
}
