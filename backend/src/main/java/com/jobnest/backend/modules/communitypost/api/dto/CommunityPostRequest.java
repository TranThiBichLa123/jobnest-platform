package com.jobnest.backend.modules.communitypost.api.dto;

import lombok.Data;

@Data
public class CommunityPostRequest {
    private String title;
    private String content;
    private String category;   // INTERVIEW_EXPERIENCE, CAREER_ADVICE,...
    private String imageUrl;
}
