package com.jobnest.backend.service.company;

import com.jobnest.backend.dto.request.CreateCompanyRequest;
import com.jobnest.backend.dto.response.CompanyResponse;
import com.jobnest.backend.entities.Company;
import com.jobnest.backend.entities.auth.Account;
import com.jobnest.backend.repository.company.CompanyRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    
    private final CompanyRepository companyRepository;
    
    @Override
    public List<CompanyResponse> getTopCompanies() {
        List<Object[]> results = companyRepository.findTopCompaniesByJobCount();
        
        return results.stream()
                .map(row -> new CompanyResponse(
                    (Long) row[0],      // id
                    (String) row[1],    // name
                    (String) row[2],    // logoUrl
                    (String) row[3],    // industry
                    (String) row[4],    // address
                    (Boolean) row[5],   // verified
                    (Long) row[6]       // openPositions (job count)
                ))
                .collect(Collectors.toList());
    }

    @Override
public CompanyResponse createCompany(Account employer, CreateCompanyRequest req) {

    if (employer.getRole() != Account.Role.EMPLOYER) {
        throw new IllegalArgumentException("Only employer can create company");
    }

    if (companyRepository.existsByEmployerIdAndName(employer.getId(), req.getName())) {
        throw new IllegalArgumentException("You already have a company with this name");
    }

    Company company = new Company();
    company.setEmployerId(employer.getId());
    company.setName(req.getName());
    company.setLogoUrl(req.getLogoUrl());
    company.setIndustry(req.getIndustry());
    company.setAddress(req.getAddress());
    company.setVerified(false);

    Company saved = companyRepository.save(company);

    return new CompanyResponse(
        saved.getId(),
        saved.getName(),
        saved.getLogoUrl(),
        saved.getIndustry(),
        saved.getAddress(),
        saved.getVerified(),
        0L
    );
}

}
