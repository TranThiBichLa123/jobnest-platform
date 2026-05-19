package com.jobnest.backend.modules.applications.api;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import com.jobnest.backend.modules.applications.application.ApplicationService;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "08. Applications", description = "Job application management APIs")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationResponse> applyForJob(
            @PathVariable Long jobId,
            @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = userDetails.getCandidateProfileId();

        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found. Please complete your profile first.");
        }

        ApplicationResponse response = applicationService.applyForJob(jobId, candidateId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Map<String, Object>> checkIfApplied(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = userDetails.getCandidateProfileId();

        boolean hasApplied = candidateId != null && applicationService.hasApplied(jobId, candidateId);
        String status = candidateId != null
                ? applicationService.getCandidateApplicationStatusForJob(jobId, candidateId)
                : null;

        Map<String, Object> response = new HashMap<>();
        response.put("hasApplied", hasApplied);
        response.put("status", status);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = userDetails.getCandidateProfileId();

        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getCandidateApplications(candidateId, pageable);

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/candidate/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationResponse> getApplicationDetailsForCandidate(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = userDetails.getCandidateProfileId();

        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found");
        }

        return ResponseEntity.ok(applicationService.getApplicationByIdForCandidate(id, candidateId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> withdrawApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = userDetails.getCandidateProfileId();

        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found");
        }

        applicationService.withdrawApplication(id, candidateId);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Page<ApplicationResponse>> getJobApplications(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getJobApplications(jobId, employerId, pageable);

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/employer/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApplicationResponse> getApplicationDetailsForEmployer(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();
        return ResponseEntity.ok(applicationService.getApplicationByIdForEmployer(id, employerId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();

        String status = request.get("status");
        String notes = request.get("notes");

        ApplicationResponse response = applicationService.updateApplicationStatus(id, employerId, status, notes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/job/{jobId}/count")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Map<String, Long>> countApplications(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();
        long count = applicationService.countApplications(jobId, employerId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}