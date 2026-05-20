package com.jobnest.backend.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role; // "CANDIDATE" or "EMPLOYER"
}
