package com.jobnest.backend.modules.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryStatsResponse {
    private String categoryName;
    private Long openPositions;
}
