package com.jobnest.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobnest.backend.entities.system.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByAdminId(Long adminId, Pageable pageable);
    Page<AuditLog> findByTargetTypeAndTargetId(String targetType, Long targetId, Pageable pageable);
}
