package com.jobnest.backend.modules.jobs.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.modules.jobs.domain.SavedJob;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, SavedJob.SavedJobId> {

    @Query("""
        select sj
        from SavedJob sj
        join fetch sj.job j
        left join fetch j.category c
        where sj.id.userId = :userId
        order by sj.savedAt desc
    """)
    Page<SavedJob> findByUserIdWithJob(
            @Param("userId") Long userId,
            Pageable pageable
    );

    boolean existsByIdUserIdAndIdJobId(Long userId, Long jobId);

    void deleteByIdUserIdAndIdJobId(Long userId, Long jobId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}
