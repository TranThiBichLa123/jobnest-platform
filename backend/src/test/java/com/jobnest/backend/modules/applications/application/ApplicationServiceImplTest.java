package com.jobnest.backend.modules.applications.application;

import com.jobnest.backend.modules.applications.api.dto.ApplicationRequest;
import com.jobnest.backend.modules.applications.api.dto.ApplicationResponse;
import com.jobnest.backend.modules.applications.domain.Application;
import com.jobnest.backend.modules.applications.infrastructure.ApplicationRepository;
import com.jobnest.backend.modules.auth.domain.Account;
import com.jobnest.backend.modules.candidate.domain.CandidateCV;
import com.jobnest.backend.modules.candidate.domain.CandidateProfile;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateCVRepository;
import com.jobnest.backend.modules.candidate.infrastructure.CandidateProfileRepository;
import com.jobnest.backend.modules.jobs.domain.Job;
import com.jobnest.backend.modules.jobs.infrastructure.JobRepository;
import com.jobnest.backend.modules.notification.application.NotificationService;
import com.jobnest.backend.shared.exception.BadRequestException;
import com.jobnest.backend.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ApplicationServiceImpl - Apply For Job RTM Unit Tests")
class ApplicationServiceImplTest {

    private static final Long JOB_ID = 10L;
    private static final Long EMPLOYER_ID = 20L;
    private static final Long OTHER_EMPLOYER_ID = 21L;
    private static final Long CANDIDATE_ID = 30L;
    private static final Long OTHER_CANDIDATE_ID = 31L;
    private static final Long CV_ID = 40L;
    private static final Long APPLICATION_ID = 50L;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private CandidateCVRepository candidateCVRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    @Nested
    @DisplayName("Apply For Job - UC-07")
    class ApplyForJobTests {

        @Test
        @DisplayName("TC-APP-001 / BR55-BR64: valid candidate applies with owned CV and application is created")
        void applyForJob_validRequest_shouldCreatePendingApplication() {
            Job activeJob = activeJob();
            CandidateProfile candidate = candidateProfile();
            CandidateCV ownedCv = ownedCv();
            ApplicationRequest request = applicationRequest(CV_ID, "  I am interested in this job.  ");

            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(activeJob));
            when(candidateProfileRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidate));
            when(candidateCVRepository.findById(CV_ID)).thenReturn(Optional.of(ownedCv));
            when(applicationRepository.existsByJobIdAndCandidateId(JOB_ID, CANDIDATE_ID)).thenReturn(false);
            when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> {
                Application application = invocation.getArgument(0);
                application.setId(APPLICATION_ID);
                return application;
            });

            ApplicationResponse response = applicationService.applyForJob(JOB_ID, CANDIDATE_ID, request);

            assertThat(response.getId()).isEqualTo(APPLICATION_ID);
            assertThat(response.getJobId()).isEqualTo(JOB_ID);
            assertThat(response.getCandidateId()).isEqualTo(CANDIDATE_ID);
            assertThat(response.getCvId()).isEqualTo(CV_ID);
            assertThat(response.getStatus()).isEqualTo(Application.ApplicationStatus.PENDING.name());
            assertThat(response.getResumeUrl()).isEqualTo(ownedCv.getFileUrl());
            assertThat(response.getCoverLetter()).isEqualTo("I am interested in this job.");

            ArgumentCaptor<Application> captor = ArgumentCaptor.forClass(Application.class);
            verify(applicationRepository).save(captor.capture());
            Application saved = captor.getValue();
            assertThat(saved.getJob()).isSameAs(activeJob);
            assertThat(saved.getCandidate()).isSameAs(candidate);
            assertThat(saved.getCvId()).isEqualTo(CV_ID);
            assertThat(saved.getStatus()).isEqualTo(Application.ApplicationStatus.PENDING);
            assertThat(saved.getAppliedAt()).isNotNull();

            verify(notificationService).createNotification(
                    eq(EMPLOYER_ID),
                    eq("New application received"),
                    contains(activeJob.getTitle()),
                    eq("NEW_APPLICATION"),
                    eq(APPLICATION_ID)
            );
            verify(notificationService).createNotification(
                    eq(candidate.getUser()),
                    eq("Application submitted"),
                    contains(activeJob.getTitle()),
                    eq("APPLICATION_SUBMITTED"),
                    eq(APPLICATION_ID)
            );
        }

        @Test
        @DisplayName("TC-APP-002 / BR57: null application request is rejected")
        void applyForJob_nullRequest_shouldThrowBadRequest() {
            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, null))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Application request is required");

            verifyNoInteractions(jobRepository, candidateProfileRepository, candidateCVRepository, applicationRepository);
        }

        @Test
        @DisplayName("TC-APP-003 / BR55: job must exist before applying")
        void applyForJob_jobNotFound_shouldThrowResourceNotFound() {
            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(CV_ID, null)))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Job not found");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-APP-004 / BR62: inactive or hidden job cannot receive applications")
        void applyForJob_inactiveJob_shouldThrowBadRequest() {
            Job hiddenJob = activeJob();
            hiddenJob.setStatus(Job.JobStatus.HIDDEN);
            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(hiddenJob));

            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(CV_ID, null)))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Only active jobs can receive applications");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-APP-005 / BR62: expired job cannot receive applications")
        void applyForJob_expiredJob_shouldThrowBadRequest() {
            Job expiredJob = activeJob();
            expiredJob.setExpiresAt(LocalDateTime.now().minusDays(1));
            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(expiredJob));

            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(CV_ID, null)))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("This job has expired");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-APP-006 / BR58: candidate must select one CV before applying")
        void applyForJob_missingCvId_shouldThrowBadRequest() {
            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(activeJob()));
            when(candidateProfileRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidateProfile()));

            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(null, null)))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("CV is required when applying for a job");

            verify(candidateCVRepository, never()).findById(anyLong());
            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-APP-007 / BR59: selected CV must exist")
        void applyForJob_cvNotFound_shouldThrowResourceNotFound() {
            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(activeJob()));
            when(candidateProfileRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidateProfile()));
            when(candidateCVRepository.findById(CV_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(CV_ID, null)))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("CV not found");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-APP-008 / BR60: candidate cannot apply using another user's CV")
        void applyForJob_cvOwnedByAnotherCandidate_shouldThrowAccessDenied() {
            CandidateCV anotherUserCv = ownedCv();
            anotherUserCv.setCandidateId(OTHER_CANDIDATE_ID);

            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(activeJob()));
            when(candidateProfileRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidateProfile()));
            when(candidateCVRepository.findById(CV_ID)).thenReturn(Optional.of(anotherUserCv));

            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(CV_ID, null)))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You can only apply using your own CV");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-APP-009 / BR61: duplicate application is rejected")
        void applyForJob_duplicateApplication_shouldThrowBadRequest() {
            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(activeJob()));
            when(candidateProfileRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidateProfile()));
            when(candidateCVRepository.findById(CV_ID)).thenReturn(Optional.of(ownedCv()));
            when(applicationRepository.existsByJobIdAndCandidateId(JOB_ID, CANDIDATE_ID)).thenReturn(true);

            assertThatThrownBy(() -> applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(CV_ID, null)))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("You have already applied for this job");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-APP-010 / ASR-AVL-01: notification failure must not rollback application")
        void applyForJob_notificationFailure_shouldStillReturnSuccess() {
            Job activeJob = activeJob();
            CandidateProfile candidate = candidateProfile();
            CandidateCV ownedCv = ownedCv();

            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(activeJob));
            when(candidateProfileRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidate));
            when(candidateCVRepository.findById(CV_ID)).thenReturn(Optional.of(ownedCv));
            when(applicationRepository.existsByJobIdAndCandidateId(JOB_ID, CANDIDATE_ID)).thenReturn(false);
            when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> {
                Application application = invocation.getArgument(0);
                application.setId(APPLICATION_ID);
                return application;
            });

            doThrow(new RuntimeException("notification service down"))
                    .when(notificationService)
                    .createNotification(eq(EMPLOYER_ID), anyString(), anyString(), eq("NEW_APPLICATION"), eq(APPLICATION_ID));
            doThrow(new RuntimeException("candidate notification down"))
                    .when(notificationService)
                    .createNotification(eq(candidate.getUser()), anyString(), anyString(), eq("APPLICATION_SUBMITTED"), eq(APPLICATION_ID));

            ApplicationResponse response = applicationService.applyForJob(JOB_ID, CANDIDATE_ID, applicationRequest(CV_ID, "test"));

            assertThat(response.getId()).isEqualTo(APPLICATION_ID);
            assertThat(response.getStatus()).isEqualTo(Application.ApplicationStatus.PENDING.name());
            verify(applicationRepository).save(any(Application.class));
        }
    }

    @Nested
    @DisplayName("Employer Review / Application Status - UC-12, UC-14")
    class EmployerApplicationTests {

        @Test
        @DisplayName("TC-EMP-001 / BR ownership: employer can view applications for own job")
        void getJobApplications_ownedJob_shouldReturnPage() {
            Job job = activeJob();
            Application application = application(job, candidateProfile(), Application.ApplicationStatus.PENDING);

            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(job));
            when(applicationRepository.findByJobId(eq(JOB_ID), any(PageRequest.class)))
                    .thenReturn(new PageImpl<>(List.of(application)));

            var page = applicationService.getJobApplications(JOB_ID, EMPLOYER_ID, PageRequest.of(0, 10));

            assertThat(page.getContent()).hasSize(1);
            assertThat(page.getContent().get(0).getJobId()).isEqualTo(JOB_ID);
        }

        @Test
        @DisplayName("TC-EMP-002 / BR ownership: employer cannot view applications for another employer's job")
        void getJobApplications_wrongEmployer_shouldThrowAccessDenied() {
            when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(activeJob()));

            assertThatThrownBy(() -> applicationService.getJobApplications(JOB_ID, OTHER_EMPLOYER_ID, PageRequest.of(0, 10)))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You can only view applications for your own jobs");
        }

        @Test
        @DisplayName("TC-STATUS-001 / BR status: employer can update owned application status")
        void updateApplicationStatus_validStatus_shouldPersistStatusAndNotes() {
            Application application = application(activeJob(), candidateProfile(), Application.ApplicationStatus.PENDING);

            when(applicationRepository.findWithDetailsById(APPLICATION_ID)).thenReturn(Optional.of(application));
            when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));

            ApplicationResponse response = applicationService.updateApplicationStatus(
                    APPLICATION_ID,
                    EMPLOYER_ID,
                    "reviewed",
                    "  strong candidate  "
            );

            assertThat(response.getStatus()).isEqualTo(Application.ApplicationStatus.REVIEWED.name());
            assertThat(response.getNotes()).isEqualTo("strong candidate");
            assertThat(response.getReviewedAt()).isNotNull();
            verify(applicationRepository).save(application);
        }

        @Test
        @DisplayName("TC-STATUS-002 / BR ownership: employer cannot update another employer's application")
        void updateApplicationStatus_wrongEmployer_shouldThrowAccessDenied() {
            when(applicationRepository.findWithDetailsById(APPLICATION_ID))
                    .thenReturn(Optional.of(application(activeJob(), candidateProfile(), Application.ApplicationStatus.PENDING)));

            assertThatThrownBy(() -> applicationService.updateApplicationStatus(APPLICATION_ID, OTHER_EMPLOYER_ID, "REVIEWED", null))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You can only update applications for your own jobs");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-STATUS-003 / BR status: invalid application status is rejected")
        void updateApplicationStatus_invalidStatus_shouldThrowBadRequest() {
            when(applicationRepository.findWithDetailsById(APPLICATION_ID))
                    .thenReturn(Optional.of(application(activeJob(), candidateProfile(), Application.ApplicationStatus.PENDING)));

            assertThatThrownBy(() -> applicationService.updateApplicationStatus(APPLICATION_ID, EMPLOYER_ID, "HIRED_BUT_NOT_EXIST", null))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid application status");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-STATUS-004 / BR status: withdrawn application cannot be updated by employer")
        void updateApplicationStatus_withdrawnApplication_shouldThrowBadRequest() {
            when(applicationRepository.findWithDetailsById(APPLICATION_ID))
                    .thenReturn(Optional.of(application(activeJob(), candidateProfile(), Application.ApplicationStatus.WITHDRAWN)));

            assertThatThrownBy(() -> applicationService.updateApplicationStatus(APPLICATION_ID, EMPLOYER_ID, "REVIEWED", null))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Withdrawn applications cannot be updated");

            verify(applicationRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Candidate Application Tracking / Withdraw")
    class CandidateApplicationTests {

        @Test
        @DisplayName("TC-CAND-APP-001: candidate can view own application")
        void getApplicationByIdForCandidate_ownApplication_shouldReturnResponse() {
            Application application = application(activeJob(), candidateProfile(), Application.ApplicationStatus.PENDING);
            when(applicationRepository.findWithDetailsById(APPLICATION_ID)).thenReturn(Optional.of(application));

            ApplicationResponse response = applicationService.getApplicationByIdForCandidate(APPLICATION_ID, CANDIDATE_ID);

            assertThat(response.getId()).isEqualTo(APPLICATION_ID);
            assertThat(response.getCandidateId()).isEqualTo(CANDIDATE_ID);
        }

        @Test
        @DisplayName("TC-CAND-APP-002: candidate cannot view another candidate's application")
        void getApplicationByIdForCandidate_anotherCandidate_shouldThrowAccessDenied() {
            when(applicationRepository.findWithDetailsById(APPLICATION_ID))
                    .thenReturn(Optional.of(application(activeJob(), candidateProfile(), Application.ApplicationStatus.PENDING)));

            assertThatThrownBy(() -> applicationService.getApplicationByIdForCandidate(APPLICATION_ID, OTHER_CANDIDATE_ID))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You can only view your own applications");
        }

        @Test
        @DisplayName("TC-WITHDRAW-001: candidate can withdraw pending application")
        void withdrawApplication_pendingOwnedApplication_shouldMarkWithdrawn() {
            Application application = application(activeJob(), candidateProfile(), Application.ApplicationStatus.PENDING);
            when(applicationRepository.findWithDetailsById(APPLICATION_ID)).thenReturn(Optional.of(application));

            applicationService.withdrawApplication(APPLICATION_ID, CANDIDATE_ID);

            assertThat(application.getStatus()).isEqualTo(Application.ApplicationStatus.WITHDRAWN);
            assertThat(application.getReviewedAt()).isNotNull();
            verify(applicationRepository).save(application);
        }

        @Test
        @DisplayName("TC-WITHDRAW-002: candidate cannot withdraw another candidate's application")
        void withdrawApplication_wrongCandidate_shouldThrowAccessDenied() {
            Application application = application(activeJob(), candidateProfile(), Application.ApplicationStatus.PENDING);
            when(applicationRepository.findWithDetailsById(APPLICATION_ID)).thenReturn(Optional.of(application));

            assertThatThrownBy(() -> applicationService.withdrawApplication(APPLICATION_ID, OTHER_CANDIDATE_ID))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You can only withdraw your own applications");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-WITHDRAW-003: candidate cannot withdraw non-pending application")
        void withdrawApplication_nonPendingApplication_shouldThrowBadRequest() {
            Application application = application(activeJob(), candidateProfile(), Application.ApplicationStatus.REVIEWED);
            when(applicationRepository.findWithDetailsById(APPLICATION_ID)).thenReturn(Optional.of(application));

            assertThatThrownBy(() -> applicationService.withdrawApplication(APPLICATION_ID, CANDIDATE_ID))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Only pending applications can be withdrawn");

            verify(applicationRepository, never()).save(any());
        }
    }

    private ApplicationRequest applicationRequest(Long cvId, String coverLetter) {
        ApplicationRequest request = new ApplicationRequest();
        request.setCvId(cvId);
        request.setCoverLetter(coverLetter);
        return request;
    }

    private Job activeJob() {
        Job job = new Job();
        job.setId(JOB_ID);
        job.setEmployerId(EMPLOYER_ID);
        job.setCompanyId(100L);
        job.setTitle("Backend Developer");
        job.setDescription("Develop Spring Boot APIs");
        job.setCategoryId(1L);
        job.setLocation("Ho Chi Minh City");
        job.setType(Job.JobType.FULLTIME);
        job.setStatus(Job.JobStatus.ACTIVE);
        job.setExpiresAt(LocalDateTime.now().plusDays(7));
        return job;
    }

    private CandidateProfile candidateProfile() {
        Account user = new Account();
        user.setEmail("candidate@jobnest.test");
        user.setRole(Account.Role.CANDIDATE);
        user.setStatus(Account.AccountStatus.ACTIVE);

        CandidateProfile candidate = new CandidateProfile();
        candidate.setId(CANDIDATE_ID);
        candidate.setFullName("Nguyen Candidate");
        candidate.setUser(user);
        return candidate;
    }

    private CandidateCV ownedCv() {
        CandidateCV cv = new CandidateCV();
        cv.setId(CV_ID);
        cv.setCandidateId(CANDIDATE_ID);
        cv.setTitle("Backend CV");
        cv.setFileName("backend-cv.pdf");
        cv.setFileUrl("/uploads/cv/backend-cv.pdf");
        cv.setFileSize(1024L);
        cv.setIsDefault(true);
        return cv;
    }

    private Application application(Job job, CandidateProfile candidate, Application.ApplicationStatus status) {
        Application application = new Application();
        application.setId(APPLICATION_ID);
        application.setJob(job);
        application.setCandidate(candidate);
        application.setCvId(CV_ID);
        application.setCoverLetter("test cover letter");
        application.setResumeUrl("/uploads/cv/backend-cv.pdf");
        application.setStatus(status);
        application.setAppliedAt(LocalDateTime.now().minusHours(1));
        return application;
    }
}
