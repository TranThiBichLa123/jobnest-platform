package com.jobnest.backend.modules.company.application;

import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.company.api.dto.CompanyResponse;
import com.jobnest.backend.modules.company.api.dto.CreateCompanyRequest;
import com.jobnest.backend.modules.company.domain.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CompanyService {

    List<CompanyResponse> getTopCompanies();

    CompanyResponse createCompany(Account employer, CreateCompanyRequest request);

    Page<CompanyResponse> getMyCompanies(Long employerId, Pageable pageable);

    CompanyResponse uploadCompanyLogo(Long employerId, Long companyId, MultipartFile file);

    CompanyResponse uploadVerificationDocument(Long employerId, Long companyId, MultipartFile file);

    Page<CompanyResponse> getCompaniesForAdmin(Company.CompanyStatus status, Pageable pageable);

    CompanyResponse verifyCompany(Long adminId, Long companyId);

    CompanyResponse rejectCompany(Long adminId, Long companyId, String reason);
}