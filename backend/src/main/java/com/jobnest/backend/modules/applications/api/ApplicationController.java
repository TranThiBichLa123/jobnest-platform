package com.jobnest.backend.modules.applications.api;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import com.jobnest.backend.modules.applications.domain.Application;
import com.jobnest.backend.modules.applications.infrastructure.ApplicationRepository;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import com.jobnest.backend.modules.applications.application.ApplicationService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "08. Applications", description = "Job application management APIs")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository; // Inject repository directly

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<ApplicationResponse> applyForJob(
            @PathVariable Long jobId,
            @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found. Please complete your profile first.");
        }

        ApplicationResponse response = applicationService.applyForJob(jobId, candidateId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{jobId}")
    public ResponseEntity<Map<String, Object>> checkIfApplied(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long candidateId = userDetails.getCandidateProfileId();
        boolean hasApplied = candidateId != null &&
                applicationService.hasApplied(jobId, candidateId);

        // Lấy status của application mới nhất (nếu có)
        Optional<Application> latest =
            candidateId != null
                ? applicationRepository.findTopByJobIdAndCandidateIdOrderByAppliedAtDesc(jobId, candidateId)
                : Optional.empty();

        String status = latest.map(a -> a.getStatus().name()).orElse(null);

        return ResponseEntity.ok(
            Map.of(
                "hasApplied", hasApplied,
                "status", status
            )
        );
    }

    @GetMapping("/my-applications")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getCandidateApplications(candidateId, pageable);
        
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationDetails(@PathVariable Long id) {
        ApplicationResponse response = applicationService.getApplicationById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> withdrawApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long candidateId = userDetails.getCandidateProfileId();
        if (candidateId == null) {
            throw new RuntimeException("Candidate profile not found");
        }

        applicationService.withdrawApplication(id, candidateId);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    // Employer endpoints
    @GetMapping("/job/{jobId}")
    public ResponseEntity<Page<ApplicationResponse>> getJobApplications(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getJobApplications(jobId, pageable);
        
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String status = request.get("status");
        String notes = request.get("notes");
        
        ApplicationResponse response = applicationService.updateApplicationStatus(id, status, notes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/job/{jobId}/count")
    public ResponseEntity<Map<String, Long>> countApplications(@PathVariable Long jobId) {
        long count = applicationService.countApplications(jobId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
