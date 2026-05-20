package com.jobnest.backend.security.user;

import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.entities.candidate.CandidateProfile;
import com.jobnest.backend.repository.auth.UserRepository;
import com.jobnest.backend.repository.candidate.CandidateProfileRepository;

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
