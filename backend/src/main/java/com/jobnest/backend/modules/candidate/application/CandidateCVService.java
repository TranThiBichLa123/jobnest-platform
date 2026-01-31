package com.jobnest.backend.modules.candidate.application;

import com.jobnest.backend.modules.candidate.api.dto.CandidateCVRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateCVResponse;

import java.util.List;

public interface CandidateCVService {
    CandidateCVResponse createCV(Long candidateId, CandidateCVRequest request);

    CandidateCVResponse updateCV(Long cvId, Long candidateId, CandidateCVRequest request);

    void deleteCV(Long cvId, Long candidateId);

    CandidateCVResponse getDefaultCV(Long candidateId);

    CandidateCVResponse setDefaultCV(Long cvId, Long candidateId);

    List<CandidateCVResponse> getMyCVs(Long candidateId);

    CandidateCVResponse getCVById(Long cvId, Long candidateId);
}
