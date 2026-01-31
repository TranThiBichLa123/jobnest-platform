package com.jobnest.backend.modules.auth.application;

import com.jobnest.backend.modules.auth.api.dto.request.*;
import com.jobnest.backend.modules.auth.api.dto.response.*;
import com.jobnest.backend.shared.domain.Account;

public interface AccountService {
    Account register(RegisterRequest req);
    Account registerWithGoogle(String email, String name, String picture, String googleId, String role);
    AuthResponse login(LoginRequest req);
    Account findByEmail(String email);
    Account findById(Long id);
    Account updateProfile(Long accountId, Account updates);
    void changePassword(Long accountId, ChangePasswordRequest req);
    void sendPasswordResetEmail(String email);
    void resetPassword(ResetPasswordRequest req);
    void sendEmailVerification(Long accountId);
    void verifyEmail(String token);
    void blockAccount(Long accountId);
    void unblockAccount(Long accountId);
}
