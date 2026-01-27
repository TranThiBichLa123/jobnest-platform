package com.jobnest.backend.controllers.company;

import com.jobnest.backend.dto.request.CreateCompanyRequest;
import com.jobnest.backend.dto.response.CompanyResponse;
import com.jobnest.backend.security.user.CustomUserDetails;
import com.jobnest.backend.service.company.CompanyService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

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
    public ResponseEntity<CompanyResponse> createCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.ok(
                companyService.createCompany(user.getAccount(), request));
    }

}
