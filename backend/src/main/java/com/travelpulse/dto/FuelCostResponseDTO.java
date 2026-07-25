package com.travelpulse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelCostResponseDTO {
    private Double totalDistanceKm;
    private Double totalFuelLitersNeeded;
    private BigDecimal totalFuelCostEur;
    private BigDecimal totalTollsEur;
    private BigDecimal grandTotalEstimatedTravelCostEur;
    private Double fuelPricePerLiterEur;
    private Double carConsumptionLitersPer100Km;
}