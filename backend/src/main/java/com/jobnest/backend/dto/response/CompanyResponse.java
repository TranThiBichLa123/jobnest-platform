package com.jobnest.backend.dto.response;

import com.jobnest.backend.entities.Company;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CompanyResponse {
    private Long id;
    private String name;
    private String logoUrl;
    private String industry;
    private String address;
    private Boolean verified;
    private Long openPositions;

    // Constructor from Company entity
    public CompanyResponse(Company company) {
        this.id = company.getId();
        this.name = company.getName();
        this.logoUrl = company.getLogoUrl();
        this.industry = company.getIndustry();
        this.address = company.getAddress();
        this.verified = company.getVerified();
    }

    // Constructor with job count
    public CompanyResponse(Long id, String name, String logoUrl, String industry, String address, Boolean verified, Long openPositions) {
        this.id = id;
        this.name = name;
        this.logoUrl = logoUrl;
        this.industry = industry;
        this.address = address;
        this.verified = verified;
        this.openPositions = openPositions;
    }
}
