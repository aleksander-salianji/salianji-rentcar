package com.salianji.rentcar.repository;

import com.salianji.rentcar.model.Role;
import com.salianji.rentcar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    // Llogaria e një kompanie (një për kompani)
    Optional<User> findFirstByCompanyIdAndRole(Long companyId, Role role);

    List<User> findByCompanyId(Long companyId);
}
