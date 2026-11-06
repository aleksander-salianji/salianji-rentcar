package com.salianji.rentcar.repository;

import com.salianji.rentcar.model.Car;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findByActiveTrueOrderByPricePerDayAsc();

    Optional<Car> findByIdAndActiveTrue(Long id);

    List<Car> findAllByOrderByIdAsc();

    long countByActiveTrue();

    // Bllokon rreshtin e makinës gjatë krijimit të rezervimit,
    // që dy klientë të mos rezervojnë të njëjtën makinë njëkohësisht për të njëjtat data.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Car c where c.id = :id")
    Optional<Car> findByIdForUpdate(@Param("id") Long id);
}
