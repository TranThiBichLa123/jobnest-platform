package com.jobnest.backend.modules.jobs.api;

import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import com.jobnest.backend.modules.jobs.application.JobService;

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

/**
 * Admin Job Controller
 * Admins have full moderation control over all jobs
 */
@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "04. Admin Jobs", description = "Admin job management APIs")

public class AdminJobController {

    private final JobService jobService;

    /**
     * GET /api/admin/jobs - View all jobs (including hidden/expired)
     */
    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<JobResponse> jobs = jobService.getAllJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    /**
     * POST /api/admin/jobs/{id}/approve - Approve job
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<String> approveJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.approveJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job approved successfully");
    }

    /**
     * POST /api/admin/jobs/{id}/reject - Reject job
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<String> rejectJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.rejectJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job rejected successfully");
    }

    /**
     * POST /api/admin/jobs/{id}/hide - Hide job
     */
    @PostMapping("/{id}/hide")
    public ResponseEntity<String> hideJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.adminHideJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job hidden successfully");
    }

    /**
     * POST /api/admin/jobs/{id}/restore - Restore job
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<String> restoreJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.restoreJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job restored successfully");
    }

    
}
