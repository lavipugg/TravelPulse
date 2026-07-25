package com.travelpulse.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "itinerary_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @NotNull
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @NotBlank
    @Column(name = "location_name", nullable = false)
    private String locationName;

    @NotBlank
    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "tips_and_must_see", length = 1000)
    private String tipsAndMustSee;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private StopCategory category;

    @NotNull
    @Column(name = "distance_from_previous_km", nullable = false)
    private Double distanceFromPreviousKm;

    @Column(name = "estimated_toll_eur")
    private BigDecimal estimatedTollEur;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "recommended_time")
    private String recommendedTime;

    public enum StopCategory {
        MONUMENT, RESTAURANT, NATURAL_SPOT, HOTEL, PIT_STOP
    }
}