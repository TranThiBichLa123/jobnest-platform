package com.jobnest.backend.modules.jobs.api;

import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.modules.jobs.application.JobService;
import com.jobnest.backend.modules.jobs.domain.Job;
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

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "04. Admin Jobs", description = "Admin job moderation APIs")
public class AdminJobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getJobsForAdmin(
            @RequestParam(required = false) Job.JobStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(jobService.getJobsForAdmin(status, keyword, pageable));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<String> approveJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.approveJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job approved successfully");
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<String> rejectJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.rejectJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job rejected successfully");
    }

    @PostMapping("/{id}/hide")
    public ResponseEntity<String> hideJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.adminHideJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job hidden successfully");
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<String> restoreJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        jobService.restoreJob(userDetails.getAccount().getId(), id);
        return ResponseEntity.ok("Job restored to pending review successfully");
    }
}