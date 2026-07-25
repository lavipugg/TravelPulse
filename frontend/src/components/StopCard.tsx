import React from 'react';
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

      <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-2.5 text-xs text-amber-300 flex items-start gap-2">
        <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-amber-400 text-[11px] font-mono">DA NON PERDERE:</strong>
          <span>{stop.tipsAndMustSee}</span>
        </div>
      </div>

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
};