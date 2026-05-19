package com.jobnest.backend.modules.auth.api;

import com.jobnest.backend.integration.google.GoogleService;
import com.jobnest.backend.modules.auth.api.dto.request.ChangePasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.request.ForgotPasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.request.LoginRequest;
import com.jobnest.backend.modules.auth.api.dto.request.RegisterRequest;
import com.jobnest.backend.modules.auth.api.dto.request.ResetPasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.response.AccountDTO;
import com.jobnest.backend.modules.auth.api.dto.response.AuthResponse;
import com.jobnest.backend.modules.auth.application.AccountService;
import com.jobnest.backend.modules.auth.application.JwtService;
import com.jobnest.backend.modules.auth.application.RefreshTokenService;
import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "01. Authentication", description = "Authentication and user management APIs")
public class AuthController {

    private final AccountService accountService;
    private final GoogleService googleService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        Account account = accountService.register(req);
        return ResponseEntity.ok(Map.of(
                "message", "Registration successful. Please verify your email before logging in.",
                "email", account.getEmail(),
                "role", account.getRole().name(),
                "status", account.getStatus().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(accountService.login(req));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken != null) {
            refreshTokenService.revokeToken(refreshToken);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");

        if (refreshToken == null || !refreshTokenService.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String email = jwtService.extractEmail(refreshToken);
        Long userId = jwtService.extractUserId(refreshToken);

        Account account = accountService.findByEmail(email);

        String newAccessToken = jwtService.generateAccessToken(
                userId,
                email,
                account.getRole().name()
        );

        return ResponseEntity.ok(new AuthResponse(newAccessToken, refreshToken, null));
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        accountService.sendPasswordResetEmail(req.getEmail());
        return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        accountService.resetPassword(req);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/password/change")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody ChangePasswordRequest req
    ) {
        accountService.changePassword(user.getAccount().getId(), req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        accountService.verifyEmail(body.get("token"));
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        accountService.sendEmailVerificationByEmail(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "Verification email sent"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not logged in"));
        }
        return ResponseEntity.ok(accountService.toDTO(user.getAccount()));
    }

    @PostMapping("/google/verify")
    public ResponseEntity<AuthResponse> verifyGoogle(@RequestBody Map<String, String> body) {
        String token = body.get("credential");
        String role = body.get("role");

        var payload = googleService.verify(token);

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        String googleId = payload.getSubject();

        Account acc = accountService.registerWithGoogle(email, name, picture, googleId, role);

        String accessToken = jwtService.generateAccessToken(
                acc.getId(),
                acc.getEmail(),
                acc.getRole().name()
        );

        String refreshToken = jwtService.generateRefreshToken(
                acc.getId(),
                acc.getEmail()
        );

        refreshTokenService.createRefreshToken(acc, "Web Browser", "127.0.0.1");

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, accountService.toDTO(acc)));
    }
}