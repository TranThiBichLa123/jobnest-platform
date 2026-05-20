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
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private static final long MAX_AVATAR_SIZE = 2L * 1024 * 1024;

    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

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
            throw new BadRequestException("Email is required");
        }

        if (username == null || username.isBlank()) {
            throw new BadRequestException("Username is required");
        }

        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already in use");
        }

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username already in use");
        }

        Account.Role role = resolveSelfRegistrationRole(req.getRole());

        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        account.setRole(role);
        account.setStatus(Account.AccountStatus.PENDING);

        Account saved = userRepository.save(account);

        /*
         * Security:
         * - Self-registration only allows CANDIDATE / EMPLOYER.
         * - ADMIN cannot be registered publicly.
         * - New accounts must verify email before login.
         *
         * Availability:
         * - EmailService must handle SMTP failure internally.
         * - Registration should not be rolled back just because email sending fails.
         */
        sendEmailVerification(saved.getId());

        return saved;
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        String email = normalizeEmail(req.getEmail());

        Account account = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (account.getStatus() == Account.AccountStatus.PENDING) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        if (account.getStatus() == Account.AccountStatus.BLOCKED
                || account.getStatus() == Account.AccountStatus.SUSPENDED
                || account.getStatus() == Account.AccountStatus.BANNED
                || account.getStatus() == Account.AccountStatus.INACTIVE) {
            throw new BadRequestException("Account is not allowed to login. Please contact support.");
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

        return new AuthResponse(accessToken, refreshToken, toDTO(account));
    }

    @Override
    @Transactional
    public Account registerWithGoogle(String email, String name, String picture, String googleId, String role) {
        String normalizedEmail = normalizeEmail(email);

        return userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    Account account = new Account();
                    account.setEmail(normalizedEmail);
                    account.setUsername(normalizedEmail.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 6));
                    account.setFullName(name);
                    account.setAvatarUrl(picture);
                    account.setRole(resolveSelfRegistrationRole(role));
                    account.setStatus(Account.AccountStatus.ACTIVE);
                    account.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                    return userRepository.save(account);
                });
    }

    @Override
    public Account findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Override
    public Account findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Override
    @Transactional
    public Account updateProfile(Long accountId, Account updates) {
        Account account = findById(accountId);

        if (updates.getUsername() != null && !updates.getUsername().isBlank()) {
            String newUsername = updates.getUsername().trim();

            if (!newUsername.equals(account.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new BadRequestException("Username already in use");
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
    public AccountDTO uploadAvatar(Long accountId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Avatar file is required");
        }

        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new BadRequestException("Avatar file must be less than 2MB");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_AVATAR_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Only JPG, PNG, WEBP, and GIF images are allowed");
        }

        Account account = findById(accountId);

        String extension = resolveImageExtension(contentType);
        String fileName = "avatar_" + accountId + "_" + UUID.randomUUID() + extension;

        try {
            Path uploadDir = Path.of("uploads", "avatars").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            Path targetPath = uploadDir.resolve(fileName).normalize();
            file.transferTo(targetPath.toFile());

            account.setAvatarUrl("/uploads/avatars/" + fileName);
            account.setUpdatedBy(accountId);

            Account saved = userRepository.save(account);
            return toDTO(saved);
        } catch (IOException ex) {
            throw new BadRequestException("Could not upload avatar");
        }
    }

    @Override
    @Transactional
    public void changePassword(Long accountId, ChangePasswordRequest req) {
        Account account = findById(accountId);

        if (!passwordEncoder.matches(req.getOldPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Old password is incorrect");
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
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
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

        if (account.getStatus() == Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is already verified");
        }

        emailVerificationRepository.findByAccountIdAndIsUsedFalse(accountId)
                .ifPresent(existing -> {
                    existing.setIsUsed(true);
                    existing.setUpdatedBy(accountId);
                    emailVerificationRepository.save(existing);
                });

        EmailVerification verification = new EmailVerification();
        verification.setAccount(account);
        verification.setToken(UUID.randomUUID().toString());
        verification.setExpiresAt(LocalDateTime.now().plusHours(24));
        verification.setCreatedBy(accountId);

        EmailVerification saved = emailVerificationRepository.save(verification);

        try {
            emailService.sendVerificationEmail(account.getEmail(), saved.getToken());
        } catch (Exception ex) {
            System.out.println("=====================================");
            System.out.println("EMAIL VERIFICATION SEND FAILED");
            System.out.println("Use this token for local demo:");
            System.out.println(saved.getToken());
            System.out.println("=====================================");
        }
    }

    @Override
    @Transactional
    public void sendEmailVerificationByEmail(String email) {
        Account account = findByEmail(email);

        if (account.getStatus() == Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is already verified");
        }

        sendEmailVerification(account.getId());
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Verification token is required");
        }

        EmailVerification verification = emailVerificationRepository
                .findByTokenAndIsUsedFalse(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired");
        }

        Account account = verification.getAccount();
        account.setStatus(Account.AccountStatus.ACTIVE);
        userRepository.save(account);

        verification.setIsUsed(true);
        verification.setUpdatedBy(account.getId());
        emailVerificationRepository.save(verification);
    }

    @Override
    public Page<AccountDTO> getAllAccounts(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDTO);
    }

    @Override
    @Transactional
    public void blockAccount(Long adminId, Long targetAccountId) {
        if (adminId.equals(targetAccountId)) {
            throw new BadRequestException("Admin cannot block their own account");
        }

        Account target = findById(targetAccountId);

        if (target.getRole() == Account.Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be blocked through this endpoint");
        }

        target.setStatus(Account.AccountStatus.BLOCKED);
        target.setUpdatedBy(adminId);
        userRepository.save(target);
    }

    @Override
    @Transactional
    public void unblockAccount(Long adminId, Long targetAccountId) {
        Account target = findById(targetAccountId);

        if (target.getRole() == Account.Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be modified through this endpoint");
        }

        target.setStatus(Account.AccountStatus.ACTIVE);
        target.setUpdatedBy(adminId);
        userRepository.save(target);
    }

    @Override
    public AccountDTO toDTO(Account account) {
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

        throw new BadRequestException("Only CANDIDATE and EMPLOYER roles are allowed for self-registration");
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveImageExtension(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new BadRequestException("Unsupported image type");
        };
    }
}