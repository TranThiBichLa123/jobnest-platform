package com.jobnest.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCVRequest {
    private String title;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Boolean isDefault;
}
