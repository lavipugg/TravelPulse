export interface CodeFile {
  path: string;
  language: 'java' | 'xml' | 'yaml' | 'sql' | 'typescript' | 'json' | 'markdown';
  description: string;
  code: string;
}

export interface CodeFolder {
  name: string;
  files: CodeFile[];
}

export interface AppIdea {
  id: string;
  title: string;
  tagline: string;
  iconName: string;
  category: string;
  description: string;
  features: string[];
  databaseTables: string[];
  recommendedTech: string;
}

export type FuelType = 'PETROL' | 'DIESEL' | 'LPG' | 'METHANE' | 'ELECTRIC';

export interface FuelTypeInfo {
  type: FuelType;
  label: string;
  unit: string; // €/L, €/kg, €/kWh
  consumptionUnit: string; // L/100km, kg/100km, kWh/100km
  defaultPrice: number;
  defaultConsumption: number;
  iconName: string;
  badgeColor: string;
}

export type TipCategory = 'FOOD' | 'HISTORY' | 'PANORAMA' | 'ZTL';

export interface ItineraryStop {
  id: number;
  dayNumber: number;
  orderIndex: number;
  locationName: string;
  city: string;
  description: string;
  tipsAndMustSee: string;
  tipCategory?: TipCategory;
  category: 'MONUMENT' | 'RESTAURANT' | 'NATURAL_SPOT' | 'HOTEL' | 'PIT_STOP';
  distanceFromPreviousKm: number; // km dalla tappa precedente
  estimatedTollEur: number; // pedaggio autostradale stimato
  latitude: number;
  longitude: number;
  recommendedTime: string; // e.g. "09:30 - 11:30"
  photos?: string[]; // Galleria immagini del luogo
}

export interface PackingItem {
  id: number;
  itemName: string;
  category: 'DOCUMENTS' | 'ELECTRONICS' | 'CLOTHING' | 'HEALTH' | 'MISC';
  packed: boolean;
}

export interface TripParticipant {
  id: string;
  name: string;
  avatarColor?: string;
}

export interface TravelExpense {
  id: number;
  title: string;
  category: 'FUEL' | 'FOOD' | 'ACCOMMODATION' | 'TOLL' | 'TICKETS' | 'OTHER';
  amountEur: number;
  date: string;
  paidByParticipantId: string; // ID del partecipante che ha pagato
  isShared: boolean; // true = da dividere in gruppo, false = spesa personale
  splitWithParticipantIds?: string[]; // ID dei partecipanti che condividono la spesa
}

export interface TripSettings {
  id: number;
  tripTitle: string;
  destination: string;
  startDate: string;
  endDate: string;
  fuelType: FuelType;
  fuelPricePerLiter: number; // €/L, €/kg or €/kWh
  fuelConsumptionPer100Km: number; // L/100km, kg/100km or kWh/100km
  vehicleName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  fuelType: FuelType;
  vehicleName: string;
  authProvider: 'EMAIL' | 'GOOGLE' | 'FACEBOOK';
  avatarUrl?: string;
  registeredAt: string;
}


