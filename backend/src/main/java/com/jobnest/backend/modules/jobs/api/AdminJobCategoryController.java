package com.jobnest.backend.modules.jobs.api;

import com.jobnest.backend.modules.jobs.api.dto.request.JobCategoryRequest;
import com.jobnest.backend.modules.jobs.api.dto.response.JobCategoryResponse;
import com.jobnest.backend.modules.jobs.application.JobService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/job-categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "05. Admin Job Categories", description = "Admin APIs for managing job categories")
public class AdminJobCategoryController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(jobService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<JobCategoryResponse> createCategory(
            @RequestBody JobCategoryRequest request
    ) {
        return ResponseEntity.ok(jobService.createCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody JobCategoryRequest request
    ) {
        return ResponseEntity.ok(jobService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        jobService.deleteCategory(id);
        return ResponseEntity.ok("Job category deleted successfully");
    }
}