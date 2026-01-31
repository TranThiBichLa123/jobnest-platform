package com.jobnest.backend.modules.auth.api.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role; // "CANDIDATE" or "EMPLOYER"
}
