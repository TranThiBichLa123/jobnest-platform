package com.jobnest.backend.modules.auth.api;

import com.jobnest.backend.modules.auth.api.dto.response.AccountDTO;
import com.jobnest.backend.modules.auth.application.AccountService;
import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "02. Admin Users", description = "Admin user management APIs")
public class AdminUserController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<Page<AccountDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(accountService.getAllAccounts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO> getUserById(@PathVariable Long id) {
        Account account = accountService.findById(id);
        return ResponseEntity.ok(accountService.toDTO(account));
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<Map<String, String>> blockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin
    ) {
        accountService.blockAccount(admin.getAccount().getId(), id);
        return ResponseEntity.ok(Map.of("message", "Account blocked successfully"));
    }

    @PostMapping("/{id}/unblock")
    public ResponseEntity<Map<String, String>> unblockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin
    ) {
        accountService.unblockAccount(admin.getAccount().getId(), id);
        return ResponseEntity.ok(Map.of("message", "Account unblocked successfully"));
    }
}