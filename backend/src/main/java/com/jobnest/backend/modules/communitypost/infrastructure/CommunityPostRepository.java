package com.jobnest.backend.modules.communitypost.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.modules.communitypost.domain.CommunityPost;
import com.jobnest.backend.modules.communitypost.domain.CommunityPost.PostStatus;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    List<CommunityPost> findByStatusOrderByCreatedAtDesc(PostStatus status);
}
