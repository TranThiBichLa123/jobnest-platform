package com.jobnest.backend.shared.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.shared.domain.Account;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByEmail(String email);
    Optional<Account> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
