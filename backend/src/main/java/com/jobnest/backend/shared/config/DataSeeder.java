package com.jobnest.backend.shared.config;

import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.auth.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminIfNotExists();
    }

    private void createAdminIfNotExists() {
        String adminEmail = "admin@gmail.com";

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        Account admin = new Account();
        admin.setUsername("admin");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole(Account.Role.ADMIN);
        admin.setStatus(Account.AccountStatus.ACTIVE);
        admin.setFullName("System Administrator");

        userRepository.save(admin);

        System.out.println("=====================================");
        System.out.println("DEFAULT ADMIN CREATED");
        System.out.println("EMAIL: admin@gmail.com");
        System.out.println("PASSWORD: admin123");
        System.out.println("=====================================");
    }
}