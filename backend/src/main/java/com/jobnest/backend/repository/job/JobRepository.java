package com.jobnest.backend.repository.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.entities.job.Job;
import com.jobnest.backend.entities.job.Job.JobStatus;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Candidate queries - only active jobs
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);

    // Fetch jobs with category eagerly to avoid LazyInitializationException
    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.category WHERE j.status = :status")
    List<Job> findByStatusWithCategory(@Param("status") Job.JobStatus status);

    @Query("""
                SELECT j
                FROM Job j
                LEFT JOIN FETCH j.category
                WHERE j.employerId = :employerId
            """)
    List<Job> findByEmployerIdWithCategory(@Param("employerId") Long employerId);

    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND " +
            "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Job> searchActiveJobs(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
                SELECT
                    c.id,
                    c.name,
                    c.slug,
                    c.iconUrl,
                    COUNT(j.id)
                FROM JobCategory c
                LEFT JOIN Job j
                    ON c.id = j.categoryId
                    AND j.status = :status
                    AND (j.expiresAt IS NULL OR j.expiresAt > CURRENT_TIMESTAMP)
                GROUP BY c.id, c.name, c.slug, c.iconUrl
                ORDER BY c.name ASC
            """)
    List<Object[]> countActiveJobsByCategory(
            @Param("status") JobStatus status);

    // Employer queries - their own jobs
    Page<Job> findByEmployerId(Long employerId, Pageable pageable);

    List<Job> findByEmployerId(Long employerId);

    @Query("SELECT j FROM Job j WHERE j.employerId = :employerId AND " +
            "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Job> searchEmployerJobs(@Param("employerId") Long employerId,
            @Param("keyword") String keyword,
            Pageable pageable);

    // Admin queries - all jobs
    Page<Job> findAll(Pageable pageable);

    @Query("SELECT j FROM Job j WHERE " +
            "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "CAST(j.employerId AS string) LIKE CONCAT('%', :keyword, '%')")
    Page<Job> searchAllJobs(@Param("keyword") String keyword, Pageable pageable);

    // Count by employer
    long countByEmployerId(Long employerId);

    // Count by status
    long countByStatus(Job.JobStatus status);
}
