package com.jobnest.backend.repository.job;

import com.jobnest.backend.entities.job.Job;
import com.jobnest.backend.entities.job.JobCategory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {

    Optional<JobCategory> findBySlug(String slug);

    Optional<JobCategory> findByName(String name);

    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.category WHERE j.status = 'active'")
    Page<Job> findByStatusWithCategory(Job.JobStatus status, Pageable pageable);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

}
