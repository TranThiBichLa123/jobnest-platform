package com.jobnest.backend.modules.communitypost.application;

import com.jobnest.backend.modules.communitypost.api.dto.CommunityPostRequest;
import com.jobnest.backend.modules.communitypost.api.dto.CommunityPostResponse;

import java.util.List;

public interface CommunityPostService {

    CommunityPostResponse createPost(Long authorId, CommunityPostRequest request);

    List<CommunityPostResponse> getActivePosts();

    CommunityPostResponse getPostById(Long id);

    void deletePost(Long postId, Long authorId);
}
