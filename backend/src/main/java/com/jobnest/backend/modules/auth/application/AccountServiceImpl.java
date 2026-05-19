package com.jobnest.backend.modules.auth.application;

import com.jobnest.backend.integration.email.EmailService;
import com.jobnest.backend.modules.auth.api.dto.request.ChangePasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.request.LoginRequest;
import com.jobnest.backend.modules.auth.api.dto.request.RegisterRequest;
import com.jobnest.backend.modules.auth.api.dto.request.ResetPasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.response.AccountDTO;
import com.jobnest.backend.modules.auth.api.dto.response.AuthResponse;
import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.auth.domain.EmailVerification;
import com.jobnest.backend.modules.auth.domain.PasswordResetToken;
import com.jobnest.backend.modules.auth.infrastructure.EmailVerificationRepository;
import com.jobnest.backend.modules.auth.infrastructure.PasswordResetTokenRepository;
import com.jobnest.backend.modules.auth.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;

    @Override
    @Transactional
    public Account register(RegisterRequest req) {
        String email = normalizeEmail(req.getEmail());
        String username = req.getUsername() != null ? req.getUsername().trim() : null;

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (username == null || username.isBlank()) {
            throw new RuntimeException("Username is required");
        }

        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already in use");
        }

        Account.Role role = resolveSelfRegistrationRole(req.getRole());

        Account acc = new Account();
        acc.setUsername(username);
        acc.setEmail(email);
        acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        acc.setRole(role);

        /*
         * Demo mode:
         * Accounts are activated immediately to keep the recruitment demo stable.
         * Email verification endpoints are still available but registration does not
         * depend on SMTP availability.
         */
        acc.setStatus(Account.AccountStatus.ACTIVE);

        return userRepository.save(acc);
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        String email = normalizeEmail(req.getEmail());

        Account account = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (account.getStatus() == Account.AccountStatus.BLOCKED
                || account.getStatus() == Account.AccountStatus.SUSPENDED
                || account.getStatus() == Account.AccountStatus.BANNED) {
            throw new RuntimeException("Account is not allowed to login. Please contact support.");
        }

        if (account.getStatus() == Account.AccountStatus.PENDING) {
            throw new RuntimeException("Account is pending verification.");
        }

        account.setLastLoginAt(LocalDateTime.now());
        userRepository.save(account);

        String accessToken = jwtService.generateAccessToken(
                account.getId(),
                account.getEmail(),
                account.getRole().name()
        );

        String refreshToken = jwtService.generateRefreshToken(
                account.getId(),
                account.getEmail()
        );

        refreshTokenService.createRefreshToken(account, "Web Browser", "127.0.0.1");

        return new AuthResponse(accessToken, refreshToken, mapToDTO(account));
    }

    @Override
    @Transactional
    public Account registerWithGoogle(String email, String name, String picture, String googleId, String role) {
        String normalizedEmail = normalizeEmail(email);

        return userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    Account acc = new Account();
                    acc.setEmail(normalizedEmail);
                    acc.setUsername(normalizedEmail.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 6));
                    acc.setFullName(name);
                    acc.setAvatarUrl(picture);
                    acc.setRole(resolveSelfRegistrationRole(role));
                    acc.setStatus(Account.AccountStatus.ACTIVE);
                    acc.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                    return userRepository.save(acc);
                });
    }

    @Override
    public Account findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    @Override
    public Account findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    @Override
    @Transactional
    public Account updateProfile(Long accountId, Account updates) {
        Account account = findById(accountId);

        if (updates.getUsername() != null && !updates.getUsername().isBlank()) {
            String newUsername = updates.getUsername().trim();

            if (!newUsername.equals(account.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new RuntimeException("Username already in use");
            }

            account.setUsername(newUsername);
        }

        if (updates.getAvatarUrl() != null) {
            account.setAvatarUrl(updates.getAvatarUrl());
        }

        if (updates.getFullName() != null) {
            account.setFullName(updates.getFullName());
        }

        account.setUpdatedBy(accountId);
        return userRepository.save(account);
    }

    @Override
    @Transactional
    public void changePassword(Long accountId, ChangePasswordRequest req) {
        Account account = findById(accountId);

        if (!passwordEncoder.matches(req.getOldPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Old password is incorrect");
        }

        account.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        account.setUpdatedBy(accountId);
        userRepository.save(account);
    }

    @Override
    @Transactional
    public void sendPasswordResetEmail(String email) {
        Account account = findByEmail(email);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setAccount(account);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));

        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(account.getEmail(), resetToken.getToken());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndIsUsedFalse(req.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        Account account = resetToken.getAccount();
        account.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(account);

        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public void sendEmailVerification(Long accountId) {
        Account account = findById(accountId);

        EmailVerification verification = new EmailVerification();
        verification.setAccount(account);
        verification.setToken(UUID.randomUUID().toString());
        verification.setExpiresAt(LocalDateTime.now().plusHours(24));
        verification.setCreatedBy(accountId);

        emailVerificationRepository.save(verification);

        emailService.sendVerificationEmail(account.getEmail(), verification.getToken());
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        EmailVerification verification = emailVerificationRepository
                .findByTokenAndIsUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        Account account = verification.getAccount();
        account.setStatus(Account.AccountStatus.ACTIVE);
        userRepository.save(account);

        verification.setIsUsed(true);
        emailVerificationRepository.save(verification);
    }

    @Override
    @Transactional
    public void blockAccount(Long accountId) {
        Account account = findById(accountId);
        account.setStatus(Account.AccountStatus.BLOCKED);
        userRepository.save(account);
    }

    @Override
    @Transactional
    public void unblockAccount(Long accountId) {
        Account account = findById(accountId);
        account.setStatus(Account.AccountStatus.ACTIVE);
        userRepository.save(account);
    }

    private Account.Role resolveSelfRegistrationRole(String role) {
        if (role == null || role.isBlank()) {
            return Account.Role.CANDIDATE;
        }

        String normalizedRole = role.trim().toUpperCase(Locale.ROOT);

        if ("CANDIDATE".equals(normalizedRole)) {
            return Account.Role.CANDIDATE;
        }

        if ("EMPLOYER".equals(normalizedRole)) {
            return Account.Role.EMPLOYER;
        }

        /*
         * Admin accounts must not be created through public registration.
         * Create demo admin manually through DB seed or a protected admin endpoint.
         */
        throw new RuntimeException("Only CANDIDATE and EMPLOYER roles are allowed for self-registration");
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private AccountDTO mapToDTO(Account account) {
        AccountDTO dto = new AccountDTO();
        dto.setId(account.getId());
        dto.setUsername(account.getUsername());
        dto.setEmail(account.getEmail());
        dto.setRole(account.getRole().name());
        dto.setAvatarUrl(account.getAvatarUrl());
        dto.setStatus(account.getStatus().name());
        dto.setLastLoginAt(account.getLastLoginAt());
        dto.setCreatedAt(account.getCreatedAt());
        return dto;
    }
}