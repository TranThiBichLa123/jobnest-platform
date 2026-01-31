package com.jobnest.backend.modules.jobs.api.dto.request;

import lombok.Data;

@Data
public class ExtendJobRequest {
    private Integer days; // Number of days to extend
}
