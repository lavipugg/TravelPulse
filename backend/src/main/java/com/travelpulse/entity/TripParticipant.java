package com.travelpulse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripParticipant {

    @Id
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "avatar_color")
    private String avatarColor;
}