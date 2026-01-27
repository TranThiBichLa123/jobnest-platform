package com.jobnest.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryStatsResponse {
    private String categoryName;
    private Long openPositions;
}
