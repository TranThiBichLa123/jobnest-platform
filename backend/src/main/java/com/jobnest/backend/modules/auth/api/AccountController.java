package com.jobnest.backend.modules.auth.api;

import com.jobnest.backend.modules.auth.api.dto.request.ChangePasswordRequest;
import com.jobnest.backend.shared.domain.Account;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import com.jobnest.backend.modules.auth.application.AccountService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/me")
    public ResponseEntity<Account> getMyProfile(@AuthenticationPrincipal CustomUserDetails user) {
        Account account = accountService.findById(user.getAccount().getId());
        return ResponseEntity.ok(account);
    }

    @PutMapping("/me")
    public ResponseEntity<Account> updateProfile(
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestBody Account updates
    ) {
        Account updated = accountService.updateProfile(user.getAccount().getId(), updates);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestParam("file") MultipartFile file
    ) {
        // TODO: Implement file upload logic
        return ResponseEntity.ok(Map.of("message", "Avatar upload not implemented yet"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestBody ChangePasswordRequest req
    ) {
        accountService.changePassword(user.getAccount().getId(), req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal CustomUserDetails user) {
        // TODO: Implement soft delete logic
        return ResponseEntity.ok(Map.of("message", "Account deletion not implemented yet"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs(@AuthenticationPrincipal CustomUserDetails user) {
        // TODO: Implement activity logs retrieval
        return ResponseEntity.ok(Map.of("message", "Activity logs not implemented yet"));
    }

    // Admin endpoints
    @PostMapping("/block/{id}")
    public ResponseEntity<?> blockAccount(@PathVariable Long id) {
        accountService.blockAccount(id);
        return ResponseEntity.ok(Map.of("message", "Account blocked successfully"));
    }

    @PostMapping("/unblock/{id}")
    public ResponseEntity<?> unblockAccount(@PathVariable Long id) {
        accountService.unblockAccount(id);
        return ResponseEntity.ok(Map.of("message", "Account unblocked successfully"));
    }
}
