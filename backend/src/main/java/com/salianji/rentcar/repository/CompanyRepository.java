package com.salianji.rentcar.repository;

import com.salianji.rentcar.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findAllByOrderByNameAsc();

    List<Company> findByActiveTrueOrderByNameAsc();

    Optional<Company> findByIdAndActiveTrue(Long id);

    Optional<Company> findFirstByNameIgnoreCase(String name);

    long countByActiveTrue();
}
