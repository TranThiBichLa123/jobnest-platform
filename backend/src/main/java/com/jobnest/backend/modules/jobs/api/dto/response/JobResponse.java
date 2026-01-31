package com.jobnest.backend.modules.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.jobnest.backend.modules.jobs.domain.Job;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private Long employerId;
    private String employerName;
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String location;
    private Job.JobType type;
    private Integer minSalary;
    private Integer maxSalary;
    private String experience;
    private String experienceLevel;
    private String education;
    private String skills;
    private Boolean isUrgent;
    private Job.JobStatus status;
    private LocalDateTime postedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
    private Long viewCount;
    private Boolean isSaved;

    // Constructor from Job entity
    public JobResponse(Job job) {
        this.id = job.getId();
        this.employerId = job.getEmployerId();
        this.companyId = job.getCompanyId();
        this.title = job.getTitle();
        this.description = job.getDescription();
        this.categoryId = job.getCategoryId();
        if (job.getCategory() != null) {
            this.categoryName = job.getCategory().getName();
            this.categorySlug = job.getCategory().getSlug();
        }
        this.location = job.getLocation();
        this.type = job.getType();
        this.minSalary = job.getMinSalary();
        this.maxSalary = job.getMaxSalary();
        this.experience = job.getExperience();
        this.experienceLevel = job.getExperienceLevel();
        this.education = job.getEducation();
        this.skills = job.getSkills();
        this.isUrgent = job.getIsUrgent();
        this.status = job.getStatus();
        this.postedAt = job.getPostedAt();
        this.updatedAt = job.getUpdatedAt();
        this.expiresAt = job.getExpiresAt();
    }
}
