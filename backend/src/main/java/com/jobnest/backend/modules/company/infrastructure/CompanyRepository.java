package com.jobnest.backend.modules.company.infrastructure;

import com.jobnest.backend.modules.company.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByEmployerId(Long employerId);
    Optional<Company> findByEmployerIdAndId(Long employerId, Long id);
    boolean existsByEmployerIdAndName(Long employerId, String name);
    
    // Get top companies with active job counts
    @Query("SELECT c.id, c.name, c.logoUrl, c.industry, c.address, c.verified, COUNT(j.id) " +
           "FROM Company c LEFT JOIN Job j ON c.id = j.companyId AND j.status = 'ACTIVE' " +
           "GROUP BY c.id, c.name, c.logoUrl, c.industry, c.address, c.verified " +
           "HAVING COUNT(j.id) > 0 " +
           "ORDER BY COUNT(j.id) DESC")
    List<Object[]> findTopCompaniesByJobCount();
}
