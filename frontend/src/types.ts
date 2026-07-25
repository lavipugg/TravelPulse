export type FuelType = 'PETROL' | 'DIESEL' | 'LPG' | 'METHANE' | 'ELECTRIC';

export interface FuelTypeInfo {
  type: FuelType;
  label: string;
  unit: string;
  consumptionUnit: string;
  defaultPrice: number;
  defaultConsumption: number;
  iconName: string;
  badgeColor: string;
}

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
  latitude: number;
  longitude: number;
  recommendedTime: string;
}

export interface TravelExpense {
  id: number;
  title: string;
  category: 'FUEL' | 'FOOD' | 'ACCOMMODATION' | 'TOLL' | 'TICKETS' | 'OTHER';
  amountEur: number;
  date: string;
  paidByParticipantId: string;
  isShared: boolean;
  splitWithParticipantIds?: string[];
}

export interface TripParticipant {
  id: string;
  name: string;
  avatarColor?: string;
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