package com.jobnest.backend.modules.auth.infrastructure;

import com.jobnest.backend.modules.auth.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByEmail(String email);

    Optional<Account> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}