package com.jobnest.backend.modules.candidate.application;

import com.jobnest.backend.modules.applications.infrastructure.ApplicationRepository;
import com.jobnest.backend.modules.candidate.api.dto.CandidateCVRequest;
import com.jobnest.backend.modules.candidate.api.dto.CandidateCVResponse;
import com.jobnest.backend.modules.candidate.domain.CandidateCV;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateCVRepository;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateCVServiceImpl implements CandidateCVService {

    private static final long MAX_CV_FILE_SIZE = 5L * 1024 * 1024;
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final CandidateCVRepository cvRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional
    public CandidateCVResponse createCV(Long candidateId, CandidateCVRequest request) {
        validateCandidateExists(candidateId);
        validateCVRequest(request);

        CandidateCV cv = new CandidateCV();
        cv.setCandidateId(candidateId);
        cv.setTitle(request.getTitle().trim());
        cv.setFileUrl(request.getFileUrl().trim());
        cv.setFileName(request.getFileName());
        cv.setFileSize(request.getFileSize());
        cv.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));

        applyDefaultRule(candidateId, cv);

        return new CandidateCVResponse(cvRepository.save(cv));
    }

    @Override
    @Transactional
    public CandidateCVResponse uploadCV(Long candidateId, String title, Boolean isDefault, MultipartFile file) {
        validateCandidateExists(candidateId);
        validatePdf(file);

        try {
            Path uploadDir = Path.of("uploads", "candidate-cvs").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename() == null ? "cv.pdf" : file.getOriginalFilename();
            String safeFileName = "candidate_" + candidateId + "_" + UUID.randomUUID() + ".pdf";
            Path target = uploadDir.resolve(safeFileName).normalize();

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            CandidateCV cv = new CandidateCV();
            cv.setCandidateId(candidateId);
            cv.setTitle(resolveTitle(title, originalName));
            cv.setFileUrl("/uploads/candidate-cvs/" + safeFileName);
            cv.setFileName(originalName);
            cv.setFileSize(file.getSize());
            cv.setIsDefault(Boolean.TRUE.equals(isDefault));

            applyDefaultRule(candidateId, cv);

            return new CandidateCVResponse(cvRepository.save(cv));
        } catch (IOException ex) {
            throw new BadRequestException("Could not upload CV file");
        }
    }

    @Override
    @Transactional
    public CandidateCVResponse updateCV(Long cvId, Long candidateId, CandidateCVRequest request) {
        CandidateCV cv = getOwnedCV(cvId, candidateId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            cv.setTitle(request.getTitle().trim());
        }

        if (request.getFileUrl() != null && !request.getFileUrl().isBlank()) {
            cv.setFileUrl(request.getFileUrl().trim());
        }

        if (request.getFileName() != null) {
            cv.setFileName(request.getFileName());
        }

        if (request.getFileSize() != null) {
            cv.setFileSize(request.getFileSize());
        }

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(cv.getIsDefault())) {
            unsetOtherDefaults(candidateId, cvId);
            cv.setIsDefault(true);
        }

        return new CandidateCVResponse(cvRepository.save(cv));
    }

    @Override
    @Transactional
    public void deleteCV(Long cvId, Long candidateId) {
        CandidateCV cv = getOwnedCV(cvId, candidateId);

        if (applicationRepository.existsByCvId(cvId)) {
            throw new BadRequestException("CV has been used to apply job, cannot delete");
        }

        cvRepository.delete(cv);
    }

    @Override
    @Transactional
    public CandidateCVResponse setDefaultCV(Long cvId, Long candidateId) {
        CandidateCV cv = getOwnedCV(cvId, candidateId);

        unsetOtherDefaults(candidateId, cvId);
        cv.setIsDefault(true);

        return new CandidateCVResponse(cvRepository.save(cv));
    }

    @Override
    public List<CandidateCVResponse> getMyCVs(Long candidateId) {
        validateCandidateExists(candidateId);

        return cvRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(CandidateCVResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public CandidateCVResponse getCVById(Long cvId, Long candidateId) {
        return new CandidateCVResponse(getOwnedCV(cvId, candidateId));
    }

    @Override
    public CandidateCVResponse getDefaultCV(Long candidateId) {
        validateCandidateExists(candidateId);

        return cvRepository.findByCandidateIdAndIsDefaultTrue(candidateId)
                .map(CandidateCVResponse::new)
                .orElse(null);
    }

    private CandidateCV getOwnedCV(Long cvId, Long candidateId) {
        CandidateCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new AccessDeniedException("You can only access your own CV");
        }

        return cv;
    }

    private void validateCandidateExists(Long candidateId) {
        if (!candidateProfileRepository.existsById(candidateId)) {
            throw new ResourceNotFoundException("Candidate profile not found");
        }
    }

    private void validateCVRequest(CandidateCVRequest request) {
        if (request == null) {
            throw new BadRequestException("CV request is required");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("CV title is required");
        }

        if (request.getFileUrl() == null || request.getFileUrl().isBlank()) {
            throw new BadRequestException("CV file URL is required");
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CV PDF file is required");
        }

        if (file.getSize() > MAX_CV_FILE_SIZE) {
            throw new BadRequestException("CV PDF file must be <= 5MB");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String contentType = file.getContentType();

        if (!original.endsWith(".pdf") || !PDF_CONTENT_TYPE.equalsIgnoreCase(contentType)) {
            throw new BadRequestException("Only PDF CV file is allowed");
        }
    }

    private void applyDefaultRule(Long candidateId, CandidateCV cv) {
        if (cvRepository.countByCandidateId(candidateId) == 0) {
            cv.setIsDefault(true);
            return;
        }

        if (Boolean.TRUE.equals(cv.getIsDefault())) {
            unsetOtherDefaults(candidateId, null);
        }
    }

    private void unsetOtherDefaults(Long candidateId, Long exceptCvId) {
        cvRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .forEach(existingCv -> {
                    if (exceptCvId == null || !existingCv.getId().equals(exceptCvId)) {
                        existingCv.setIsDefault(false);
                        cvRepository.save(existingCv);
                    }
                });
    }

    private String resolveTitle(String title, String originalName) {
        if (title != null && !title.isBlank()) {
            return title.trim();
        }

        String cleaned = originalName == null ? "My CV" : originalName.replace(".pdf", "").replace(".PDF", "").trim();
        return cleaned.isBlank() ? "My CV" : cleaned;
    }
}