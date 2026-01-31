package com.jobnest.backend.modules.auth.api.dto.request;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}
