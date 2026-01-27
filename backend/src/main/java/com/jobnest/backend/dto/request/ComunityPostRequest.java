package com.jobnest.backend.dto.request;

import lombok.Data;

@Data
public class ComunityPostRequest {
    private String title;
    private String content;
    private String category;   // INTERVIEW_EXPERIENCE, CAREER_ADVICE,...
    private String imageUrl;
}
