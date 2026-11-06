package com.salianji.rentcar.repository;

import com.salianji.rentcar.model.Booking;
import com.salianji.rentcar.model.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // A ka rezervim aktiv që mbivendoset me periudhën [from, to)?
    // Dita e kthimit nuk llogaritet: makina e kthyer më 10 mund të merret përsëri më 10.
    @Query("""
        select count(b) > 0 from Booking b
        where b.car.id = :carId
          and b.status in :statuses
          and b.pickupDate < :to
          and :from < b.returnDate
        """)
    boolean existsOverlap(@Param("carId") Long carId,
                          @Param("from") LocalDate from,
                          @Param("to") LocalDate to,
                          @Param("statuses") Collection<BookingStatus> statuses);

    List<Booking> findByCarIdAndStatusInAndReturnDateAfterOrderByPickupDateAsc(
        Long carId, Collection<BookingStatus> statuses, LocalDate date);

    @EntityGraph(attributePaths = {"car", "user", "phoneNumbers"})
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"car", "user", "phoneNumbers"})
    List<Booking> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"car", "user", "phoneNumbers"})
    Optional<Booking> findWithDetailsById(Long id);

    boolean existsByCarId(Long carId);

    long countByStatus(BookingStatus status);

    long countByStatusIn(Collection<BookingStatus> statuses);

    @Query("select coalesce(sum(b.totalPrice), 0) from Booking b where b.status in :statuses")
    BigDecimal sumTotalPriceByStatusIn(@Param("statuses") Collection<BookingStatus> statuses);
}
