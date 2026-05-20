package com.jobnest.backend.shared.security.user;

import com.jobnest.backend.modules.auth.domain.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
        return this.account.getId();
    }

    public Long getCandidateProfileId() {
        return candidateProfileId;
    }

    public void setCandidateProfileId(Long candidateProfileId) {
        this.candidateProfileId = candidateProfileId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
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
        return account.getStatus() != Account.AccountStatus.BLOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return account.getStatus() == Account.AccountStatus.ACTIVE;
    }
}