package com.jobnest.backend.repository.application;

import com.jobnest.backend.entities.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Check if candidate already applied for a job
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);
    boolean existsByCvId(Long cvId);
    // Get all applications for a specific job
    Page<Application> findByJobId(Long jobId, Pageable pageable);
    
    // Get all applications by a candidate
    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);
    
    // Get applications by status for a job
    Page<Application> findByJobIdAndStatus(Long jobId, Application.ApplicationStatus status, Pageable pageable);
    
    // Get applications by status for a candidate
    Page<Application> findByCandidateIdAndStatus(Long candidateId, Application.ApplicationStatus status, Pageable pageable);
    
    // Count applications for a job
    long countByJobId(Long jobId);
    
    // Find application by job and candidate
    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    @Query(
        value = """
            select a
            from Application a
            join fetch a.job j
            left join fetch j.category
            join fetch a.candidate c
            join fetch c.user u
            left join fetch a.cv cv
            where c.id = :candidateId
            order by a.appliedAt desc
        """,
        countQuery = """
            select count(a)
            from Application a
            where a.candidate.id = :candidateId
        """
    )
    Page<Application> findByCandidateIdWithDetails(
            @Param("candidateId") Long candidateId,
            Pageable pageable
    );

    // Lấy application mới nhất của candidate cho job (dùng để kiểm tra apply lại)
    Optional<Application> findTopByJobIdAndCandidateIdOrderByAppliedAtDesc(
        Long jobId,
        Long candidateId
    );

    // Check if candidate already applied for a job with specific statuses
    boolean existsByJobIdAndCandidateIdAndStatusIn(
        Long jobId,
        Long candidateId,
        Iterable<Application.ApplicationStatus> statuses
    );
}
