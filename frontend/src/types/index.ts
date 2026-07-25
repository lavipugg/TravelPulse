export interface ItineraryStop {
  id: number;
  dayNumber: number;
  orderIndex: number;
  locationName: string;
  city: string;
  description: string;
  tipsAndMustSee: string;
  category: 'MONUMENT' | 'RESTAURANT' | 'NATURAL_SPOT' | 'HOTEL' | 'PIT_STOP';
  distanceFromPreviousKm: number;
  estimatedTollEur: number;
  latitude?: number;
  longitude?: number;
  recommendedTime: string;
}

export interface TravelExpense {
  id: number;
  title: string;
  amountEur: number;
  category: string;
  expenseDate: string;
  paidByParticipantId: string;
  isShared: boolean;
  splitWithParticipantIds: string[];
}

export interface TripParticipant {
  id: string;
  name: string;
  avatarColor: string;
}

export interface FuelCostResponse {
  totalDistanceKm: number;
  totalFuelLitersNeeded: number;
  totalFuelCostEur: number;
  totalTollsEur: number;
  grandTotalEstimatedTravelCostEur: number;
  fuelPricePerLiterEur: number;
  carConsumptionLitersPer100Km: number;
}