package com.jobnest.backend.repository.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.entities.auth.RefreshToken;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteByAccountId(Long accountId);
    void deleteByExpiresAtBefore(LocalDateTime now);
}
