import { FuelType, FuelTypeInfo, ItineraryStop, PackingItem, TravelExpense, TripParticipant, TripSettings } from '../types';

export const initialTripParticipants: TripParticipant[] = [
  { id: 'p1', name: 'Chiara', avatarColor: 'bg-emerald-600' },
  { id: 'p2', name: 'Marco', avatarColor: 'bg-blue-600' },
  { id: 'p3', name: 'Elena', avatarColor: 'bg-purple-600' },
  { id: 'p4', name: 'Matteo', avatarColor: 'bg-amber-600' }
];

export const FUEL_TYPES_CONFIG: Record<FuelType, FuelTypeInfo> = {
  PETROL: {
    type: 'PETROL',
    label: 'Benzina',
    unit: '€/L',
    consumptionUnit: 'L/100km',
    defaultPrice: 1.85,
    defaultConsumption: 6.5,
    iconName: 'Fuel',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
  },
  DIESEL: {
    type: 'DIESEL',
    label: 'Diesel / Gasolio',
    unit: '€/L',
    consumptionUnit: 'L/100km',
    defaultPrice: 1.72,
    defaultConsumption: 5.2,
    iconName: 'Fuel',
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700'
  },
  LPG: {
    type: 'LPG',
    label: 'GPL',
    unit: '€/L',
    consumptionUnit: 'L/100km',
    defaultPrice: 0.72,
    defaultConsumption: 8.0,
    iconName: 'Flame',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700'
  },
  METHANE: {
    type: 'METHANE',
    label: 'Metano (CNG)',
    unit: '€/kg',
    consumptionUnit: 'kg/100km',
    defaultPrice: 1.35,
    defaultConsumption: 4.2,
    iconName: 'Wind',
    badgeColor: 'bg-teal-900/60 text-teal-300 border-teal-700'
  },
  ELECTRIC: {
    type: 'ELECTRIC',
    label: 'Elettrica (EV)',
    unit: '€/kWh',
    consumptionUnit: 'kWh/100km',
    defaultPrice: 0.45,
    defaultConsumption: 15.0,
    iconName: 'Zap',
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700'
  }
};

export const initialTripSettings: TripSettings = {
  id: 1,
  tripTitle: 'Road Trip Italia: Roma, Napoli e Costiera Amalfitana',
  destination: 'Campania & Costiera Amalfitana',
  startDate: '2026-08-10',
  endDate: '2026-08-16',
  fuelType: 'PETROL',
  fuelPricePerLiter: 1.85,
  fuelConsumptionPer100Km: 6.5,
  vehicleName: 'Volkswagen Golf 1.5 TSI / Fiat 500X'
};

export const initialItineraryStops: ItineraryStop[] = [
  // GIORNO 1
  {
    id: 1,
    dayNumber: 1,
    orderIndex: 1,
    locationName: 'Piazza Venezia & Colosseo',
    city: 'Roma',
    description: 'Partenza dal cuore di Roma. Punto di ritrovo e partenza del viaggio in auto con panoramica del centro storico.',
    tipsAndMustSee: 'Visita il Colosseo di prima mattina per evitare la ressa. Parcheggio consigliato vicino Termini al coperto fuori ZTL.',
    tipCategory: 'HISTORY',
    category: 'MONUMENT',
    distanceFromPreviousKm: 0,
    estimatedTollEur: 0,
    latitude: 41.8925,
    longitude: 12.4853,
    recommendedTime: '08:30 - 10:30',
    photos: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 2,
    dayNumber: 1,
    orderIndex: 2,
    locationName: 'Abbazia di Montecassino (Sosta & Panorama)',
    city: 'Cassino (FR)',
    description: 'Tappa intermedia sull\'autostrada A1 per spezzare il viaggio, ammirare il panorama e visitare lo storico monastero.',
    tipsAndMustSee: 'Visita il chiostro del Bramante e goditi la vista sulla valle. Sosta bar con espresso napoletano e sfogliatella fresca.',
    tipCategory: 'PANORAMA',
    category: 'PIT_STOP',
    distanceFromPreviousKm: 138,
    estimatedTollEur: 11.20,
    latitude: 41.4901,
    longitude: 13.8136,
    recommendedTime: '12:00 - 13:15',
    photos: [
      'https://images.unsplash.com/photo-1548625361-18544e397c55?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 3,
    dayNumber: 1,
    orderIndex: 3,
    locationName: 'Spaccanapoli & Pizzeria Sorbillo',
    city: 'Napoli',
    description: 'Arrivo a Napoli Centro Storico. Sistemazione in alloggio e pranzo d\'autore con la vera pizza margherita napoletana.',
    tipsAndMustSee: 'Cappella Sansevero col Cristo Velato, San Gregorio Armeno (vicolo dei presepi). Mangia la margherita con mozzarella di bufala campana!',
    tipCategory: 'FOOD',
    category: 'RESTAURANT',
    distanceFromPreviousKm: 98,
    estimatedTollEur: 8.50,
    latitude: 40.8518,
    longitude: 14.2581,
    recommendedTime: '14:30 - 18:00',
    photos: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // GIORNO 2
  {
    id: 4,
    dayNumber: 2,
    orderIndex: 1,
    locationName: 'Parco Archeologico di Pompei',
    city: 'Pompei (NA)',
    description: 'Esplorazione degli scavi archeologici dell\'antica città romana sepolta dal Vesuvio nel 79 d.C.',
    tipsAndMustSee: 'Attenzione ZTL e parcheggi abusivi! Usa solo parcheggi ufficiali Scavi. Prenota i biglietti salta-fila online. Da vedere Casa del Fauno e Anfiteatro.',
    tipCategory: 'ZTL',
    category: 'MONUMENT',
    distanceFromPreviousKm: 26,
    estimatedTollEur: 2.30,
    latitude: 40.7489,
    longitude: 14.4849,
    recommendedTime: '09:00 - 12:30',
    photos: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 5,
    dayNumber: 2,
    orderIndex: 2,
    locationName: 'Sorrento Centro & Terrazza Belvedere',
    city: 'Sorrento (NA)',
    description: 'Passeggiata nel centro storico tra i vicoli di limoni, botteghe artigiane e degustazione del Limoncello di Sorrento.',
    tipsAndMustSee: 'Belvedere della Villa Comunale per il tramonto sul Vesuvio e Golfo di Napoli. Prova la delizia al limone nella pasticceria storica!',
    tipCategory: 'FOOD',
    category: 'NATURAL_SPOT',
    distanceFromPreviousKm: 28,
    estimatedTollEur: 0,
    latitude: 40.6263,
    longitude: 14.3758,
    recommendedTime: '14:00 - 18:30',
    photos: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // GIORNO 3
  {
    id: 6,
    dayNumber: 3,
    orderIndex: 1,
    locationName: 'Positano (La Perla della Costiera)',
    city: 'Positano (SA)',
    description: 'Strada panoramica SS163 Amalfitana con viste verticali da brivido sul mare turchese e scogliere.',
    tipsAndMustSee: 'Sosta belvedere lungo la curva per foto panoramiche. Parcheggia a Mandara o Parcheggio dei Muli. Scesa a piedi fino alla Spiaggia Grande.',
    tipCategory: 'PANORAMA',
    category: 'NATURAL_SPOT',
    distanceFromPreviousKm: 15,
    estimatedTollEur: 0,
    latitude: 40.6281,
    longitude: 14.4850,
    recommendedTime: '09:30 - 13:00',
    photos: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 7,
    dayNumber: 3,
    orderIndex: 2,
    locationName: 'Amalfi Duomo & Marina Grande',
    city: 'Amalfi (SA)',
    description: 'Visita alla gloriosa antica Repubblica Marinara di Amalfi con il maestoso Duomo arabo-normanno.',
    tipsAndMustSee: 'Scalinata del Duomo di Sant\'Andrea, Chiostro del Paradiso e Museo della Carta. Assaggia la sfogliatella Santa Rosa Pasticceria Pansa!',
    tipCategory: 'HISTORY',
    category: 'MONUMENT',
    distanceFromPreviousKm: 16,
    estimatedTollEur: 0,
    latitude: 40.6340,
    longitude: 14.6027,
    recommendedTime: '14:30 - 19:00',
    photos: [
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const initialPackingItems: PackingItem[] = [
  { id: 1, itemName: 'Patente di Guida & Carta d\'Identità', category: 'DOCUMENTS', packed: true },
  { id: 2, itemName: 'Assicurazione Auto & Libretto', category: 'DOCUMENTS', packed: true },
  { id: 3, itemName: 'Telepass / Carte per Pedaggi', category: 'DOCUMENTS', packed: true },
  { id: 4, itemName: 'Caricatore Smartphone Auto + Cavo USB', category: 'ELECTRONICS', packed: false },
  { id: 5, itemName: 'Supporto Smartphone per Cruscotto Navigatore', category: 'ELECTRONICS', packed: true },
  { id: 6, itemName: 'Powerbank Portatile 10.000 mAh', category: 'ELECTRONICS', packed: false },
  { id: 7, itemName: 'Scarpe Comode da Camminata', category: 'CLOTHING', packed: true },
  { id: 8, itemName: 'Occhiali da Sole & Cappello', category: 'CLOTHING', packed: false },
  { id: 9, itemName: 'Telo Mare & Costume da Bagno', category: 'CLOTHING', packed: false },
  { id: 10, itemName: 'Kit Pronto Soccorso Auto & Medicine Base', category: 'HEALTH', packed: true },
  { id: 11, itemName: 'Borraccia Termica 1 Litro', category: 'MISC', packed: false }
];

export const initialTravelExpenses: TravelExpense[] = [
  { id: 1, title: 'Carburante Pieno Roma', category: 'FUEL', amountEur: 65.00, date: '2026-08-10', paidByParticipantId: 'p1', isShared: true },
  { id: 2, title: 'Pedaggio Autostrada A1 Roma-Cassino-Napoli', category: 'TOLL', amountEur: 19.70, date: '2026-08-10', paidByParticipantId: 'p1', isShared: true },
  { id: 3, title: 'Pranzo Pizzeria Sorbillo Napoli', category: 'FOOD', amountEur: 64.00, date: '2026-08-10', paidByParticipantId: 'p2', isShared: true },
  { id: 4, title: 'Hotel 2 Notti Napoli Centro', category: 'ACCOMMODATION', amountEur: 240.00, date: '2026-08-10', paidByParticipantId: 'p1', isShared: true },
  { id: 5, title: 'Biglietti Ingresso Scavi Pompei (x4)', category: 'TICKETS', amountEur: 72.00, date: '2026-08-11', paidByParticipantId: 'p3', isShared: true },
  { id: 6, title: 'Souvenir Ceramica Positano', category: 'OTHER', amountEur: 25.00, date: '2026-08-12', paidByParticipantId: 'p2', isShared: false }
];

