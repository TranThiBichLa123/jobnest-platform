package com.jobnest.backend.repository.candidate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.entities.candidate.CandidateProfile;

import java.util.Optional;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    @Query("SELECT cp FROM CandidateProfile cp JOIN FETCH cp.user WHERE cp.user.id = :userId")
    Optional<CandidateProfile> findByUser_Id(@Param("userId") Long userId);

    boolean existsByUser_Id(Long userId);
}
