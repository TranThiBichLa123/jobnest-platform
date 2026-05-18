CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(512),
    full_name VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    created_by BIGINT,
    updated_at TIMESTAMP,
    updated_by BIGINT,
    deleted_at TIMESTAMP
);

CREATE TABLE email_verification (
    id BIGSERIAL PRIMARY KEY,
    accounts_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    created_by BIGINT,
    updated_at TIMESTAMP,
    updated_by BIGINT,
    CONSTRAINT fk_email_verification_accounts FOREIGN KEY (accounts_id) REFERENCES accounts(id)
);

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    accounts_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_password_reset_accounts FOREIGN KEY (accounts_id) REFERENCES accounts(id)
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    accounts_id BIGINT NOT NULL,
    token_hash VARCHAR(512) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    created_by BIGINT,
    updated_at TIMESTAMP,
    updated_by BIGINT,
    CONSTRAINT fk_refresh_token_accounts FOREIGN KEY (accounts_id) REFERENCES accounts(id)
);

CREATE TABLE candidate_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    current_position VARCHAR(255),
    years_of_experience VARCHAR(10),
    skills TEXT,
    about_me TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_candidate_profile_user FOREIGN KEY (user_id) REFERENCES accounts(id)
);

CREATE TABLE candidate_cvs (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_candidate_cv_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id)
);

CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(255),
    industry VARCHAR(150),
    address VARCHAR(255),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_company_employer FOREIGN KEY (employer_id) REFERENCES accounts(id)
);

CREATE TABLE job_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    icon_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL,
    company_id BIGINT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT NOT NULL,
    location VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    min_salary INTEGER,
    max_salary INTEGER,
    experience VARCHAR(50),
    experience_level VARCHAR(50),
    education VARCHAR(100),
    skills TEXT,
    is_urgent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL,
    posted_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT fk_job_employer FOREIGN KEY (employer_id) REFERENCES accounts(id),
    CONSTRAINT fk_job_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_job_category FOREIGN KEY (category_id) REFERENCES job_categories(id)
);

CREATE TABLE job_views (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    viewer_id BIGINT,
    viewer_ip VARCHAR(45),
    viewed_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_job_view_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_job_view_viewer FOREIGN KEY (viewer_id) REFERENCES accounts(id)
);

CREATE TABLE saved_jobs (
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    saved_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, job_id),
    CONSTRAINT fk_saved_job_user FOREIGN KEY (user_id) REFERENCES accounts(id),
    CONSTRAINT fk_saved_job_job FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    cv_id BIGINT,
    cover_letter TEXT,
    resume_url VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_application_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_application_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id),
    CONSTRAINT fk_application_cv FOREIGN KEY (cv_id) REFERENCES candidate_cvs(id)
);

CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES accounts(id)
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES accounts(id)
);

CREATE TABLE post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_post_like_post FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_post_like_user FOREIGN KEY (user_id) REFERENCES accounts(id),
    CONSTRAINT uq_post_like UNIQUE (post_id, user_id)
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES accounts(id)
);

CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    accounts_id BIGINT NOT NULL UNIQUE,
    application_status BOOLEAN NOT NULL DEFAULT TRUE,
    new_application BOOLEAN NOT NULL DEFAULT TRUE,
    new_message BOOLEAN NOT NULL DEFAULT TRUE,
    job_expired BOOLEAN NOT NULL DEFAULT TRUE,
    system BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_notification_pref_accounts FOREIGN KEY (accounts_id) REFERENCES accounts(id)
);

CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    participant_one_id BIGINT NOT NULL,
    participant_two_id BIGINT NOT NULL,
    job_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_conversation_participant_one FOREIGN KEY (participant_one_id) REFERENCES accounts(id),
    CONSTRAINT fk_conversation_participant_two FOREIGN KEY (participant_two_id) REFERENCES accounts(id),
    CONSTRAINT fk_conversation_job FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES accounts(id)
);

CREATE TABLE service_packages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(19,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    max_job_posts INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payer_id BIGINT NOT NULL,
    service_package_id BIGINT,
    amount NUMERIC(19,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    payment_method VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT fk_payment_payer FOREIGN KEY (payer_id) REFERENCES accounts(id),
    CONSTRAINT fk_payment_service_package FOREIGN KEY (service_package_id) REFERENCES service_packages(id)
);

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    admin_note TEXT,
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES accounts(id)
);

CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    level VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_system_log_user FOREIGN KEY (user_id) REFERENCES accounts(id)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id BIGINT,
    details JSON,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_log_admin FOREIGN KEY (admin_id) REFERENCES accounts(id)
);

-- =========================
-- PERFORMANCE INDEXES
-- =========================

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_category ON jobs(category_id);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);

CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);

-- =========================
-- BUSINESS CONSTRAINTS
-- =========================

ALTER TABLE applications
ADD CONSTRAINT uq_job_candidate
UNIQUE (job_id, candidate_id);