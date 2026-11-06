package com.salianji.rentcar.repository;

import com.salianji.rentcar.model.SupportStatus;
import com.salianji.rentcar.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    long countByStatus(SupportStatus status);
}
