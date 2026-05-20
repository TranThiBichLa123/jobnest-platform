package com.jobnest.backend.modules.jobs.api;

import com.jobnest.backend.modules.jobs.api.dto.request.ExtendJobRequest;
import com.jobnest.backend.modules.jobs.api.dto.request.JobRequest;
import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.modules.jobs.application.JobService;
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

import java.util.List;

@RestController
@RequestMapping("/api/employers")
@RequiredArgsConstructor
@Tag(name = "09. Employer Jobs", description = "Employer job management APIs")
public class EmployerJobController {

    private final JobService jobService;

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> createJob(
            @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(jobService.createJob(userDetails.getAccount().getId(), request));
    }

    @PutMapping("/jobs/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long id,
            @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(jobService.updateJob(userDetails.getAccount().getId(), id, request));
    }

    @PostMapping("/jobs/{id}/hide")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<String> hideJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.hideJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job hidden successfully");
    }

    @PostMapping("/jobs/{id}/unhide")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<String> unhideJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.unhideJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job sent to admin review successfully");
    }

    @PostMapping("/jobs/{id}/extend")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<String> extendJob(
            @PathVariable Long id,
            @RequestBody ExtendJobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.extendJob(userDetails.getAccount().getId(), id, request);
        return ResponseEntity.ok("Job extended and sent to admin review successfully");
    }

    @GetMapping("/me/jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Page<JobResponse>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(jobService.getEmployerJobs(userDetails.getAccount().getId(), pageable));
    }

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<JobResponse>> getEmployerPublicActiveJobs(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getAllEmployerJobs(id));
    }
}