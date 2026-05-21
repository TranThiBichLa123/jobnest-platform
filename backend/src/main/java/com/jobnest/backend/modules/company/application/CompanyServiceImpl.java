package com.jobnest.backend.modules.company.application;

import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.company.api.dto.CompanyResponse;
import com.jobnest.backend.modules.company.api.dto.CreateCompanyRequest;
import com.jobnest.backend.modules.company.domain.Company;
import com.jobnest.backend.modules.company.infrastructure.CompanyRepository;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private static final long MAX_VERIFICATION_FILE_SIZE = 5L * 1024 * 1024;
    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final long MAX_LOGO_FILE_SIZE = 2L * 1024 * 1024;

    private final CompanyRepository companyRepository;

    @Override
    public List<CompanyResponse> getTopCompanies() {
        return companyRepository.findTopCompaniesByJobCount().stream()
                .map(row -> new CompanyResponse(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        (String) row[4],
                        (Boolean) row[5],
                        (Long) row[6]
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CompanyResponse createCompany(Account employer, CreateCompanyRequest req) {
        if (employer.getRole() != Account.Role.EMPLOYER) {
            throw new AccessDeniedException("Only employer can create company");
        }

        if (req == null || req.getName() == null || req.getName().isBlank()) {
            throw new BadRequestException("Company name is required");
        }

        String companyName = req.getName().trim();

        if (companyRepository.existsByEmployerIdAndName(employer.getId(), companyName)) {
            throw new BadRequestException("You already have a company with this name");
        }

        Company company = new Company();
        company.setEmployerId(employer.getId());
        company.setName(companyName);
        company.setLogoUrl(req.getLogoUrl());
        company.setIndustry(req.getIndustry());
        company.setAddress(req.getAddress());
        company.setVerified(false);
        company.setStatus(Company.CompanyStatus.PENDING_REVIEW);

        return new CompanyResponse(companyRepository.save(company));
    }

    @Override
@Transactional
public CompanyResponse uploadCompanyLogo(Long employerId, Long companyId, MultipartFile file) {
    Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

    if (!company.getEmployerId().equals(employerId)) {
        throw new AccessDeniedException("You can only upload logo for your own company");
    }

    validateImage(file);

    try {
        Path uploadDir = Path.of("uploads", "company-logos").toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String extension = original.endsWith(".png") ? ".png" : ".jpg";
        String safeName = "company_" + companyId + "_" + UUID.randomUUID() + extension;

        Path target = uploadDir.resolve(safeName).normalize();
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        company.setLogoUrl("/uploads/company-logos/" + safeName);

        return new CompanyResponse(companyRepository.save(company));
    } catch (IOException ex) {
        throw new BadRequestException("Could not upload company logo");
    }
}

    @Override
    public Page<CompanyResponse> getMyCompanies(Long employerId, Pageable pageable) {
        return companyRepository.findByEmployerId(employerId, pageable).map(CompanyResponse::new);
    }

    @Override
    @Transactional
    public CompanyResponse uploadVerificationDocument(Long employerId, Long companyId, MultipartFile file) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (!company.getEmployerId().equals(employerId)) {
            throw new AccessDeniedException("You can only upload verification document for your own company");
        }

        validatePdf(file);

        try {
            Path uploadDir = Path.of("uploads", "company-verifications").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String safeName = "company_" + companyId + "_" + UUID.randomUUID() + ".pdf";
            Path target = uploadDir.resolve(safeName).normalize();

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            company.setVerificationDocumentPath("/uploads/company-verifications/" + safeName);
            company.setVerified(false);
            company.setStatus(Company.CompanyStatus.PENDING_REVIEW);
            company.setRejectionReason(null);
            company.setReviewedAt(null);
            company.setReviewedBy(null);

            return new CompanyResponse(companyRepository.save(company));
        } catch (IOException ex) {
            throw new BadRequestException("Could not upload verification document");
        }
    }

    @Override
    public Page<CompanyResponse> getCompaniesForAdmin(Company.CompanyStatus status, Pageable pageable) {
        if (status == null) {
            return companyRepository.findAll(pageable).map(CompanyResponse::new);
        }

        return companyRepository.findByStatus(status, pageable).map(CompanyResponse::new);
    }

    @Override
    @Transactional
    public CompanyResponse verifyCompany(Long adminId, Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (company.getVerificationDocumentPath() == null || company.getVerificationDocumentPath().isBlank()) {
            throw new BadRequestException("Company must upload verification PDF before approval");
        }

        company.setVerified(true);
        company.setStatus(Company.CompanyStatus.VERIFIED);
        company.setRejectionReason(null);
        company.setReviewedAt(LocalDateTime.now());
        company.setReviewedBy(adminId);

        return new CompanyResponse(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyResponse rejectCompany(Long adminId, Long companyId, String reason) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        company.setVerified(false);
        company.setStatus(Company.CompanyStatus.REJECTED);
        company.setRejectionReason(reason == null || reason.isBlank() ? "Verification rejected" : reason.trim());
        company.setReviewedAt(LocalDateTime.now());
        company.setReviewedBy(adminId);

        return new CompanyResponse(companyRepository.save(company));
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Verification PDF is required");
        }

        if (file.getSize() > MAX_VERIFICATION_FILE_SIZE) {
            throw new BadRequestException("Verification PDF must be <= 5MB");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String contentType = file.getContentType();

        if (!original.endsWith(".pdf") || !PDF_CONTENT_TYPE.equalsIgnoreCase(contentType)) {
            throw new BadRequestException("Only PDF verification document is allowed");
        }
    }

    private void validateImage(MultipartFile file) {
    if (file == null || file.isEmpty()) {
        throw new BadRequestException("Company logo is required");
    }

    if (file.getSize() > MAX_LOGO_FILE_SIZE) {
        throw new BadRequestException("Company logo must be <= 2MB");
    }

    String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
    String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();

    boolean validExtension =
            original.endsWith(".jpg") ||
            original.endsWith(".jpeg") ||
            original.endsWith(".png");

    boolean validContentType =
            contentType.equals("image/jpeg") ||
            contentType.equals("image/png");

    if (!validExtension || !validContentType) {
        throw new BadRequestException("Only JPG, JPEG, and PNG images are allowed");
    }
}
}