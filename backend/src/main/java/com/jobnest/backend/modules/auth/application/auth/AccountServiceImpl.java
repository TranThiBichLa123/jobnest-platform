package com.jobnest.backend.modules.auth.application;

import com.jobnest.backend.modules.auth.api.dto.request.*;
import com.jobnest.backend.modules.auth.api.dto.response.*;
import com.jobnest.backend.shared.domain.Account;
import com.jobnest.backend.modules.auth.domain.EmailVerification;
import com.jobnest.backend.modules.auth.domain.PasswordResetToken;
import com.jobnest.backend.modules.auth.infrastructure.EmailVerificationRepository;
import com.jobnest.backend.modules.auth.infrastructure.PasswordResetTokenRepository;
import com.jobnest.backend.shared.repository.UserRepository;
import com.jobnest.backend.integration.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }

        // Check username uniqueness
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already in use!");
        }

        Account acc = new Account();
        acc.setUsername(req.getUsername());
        acc.setEmail(req.getEmail());
        acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        
        // Set role from request or default to CANDIDATE
        if (req.getRole() != null) {
            acc.setRole(Account.Role.valueOf(req.getRole().toUpperCase()));
        } else {
            acc.setRole(Account.Role.CANDIDATE);
        }
        
        // TODO: Change back to PENDING in production
        // For testing: Auto-activate accounts without email verification
        acc.setStatus(Account.AccountStatus.ACTIVE);

        Account saved = userRepository.save(acc);
        
        // Send email verification
        sendEmailVerification(saved.getId());
        
        return saved;
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        Account account = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (account.getStatus() == Account.AccountStatus.BLOCKED) {
            throw new RuntimeException("Account is blocked. Please contact support.");
        }

        if (account.getStatus() == Account.AccountStatus.PENDING) {
            throw new RuntimeException("Account is pending verification. Please check your email to verify your account.");
        }

        // Update last login
        account.setLastLoginAt(LocalDateTime.now());
        userRepository.save(account);

        // Generate real JWT tokens
        String accessToken = jwtService.generateAccessToken(
            account.getId(), 
            account.getEmail(), 
            account.getRole().name()
        );
        String refreshToken = jwtService.generateRefreshToken(
            account.getId(), 
            account.getEmail()
        );

        // Save refresh token to database
        refreshTokenService.createRefreshToken(account, "Web Browser", "127.0.0.1");

        AccountDTO accountDTO = mapToDTO(account);
        return new AuthResponse(accessToken, refreshToken, accountDTO);
    }

    @Override
    @Transactional
    public Account registerWithGoogle(String email, String name, String picture, String googleId, String role) {
        // If user exists, return it
        java.util.Optional<Account> opt = userRepository.findByEmail(email);
        if (opt.isPresent()) {
            return opt.get();
        }

        // Create new account
        Account acc = new Account();
        acc.setEmail(email);
        acc.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 6));
        acc.setAvatarUrl(picture);
        
        // Set role from parameter or default to CANDIDATE
        if ("EMPLOYER".equalsIgnoreCase(role)) {
            acc.setRole(Account.Role.EMPLOYER);
        } else {
            acc.setRole(Account.Role.CANDIDATE);
        }
        
        acc.setStatus(Account.AccountStatus.ACTIVE); // Auto-verify Google accounts
        acc.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password

        return userRepository.save(acc);
    }

    @Override
    public Account findByEmail(String email) {
        return userRepository.findByEmail(email)
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
        
        if (updates.getUsername() != null) {
            account.setUsername(updates.getUsername());
        }
        if (updates.getAvatarUrl() != null) {
            account.setAvatarUrl(updates.getAvatarUrl());
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
        
        // Create reset token
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setAccount(account);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1)); // 1 hour expiry
        
        passwordResetTokenRepository.save(resetToken);
        
        // Send reset email
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
        
        // Mark token as used
        resetToken.setIsUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public void sendEmailVerification(Long accountId) {
        Account account = findById(accountId);
        
        // Create verification token
        EmailVerification verification = new EmailVerification();
        verification.setAccount(account);
        verification.setToken(UUID.randomUUID().toString());
        verification.setExpiresAt(LocalDateTime.now().plusHours(24));
        verification.setCreatedBy(accountId);
        
        emailVerificationRepository.save(verification);
        
        // Send verification email
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
