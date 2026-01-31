package com.jobnest.backend.modules.communitypost.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

import com.jobnest.backend.modules.communitypost.domain.CommunityPost;

@Data
public class CommunityPostResponse {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String imageUrl;
    private String status;

    private Long authorId;
    private String authorName;

    private int likeCount;
    private int commentCount;

    private LocalDateTime createdAt;

    public CommunityPostResponse(CommunityPost post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.category = post.getCategory().name();
        this.imageUrl = post.getImageUrl();
        this.status = post.getStatus().name();

        this.authorId = post.getAuthor().getId();
        this.authorName = post.getAuthor().getUsername();

        this.likeCount = post.getLikeCount();
        this.commentCount = post.getCommentCount();
        this.createdAt = post.getCreatedAt();
    }
}
