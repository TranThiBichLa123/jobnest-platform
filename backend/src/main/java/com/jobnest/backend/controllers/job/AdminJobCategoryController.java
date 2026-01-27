package com.jobnest.backend.controllers.job;

import com.jobnest.backend.dto.request.JobCategoryRequest;
import com.jobnest.backend.dto.response.JobCategoryResponse;
import com.jobnest.backend.service.job.JobService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/job-categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "05. Admin Job Categories", description = "Admin APIs for managing job categories")
public class AdminJobCategoryController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobCategoryResponse> createCategory(
            @RequestBody JobCategoryRequest request
    ) {
        return ResponseEntity.ok(jobService.createCategory(request));
    }
}
