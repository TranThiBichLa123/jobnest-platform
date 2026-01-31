package com.jobnest.backend.modules.jobs.api;

import com.jobnest.backend.modules.jobs.api.dto.response.JobResponse;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import com.jobnest.backend.modules.jobs.application.JobViewService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController

@RequestMapping("/api/job-views")
@Tag(name = "06. Job Views", description = "Track and manage job view history")
public class JobViewController {

    @Autowired
    private JobViewService jobViewService;

    @PostMapping("/{jobId}")
    public ResponseEntity<?> recordView(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        
        Long viewerId = userDetails != null ? userDetails.getAccount().getId() : null;
        String viewerIp = getClientIp(request);
        
        jobViewService.recordView(jobId, viewerId, viewerIp);
        
        return ResponseEntity.ok(Map.of("message", "View recorded"));
    }

    @GetMapping("/my-viewed-jobs")
    public ResponseEntity<Page<JobResponse>> getMyViewedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long viewerId = userDetails.getAccount().getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<JobResponse> viewedJobs = jobViewService.getViewedJobs(viewerId, pageable);
        
        return ResponseEntity.ok(viewedJobs);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
