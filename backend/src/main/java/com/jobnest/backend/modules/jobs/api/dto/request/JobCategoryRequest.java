package com.jobnest.backend.modules.jobs.api.dto.request;

import lombok.Data;

@Data
public class JobCategoryRequest {

    private String name;

    private String iconUrl;

    private String description;
}