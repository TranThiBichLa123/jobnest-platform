package com.jobnest.backend.modules.candidate.application;

import com.jobnest.backend.modules.candidate.api.dto.CandidateCVRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateCVResponse;
import com.jobnest.backend.modules.candidate.domain.CandidateCV;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateCVRepository;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import com.jobnest.backend.modules.applications.infrastructure.ApplicationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateCVServiceImpl implements CandidateCVService {

    @Autowired
    private CandidateCVRepository cvRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Override
    @Transactional
    public CandidateCVResponse createCV(Long candidateId, CandidateCVRequest request) {
        // Verify candidate profile exists
        if (!candidateProfileRepository.existsById(candidateId)) {
            throw new RuntimeException("Candidate profile not found");
        }

        CandidateCV cv = new CandidateCV();
        cv.setCandidateId(candidateId);
        cv.setTitle(request.getTitle());
        cv.setFileUrl(request.getFileUrl());
        cv.setFileName(request.getFileName());
        cv.setFileSize(request.getFileSize());
        cv.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        // If this is set as default, unset other defaults
        if (cv.getIsDefault()) {
            cvRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .forEach(existingCv -> {
                    existingCv.setIsDefault(false);
                    cvRepository.save(existingCv);
                });
        }

        // If this is the first CV, set it as default
        if (cvRepository.countByCandidateId(candidateId) == 0) {
            cv.setIsDefault(true);
        }

        CandidateCV saved = cvRepository.save(cv);
        return new CandidateCVResponse(saved);
    }

    @Override
    @Transactional
    public CandidateCVResponse updateCV(Long cvId, Long candidateId, CandidateCVRequest request) {
        CandidateCV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new RuntimeException("CV not found"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new RuntimeException("Unauthorized access to CV");
        }

        cv.setTitle(request.getTitle());
        cv.setFileUrl(request.getFileUrl());
        cv.setFileName(request.getFileName());
        cv.setFileSize(request.getFileSize());

        if (request.getIsDefault() != null && request.getIsDefault() && !cv.getIsDefault()) {
            // Unset other defaults
            cvRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .forEach(existingCv -> {
                    if (!existingCv.getId().equals(cvId)) {
                        existingCv.setIsDefault(false);
                        cvRepository.save(existingCv);
                    }
                });
            cv.setIsDefault(true);
        }

        CandidateCV updated = cvRepository.save(cv);
        return new CandidateCVResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCV(Long cvId, Long candidateId) {
        CandidateCV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new RuntimeException("CV not found"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new RuntimeException("Unauthorized access to CV");
        }

        boolean used = applicationRepository.existsByCvId(cvId);
        if (used) {
            throw new RuntimeException("CV has been used to apply job, cannot delete");
        }

        cvRepository.delete(cv);
    }

    @Override
    @Transactional
    public CandidateCVResponse setDefaultCV(Long cvId, Long candidateId) {
        CandidateCV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new RuntimeException("CV not found"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new RuntimeException("Unauthorized access to CV");
        }

        // Unset all other defaults
        cvRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
            .forEach(existingCv -> {
                existingCv.setIsDefault(false);
                cvRepository.save(existingCv);
            });

        cv.setIsDefault(true);
        CandidateCV updated = cvRepository.save(cv);
        return new CandidateCVResponse(updated);
    }

    @Override
    public List<CandidateCVResponse> getMyCVs(Long candidateId) {
        return cvRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
            .stream()
            .map(CandidateCVResponse::new)
            .collect(Collectors.toList());
    }

    @Override
    public CandidateCVResponse getCVById(Long cvId, Long candidateId) {
        CandidateCV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new RuntimeException("CV not found"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new RuntimeException("Unauthorized access to CV");
        }

        return new CandidateCVResponse(cv);
    }

    @Override
    public CandidateCVResponse getDefaultCV(Long candidateId) {
        return cvRepository.findByCandidateIdAndIsDefaultTrue(candidateId)
            .map(CandidateCVResponse::new)
            .orElse(null);
    }
}
