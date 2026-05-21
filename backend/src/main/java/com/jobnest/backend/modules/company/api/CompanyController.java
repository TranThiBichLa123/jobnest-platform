package com.jobnest.backend.modules.company.api;

import com.jobnest.backend.modules.company.api.dto.CompanyResponse;
import com.jobnest.backend.modules.company.api.dto.CreateCompanyRequest;
import com.jobnest.backend.modules.company.application.CompanyService;
import com.jobnest.backend.modules.company.domain.Company;
import com.jobnest.backend.shared.security.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "10. Company", description = "Company management APIs")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/top")
    public ResponseEntity<List<CompanyResponse>> getTopCompanies() {
        return ResponseEntity.ok(companyService.getTopCompanies());
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponse> createCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CreateCompanyRequest request
    ) {
        return ResponseEntity.ok(companyService.createCompany(user.getAccount(), request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Page<CompanyResponse>> getMyCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(companyService.getMyCompanies(user.getAccount().getId(), pageable));
    }

    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponse> uploadCompanyLogo(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(companyService.uploadCompanyLogo(user.getAccount().getId(), id, file));
    }

    @PostMapping(value = "/{id}/verification-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponse> uploadVerificationDocument(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(companyService.uploadVerificationDocument(user.getAccount().getId(), id, file));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CompanyResponse>> getCompaniesForAdmin(
            @RequestParam(required = false) Company.CompanyStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(companyService.getCompaniesForAdmin(status, pageable));
    }

    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> approveCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(companyService.verifyCompany(user.getAccount().getId(), id));
    }

    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> rejectCompany(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        String reason = body == null ? null : body.get("reason");
        return ResponseEntity.ok(companyService.rejectCompany(user.getAccount().getId(), id, reason));
    }
}