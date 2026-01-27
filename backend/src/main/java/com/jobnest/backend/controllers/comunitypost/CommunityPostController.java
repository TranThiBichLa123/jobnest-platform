package com.jobnest.backend.controllers.comunitypost;

import com.jobnest.backend.dto.request.ComunityPostRequest;
import com.jobnest.backend.dto.response.ComunityPostResponse;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.service.communitypost.CommunityPostService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Post / Community")
public class CommunityPostController {

    private final CommunityPostService postService;

    // Public – xem bài viết
    @GetMapping
    public ResponseEntity<List<ComunityPostResponse>> getPosts() {
        return ResponseEntity.ok(postService.getActivePosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComunityPostResponse> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    // Job seeker – tạo bài
    @PostMapping
    public ResponseEntity<ComunityPostResponse> createPost(
        @RequestBody ComunityPostRequest request,
        @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
            postService.createPost(user.getId(), request)
        );
    }

    // Job seeker – xóa bài của mình
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
        @PathVariable Long id,
        @AuthenticationPrincipal CustomUserDetails user
    ) {
        postService.deletePost(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
