package com.jobnest.backend.service.auth;

import com.jobnest.backend.dto.request.*;
import com.jobnest.backend.dto.response.*;
import com.jobnest.backend.entities.auth.Account;

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
