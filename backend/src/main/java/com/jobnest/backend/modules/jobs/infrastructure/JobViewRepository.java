package com.jobnest.backend.modules.jobs.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.modules.jobs.domain.JobView;

import java.time.LocalDateTime;
import java.util.Optional;
@Repository
public interface JobViewRepository extends JpaRepository<JobView, Long> {

    long countByJobId(Long jobId);

    boolean existsByJobIdAndViewerId(Long jobId, Long viewerId);

    boolean existsByJobIdAndViewerIp(Long jobId, String viewerIp);

    //  FIX HOÀN TOÀN LAZY
    @Query("""
        select jv
        from JobView jv
        join fetch jv.job j
        left join fetch j.category c
        where jv.viewerId = :viewerId
        order by jv.viewedAt desc
    """)
    Page<JobView> findByViewerIdWithJob(
            @Param("viewerId") Long viewerId,
            Pageable pageable
    );

    Optional<JobView> findFirstByJobIdAndViewerIdAndViewedAtAfterOrderByViewedAtDesc(
            Long jobId,
            Long viewerId,
            LocalDateTime viewedAt
    );
}
