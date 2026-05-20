package com.jobnest.backend.entities.job;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCategory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 150)
    private String name;
    
    @Column(nullable = false, unique = true, length = 150)
    private String slug;
    
    @Column(name = "icon_url", length = 255)
    private String iconUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


}
