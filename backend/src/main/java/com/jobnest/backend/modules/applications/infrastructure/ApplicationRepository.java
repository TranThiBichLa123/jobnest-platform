package com.jobnest.backend.modules.applications.infrastructure;

import com.jobnest.backend.modules.applications.domain.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    boolean existsByCvId(Long cvId);

    boolean existsByJobIdAndCandidateIdAndStatusIn(
            Long jobId,
            Long candidateId,
            Iterable<Application.ApplicationStatus> statuses
    );

    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    Optional<Application> findTopByJobIdAndCandidateIdOrderByAppliedAtDesc(Long jobId, Long candidateId);

    @EntityGraph(attributePaths = {
            "job",
            "job.category",
            "candidate",
            "candidate.user",
            "cv"
    })
    Page<Application> findByJobId(Long jobId, Pageable pageable);

    @EntityGraph(attributePaths = {
            "job",
            "job.category",
            "candidate",
            "candidate.user",
            "cv"
    })
    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    @EntityGraph(attributePaths = {
            "job",
            "job.category",
            "candidate",
            "candidate.user",
            "cv"
    })
    Optional<Application> findWithDetailsById(Long id);

    long countByJobId(Long jobId);
}