package com.jobnest.backend.modules.candidate.api;

import com.jobnest.backend.modules.candidate.api.dto.CandidateCVRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateCVResponse;
import com.jobnest.backend.modules.candidate.application.CandidateCVService;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate/cvs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@Tag(name = "07. Candidate CVs", description = "Candidate CV management APIs")
public class CandidateCVController {

    private final CandidateCVService cvService;

    @PostMapping
    public ResponseEntity<CandidateCVResponse> createCV(
            @RequestBody CandidateCVRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(cvService.createCV(candidateId, request));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CandidateCVResponse> uploadCV(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false, defaultValue = "false") Boolean isDefault,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(cvService.uploadCV(candidateId, title, isDefault, file));
    }

    @PutMapping("/{cvId}")
    public ResponseEntity<CandidateCVResponse> updateCV(
            @PathVariable Long cvId,
            @RequestBody CandidateCVRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(cvService.updateCV(cvId, candidateId, request));
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<?> deleteCV(
            @PathVariable Long cvId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        cvService.deleteCV(cvId, candidateId);
        return ResponseEntity.ok(Map.of("message", "CV deleted successfully"));
    }

    @PostMapping("/{cvId}/set-default")
    public ResponseEntity<CandidateCVResponse> setDefaultCV(
            @PathVariable Long cvId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(cvService.setDefaultCV(cvId, candidateId));
    }

    @GetMapping
    public ResponseEntity<List<CandidateCVResponse>> getMyCVs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(cvService.getMyCVs(candidateId));
    }

    @GetMapping("/{cvId}")
    public ResponseEntity<CandidateCVResponse> getCV(
            @PathVariable Long cvId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(cvService.getCVById(cvId, candidateId));
    }

    @GetMapping("/default")
    public ResponseEntity<CandidateCVResponse> getDefaultCV(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(cvService.getDefaultCV(candidateId));
    }

    private Long getCandidateId(CustomUserDetails userDetails) {
        Long candidateId = userDetails.getCandidateProfileId();

        if (candidateId == null) {
            throw new BadRequestException("Candidate profile not found. Please complete your profile first, then login again.");
        }

        return candidateId;
    }
}