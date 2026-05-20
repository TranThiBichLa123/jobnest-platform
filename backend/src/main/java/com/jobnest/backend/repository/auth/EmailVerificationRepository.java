package com.jobnest.backend.repository.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.entities.auth.EmailVerification;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByTokenAndIsUsedFalse(String token);
    Optional<EmailVerification> findByAccountIdAndIsUsedFalse(Long accountId);
}
