package com.jobnest.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AccountDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String avatarUrl;
    private String status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
