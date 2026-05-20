package com.jobnest.backend.security.user;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.jobnest.backend.entities.auth.Account;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {
    private final Account account;
    private Long candidateProfileId;

    public CustomUserDetails(Account account) {
        this.account = account;
    }

    public CustomUserDetails(Account account, Long candidateProfileId) {
        this.account = account;
        this.candidateProfileId = candidateProfileId;
    }

    public Account getAccount() {
        return this.account;
    }

    public Long getId() {
        // Trả về id của entity Account đang đăng nhập (chính là user hiện tại)
        return this.account.getId();
    }

    public Long getCandidateProfileId() {
        return this.candidateProfileId;
    }

    public void setCandidateProfileId(Long candidateProfileId) {
        this.candidateProfileId = candidateProfileId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Return role as authority with ROLE_ prefix (required by Spring Security)
        return Collections.singletonList(
        new SimpleGrantedAuthority("ROLE_" + account.getRole().name())
        );
    }

    @Override
    public String getPassword() {
        return account.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return account.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() { 
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() { 
        // Check if account is not BLOCKED
        return account.getStatus() != Account.AccountStatus.BLOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() { 
        return true; 
    }

    @Override
    public boolean isEnabled() { 
        // Check if account is ACTIVE
        return account.getStatus() == Account.AccountStatus.ACTIVE;
    }
}
