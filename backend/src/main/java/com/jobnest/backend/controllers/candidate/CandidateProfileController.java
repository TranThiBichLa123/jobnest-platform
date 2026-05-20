package com.jobnest.backend.controllers.candidate;

import com.jobnest.backend.dto.request.CandidateProfileRequest;
import com.jobnest.backend.dto.response.CandidateProfileResponse;
import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.repository.auth.UserRepository;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.service.candidate.CandidateProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
@Tag(name = "03. Candidate Profile", description = "Candidate profile management APIs")
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;
    private final UserRepository userRepository;
    
    private static final String UPLOAD_DIR = "uploads/avatars/";

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get my profile")
    public ResponseEntity<CandidateProfileResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            CandidateProfileResponse profile = candidateProfileService.getProfile(userDetails.getAccount().getId());
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            // Profile doesn't exist yet, return null values
            return ResponseEntity.ok(new CandidateProfileResponse());
        }
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Create or update my profile")
    public ResponseEntity<CandidateProfileResponse> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CandidateProfileRequest request
    ) {
        CandidateProfileResponse profile = candidateProfileService.createOrUpdateProfile(
                userDetails.getAccount().getId(), 
                request
        );
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Upload avatar image")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("Please select a file");
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed");
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user's avatar URL
            String avatarUrl = "/uploads/avatars/" + filename;
            Account account = userDetails.getAccount();
            account.setAvatarUrl(avatarUrl);
            userRepository.save(account);

            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("avatarUrl", avatarUrl);
            response.put("message", "Avatar uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
}
