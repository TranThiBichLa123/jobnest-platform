package com.jobnest.backend.modules.company.application;

import com.jobnest.backend.modules.company.api.dto.CreateCompanyRequest;
import com.jobnest.backend.modules.company.api.dto.CompanyResponse;
import com.jobnest.backend.shared.domain.Account;

import java.util.List;

public interface CompanyService {
    List<CompanyResponse> getTopCompanies();
    CompanyResponse createCompany(Account employer, CreateCompanyRequest request);
}
