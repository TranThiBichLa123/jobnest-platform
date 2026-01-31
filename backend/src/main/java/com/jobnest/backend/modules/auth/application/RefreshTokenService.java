package com.jobnest.backend.modules.auth.application;

import com.jobnest.backend.shared.domain.Account;
import com.jobnest.backend.modules.auth.domain.RefreshToken;
import com.jobnest.backend.modules.auth.infrastructure.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public RefreshToken createRefreshToken(Account account, String deviceInfo, String ipAddress) {
        // Generate JWT refresh token
        String token = jwtService.generateRefreshToken(account.getId(), account.getEmail());
        
        // Hash the token for storage
        String tokenHash = hashToken(token);
        
        // Create refresh token entity
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setAccount(account);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setDeviceInfo(deviceInfo);
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshToken.setRevoked(false);
        
        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeToken(String token) {
        String tokenHash = hashToken(token);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional
    public void revokeAllUserTokens(Long accountId) {
        refreshTokenRepository.deleteByAccountId(accountId);
    }

    @Transactional
    public boolean validateRefreshToken(String token) {
        String tokenHash = hashToken(token);
        return refreshTokenRepository.findByTokenHash(tokenHash)
                .map(rt -> !rt.getRevoked() && rt.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}
