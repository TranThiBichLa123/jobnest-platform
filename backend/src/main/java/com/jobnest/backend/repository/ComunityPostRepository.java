package com.jobnest.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.entities.post.CommunityPost;
import com.jobnest.backend.entities.post.CommunityPost.PostStatus;

import java.util.List;

@Repository
public interface ComunityPostRepository extends JpaRepository<CommunityPost, Long> {

    List<CommunityPost> findByStatusOrderByCreatedAtDesc(PostStatus status);
}
