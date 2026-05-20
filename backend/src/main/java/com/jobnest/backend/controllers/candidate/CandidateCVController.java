package com.jobnest.backend.controllers.candidate;

import com.jobnest.backend.dto.request.CandidateCVRequest;
import com.jobnest.backend.dto.response.CandidateCVResponse;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.service.candidate.CandidateCVService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate/cvs")
public class CandidateCVController {

    @Autowired
    private CandidateCVService cvService;

    @PostMapping
    public ResponseEntity<CandidateCVResponse> createCV(
            @RequestBody CandidateCVRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            return ResponseEntity.status(403).build();
        }

        CandidateCVResponse response = cvService.createCV(candidateId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cvId}")
    public ResponseEntity<CandidateCVResponse> updateCV(
            @PathVariable Long cvId,
            @RequestBody CandidateCVRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            return ResponseEntity.status(403).build();
        }

        CandidateCVResponse response = cvService.updateCV(cvId, candidateId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<?> deleteCV(
            @PathVariable Long cvId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            return ResponseEntity.status(403).build();
        }

        cvService.deleteCV(cvId, candidateId);
        return ResponseEntity.ok(Map.of("message", "CV deleted successfully"));
    }

    @PutMapping("/{cvId}/set-default")
    public ResponseEntity<CandidateCVResponse> setDefaultCV(
            @PathVariable Long cvId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            return ResponseEntity.status(403).build();
        }

        CandidateCVResponse response = cvService.setDefaultCV(cvId, candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CandidateCVResponse>> getMyCVs(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            return ResponseEntity.status(403).build();
        }

        List<CandidateCVResponse> cvs = cvService.getMyCVs(candidateId);
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/{cvId}")
    public ResponseEntity<CandidateCVResponse> getCVById(
            @PathVariable Long cvId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            return ResponseEntity.status(403).build();
        }

        CandidateCVResponse response = cvService.getCVById(cvId, candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/default")
    public ResponseEntity<CandidateCVResponse> getDefaultCV(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            return ResponseEntity.status(403).build();
        }

        CandidateCVResponse response = cvService.getDefaultCV(candidateId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
