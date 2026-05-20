package com.jobnest.backend.modules.jobs.infrastructure;

import com.jobnest.backend.modules.jobs.domain.Job;
import com.jobnest.backend.modules.jobs.domain.Job.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @EntityGraph(attributePaths = {"category"})
    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Job> findByEmployerId(Long employerId, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Job> findByEmployerId(Long employerId);

    @EntityGraph(attributePaths = {"category"})
    Page<Job> findByStatusAndEmployerId(JobStatus status, Long employerId, Pageable pageable);

    @Query("""
        SELECT j
        FROM Job j
        LEFT JOIN FETCH j.category
        WHERE j.employerId = :employerId
        ORDER BY j.postedAt DESC
    """)
    List<Job> findByEmployerIdWithCategory(@Param("employerId") Long employerId);

    @Query(
        value = """
            SELECT j
            FROM Job j
            WHERE j.status = 'ACTIVE'
            AND (j.expiresAt IS NULL OR j.expiresAt > CURRENT_TIMESTAMP)
            AND (
                LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        """,
        countQuery = """
            SELECT COUNT(j)
            FROM Job j
            WHERE j.status = 'ACTIVE'
            AND (j.expiresAt IS NULL OR j.expiresAt > CURRENT_TIMESTAMP)
            AND (
                LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        """
    )
    @EntityGraph(attributePaths = {"category"})
    Page<Job> searchActiveJobs(@Param("keyword") String keyword, Pageable pageable);

    @Query(
        value = """
            SELECT j
            FROM Job j
            WHERE j.status = 'ACTIVE'
            AND (j.expiresAt IS NULL OR j.expiresAt > CURRENT_TIMESTAMP)
            AND (:keyword IS NULL OR :keyword = ''
                OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            AND (:location IS NULL OR :location = ''
                OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))
            )
            AND (:type IS NULL OR j.type = :type)
            AND (:categoryId IS NULL OR j.categoryId = :categoryId)
            AND (:minSalary IS NULL OR j.maxSalary IS NULL OR j.maxSalary >= :minSalary)
            AND (:maxSalary IS NULL OR j.minSalary IS NULL OR j.minSalary <= :maxSalary)
            AND (:experienceLevel IS NULL OR :experienceLevel = ''
                OR LOWER(j.experienceLevel) = LOWER(:experienceLevel)
            )
        """,
        countQuery = """
            SELECT COUNT(j)
            FROM Job j
            WHERE j.status = 'ACTIVE'
            AND (j.expiresAt IS NULL OR j.expiresAt > CURRENT_TIMESTAMP)
            AND (:keyword IS NULL OR :keyword = ''
                OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            AND (:location IS NULL OR :location = ''
                OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))
            )
            AND (:type IS NULL OR j.type = :type)
            AND (:categoryId IS NULL OR j.categoryId = :categoryId)
            AND (:minSalary IS NULL OR j.maxSalary IS NULL OR j.maxSalary >= :minSalary)
            AND (:maxSalary IS NULL OR j.minSalary IS NULL OR j.minSalary <= :maxSalary)
            AND (:experienceLevel IS NULL OR :experienceLevel = ''
                OR LOWER(j.experienceLevel) = LOWER(:experienceLevel)
            )
        """
    )
    @EntityGraph(attributePaths = {"category"})
    Page<Job> searchActiveJobsAdvanced(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("type") Job.JobType type,
            @Param("categoryId") Long categoryId,
            @Param("minSalary") Integer minSalary,
            @Param("maxSalary") Integer maxSalary,
            @Param("experienceLevel") String experienceLevel,
            Pageable pageable
    );

    @Query(
        value = """
            SELECT j
            FROM Job j
            JOIN j.category c
            WHERE j.status = 'ACTIVE'
            AND (j.expiresAt IS NULL OR j.expiresAt > CURRENT_TIMESTAMP)
            AND c.slug = :slug
        """,
        countQuery = """
            SELECT COUNT(j)
            FROM Job j
            JOIN j.category c
            WHERE j.status = 'ACTIVE'
            AND (j.expiresAt IS NULL OR j.expiresAt > CURRENT_TIMESTAMP)
            AND c.slug = :slug
        """
    )
    @EntityGraph(attributePaths = {"category"})
    Page<Job> findActiveJobsByCategorySlug(@Param("slug") String slug, Pageable pageable);

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
    List<Object[]> countActiveJobsByCategory(@Param("status") JobStatus status);

    @Query(
        value = """
            SELECT j
            FROM Job j
            WHERE (:status IS NULL OR j.status = :status)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        """,
        countQuery = """
            SELECT COUNT(j)
            FROM Job j
            WHERE (:status IS NULL OR j.status = :status)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        """
    )
    @EntityGraph(attributePaths = {"category"})
    Page<Job> searchJobsForAdmin(
            @Param("status") JobStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query(
        value = """
            SELECT j
            FROM Job j
            WHERE j.employerId = :employerId
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        """,
        countQuery = """
            SELECT COUNT(j)
            FROM Job j
            WHERE j.employerId = :employerId
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        """
    )
    @EntityGraph(attributePaths = {"category"})
    Page<Job> searchEmployerJobs(
            @Param("employerId") Long employerId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByEmployerId(Long employerId);

    long countByStatus(JobStatus status);

    long countByCategoryId(Long categoryId);
}