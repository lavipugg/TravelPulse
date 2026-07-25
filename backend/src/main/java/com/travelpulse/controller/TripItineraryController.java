package com.travelpulse.controller;

import com.travelpulse.dto.FuelCostResponseDTO;
import com.travelpulse.entity.ItineraryStop;
import com.travelpulse.entity.TravelExpense;
import com.travelpulse.service.TripPlannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripItineraryController {

    private final TripPlannerService tripPlannerService;

    @GetMapping("/itinerary/stops")
    public ResponseEntity<List<ItineraryStop>> getAllStops() {
        return ResponseEntity.ok(tripPlannerService.getAllStopsOrdered());
    }

    @PostMapping("/itinerary/stops")
    public ResponseEntity<ItineraryStop> createStop(@Valid @RequestBody ItineraryStop stop) {
        ItineraryStop saved = tripPlannerService.createStop(stop);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/expenses")
    public ResponseEntity<TravelExpense> createExpense(@Valid @RequestBody TravelExpense expense) {
        TravelExpense saved = tripPlannerService.createExpense(expense);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/fuel-calculator")
    public ResponseEntity<FuelCostResponseDTO> getFuelEstimate(
            @RequestParam(defaultValue = "1.85") Double fuelPrice,
            @RequestParam(defaultValue = "6.5") Double consumption) {
        FuelCostResponseDTO estimate = tripPlannerService.calculateFuelAndTollEstimate(fuelPrice, consumption);
        return ResponseEntity.ok(estimate);
    }
}