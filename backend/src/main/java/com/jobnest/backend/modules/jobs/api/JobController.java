package com.jobnest.backend.modules.jobs.api;

import com.jobnest.backend.modules.jobs.api.dto.response.JobCategoryResponse;
import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.modules.jobs.application.JobService;
import com.jobnest.backend.modules.jobs.domain.Job;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
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

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "02. Jobs", description = "Public and candidate job APIs")
public class JobController {

    private final JobService jobService;

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
        return ResponseEntity.ok(jobService.getAllActiveJobs(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Job.JobType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) Integer maxSalary,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(jobService.searchActiveJobsAdvanced(
                keyword,
                location,
                type,
                categoryId,
                minSalary,
                maxSalary,
                experienceLevel,
                pageable
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        Long viewerId = userDetails != null ? userDetails.getAccount().getId() : null;
        String viewerIp = request.getRemoteAddr();

        return ResponseEntity.ok(jobService.getJobById(id, viewerId, viewerIp));
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasRole('CANDIDATE')")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<String> saveJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.saveJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job saved successfully");
    }

    @DeleteMapping("/{id}/save")
    @PreAuthorize("hasRole('CANDIDATE')")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<String> unsaveJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.unsaveJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job unsaved successfully");
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('CANDIDATE')")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<List<JobResponse>> getSavedJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(jobService.getSavedJobs(userDetails.getAccount().getId()));
    }

    @GetMapping("/categories/stats")
    public ResponseEntity<List<JobCategoryResponse>> getCategoryStats() {
        return ResponseEntity.ok(jobService.getCategoryStats());
    }
}