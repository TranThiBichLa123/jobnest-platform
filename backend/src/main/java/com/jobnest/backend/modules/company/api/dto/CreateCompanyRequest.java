package com.jobnest.backend.modules.company.api.dto;

import lombok.Data;

@Data
public class CreateCompanyRequest {
    private String name;
    private String logoUrl;
    private String industry;
    private String address;
}
