import React, { useState } from 'react';
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