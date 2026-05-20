package com.jobnest.backend.controllers.job;

import com.jobnest.backend.dto.response.JobResponse;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.service.job.SavedJobService;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/saved-jobs")
@Tag(name = "07. Saved Jobs", description = "Bookmark and manage saved jobs")
public class SavedJobController {

    @Autowired
    private SavedJobService savedJobService;

    @PostMapping("/{jobId}")
    public ResponseEntity<?> saveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long userId = userDetails.getAccount().getId();
        savedJobService.saveJob(userId, jobId);
        
        return ResponseEntity.ok(Map.of("message", "Job saved successfully"));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> unsaveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long userId = userDetails.getAccount().getId();
        savedJobService.unsaveJob(userId, jobId);
        
        return ResponseEntity.ok(Map.of("message", "Job unsaved successfully"));
    }

    @GetMapping("/check/{jobId}")
    public ResponseEntity<?> checkIfSaved(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long userId = userDetails.getAccount().getId();
        boolean isSaved = savedJobService.isSaved(userId, jobId);
        
        return ResponseEntity.ok(Map.of("isSaved", isSaved));
    }

    @GetMapping("/my-saved-jobs")
    public ResponseEntity<Page<JobResponse>> getMySavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long userId = userDetails.getAccount().getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<JobResponse> savedJobs = savedJobService.getSavedJobs(userId, pageable);
        
        return ResponseEntity.ok(savedJobs);
    }
}
