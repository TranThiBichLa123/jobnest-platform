package com.jobnest.backend.service.candidate;

import com.jobnest.backend.dto.request.CandidateCVRequest;
import com.jobnest.backend.dto.response.CandidateCVResponse;

import java.util.List;

public interface CandidateCVService {
    CandidateCVResponse createCV(Long candidateId, CandidateCVRequest request);
    
    CandidateCVResponse updateCV(Long cvId, Long candidateId, CandidateCVRequest request);
    
    void deleteCV(Long cvId, Long candidateId);
    
    CandidateCVResponse setDefaultCV(Long cvId, Long candidateId);
    
    List<CandidateCVResponse> getMyCVs(Long candidateId);
    
    CandidateCVResponse getCVById(Long cvId, Long candidateId);
    
    CandidateCVResponse getDefaultCV(Long candidateId);
}
