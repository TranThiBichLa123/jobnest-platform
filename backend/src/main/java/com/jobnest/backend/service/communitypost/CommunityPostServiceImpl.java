package com.jobnest.backend.service.communitypost;

import com.jobnest.backend.dto.request.ComunityPostRequest;
import com.jobnest.backend.dto.response.ComunityPostResponse;
import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.entities.post.CommunityPost;
import com.jobnest.backend.repository.ComunityPostRepository;
import com.jobnest.backend.repository.auth.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityPostServiceImpl implements CommunityPostService {

    private final ComunityPostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ComunityPostResponse createPost(Long authorId, ComunityPostRequest request) {

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

        return new ComunityPostResponse(postRepository.save(post));
    }

    @Override
    public List<ComunityPostResponse> getActivePosts() {
        return postRepository
            .findByStatusOrderByCreatedAtDesc(CommunityPost.PostStatus.ACTIVE)
            .stream()
            .map(ComunityPostResponse::new)
            .toList();
    }

    @Override
    public ComunityPostResponse getPostById(Long id) {
        CommunityPost post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        return new ComunityPostResponse(post);
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
