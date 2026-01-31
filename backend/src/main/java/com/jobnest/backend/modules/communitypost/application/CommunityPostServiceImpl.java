package com.jobnest.backend.modules.communitypost.application;

import com.jobnest.backend.modules.communitypost.api.dto.CommunityPostRequest;
import com.jobnest.backend.modules.communitypost.api.dto.CommunityPostResponse;
import com.jobnest.backend.shared.domain.Account;
import com.jobnest.backend.modules.communitypost.domain.CommunityPost;
import com.jobnest.backend.modules.communitypost.infrastructure.CommunityPostRepository;
import com.jobnest.backend.shared.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityPostServiceImpl implements CommunityPostService {

    private final CommunityPostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommunityPostResponse createPost(Long authorId, CommunityPostRequest request) {

        Account author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Author not found"));

        CommunityPost post = new CommunityPost();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(CommunityPost.PostCategory.valueOf(request.getCategory()));
        post.setImageUrl(request.getImageUrl());

        post.setAuthor(author);
        post.setStatus(CommunityPost.PostStatus.ACTIVE);
        post.setLikeCount(0);
        post.setCommentCount(0);
        post.setCreatedAt(LocalDateTime.now());

        return new CommunityPostResponse(postRepository.save(post));
    }

    @Override
    public List<CommunityPostResponse> getActivePosts() {
        return postRepository
            .findByStatusOrderByCreatedAtDesc(CommunityPost.PostStatus.ACTIVE)
            .stream()
            .map(CommunityPostResponse::new)
            .toList();
    }

    @Override
    public CommunityPostResponse getPostById(Long id) {
        CommunityPost post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        return new CommunityPostResponse(post);
    }

    @Override
    @Transactional
    public void deletePost(Long postId, Long authorId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new AccessDeniedException("Not your post");
        }

        // SOFT DELETE
        post.setStatus(CommunityPost.PostStatus.DELETED);
        postRepository.save(post);
    }
}
