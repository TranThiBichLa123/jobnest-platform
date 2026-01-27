package com.jobnest.backend.controllers.job;

import com.jobnest.backend.dto.response.JobCategoryResponse;
import com.jobnest.backend.dto.response.JobResponse;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.service.job.JobService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

/**
 * Job Controller for CANDIDATE role
 * Candidates can only view active jobs and save them
 */
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "02. Jobs", description = "Job listing and management APIs for candidates")
public class JobController {

    private final JobService jobService;

    /**
     * GET /api/jobs - View all active jobs
     * Open to everyone (authenticated or not)
     */
    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<JobResponse> jobs = jobService.getAllActiveJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    /**
     * GET /api/jobs/search - Search active jobs
     */
    @GetMapping("/search")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<JobResponse> jobs = jobService.searchActiveJobs(keyword, pageable);
        return ResponseEntity.ok(jobs);
    }

    /**
     * GET /api/jobs/{id} - View job details
     * Tracks views (IP-based for guests, user-based for authenticated)
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        Long viewerId = userDetails != null ? userDetails.getAccount().getId() : null;
        String viewerIp = request.getRemoteAddr();

        JobResponse job = jobService.getJobById(id, viewerId, viewerIp);
        return ResponseEntity.ok(job);
    }

    /**
     * POST /api/jobs/{id}/save - Save a job (authenticated users only)
     */
    @PostMapping("/{id}/save")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<String> saveJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        jobService.saveJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job saved successfully");
    }

    /**
     * DELETE /api/jobs/{id}/save - Unsave a job
     */
    @DeleteMapping("/{id}/save")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<String> unsaveJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        jobService.unsaveJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job unsaved successfully");
    }

    /**
     * GET /api/jobs/saved - Get user's saved jobs
     */
    @GetMapping("/saved")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<List<JobResponse>> getSavedJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<JobResponse> savedJobs = jobService.getSavedJobs(userDetails.getAccount().getId());
        return ResponseEntity.ok(savedJobs);
    }

    /**
     * GET /api/jobs/categories/stats - Get job count by category
     */
    @GetMapping("/categories/stats")
    public ResponseEntity<List<JobCategoryResponse>> getCategoryStats() {
        List<JobCategoryResponse> stats = jobService.getCategoryStats();
        return ResponseEntity.ok(stats);
    }

   
}
