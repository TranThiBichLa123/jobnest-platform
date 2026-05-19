package com.jobnest.backend.modules.auth.application;

import com.jobnest.backend.modules.auth.api.dto.request.ChangePasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.request.LoginRequest;
import com.jobnest.backend.modules.auth.api.dto.request.RegisterRequest;
import com.jobnest.backend.modules.auth.api.dto.request.ResetPasswordRequest;
import com.jobnest.backend.modules.auth.api.dto.response.AccountDTO;
import com.jobnest.backend.modules.auth.api.dto.response.AuthResponse;
import com.jobnest.backend.modules.auth.domain.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface AccountService {
    Account register(RegisterRequest req);

    Account registerWithGoogle(String email, String name, String picture, String googleId, String role);

    AuthResponse login(LoginRequest req);

    Account findByEmail(String email);

    Account findById(Long id);

    Account updateProfile(Long accountId, Account updates);

    AccountDTO uploadAvatar(Long accountId, MultipartFile file);

    void changePassword(Long accountId, ChangePasswordRequest req);

    void sendPasswordResetEmail(String email);

    void resetPassword(ResetPasswordRequest req);

    void sendEmailVerification(Long accountId);

    void sendEmailVerificationByEmail(String email);

    void verifyEmail(String token);

    Page<AccountDTO> getAllAccounts(Pageable pageable);

    void blockAccount(Long adminId, Long targetAccountId);

    void unblockAccount(Long adminId, Long targetAccountId);

    AccountDTO toDTO(Account account);
}