package com.jobnest.backend.modules.candidate.api;

import com.jobnest.backend.modules.candidate.api.dto.CandidateCVRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateCVResponse;
import com.jobnest.backend.modules.candidate.application.CandidateCVService;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate/cvs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateCVController {

    private final CandidateCVService cvService;

    @PostMapping
    public ResponseEntity<CandidateCVResponse> createCV(
            @RequestBody CandidateCVRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        CandidateCVResponse response = cvService.createCV(candidateId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cvId}")
    public ResponseEntity<CandidateCVResponse> updateCV(
            @PathVariable Long cvId,
            @RequestBody CandidateCVRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        CandidateCVResponse response = cvService.updateCV(cvId, candidateId, request);
        return ResponseEntity.ok(response);
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
        CandidateCVResponse response = cvService.setDefaultCV(cvId, candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CandidateCVResponse>> getMyCVs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        List<CandidateCVResponse> cvs = cvService.getMyCVs(candidateId);
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/{cvId}")
    public ResponseEntity<CandidateCVResponse> getCV(
            @PathVariable Long cvId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        CandidateCVResponse response = cvService.getCVById(cvId, candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/default")
    public ResponseEntity<CandidateCVResponse> getDefaultCV(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = getCandidateId(userDetails);
        CandidateCVResponse response = cvService.getDefaultCV(candidateId);
        return ResponseEntity.ok(response);
    }

    private Long getCandidateId(CustomUserDetails userDetails) {
        Long candidateId = userDetails.getCandidateProfileId();

        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found. Please complete your profile first.");
        }

        return candidateId;
    }
}