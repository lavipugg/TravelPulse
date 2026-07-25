package com.travelpulse.service;

import com.travelpulse.dto.FuelCostResponseDTO;
import com.travelpulse.entity.ItineraryStop;
import com.travelpulse.entity.TravelExpense;
import com.travelpulse.repository.ItineraryStopRepository;
import com.travelpulse.repository.TravelExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripPlannerService {

    private final ItineraryStopRepository stopRepository;
    private final TravelExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public List<ItineraryStop> getAllStopsOrdered() {
        return stopRepository.findAllByOrderByDayNumberAscOrderIndexAsc();
    }

    @Transactional
    public ItineraryStop createStop(ItineraryStop stop) {
        // Calcolo automatico distanza se non specificata (GPS simulato)
        if (stop.getDistanceFromPreviousKm() == null || stop.getDistanceFromPreviousKm() <= 0) {
            double autoKm = calculateAutoDistance(stop.getCity(), stop.getLocationName());
            stop.setDistanceFromPreviousKm(autoKm);
        }
        return stopRepository.save(stop);
    }

    @Transactional
    public TravelExpense createExpense(TravelExpense expense) {
        return expenseRepository.save(expense);
    }

    private double calculateAutoDistance(String city, String location) {
        if (city == null) city = "";
        if (location == null) location = "";
        int hash = (city + location).toLowerCase().hashCode();
        double base = 12.0 + (Math.abs(hash) % 35);
        double decimal = ((Math.abs(hash) % 9) + 1) / 10.0;
        return Math.round((base + decimal) * 10.0) / 10.0;
    }

    public FuelCostResponseDTO calculateFuelAndTollEstimate(Double fuelPricePerLiter, Double consumptionPer100Km) {
        List<ItineraryStop> stops = stopRepository.findAllByOrderByDayNumberAscOrderIndexAsc();

        double totalKm = stops.stream()
                .mapToDouble(s -> s.getDistanceFromPreviousKm() != null ? s.getDistanceFromPreviousKm() : 0.0)
                .sum();

        double totalTolls = stops.stream()
                .mapToDouble(s -> s.getEstimatedTollEur() != null ? s.getEstimatedTollEur().doubleValue() : 0.0)
                .sum();

        double litersNeeded = (totalKm / 100.0) * consumptionPer100Km;
        double fuelCostDouble = litersNeeded * fuelPricePerLiter;

        BigDecimal fuelCostEur = BigDecimal.valueOf(fuelCostDouble).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tollsEur = BigDecimal.valueOf(totalTolls).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = fuelCostEur.add(tollsEur);

        return FuelCostResponseDTO.builder()
                .totalDistanceKm(totalKm)
                .totalFuelLitersNeeded(Math.round(litersNeeded * 100.0) / 100.0)
                .totalFuelCostEur(fuelCostEur)
                .totalTollsEur(tollsEur)
                .grandTotalEstimatedTravelCostEur(grandTotal)
                .fuelPricePerLiterEur(fuelPricePerLiter)
                .carConsumptionLitersPer100Km(consumptionPer100Km)
                .build();
    }
}