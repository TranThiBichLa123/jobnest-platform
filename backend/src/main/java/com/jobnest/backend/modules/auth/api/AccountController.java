package com.jobnest.backend.modules.auth.api;

import com.jobnest.backend.modules.auth.api.dto.request.ChangePasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.response.AccountDTO;
import com.jobnest.backend.modules.auth.application.AccountService;
import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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
    public ResponseEntity<AccountDTO> getMyProfile(@AuthenticationPrincipal CustomUserDetails user) {
        Account account = accountService.findById(user.getAccount().getId());
        return ResponseEntity.ok(accountService.toDTO(account));
    }

    @PutMapping("/me")
    public ResponseEntity<AccountDTO> updateProfile(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody Account updates
    ) {
        Account updated = accountService.updateProfile(user.getAccount().getId(), updates);
        return ResponseEntity.ok(accountService.toDTO(updated));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AccountDTO> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(accountService.uploadAvatar(user.getAccount().getId(), file));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody ChangePasswordRequest req
    ) {
        accountService.changePassword(user.getAccount().getId(), req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}