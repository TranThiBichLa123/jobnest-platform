package com.jobnest.backend.modules.applications.api;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import com.jobnest.backend.modules.applications.application.ApplicationService;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "08. Applications", description = "Job application management APIs")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate applies for an active job using one of their CVs")
    public ResponseEntity<ApplicationResponse> applyForJob(
            @PathVariable Long jobId,
            @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = requireCandidateProfile(userDetails);
        return ResponseEntity.ok(applicationService.applyForJob(jobId, candidateId, request));
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Check whether current candidate has applied to a job")
    public ResponseEntity<Map<String, Object>> checkIfApplied(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = requireCandidateProfile(userDetails);

        boolean hasApplied = applicationService.hasApplied(jobId, candidateId);
        String status = applicationService.getCandidateApplicationStatusForJob(jobId, candidateId);

        return ResponseEntity.ok(Map.of(
                "hasApplied", hasApplied,
                "status", status == null ? "" : status
        ));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate views their own applications")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = requireCandidateProfile(userDetails);
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

        return ResponseEntity.ok(applicationService.getCandidateApplications(candidateId, pageable));
    }

    @GetMapping("/candidate/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate views one of their own applications")
    public ResponseEntity<ApplicationResponse> getApplicationDetailsForCandidate(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = requireCandidateProfile(userDetails);
        return ResponseEntity.ok(applicationService.getApplicationByIdForCandidate(id, candidateId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate withdraws their own pending application")
    public ResponseEntity<Map<String, String>> withdrawApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long candidateId = requireCandidateProfile(userDetails);
        applicationService.withdrawApplication(id, candidateId);

        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Employer views applications of their own job")
    public ResponseEntity<Page<ApplicationResponse>> getJobApplications(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());

        return ResponseEntity.ok(applicationService.getJobApplications(jobId, employerId, pageable));
    }

    @GetMapping("/employer/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Employer views one application of their own job")
    public ResponseEntity<ApplicationResponse> getApplicationDetailsForEmployer(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();
        return ResponseEntity.ok(applicationService.getApplicationByIdForEmployer(id, employerId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Employer updates application status of their own job")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();

        String status = request == null ? null : request.get("status");
        String notes = request == null ? null : request.get("notes");

        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, employerId, status, notes));
    }

    @GetMapping("/job/{jobId}/count")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Employer counts applications of their own job")
    public ResponseEntity<Map<String, Long>> countApplications(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long employerId = userDetails.getAccount().getId();
        long count = applicationService.countApplications(jobId, employerId);

        return ResponseEntity.ok(Map.of("count", count));
    }

    private Long requireCandidateProfile(CustomUserDetails userDetails) {
        Long candidateId = userDetails.getCandidateProfileId();

        if (candidateId == null) {
            throw new BadRequestException("Candidate profile not found. Please complete your profile first, then login again.");
        }

        return candidateId;
    }
}