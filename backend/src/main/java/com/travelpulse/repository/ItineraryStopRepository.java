package com.travelpulse.repository;

import com.travelpulse.entity.ItineraryStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryStopRepository extends JpaRepository<ItineraryStop, Long> {

    List<ItineraryStop> findByDayNumberOrderByOrderIndexAsc(Integer dayNumber);

    List<ItineraryStop> findAllByOrderByDayNumberAscOrderIndexAsc();

    @Query("SELECT SUM(s.distanceFromPreviousKm) FROM ItineraryStop s")
    Double calculateTotalDistanceKm();

    @Query("SELECT SUM(s.estimatedTollEur) FROM ItineraryStop s")
    Double calculateTotalTollsEur();
}