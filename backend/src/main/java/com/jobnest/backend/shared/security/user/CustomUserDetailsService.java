package com.jobnest.backend.shared.security.user;

import com.jobnest.backend.shared.domain.Account;
import com.jobnest.backend.modules.candidate.domain.CandidateProfile;
import com.jobnest.backend.shared.repository.UserRepository;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account account = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        CustomUserDetails userDetails = new CustomUserDetails(account);
        
        // If user is a candidate, fetch their profile ID
        if (account.getRole() == Account.Role.CANDIDATE) {
            Optional<CandidateProfile> profile = candidateProfileRepository.findByUser_Id(account.getId());
            profile.ifPresent(p -> userDetails.setCandidateProfileId(p.getId()));
        }
        
        return userDetails;
    }
}
