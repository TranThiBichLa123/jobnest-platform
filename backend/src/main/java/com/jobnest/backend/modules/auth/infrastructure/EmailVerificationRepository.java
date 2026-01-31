package com.jobnest.backend.modules.auth.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.modules.auth.domain.EmailVerification;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByTokenAndIsUsedFalse(String token);
    Optional<EmailVerification> findByAccountIdAndIsUsedFalse(Long accountId);
}
