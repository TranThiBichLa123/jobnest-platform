package com.jobnest.backend.modules.candidate.api;

import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.auth.infrastructure.UserRepository;
import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateProfileResponse;
import com.jobnest.backend.modules.candidate.application.CandidateProfileService;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "03. Candidate Profile", description = "Candidate profile management APIs")
public class CandidateProfileController {

    private static final long MAX_AVATAR_SIZE = 2L * 1024 * 1024;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final CandidateProfileService candidateProfileService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get my candidate profile")
    public ResponseEntity<CandidateProfileResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            return ResponseEntity.ok(candidateProfileService.getProfile(userDetails.getAccount().getId()));
        } catch (RuntimeException ex) {
            return ResponseEntity.ok(new CandidateProfileResponse());
        }
    }

    @PutMapping
    @Operation(summary = "Create or update my candidate profile")
    public ResponseEntity<CandidateProfileResponse> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CandidateProfileRequest request
    ) {
        return ResponseEntity.ok(candidateProfileService.createOrUpdateProfile(
                userDetails.getAccount().getId(),
                request
        ));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload candidate avatar image")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("file") MultipartFile file
    ) {
        validateAvatar(file);

        try {
            Path uploadDir = Path.of("uploads", "avatars").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String extension = resolveExtension(file.getContentType());
            String fileName = "candidate_avatar_" + userDetails.getAccount().getId() + "_" + UUID.randomUUID() + extension;
            Path target = uploadDir.resolve(fileName).normalize();

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String avatarUrl = "/uploads/avatars/" + fileName;

            Account account = userDetails.getAccount();
            account.setAvatarUrl(avatarUrl);
            userRepository.save(account);

            return ResponseEntity.ok(Map.of(
                    "avatarUrl", avatarUrl,
                    "message", "Avatar uploaded successfully"
            ));
        } catch (IOException ex) {
            throw new BadRequestException("Could not upload avatar");
        }
    }

    private void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Avatar file is required");
        }

        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new BadRequestException("Avatar file must be <= 2MB");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only JPG, PNG, WEBP, and GIF images are allowed");
        }
    }

    private String resolveExtension(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new BadRequestException("Unsupported avatar type");
        };
    }
}