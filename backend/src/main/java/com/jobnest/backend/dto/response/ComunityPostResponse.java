package com.jobnest.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

import com.jobnest.backend.entities.post.CommunityPost;

@Data
public class ComunityPostResponse {

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

    public ComunityPostResponse(CommunityPost post) {
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
