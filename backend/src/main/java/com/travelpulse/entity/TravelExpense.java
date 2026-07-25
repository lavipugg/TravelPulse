package com.travelpulse.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "travel_expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "title", nullable = false)
    private String title;

    @NotNull
    @Column(name = "amount_eur", nullable = false)
    private BigDecimal amountEur;

    @Column(name = "category")
    private String category;

    @Column(name = "expense_date")
    private LocalDate expenseDate;

    @Column(name = "paid_by_participant_id")
    private String paidByParticipantId;

    @Column(name = "is_shared")
    private Boolean isShared;

    @ElementCollection
    @CollectionTable(name = "expense_splits", joinColumns = @JoinColumn(name = "expense_id"))
    @Column(name = "participant_id")
    private List<String> splitWithParticipantIds;
}