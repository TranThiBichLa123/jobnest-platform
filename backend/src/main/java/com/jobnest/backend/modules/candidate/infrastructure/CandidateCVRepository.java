package com.jobnest.backend.modules.candidate.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.modules.candidate.domain.CandidateCV;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateCVRepository extends JpaRepository<CandidateCV, Long> {
    List<CandidateCV> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
    
    Optional<CandidateCV> findByCandidateIdAndIsDefaultTrue(Long candidateId);
    
    long countByCandidateId(Long candidateId);
}
