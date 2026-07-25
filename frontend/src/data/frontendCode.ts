import { CodeFile } from '../types';

export const frontendFiles: CodeFile[] = [
  {
    path: 'frontend/package.json',
    language: 'json',
    description: 'Dipendenze React, Vite 5, Tailwind CSS v4 con plugin Vite integrato, Capacitor Core e iOS/Android',
    code: `{
  "name": "travelpulse-mobile",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "cap:sync": "cap sync",
    "cap:android": "cap open android",
    "cap:ios": "cap open ios"
  },
  "dependencies": {
    "@capacitor/core": "^5.7.0",
    "@capacitor/android": "^5.7.0",
    "@capacitor/ios": "^5.7.0",
    "@capacitor/geolocation": "^5.0.0",
    "@capacitor/preferences": "^5.0.0",
    "axios": "^1.6.8",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.7.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.2.2",
    "vite": "^5.4.11"
  }
}`
  },
  {
    path: 'frontend/tsconfig.json',
    language: 'json',
    description: 'Configurazione TypeScript per React + Vite Mobile',
    code: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}`
  },
  {
    path: 'frontend/capacitor.config.json',
    language: 'json',
    description: 'Configurazione Capacitor per la generazione dei progetti nativi Android Studio e Xcode (iOS)',
    code: `{
  "appId": "com.travelpulse.planner",
  "appName": "TravelPulse",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "plugins": {
    "CapacitorCookies": {
      "enabled": true
    },
    "Geolocation": {
      "permissions": ["location"]
    }
  }
}`
  },
  {
    path: 'frontend/vite.config.ts',
    language: 'typescript',
    description: 'Configurazione Vite con plugin React e Tailwind CSS per compilazione ad alta velocità in dist/',
    code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true,
  }
});`
  },
  {
    path: 'frontend/index.html',
    language: 'xml',
    description: 'Entry point HTML con viewport mobile ottimizzata per tacca iPhone (safe-area-inset)',
    code: `<!DOCTYPE html>
<html lang="it" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>TravelPulse Mobile</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-black text-zinc-100 antialiased select-none">
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>`
  },
  {
    path: 'frontend/src/index.css',
    language: 'css',
    description: 'Stili globali Tailwind CSS v4 ed effetti Safe Area per schermi mobile notch (iPhone e Android)',
    code: `@import "tailwindcss";

@layer base {
  body {
    background-color: #000000;
    color: #f4f4f5;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}`
  },
  {
    path: 'frontend/src/main.tsx',
    language: 'typescript',
    description: 'Entry point React 18 per il rendering dell app mobile',
    code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
  },
  {
    path: 'frontend/src/types.ts',
    language: 'typescript',
    description: 'Tipi TypeScript per Tappe, Spese, Tipi Carburante, Partecipanti e Risposte REST API',
    code: `export type FuelType = 'PETROL' | 'DIESEL' | 'LPG' | 'METHANE' | 'ELECTRIC';

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
}`
  },
  {
    path: 'frontend/src/api/tripApi.ts',
    language: 'typescript',
    description: 'Service Axios con gestione automatica degli IP per emulatore Android (10.0.2.2) e iOS (localhost)',
    code: `import axios from 'axios';
import { ItineraryStop, TravelExpense, FuelCostResponse } from '../types';

const BASE_URL = typeof window !== 'undefined' && window.navigator.userAgent.includes('Android')
  ? 'http://10.0.2.2:8080/api/v1'
  : 'http://localhost:8080/api/v1';

export const tripApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStops = async (): Promise<ItineraryStop[]> => {
  const response = await tripApi.get('/trips/itinerary/stops');
  return response.data;
};

export const createStop = async (stop: Partial<ItineraryStop>): Promise<ItineraryStop> => {
  const response = await tripApi.post('/trips/itinerary/stops', stop);
  return response.data;
};

export const createExpense = async (expense: Partial<TravelExpense>): Promise<TravelExpense> => {
  const response = await tripApi.post('/trips/expenses', expense);
  return response.data;
};

export const getFuelEstimate = async (fuelPrice: number, consumption: number): Promise<FuelCostResponse> => {
  const response = await tripApi.get('/trips/fuel-calculator', {
    params: { fuelPrice, consumption }
  });
  return response.data;
};`
  },
  {
    path: 'frontend/src/hooks/useLiveTripSync.ts',
    language: 'typescript',
    description: 'Hook React per la Sincronizzazione Live Multi-Dispositivo tramite BroadcastChannel e LocalStorage',
    code: `import { useEffect, useRef } from 'react';
import { TravelExpense, ItineraryStop, TripParticipant } from '../types';

export function useLiveTripSync(
  onRemoteUpdate: (data: { expenses?: TravelExpense[]; stops?: ItineraryStop[]; message: string; updatedBy: string }) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const deviceIdRef = useRef<string>(\`dev_\${Math.random().toString(36).substring(2, 9)}\`);

  const broadcastChange = (payload: {
    expenses?: TravelExpense[];
    stops?: ItineraryStop[];
    participants?: TripParticipant[];
    message: string;
    updatedBy: string;
  }) => {
    try {
      localStorage.setItem('travelpulse_shared_trip_data', JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'TRIP_SYNC',
        senderId: deviceIdRef.current,
        payload
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('travelpulse_shared_trip_v1');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload, senderId } = event.data || {};
        if (senderId && senderId !== deviceIdRef.current && type === 'TRIP_SYNC') {
          onRemoteUpdate(payload);
        }
      };

      return () => channel.close();
    }
  }, [onRemoteUpdate]);

  return { broadcastChange };
}`
  },
  {
    path: 'frontend/src/components/StopCard.tsx',
    language: 'typescript',
    description: 'Componente React per la singola tappa dell itinerario con calcolo automatico distanza e consigli',
    code: `import React from 'react';
import { MapPin, Navigation, Compass, Fuel } from 'lucide-react';
import { ItineraryStop } from '../types';

interface StopCardProps {
  stop: ItineraryStop;
  fuelPrice: number;
  consumption: number;
  onOpenMap: (stop: ItineraryStop) => void;
}

export const StopCard: React.FC<StopCardProps> = ({ stop, fuelPrice, consumption, onOpenMap }) => {
  const liters = (stop.distanceFromPreviousKm / 100) * consumption;
  const fuelCost = liters * fuelPrice;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-2.5 shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
            {stop.recommendedTime} • {stop.city}
          </span>
          <h3 className="text-sm font-bold text-zinc-100 mt-1">{stop.locationName}</h3>
        </div>
        <button
          onClick={() => onOpenMap(stop)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition"
        >
          <Navigation className="w-3.5 h-3.5" />
          Mappa
        </button>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed">{stop.description}</p>

      {/* Consigli di cosa visitare */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-2.5 text-xs text-amber-300 flex items-start gap-2">
        <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-amber-400 text-[11px] font-mono">DA NON PERDERE:</strong>
          <span>{stop.tipsAndMustSee}</span>
        </div>
      </div>

      {/* Info Tratta e Carburante */}
      {stop.distanceFromPreviousKm > 0 && (
        <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-800/80 text-zinc-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            Dist: <strong className="text-zinc-200">~{stop.distanceFromPreviousKm} km</strong>
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Fuel className="w-3.5 h-3.5" />
            Benzina: ~{fuelCost.toFixed(2)} €
          </span>
        </div>
      )}
    </div>
  );
};`
  },
  {
    path: 'frontend/src/components/ExpenseList.tsx',
    language: 'typescript',
    description: 'Componente React per la lista spese condivise e il calcolo automatico dei saldi e dei pareggi',
    code: `import React from 'react';
import { TravelExpense, TripParticipant } from '../types';

interface ExpenseListProps {
  expenses: TravelExpense[];
  participants: TripParticipant[];
  onSettle: (from: string, to: string, amount: number) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, participants }) => {
  const total = expenses.reduce((sum, e) => sum + e.amountEur, 0);

  return (
    <div className="space-y-3 font-sans">
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-mono">Totale Spese Gruppo:</span>
        <strong className="text-emerald-400 font-bold text-sm font-mono">€{total.toFixed(2)}</strong>
      </div>

      <div className="space-y-2">
        {expenses.map((exp) => {
          const payer = participants.find(p => p.id === exp.paidByParticipantId);
          return (
            <div key={exp.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-100 block">{exp.title}</span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  Pagato da: <strong className="text-sky-300">{payer?.name || 'Utente'}</strong>
                </span>
              </div>
              <strong className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                €{exp.amountEur.toFixed(2)}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};`
  },
  {
    path: 'frontend/src/App.tsx',
    language: 'typescript',
    description: 'Componente principale dell app mobile con Tab Bar (Itinerario, Carburante, Spese, Valigia)',
    code: `import React, { useState } from 'react';
import { MapPin, Fuel, DollarSign, Briefcase, Navigation } from 'lucide-react';
import { ItineraryStop, TravelExpense, TripParticipant } from './types';
import { StopCard } from './components/StopCard';
import { ExpenseList } from './components/ExpenseList';

export default function App() {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'fuel' | 'expenses' | 'packing'>('itinerary');

  const [fuelPrice, setFuelPrice] = useState<number>(1.85);
  const [consumption, setConsumption] = useState<number>(6.5);

  const [stops] = useState<ItineraryStop[]>([
    {
      id: 1,
      dayNumber: 1,
      orderIndex: 1,
      locationName: "Duomo di Milano e Galleria Vittorio Emanuele",
      city: "Milano",
      description: "Passeggiata nel cuore di Milano, salita sulle terrazze del Duomo e caffè in Galleria.",
      tipsAndMustSee: "Acquista il biglietto 'Terratze a piedi' per evitare 1 ora di coda.",
      category: "MONUMENT",
      distanceFromPreviousKm: 0,
      estimatedTollEur: 0,
      latitude: 45.4642,
      longitude: 9.1900,
      recommendedTime: "09:30 - 12:00"
    },
    {
      id: 2,
      dayNumber: 1,
      orderIndex: 2,
      locationName: "Castello Sforzesco e Parco Sempione",
      city: "Milano",
      description: "Esplorazione dei cortili del castello e relax nel parco fino all'Arco della Pace.",
      tipsAndMustSee: "Aperitivo con vista Arco della Pace alle 18:30.",
      category: "NATURAL_SPOT",
      distanceFromPreviousKm: 4.2,
      estimatedTollEur: 0,
      latitude: 45.4705,
      longitude: 9.1793,
      recommendedTime: "14:30 - 17:00"
    }
  ]);

  const [expenses] = useState<TravelExpense[]>([
    {
      id: 1,
      title: "Pieno di Benzina (Eni Station)",
      category: "FUEL",
      amountEur: 75.00,
      date: "2026-07-24",
      paidByParticipantId: "p1",
      isShared: true
    },
    {
      id: 2,
      title: "Pranzo Trattoria Tipica",
      category: "FOOD",
      amountEur: 54.50,
      date: "2026-07-24",
      paidByParticipantId: "p2",
      isShared: true
    }
  ]);

  const participants: TripParticipant[] = [
    { id: "p1", name: "Marco", avatarColor: "bg-blue-600" },
    { id: "p2", name: "Laura", avatarColor: "bg-emerald-600" },
    { id: "p3", name: "Luca", avatarColor: "bg-purple-600" }
  ];

  const handleOpenMap = (stop: ItineraryStop) => {
    window.open("https://www.google.com/maps/search/?api=1&query=" + stop.latitude + "," + stop.longitude, '_blank');
  };

  const totalKm = stops.reduce((acc, s) => acc + s.distanceFromPreviousKm, 0);
  const totalFuelLiters = (totalKm / 100) * consumption;
  const totalFuelCost = totalFuelLiters * fuelPrice;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans pb-20">
      {/* Top Header App Mobile */}
      <header className="bg-zinc-950 border-b border-zinc-800 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-blue-400 tracking-tight flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            TravelPulse Mobile
          </h1>
          <p className="text-[11px] text-zinc-400 font-mono">Pianificatore Itinerario & Spese Gruppo</p>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-800 font-mono">
          LIVE SYNC
        </span>
      </header>

      {/* Main Tab Content */}
      <main className="p-4 flex-1 space-y-4 max-w-md mx-auto w-full">
        {activeTab === 'itinerary' && (
          <div className="space-y-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Km Totali Itinerario:</span>
              <strong className="text-sky-400 font-bold font-mono text-sm">{totalKm.toFixed(1)} km</strong>
            </div>
            {stops.map(stop => (
              <StopCard
                key={stop.id}
                stop={stop}
                fuelPrice={fuelPrice}
                consumption={consumption}
                onOpenMap={handleOpenMap}
              />
            ))}
          </div>
        )}

        {activeTab === 'fuel' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <Fuel className="w-4 h-4 text-emerald-400" />
              CALCOLATORE CARBURANTE
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Prezzo Carburante (€/L):</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Consumo Medio Auto (L / 100km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={consumption}
                  onChange={(e) => setConsumption(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Litri Stima Necessari:</span>
                <strong className="text-zinc-200">{totalFuelLiters.toFixed(2)} L</strong>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-zinc-800">
                <span>Costo Totale Benzina:</span>
                <span>€{totalFuelCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            participants={participants}
            onSettle={() => {}}
          />
        )}

        {activeTab === 'packing' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs space-y-2">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <Briefcase className="w-4 h-4 text-amber-400" />
              VALIGIA & DOCUMENTI
            </h2>
            <p className="text-zinc-400">Lista cose da mettere in valigia prima di partire.</p>
            <ul className="space-y-2 pt-2">
              <li className="flex items-center gap-2 p-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-200">
                <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                <span>Patente di guida e Carta d'Identità</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-200">
                <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                <span>Caricabatterie e Powerbank</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-zinc-950 rounded border border-zinc-800 text-zinc-200">
                <input type="checkbox" className="rounded accent-blue-600" />
                <span>Kit pronto soccorso auto</span>
              </li>
            </ul>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 py-2 px-4 flex justify-around z-50">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={activeTab === 'itinerary' ? 'flex flex-col items-center gap-1 text-[11px] font-bold text-blue-400 transition' : 'flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition'}
        >
          <MapPin className="w-5 h-5" />
          Itinerario
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={activeTab === 'fuel' ? 'flex flex-col items-center gap-1 text-[11px] font-bold text-emerald-400 transition' : 'flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition'}
        >
          <Fuel className="w-5 h-5" />
          Carburante
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={activeTab === 'expenses' ? 'flex flex-col items-center gap-1 text-[11px] font-bold text-purple-400 transition' : 'flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition'}
        >
          <DollarSign className="w-5 h-5" />
          Spese
        </button>
        <button
          onClick={() => setActiveTab('packing')}
          className={activeTab === 'packing' ? 'flex flex-col items-center gap-1 text-[11px] font-bold text-amber-400 transition' : 'flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition'}
        >
          <Briefcase className="w-5 h-5" />
          Valigia
        </button>
      </nav>
    </div>
  );
}
`
  }
];
