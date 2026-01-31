package com.jobnest.backend.modules.auth.api.dto.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
