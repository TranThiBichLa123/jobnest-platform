package com.jobnest.backend.controllers.job;

import com.jobnest.backend.dto.request.ExtendJobRequest;
import com.jobnest.backend.dto.request.JobRequest;
import com.jobnest.backend.dto.response.JobResponse;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.service.job.JobService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Employer Job Controller
 * Employers can manage their own job postings
 */
@RestController
@RequestMapping("/api/employers")
@RequiredArgsConstructor
@Tag(name = "09. Employer Jobs", description = "Job listing and management APIs for employers")
public class EmployerJobController {

    private final JobService jobService;

    /**
     * POST /api/employers/jobs - Create new job
     */
    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> createJob(
            @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        JobResponse job = jobService.createJob(userDetails.getAccount().getId(), request);
        return ResponseEntity.ok(job);
    }

    /**
     * PUT /api/employers/jobs/{id} - Update job
     */
    @PutMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long id,
            @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        JobResponse job = jobService.updateJob(userDetails.getAccount().getId(), id, request);
        return ResponseEntity.ok(job);
    }

    /**
     * POST /api/employers/jobs/{id}/hide - Hide job
     */
    @PostMapping("/jobs/{id}/hide")
    public ResponseEntity<String> hideJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.hideJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job hidden successfully");
    }

    /**
     * POST /api/employers/jobs/{id}/unhide - Unhide job
     */
    @PostMapping("/jobs/{id}/unhide")
    public ResponseEntity<String> unhideJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.unhideJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job unhidden successfully");
    }

    /**
     * POST /api/employers/jobs/{id}/extend - Extend job posting
     */
    @PostMapping("/jobs/{id}/extend")
    public ResponseEntity<String> extendJob(
            @PathVariable Long id,
            @RequestBody ExtendJobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.extendJob(userDetails.getAccount().getId(), id, request);
        return ResponseEntity.ok("Job extended successfully");
    }

    /**
     * GET /api/employers/me/jobs - Get current employer's jobs (paginated)
     */
    @GetMapping("/me/jobs")
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
        Page<JobResponse> jobs = jobService.getEmployerJobs(userDetails.getAccount().getId(), pageable);
        return ResponseEntity.ok(jobs);
    }

    /**
     * GET /api/employers/{id}/jobs - Get all jobs posted by specific employer
     * This can be accessed by anyone to see employer's job listings
     */
    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<JobResponse>> getEmployerJobs(@PathVariable Long id) {
        List<JobResponse> jobs = jobService.getAllEmployerJobs(id);
        return ResponseEntity.ok(jobs);
    }
}
