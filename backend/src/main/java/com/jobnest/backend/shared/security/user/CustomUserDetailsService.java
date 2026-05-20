package com.jobnest.backend.shared.security.user;

import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.auth.infrastructure.UserRepository;
import com.jobnest.backend.modules.candidate.domain.CandidateProfile;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account account = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        CustomUserDetails userDetails = new CustomUserDetails(account);

        if (account.getRole() == Account.Role.CANDIDATE) {
            Optional<CandidateProfile> profile = candidateProfileRepository.findByUser_Id(account.getId());
            profile.ifPresent(p -> userDetails.setCandidateProfileId(p.getId()));
        }

        return userDetails;
    }
}