package com.jobnest.backend.service.communitypost;

import com.jobnest.backend.dto.request.ComunityPostRequest;
import com.jobnest.backend.dto.response.ComunityPostResponse;

import java.util.List;

public interface CommunityPostService {

    ComunityPostResponse createPost(Long authorId, ComunityPostRequest request);

    List<ComunityPostResponse> getActivePosts();

    ComunityPostResponse getPostById(Long id);

    void deletePost(Long postId, Long authorId);
}
