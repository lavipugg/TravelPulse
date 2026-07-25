import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone, Plus, RefreshCw, Terminal, ShieldCheck, MapPin, Navigation,
  Fuel, Compass, CheckSquare, DollarSign, Calendar, Map, CheckCircle2, ChevronRight,
  Camera, Image as ImageIcon, Car, Flame, Zap, Wind, User, AlertTriangle, Layers, Utensils,
  Users, UserCheck, Receipt, Scale, CreditCard, ArrowRightLeft, UserPlus, Check, Luggage,
  Sun, Moon, Share2, Copy, Wifi, ExternalLink
} from 'lucide-react';
import { ItineraryStop, PackingItem, TravelExpense, TripSettings, FuelType, UserProfile, TipCategory, TripParticipant } from '../types';
import { initialItineraryStops, initialPackingItems, initialTravelExpenses, initialTripSettings, initialTripParticipants, FUEL_TYPES_CONFIG } from '../data/travelData';
import { calculateTripBalances } from '../utils/expenseUtils';

interface MobileSimulatorProps {
  themeMode?: 'dark' | 'light';
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onToggleThemeMode?: () => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  themeMode = 'dark',
  currentUser = null,
  onOpenAuthModal,
  onToggleThemeMode
}) => {
  const isDark = themeMode === 'dark';

  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'fuel' | 'expenses'>('itinerary');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [expenseSubTab, setExpenseSubTab] = useState<'list' | 'split'>('split');

  // App State
  const [tripSettings, setTripSettings] = useState<TripSettings>(initialTripSettings);
  const [stops, setStops] = useState<ItineraryStop[]>(initialItineraryStops);
  const [packingList, setPackingList] = useState<PackingItem[]>(initialPackingItems);
  const [expenses, setExpenses] = useState<TravelExpense[]>(initialTravelExpenses);
  const [participants, setParticipants] = useState<TripParticipant[]>(initialTripParticipants);

  // Modals
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddFuelModal, setShowAddFuelModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState<ItineraryStop | null>(null);
  const [selectedPhotoStop, setSelectedPhotoStop] = useState<ItineraryStop | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Live Sync & Sharing state
  const deviceIdRef = useRef<string>(`device_${Math.random().toString(36).substring(2, 9)}`);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const tripShareUrl = 'https://travelpulse.app/trip/vacanze-italia-2026?invite=TP-8842';

  // Helper for automatic distance calculation from previous stop
  const calculateAutoDistance = (city: string, locationName: string, existingStops: ItineraryStop[]): number => {
    if (!city.trim() && !locationName.trim()) return 18.5;
    const combined = (city + locationName).toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const baseKm = 12 + (Math.abs(hash) % 35);
    const decimal = ((Math.abs(hash) % 9) + 1) / 10;
    return Number((baseKm + decimal).toFixed(1));
  };

  // Broadcast function for cross-device / multi-tab synchronization
  const broadcastTripState = (
    updatedExpenses: TravelExpense[],
    updatedStops: ItineraryStop[],
    updatedParticipants: TripParticipant[],
    message: string,
    updatedBy: string = 'Tu'
  ) => {
    const payload = {
      expenses: updatedExpenses,
      stops: updatedStops,
      participants: updatedParticipants,
      message,
      updatedBy
    };

    try {
      localStorage.setItem('travelpulse_shared_trip_data', JSON.stringify(payload));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'TRIP_SYNC',
        senderId: deviceIdRef.current,
        payload
      });
    }
  };

  // Real-time synchronization listener
  useEffect(() => {
    // Load initial synced state if available in localStorage
    try {
      const saved = localStorage.getItem('travelpulse_shared_trip_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.stops) setStops(parsed.stops);
        if (parsed.participants) setParticipants(parsed.participants);
      }
    } catch (err) {
      console.error(err);
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('travelpulse_shared_trip_v1');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload, senderId } = event.data || {};
        if (senderId && senderId !== deviceIdRef.current && type === 'TRIP_SYNC') {
          if (payload.expenses) setExpenses(payload.expenses);
          if (payload.stops) setStops(payload.stops);
          if (payload.participants) setParticipants(payload.participants);

          setSyncToast(`🔄 Sincronizzato Live (${payload.updatedBy || 'Amico'}): ${payload.message || 'Nuova modifica al viaggio'}`);
          addApiLog(`WEBSOCKET/SYNC -> Modifica ricevuta da ${payload.updatedBy || 'Amico'}`);

          setTimeout(() => {
            setSyncToast(null);
          }, 4000);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // New Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expAmountEur, setExpAmountEur] = useState<number>(25);
  const [expCategory, setExpCategory] = useState<TravelExpense['category']>('FOOD');
  const [expPaidBy, setExpPaidBy] = useState<string>('p1'); // default Chiara
  const [expIsShared, setExpIsShared] = useState<boolean>(true);
  const [expSplitWith, setExpSplitWith] = useState<string[]>(['p1', 'p2', 'p3', 'p4']);

  // New Fuel Refill Form State
  const [fuelStationName, setFuelStationName] = useState('ENI Station Napoli');
  const [fuelAmountEur, setFuelAmountEur] = useState<number>(45);
  const [fuelLiters, setFuelLiters] = useState<number>(24.3);
  const [fuelPaidBy, setFuelPaidBy] = useState<string>('p1');

  // New Participant Form State
  const [newParticipantName, setNewParticipantName] = useState('');

  // New Stop Form
  const [newLocation, setNewLocation] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTips, setNewTips] = useState('');
  const [newTipCategory, setNewTipCategory] = useState<TipCategory>('FOOD');
  const [newDistance, setNewDistance] = useState(25);
  const [newDay, setNewDay] = useState(1);
  const [newCategory, setNewCategory] = useState<ItineraryStop['category']>('MONUMENT');

  // Simulated REST API Logs
  const [apiLogs, setApiLogs] = useState<string[]>([
    'GET /api/v1/trips/itinerary/stops -> 200 OK [7 tappe caricate]',
    'GET /api/v1/trips/itinerary/fuel-calculator?fuelType=PETROL&price=1.85 -> 200 OK',
    'Spring Boot 3.2 Context: TravelPulseBackend listening on port 8080 (MySQL travelpulse_db connected)'
  ]);

  const addApiLog = (log: string) => {
    setApiLogs(prev => [log, ...prev].slice(0, 8));
  };

  // Sync trip settings with logged in user fuel preference
  const currentFuelType: FuelType = currentUser?.fuelType || tripSettings.fuelType || 'PETROL';
  const fuelConfig = FUEL_TYPES_CONFIG[currentFuelType];

  // Calculations
  const totalKm = stops.reduce((sum, s) => sum + s.distanceFromPreviousKm, 0);
  const totalUnitsNeeded = (totalKm / 100) * tripSettings.fuelConsumptionPer100Km;
  const totalFuelCost = totalUnitsNeeded * tripSettings.fuelPricePerLiter;
  const totalTolls = stops.reduce((sum, s) => sum + s.estimatedTollEur, 0);

  const filteredStops = stops.filter(s => s.dayNumber === selectedDay);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmountEur <= 0) return;

    const newExp: TravelExpense = {
      id: Date.now(),
      title: expTitle.trim(),
      amountEur: Number(expAmountEur),
      category: expCategory,
      date: new Date().toLocaleDateString('it-IT'),
      paidByParticipantId: expPaidBy,
      isShared: expIsShared,
      splitWithParticipantIds: expIsShared ? expSplitWith : []
    };

    setExpenses(prev => {
      const nextExpenses = [newExp, ...prev];
      broadcastTripState(nextExpenses, stops, participants, `Nuova spesa: ${newExp.title} (€${newExp.amountEur})`, currentUser?.name || 'Utente');
      return nextExpenses;
    });

    setShowAddExpenseModal(false);
    setExpTitle('');
    setExpAmountEur(25);

    const payerName = participants.find(p => p.id === expPaidBy)?.name || 'Partecipante';
    addApiLog(`POST /api/v1/expenses -> 201 Created (€${newExp.amountEur.toFixed(2)} - ${newExp.title}, Pagato da ${payerName}, ${expIsShared ? 'Condivisa' : 'Personale'})`);
  };

  const handleAddFuel = (e: React.FormEvent) => {
    e.preventDefault();
    if (fuelAmountEur <= 0) return;

    const newFuelExp: TravelExpense = {
      id: Date.now(),
      title: `Rifornimento: ${fuelStationName} (${fuelLiters}L)`,
      amountEur: Number(fuelAmountEur),
      category: 'FUEL',
      date: new Date().toLocaleDateString('it-IT'),
      paidByParticipantId: fuelPaidBy,
      isShared: true,
      splitWithParticipantIds: participants.map(p => p.id)
    };

    setExpenses(prev => {
      const nextExpenses = [newFuelExp, ...prev];
      broadcastTripState(nextExpenses, stops, participants, `Rifornimento carburante (€${newFuelExp.amountEur})`, currentUser?.name || 'Utente');
      return nextExpenses;
    });

    setShowAddFuelModal(false);

    const payerName = participants.find(p => p.id === fuelPaidBy)?.name || 'Partecipante';
    addApiLog(`POST /api/v1/expenses/fuel -> 201 Created (Benzina €${newFuelExp.amountEur.toFixed(2)} at ${fuelStationName}, Pagato da ${payerName})`);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;

    const newP: TripParticipant = {
      id: `p_${Date.now()}`,
      name: newParticipantName.trim(),
      avatarColor: 'bg-indigo-600'
    };

    setParticipants(prev => {
      const nextP = [...prev, newP];
      broadcastTripState(expenses, stops, nextP, `Nuovo partecipante: ${newP.name}`, currentUser?.name || 'Utente');
      return nextP;
    });

    setExpSplitWith(prev => [...prev, newP.id]);
    setShowAddParticipantModal(false);
    setNewParticipantName('');
    addApiLog(`POST /api/v1/trips/participants -> 201 Created (Partecipante: ${newP.name})`);
  };

  const handleFuelTypeChange = (newFuel: FuelType) => {
    const config = FUEL_TYPES_CONFIG[newFuel];
    setTripSettings(s => ({
      ...s,
      fuelType: newFuel,
      fuelPricePerLiter: config.defaultPrice,
      fuelConsumptionPer100Km: config.defaultConsumption
    }));
    addApiLog(`PUT /api/v1/trips/settings -> 200 OK (FuelType: ${newFuel}, Price: €${config.defaultPrice})`);
  };

  const handleSettleDebt = (fromName: string, toName: string, amount: number) => {
    const settlementExp: TravelExpense = {
      id: Date.now(),
      title: `Saldo Debito: ${fromName} ➔ ${toName}`,
      amountEur: amount,
      category: 'OTHER',
      date: new Date().toLocaleDateString('it-IT'),
      paidByParticipantId: participants.find(p => p.name === fromName)?.id || 'p2',
      isShared: false,
      splitWithParticipantIds: []
    };

    setExpenses(prev => {
      const nextExp = [settlementExp, ...prev];
      broadcastTripState(nextExp, stops, participants, `Debito saldato: ${fromName} ➔ ${toName} (€${amount})`, currentUser?.name || 'Utente');
      return nextExp;
    });

    addApiLog(`POST /api/v1/expenses/settlement -> 200 OK (${fromName} ha saldato €${amount.toFixed(2)} a ${toName})`);
  };

  const handleTogglePacking = (id: number) => {
    setPackingList(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextPacked = !p.packed;
          addApiLog(`PUT /api/v1/packing/${id} -> 200 OK (packed=${nextPacked})`);
          return { ...p, packed: nextPacked };
        }
        return p;
      })
    );
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim() || !newCity.trim()) return;

    const autoKm = calculateAutoDistance(newCity, newLocation, stops);

    const samplePhotos = [
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
    ];

    const newStopItem: ItineraryStop = {
      id: Date.now(),
      dayNumber: newDay,
      orderIndex: stops.filter(s => s.dayNumber === newDay).length + 1,
      locationName: newLocation,
      city: newCity,
      description: newDesc || 'Nuova tappa aggiunta dall\'App Mobile',
      tipsAndMustSee: newTips || 'Consiglio: Visita guidata e passeggiata panoramica.',
      tipCategory: newTipCategory,
      category: newCategory,
      distanceFromPreviousKm: autoKm, // AUTOMATICALLY CALCULATED DISTANCE
      estimatedTollEur: 2.50,
      latitude: 40.85,
      longitude: 14.25,
      recommendedTime: '15:00 - 17:00',
      photos: samplePhotos
    };

    setStops(prev => {
      const nextStops = [...prev, newStopItem];
      broadcastTripState(expenses, nextStops, participants, `Tappa aggiunta: ${newLocation} (~${autoKm} km)`, currentUser?.name || 'Utente');
      return nextStops;
    });

    setShowAddStopModal(false);
    setNewLocation('');
    setNewCity('');
    setNewDesc('');
    setNewTips('');
    addApiLog(`POST /api/v1/trips/itinerary/stops -> 201 Created (ID: ${newStopItem.id}, City: ${newCity}, Km Auto GPS: ~${autoKm} km)`);
  };

  const openGoogleMaps = (stop: ItineraryStop) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.locationName}, ${stop.city}`)}`;
    window.open(url, '_blank');
    addApiLog(`EXTERNAL_INTENT: Open Map for ${stop.locationName}`);
  };

  // Render colored tip badge
  const renderTipBadge = (stop: ItineraryStop) => {
    const cat = stop.tipCategory || 'FOOD';
    switch (cat) {
      case 'FOOD':
        return (
          <div className="bg-emerald-950/80 border border-emerald-700/80 rounded p-2.5 text-xs text-emerald-200 flex items-start gap-2">
            <Utensils className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-emerald-300 text-[10px] uppercase block">
                🍕 CIBO & GASTRONOMIA DA NON PERDERE:
              </span>
              <span className="leading-snug">{stop.tipsAndMustSee}</span>
            </div>
          </div>
        );
      case 'HISTORY':
        return (
          <div className="bg-amber-950/80 border border-amber-700/80 rounded p-2.5 text-xs text-amber-200 flex items-start gap-2">
            <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-amber-300 text-[10px] uppercase block">
                🏛️ MONUMENTI & STORIA:
              </span>
              <span className="leading-snug">{stop.tipsAndMustSee}</span>
            </div>
          </div>
        );
      case 'PANORAMA':
        return (
          <div className="bg-sky-950/80 border border-sky-700/80 rounded p-2.5 text-xs text-sky-200 flex items-start gap-2">
            <ImageIcon className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-sky-300 text-[10px] uppercase block">
                🌅 VISTA PANORAMICA & MARE:
              </span>
              <span className="leading-snug">{stop.tipsAndMustSee}</span>
            </div>
          </div>
        );
      case 'ZTL':
        return (
          <div className="bg-rose-950/80 border border-rose-700/80 rounded p-2.5 text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-rose-300 text-[10px] uppercase block">
                ⚠️ ZTL, PARCHEGGI & VIABILITÀ:
              </span>
              <span className="leading-snug">{stop.tipsAndMustSee}</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-blue-950/80 border border-blue-700/80 rounded p-2.5 text-xs text-blue-200 flex items-start gap-2">
            <Compass className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-blue-300 text-[10px] uppercase block">
                💡 CONSIGLIO UTILE:
              </span>
              <span className="leading-snug">{stop.tipsAndMustSee}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 py-2">
      {/* Top Banner */}
      <div className={`${isDark ? 'bg-[#0c0c0e] border-zinc-800' : 'bg-white border-slate-200'} border rounded-lg p-3 sm:p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'} uppercase`}>
              SIMULATORE LIVE APP MOBILE: TRAVELPULSE
            </h2>
            <span className="text-[10px] bg-blue-950/80 text-blue-400 border border-blue-800/80 px-2 py-0.5 rounded font-bold">
              iOS & ANDROID
            </span>
          </div>
          <p className={`${isDark ? 'text-zinc-400' : 'text-slate-600'} text-xs mt-0.5 font-sans`}>
            Galleria foto dei luoghi, consigli colorati, selezione tipo di alimentazione veicolo (Benzina/Diesel/GPL/EV) e sincronizzazione Spring Boot.
          </p>
        </div>

        {/* Device Switcher & Theme Workspace Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleThemeMode}
            className={`px-3 py-1.5 rounded-md border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              isDark
                ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-700/80'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
            }`}
            title="Cambia modalità Giorno / Notte dell'ambiente workspace (intorno al telefono)"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{isDark ? 'Giorno (Workspace Chiaro)' : 'Notte (Workspace Scuro)'}</span>
          </button>

          <div className={`flex items-center gap-1.5 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-300'} p-1 rounded-md border text-xs`}>
            <button
              onClick={() => setDeviceType('ios')}
              className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                deviceType === 'ios' ? 'bg-blue-600/20 text-blue-500 border border-blue-500/40' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Apple iOS
            </button>
            <button
              onClick={() => setDeviceType('android')}
              className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                deviceType === 'android' ? 'bg-blue-600/20 text-blue-500 border border-blue-500/40' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Google Android
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Mobile Phone Frame */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            className={`relative transition-all duration-300 w-full max-w-[380px] h-[720px] bg-[#09090b] rounded-[42px] border-[8px] ${
              deviceType === 'ios' ? 'border-zinc-800 shadow-2xl shadow-blue-950/30' : 'border-zinc-800 shadow-2xl'
            } overflow-hidden flex flex-col justify-between`}
          >
            {/* Dynamic Island / Status Bar */}
            {deviceType === 'ios' ? (
              <div className="w-28 h-4.5 bg-black rounded-b-2xl mx-auto z-30 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 mr-2"></div>
                <div className="w-2 h-2 rounded-full bg-blue-900"></div>
              </div>
            ) : (
              <div className="w-full h-5 bg-zinc-950 z-30 flex items-center justify-between px-5 text-[10px] font-mono text-zinc-500 shrink-0">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Simulated Header App with User Status */}
            <div className="bg-[#0c0c0e]/95 backdrop-blur px-3.5 py-2.5 border-b border-zinc-800 flex justify-between items-center z-20 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 leading-tight">TravelPulse Mobile</h3>
                  <span className="text-[9px] text-blue-400 block font-mono">Road Trip Italia 2026</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {currentUser ? (
                  <button
                    onClick={onOpenAuthModal}
                    className="flex items-center gap-1 bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold hover:bg-emerald-900 transition"
                  >
                    <User className="w-3 h-3 text-emerald-400" />
                    <span className="max-w-[60px] truncate">{currentUser.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  >
                    Accedi
                  </button>
                )}

                {/* Valigia Button (icon only) */}
                <button
                  onClick={onOpenAuthModal}
                  className="bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 p-1.5 rounded transition"
                  title="Apri Valigia e Documenti dal profilo utente"
                >
                  <Luggage className="w-3.5 h-3.5 text-purple-400" />
                </button>

                {/* Day / Night Mode Switch Button for surrounding workspace */}
                <button
                  onClick={onToggleThemeMode}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 p-1.5 rounded transition"
                  title={isDark ? "Cambia ambiente esterno in Modalità Giorno (Light)" : "Cambia ambiente esterno in Modalità Notte (Dark)"}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                </button>

                <button
                  onClick={() => addApiLog('GET /api/v1/trips/itinerary/stops -> 200 OK (Refresh)')}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 transition"
                  title="Sincronizza con Spring Boot REST"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Sync Toast Banner for Cross-Device updates */}
            {syncToast && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-mono p-2 px-3 flex items-center justify-between gap-2 shadow-lg animate-bounce shrink-0 z-30">
                <div className="flex items-center gap-1.5 font-bold">
                  <Wifi className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  <span>{syncToast}</span>
                </div>
                <button onClick={() => setSyncToast(null)} className="text-white/80 hover:text-white font-bold text-xs">✕</button>
              </div>
            )}

            {/* Main Phone Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#09090b] text-zinc-200 text-xs">

              {/* TAB 1: ITINERARIO & TAPPE */}
              {activeTab === 'itinerary' && (
                <div className="space-y-3">
                  {/* Select Day Tabs */}
                  <div className="flex items-center justify-between bg-[#0c0c0e] p-1.5 rounded border border-zinc-800 text-xs font-mono">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold pl-1">Giorno Viaggio:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(dNum => (
                        <button
                          key={dNum}
                          onClick={() => setSelectedDay(dNum)}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                            selectedDay === dNum
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          G{dNum}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Bar for Day */}
                  <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 rounded font-mono text-[11px] flex justify-between items-center text-blue-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      Giorno {selectedDay}: {filteredStops.length} tappe
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {filteredStops.reduce((s, item) => s + item.distanceFromPreviousKm, 0)} km tot
                    </span>
                  </div>

                  {/* Stop Cards */}
                  <div className="space-y-3">
                    {filteredStops.map((stop) => {
                      const segmentFuelUnits = (stop.distanceFromPreviousKm / 100) * tripSettings.fuelConsumptionPer100Km;
                      const segmentFuelCost = segmentFuelUnits * tripSettings.fuelPricePerLiter;

                      return (
                        <div key={stop.id} className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 space-y-2.5 relative shadow-md">
                          {/* Segment distance connector pill */}
                          {stop.distanceFromPreviousKm > 0 && (
                            <div className="p-1.5 bg-zinc-950 border border-zinc-800/80 rounded text-[10px] font-mono flex items-center justify-between text-zinc-400">
                              <span className="flex items-center gap-1">
                                <ChevronRight className="w-3 h-3 text-sky-400" />
                                Da tappa prec: <strong className="text-zinc-200">{stop.distanceFromPreviousKm} km</strong>
                              </span>
                              <span className="text-emerald-400 font-bold">
                                ~{segmentFuelCost.toFixed(2)} € ({fuelConfig.label})
                              </span>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 px-1.5 py-0.2 rounded">
                                  {stop.recommendedTime}
                                </span>
                                <span className="text-[9px] font-mono text-zinc-400">
                                  • {stop.city}
                                </span>
                              </div>
                              {/* CLICKING PLACE TITLE OPENS PHOTO GALLERY */}
                              <button
                                onClick={() => {
                                  setSelectedPhotoStop(stop);
                                  setActivePhotoIndex(0);
                                  addApiLog(`VIEW_GALLERY: Photos for ${stop.locationName}`);
                                }}
                                className="text-left font-bold text-zinc-100 text-xs mt-1 hover:text-blue-400 transition block group"
                              >
                                {stop.locationName}
                                <span className="text-[10px] text-blue-400 ml-1 font-mono font-normal opacity-80 group-hover:underline">
                                  [📷 Foto]
                                </span>
                              </button>
                            </div>

                            <button
                              onClick={() => setShowMapModal(stop)}
                              className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold px-2 py-1 rounded flex items-center gap-1 transition shadow"
                            >
                              <Navigation className="w-3 h-3" />
                              Mappa
                            </button>
                          </div>

                          <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{stop.description}</p>

                          {/* PHOTO THUMBNAILS PREVIEW (Clicca per foto grandi) */}
                          {stop.photos && stop.photos.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-400 uppercase font-semibold flex items-center gap-1">
                                <Camera className="w-3 h-3 text-blue-400" />
                                Galleria Immagini ({stop.photos.length} Foto - Clicca per ingrandire):
                              </span>
                              <div className="flex gap-1.5 overflow-x-auto pb-1">
                                {stop.photos.map((photoUrl, pIdx) => (
                                  <button
                                    key={pIdx}
                                    onClick={() => {
                                      setSelectedPhotoStop(stop);
                                      setActivePhotoIndex(pIdx);
                                    }}
                                    className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-zinc-800 hover:border-blue-500 transition shadow group"
                                  >
                                    <img src={photoUrl} alt={stop.locationName} className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CONSIGLI DA NON PERDERE - COLORI VIVACI PER CATEGORIA */}
                          {renderTipBadge(stop)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: CALCOLO BENZINA / DIESEL / GPL / EV */}
              {activeTab === 'fuel' && (
                <div className="space-y-3 font-mono">
                  <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase">
                        <Fuel className="w-4 h-4 text-emerald-400" />
                        CALCOLO CONSUMI E VEICOLO
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${fuelConfig.badgeColor}`}>
                        {fuelConfig.label}
                      </span>
                    </div>

                    <p className="text-[11px] font-sans text-zinc-400">
                      Scegli il tipo di alimentazione della tua macchina (Benzina, Diesel, GPL, Metano o Elettrica).
                    </p>

                    {/* SELECTOR FUEL TYPE */}
                    <div className="space-y-1.5">
                      <label className="block text-zinc-400 text-[10px] uppercase font-bold">Tipo Alimentazione Macchina:</label>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {Object.values(FUEL_TYPES_CONFIG).map(f => (
                          <button
                            key={f.type}
                            onClick={() => handleFuelTypeChange(f.type)}
                            className={`p-1.5 rounded border text-left flex items-center justify-between transition ${
                              currentFuelType === f.type
                                ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-bold'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <span>{f.label}</span>
                            <span className="text-[9px] opacity-80">{f.unit}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div>
                        <label className="block text-zinc-400 text-[10px] mb-1">Prezzo ({fuelConfig.unit})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={tripSettings.fuelPricePerLiter}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setTripSettings(s => ({ ...s, fuelPricePerLiter: val }));
                          }}
                          className="w-full bg-[#09090b] border border-zinc-800 rounded p-1.5 text-emerald-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[10px] mb-1">Consumo ({fuelConfig.consumptionUnit})</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tripSettings.fuelConsumptionPer100Km}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setTripSettings(s => ({ ...s, fuelConsumptionPer100Km: val }));
                          }}
                          className="w-full bg-[#09090b] border border-zinc-800 rounded p-1.5 text-blue-400 font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metrics Cards */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-[#0c0c0e] border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-zinc-400">Distanza Totale Itinerario:</span>
                      <span className="font-bold text-sky-400 text-sm">{totalKm} km</span>
                    </div>

                    <div className="bg-[#0c0c0e] border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-zinc-400">Consumo Stimato ({fuelConfig.consumptionUnit.split('/')[0]}):</span>
                      <span className="font-bold text-zinc-200 text-sm">{totalUnitsNeeded.toFixed(2)} {fuelConfig.consumptionUnit.split('/')[0]}</span>
                    </div>

                    <div className="bg-[#0c0c0e] border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-zinc-400">Costo Carburante/Energia Stimato:</span>
                      <span className="font-bold text-emerald-400 text-sm">€{totalFuelCost.toFixed(2)}</span>
                    </div>

                    <div className="bg-[#0c0c0e] border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-zinc-400">Pedaggi Autostradali Stimati:</span>
                      <span className="font-bold text-amber-400 text-sm">€{totalTolls.toFixed(2)}</span>
                    </div>

                    <div className="bg-emerald-950/50 border border-emerald-800/80 p-3 rounded-lg flex justify-between items-center text-emerald-300">
                      <span className="font-bold">SPESA TOTALE TRAGITTO:</span>
                      <span className="font-bold text-base text-emerald-400">€{(totalFuelCost + totalTolls).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SPESE VIAGGIO & DIVISI (CHI DEVE A CHI) */}
              {activeTab === 'expenses' && (() => {
                const balances = calculateTripBalances(expenses, participants);

                return (
                  <div className="space-y-3 font-sans">
                    {/* Share Trip Link Button with Live Sync Indicator */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full p-2.5 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 hover:from-blue-900/90 hover:to-indigo-900/90 border border-blue-700/80 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-blue-200 transition shadow"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <div className="text-left">
                          <span className="block text-zinc-100 font-sans text-xs">Condividi Viaggio con Amici</span>
                          <span className="text-[10px] text-sky-300 block font-mono">Sincronizzazione Live Multi-Dispositivo</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                        <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                        Live Sync
                      </span>
                    </button>

                    {/* Sub-tab toggle: Liste vs Conti */}
                    <div className="flex bg-[#0c0c0e] p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                      <button
                        onClick={() => setExpenseSubTab('split')}
                        className={`w-1/2 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                          expenseSubTab === 'split' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        Conti & Chi Deve a Chi
                      </button>
                      <button
                        onClick={() => setExpenseSubTab('list')}
                        className={`w-1/2 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                          expenseSubTab === 'list' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Tutte le Spese ({expenses.length})
                      </button>
                    </div>

                    {expenseSubTab === 'split' ? (
                      <div className="space-y-3">
                        {/* Overall Group Expense Overview */}
                        <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-800/80 p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-blue-300 font-mono font-semibold uppercase flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-sky-400" />
                              Spese Totali di Gruppo:
                            </span>
                            <strong className="text-emerald-400 font-mono text-sm">€{balances.totalGroupExpensesEur.toFixed(2)}</strong>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-zinc-300 font-mono pt-1 border-t border-blue-900/50">
                            <span>Quota a testa (4 partecipanti):</span>
                            <span className="font-bold text-sky-300">
                              €{(balances.totalGroupExpensesEur / (participants.length || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* CHI DEVE A CHI (DEBT SETTLEMENT CARDS) */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-zinc-100 uppercase font-mono flex items-center gap-1.5">
                              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                              CHI DEVE A CHI (CONTI FINALI)
                            </h4>
                            <button
                              onClick={() => setShowAddParticipantModal(true)}
                              className="text-[10px] text-sky-400 hover:underline font-mono font-bold flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              + Persona
                            </button>
                          </div>

                          {balances.settlements.length === 0 ? (
                            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded text-center text-xs text-emerald-300 font-mono">
                              🎉 Tutti i conti sono in pareggio! Nessun debito pendente.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {balances.settlements.map((s, idx) => (
                                <div key={idx} className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center justify-center font-bold text-[11px]">
                                      {s.fromName.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="text-zinc-200 font-bold block">{s.fromName}</span>
                                      <span className="text-[10px] text-zinc-400">
                                        deve dare a <strong className="text-emerald-400">{s.toName}</strong>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="font-bold text-rose-400 text-sm block">€{s.amountEur.toFixed(2)}</span>
                                    <button
                                      onClick={() => handleSettleDebt(s.fromName, s.toName, s.amountEur)}
                                      className="text-[9px] bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 px-1.5 py-0.5 rounded font-bold transition mt-0.5 inline-block"
                                    >
                                      ✓ Salda Ora
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* INDIVIDUAL PARTICIPANT SUMMARIES */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 space-y-2">
                          <h4 className="text-xs font-bold text-zinc-300 uppercase font-mono flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            Bilancio Singoli Partecipanti:
                          </h4>

                          <div className="space-y-1.5 text-xs font-mono">
                            {balances.participantSummaries.map(s => (
                              <div key={s.participant.id} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${s.participant.avatarColor} text-white font-bold flex items-center justify-center text-[10px]`}>
                                    {s.participant.name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="text-zinc-200 font-bold block">{s.participant.name}</span>
                                    <span className="text-[9px] text-zinc-500">Anticipato: €{s.totalPaidEur.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  {s.netBalanceEur > 0 ? (
                                    <span className="text-emerald-400 font-bold text-xs">+€{s.netBalanceEur.toFixed(2)} (In Credito)</span>
                                  ) : s.netBalanceEur < 0 ? (
                                    <span className="text-rose-400 font-bold text-xs">-€{Math.abs(s.netBalanceEur).toFixed(2)} (In Debito)</span>
                                  ) : (
                                    <span className="text-zinc-500 font-bold text-xs">€0.00 (Pari)</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* LIST OF ALL EXPENSES */
                      <div className="space-y-2">
                        {expenses.map(exp => {
                          const payer = participants.find(p => p.id === exp.paidByParticipantId);
                          return (
                            <div key={exp.id} className="bg-[#0c0c0e] border border-zinc-800 p-3 rounded-xl space-y-1.5 text-xs font-mono">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[9px] bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.2 rounded font-bold">
                                      {exp.category}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                      exp.isShared
                                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                                        : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                                    }`}>
                                      {exp.isShared ? '🤝 Condivisa' : '👤 Personale'}
                                    </span>
                                  </div>
                                  <strong className="text-zinc-100 font-sans text-xs">{exp.title}</strong>
                                </div>

                                <span className="font-bold text-emerald-400 text-sm">€{exp.amountEur.toFixed(2)}</span>
                              </div>

                              <div className="flex justify-between items-center pt-1 border-t border-zinc-900 text-[10px] text-zinc-400">
                                <span>Pagato da: <strong className="text-sky-300">{payer?.name || 'Chiara'}</strong></span>
                                <span>Data: {exp.date}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Bottom Action Bar: DYNAMIC PER ACTIVE TAB */}
            <div className="bg-[#0c0c0e] border-t border-zinc-800 p-2 flex items-center justify-between gap-2 z-20 shrink-0 font-mono">
              {activeTab === 'itinerary' && (
                <button
                  onClick={() => setShowAddStopModal(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Aggiungi Tappa Itinerario
                </button>
              )}

              {activeTab === 'fuel' && (
                <button
                  onClick={() => setShowAddFuelModal(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Fuel className="w-3.5 h-3.5" />
                  + Benzina / Rifornimento
                </button>
              )}

              {activeTab === 'expenses' && (
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Spesa
                </button>
              )}
            </div>

            {/* Bottom Navigation Tabs (3 TABS ONLY: Tappe, Benzina, Spese) */}
            <div className="bg-[#09090b] border-t border-zinc-800 p-1.5 grid grid-cols-3 gap-1 text-[10px] font-mono z-20 shrink-0">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`py-1.5 rounded flex flex-col items-center gap-0.5 transition ${
                  activeTab === 'itinerary' ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Map className="w-4 h-4" />
                Tappe
              </button>
              <button
                onClick={() => setActiveTab('fuel')}
                className={`py-1.5 rounded flex flex-col items-center gap-0.5 transition ${
                  activeTab === 'fuel' ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Fuel className="w-4 h-4" />
                Benzina
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-1.5 rounded flex flex-col items-center gap-0.5 transition ${
                  activeTab === 'expenses' ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Spese & Conti
              </button>
            </div>

            {/* Home Indicator bar */}
            {deviceType === 'ios' && (
              <div className="w-28 h-1 bg-zinc-700 rounded-full mx-auto my-1 z-30 shrink-0"></div>
            )}
          </div>
        </div>

        {/* Right Side: Live Spring Boot & MySQL Log Inspector */}
        <div className="lg:col-span-6 space-y-4 font-mono">
          <div className={`${isDark ? 'bg-[#0c0c0e] border-zinc-800' : 'bg-white border-slate-200'} border rounded-lg p-4 shadow-xl space-y-3`}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3 className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'} uppercase`}>
                  ISPETTORE API SPRING BOOT & MYSQL
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                200 OK
              </span>
            </div>

            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'} font-sans`}>
              Interagendo con l'App Mobile, le tappe, la distanza in km, i tipi di carburante e le foto dei luoghi vengono sincronizzate con i Controller REST in Java.
            </p>

            <div className="bg-[#09090b] rounded-lg p-3 text-[11px] text-blue-300 border border-zinc-800 space-y-1.5 h-52 overflow-y-auto">
              {apiLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 border-b border-zinc-900 pb-1">
                  <span className="text-zinc-600 shrink-0">&gt;</span>
                  <span className="text-zinc-300 leading-tight">{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className={`${isDark ? 'bg-[#0c0c0e] border-zinc-800' : 'bg-white border-slate-200'} border rounded-lg p-4 space-y-2.5`}>
            <h4 className={`font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'} text-xs font-mono flex items-center gap-2 uppercase`}>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              PORTA TRAVELPULSE SUL TUO SMARTPHONE REALE
            </h4>

            <ol className={`list-decimal list-inside space-y-1.5 text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700'} font-sans`}>
              <li>
                Avvia Spring Boot in VS Code: <code className="bg-zinc-950 border border-zinc-800 font-mono text-blue-300 px-1 py-0.5 rounded text-[11px]">mvn spring-boot:run</code>
              </li>
              <li>
                In <code className="bg-zinc-950 border border-zinc-800 font-mono text-blue-300 px-1 py-0.5 rounded text-[11px]">/frontend</code> esegui <code className="bg-zinc-950 border border-zinc-800 font-mono text-blue-300 px-1 py-0.5 rounded text-[11px]">npx cap open android</code> o <code className="bg-zinc-950 border border-zinc-800 font-mono text-blue-300 px-1 py-0.5 rounded text-[11px]">npx cap open ios</code>.
              </li>
              <li>
                Collega il telefono via USB e premi <strong>Run</strong> in Android Studio o Xcode!
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* MODAL GALLERIA FOTO LUOGO */}
      {selectedPhotoStop && selectedPhotoStop.photos && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 w-full max-w-lg space-y-4 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm uppercase font-mono">{selectedPhotoStop.locationName}</h3>
                  <span className="text-xs text-sky-400 block font-mono">{selectedPhotoStop.city}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhotoStop(null)}
                className="text-xs px-2.5 py-1 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-400 font-mono"
              >
                ✕ Chiudi
              </button>
            </div>

            {/* Main Photo Display */}
            <div className="relative h-64 w-full rounded-lg overflow-hidden border border-zinc-800 bg-black shadow-inner">
              <img
                src={selectedPhotoStop.photos[activePhotoIndex]}
                alt={selectedPhotoStop.locationName}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white font-mono text-[10px] px-2 py-1 rounded border border-zinc-700">
                Foto {activePhotoIndex + 1} di {selectedPhotoStop.photos.length}
              </div>
            </div>

            {/* Thumbnails list */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedPhotoStop.photos.map((pUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-16 h-12 rounded border overflow-hidden shrink-0 transition ${
                    activePhotoIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={pUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {selectedPhotoStop.description}
            </p>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => openGoogleMaps(selectedPhotoStop)}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow"
              >
                <Navigation className="w-4 h-4" />
                Apri Mappa & Navigatore GPS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Nuova Tappa */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 w-full max-w-md space-y-3 shadow-2xl text-zinc-100">
            <h3 className="text-xs font-bold uppercase">AGGIUNGI NUOVA TAPPA ITINERARIO (MYSQL)</h3>

            <form onSubmit={handleAddStop} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px]">Giorno Viaggio</label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>Giorno 1 (Roma - Napoli)</option>
                    <option value={2}>Giorno 2 (Pompei - Sorrento)</option>
                    <option value={3}>Giorno 3 (Positano - Amalfi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px]">Città</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Ravello"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[11px]">Nome Tappa / Luogo</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Villa Cimbrone & Terrazza dell'Infinito"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[11px]">Descrizione della Tappa</label>
                <textarea
                  rows={2}
                  placeholder="Piccola descrizione del posto..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-amber-400 mb-1 text-[11px]">Consiglio & Categoria Tip</label>
                <div className="grid grid-cols-2 gap-2 mb-1.5 font-sans">
                  <select
                    value={newTipCategory}
                    onChange={e => setNewTipCategory(e.target.value as TipCategory)}
                    className="bg-[#09090b] border border-zinc-800 rounded p-1.5 text-zinc-200 text-xs"
                  >
                    <option value="FOOD">🍕 Cibo & Ristoranti</option>
                    <option value="HISTORY">🏛️ Monumenti & Storia</option>
                    <option value="PANORAMA">🌅 Vista Panoramica</option>
                    <option value="ZTL">⚠️ ZTL & Parcheggi</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Es. Fai una foto sul mare..."
                    value={newTips}
                    onChange={e => setNewTips(e.target.value)}
                    className="bg-[#09090b] border border-zinc-800 rounded p-1.5 text-zinc-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Distanza dalla tappa precedente (Calcolata Automatica GPS):</span>
                      <strong className="text-emerald-400 font-bold text-sm">
                        ~{calculateAutoDistance(newCity, newLocation, stops)} km
                      </strong>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    ⚡ Auto GPS
                  </span>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px]">Categoria Tappa</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="MONUMENT">MONUMENTO / CULTURA</option>
                    <option value="RESTAURANT">RISTORANTE / CIBO</option>
                    <option value="NATURAL_SPOT">PANORAMA / MARE / SPIAGGIA</option>
                    <option value="HOTEL">HOTEL / ALLOGGIO</option>
                    <option value="PIT_STOP">SOSTA CAFFÈ / PAUSA</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="w-1/2 py-2 rounded border border-zinc-700 text-zinc-300"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Salva Tappa REST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mappa & Navigazione */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase">MAPPA E NAVIGAZIONE</h3>
              </div>
              <button
                onClick={() => setShowMapModal(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded border border-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#09090b] border border-zinc-800 rounded-lg p-4 space-y-2">
              <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                {showMapModal.city} • Lat: {showMapModal.latitude}, Lon: {showMapModal.longitude}
              </span>
              <h4 className="text-sm font-bold text-zinc-100">{showMapModal.locationName}</h4>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{showMapModal.description}</p>
            </div>

            <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded text-xs text-blue-300 space-y-1 font-sans">
              <strong className="font-mono text-blue-400 block text-[11px]">Mappa di Navigazione GPS:</strong>
              <p>Clicca sul pulsante in basso per aprire direttamente il navigatore per raggiungere questa tappa dal tuo punto corrente.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openGoogleMaps(showMapModal)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow"
              >
                <Navigation className="w-4 h-4" />
                Apri Navigatore su Google Maps
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Aggiungi Spesa Generica / Condivisa */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 w-full max-w-md space-y-3 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase flex items-center gap-1.5 text-amber-400">
                <DollarSign className="w-4 h-4" />
                AGGIUNGI SPESA VIAGGIO
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Descrizione Spesa</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Cena di Pesce / Biglietti Musei"
                  value={expTitle}
                  onChange={e => setExpTitle(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Importo (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={expAmountEur}
                    onChange={e => setExpAmountEur(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-emerald-400 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Categoria</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                  >
                    <option value="FOOD">🍕 Ristoranti & Cibo</option>
                    <option value="FUEL">⛽ Carburante</option>
                    <option value="ACCOMMODATION">🏨 Hotel / B&B</option>
                    <option value="TICKETS">🎟️ Musei & Ingressi</option>
                    <option value="TOLL">🛣️ Pedaggio Autostrada</option>
                    <option value="OTHER">🛍️ Altro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Chi ha pagato la spesa?</label>
                <select
                  value={expPaidBy}
                  onChange={e => setExpPaidBy(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-sky-400 font-mono font-bold"
                >
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Personal vs Shared */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-200 font-bold">Tipo Spesa:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setExpIsShared(true)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        expIsShared ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      🤝 Condivisa
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpIsShared(false)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        !expIsShared ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      👤 Personale
                    </button>
                  </div>
                </div>

                {expIsShared && (
                  <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                    Questa spesa verrà divisa in parti uguali tra tutti i partecipanti selezionati per il calcolo finale dei debiti.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="w-1/2 py-2 rounded border border-zinc-700 text-zinc-300"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Salva Spesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Benzina / Rifornimento */}
      {showAddFuelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 w-full max-w-md space-y-3 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase flex items-center gap-1.5 text-emerald-400">
                <Fuel className="w-4 h-4" />
                + REGISTRA RIFORNIMENTO BENZINA
              </h3>
              <button onClick={() => setShowAddFuelModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddFuel} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Stazione di Servizio / Distributore</label>
                <input
                  type="text"
                  required
                  placeholder="Es. ENI Autostrada A1 / Q8"
                  value={fuelStationName}
                  onChange={e => setFuelStationName(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px]">Costo Pagato (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={fuelAmountEur}
                    onChange={e => setFuelAmountEur(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-emerald-400 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px]">Litri Erogati (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fuelLiters}
                    onChange={e => setFuelLiters(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-blue-400 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Chi ha effettuato e pagato il rifornimento?</label>
                <select
                  value={fuelPaidBy}
                  onChange={e => setFuelPaidBy(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-sky-400 font-mono font-bold"
                >
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded text-[11px] text-emerald-300 font-mono">
                ⛽ I rifornimenti carburante vengono calcolati come spese di gruppo da dividere tra tutti i viaggiatori.
              </div>

              <div className="flex gap-2 pt-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddFuelModal(false)}
                  className="w-1/2 py-2 rounded border border-zinc-700 text-zinc-300"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Salva Rifornimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Nuovo Partecipante */}
      {showAddParticipantModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-3 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase flex items-center gap-1.5 text-sky-400">
                <UserPlus className="w-4 h-4" />
                + NUOVO PARTECIPANTE
              </h3>
              <button onClick={() => setShowAddParticipantModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Nome e Cognome / Soprannome</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Luca Bianchi"
                  value={newParticipantName}
                  onChange={e => setNewParticipantName(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddParticipantModal(false)}
                  className="w-1/2 py-2 rounded border border-zinc-700 text-zinc-300"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Condividi Viaggio & Live Sync */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase flex items-center gap-1.5 text-sky-400">
                <Share2 className="w-4 h-4 text-blue-400" />
                CONDIVIDI VIAGGIO & ACCESSO COMPLETO
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <p className="text-zinc-300 text-xs leading-relaxed">
                Invia questo link ai tuoi compagni di viaggio. Chiunque acceda con questo link avrà <strong>accesso completo</strong> per visualizzare e aggiungere tappe, spese e conti dal proprio dispositivo.
              </p>

              {/* Shareable Link Input Box */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-mono block">Link Invito Viaggio (Sincronizzazione Live):</label>
                <div className="flex items-center gap-1.5 bg-[#09090b] border border-zinc-800 p-2 rounded-lg font-mono">
                  <input
                    type="text"
                    readOnly
                    value={tripShareUrl}
                    className="bg-transparent text-sky-300 text-[11px] w-full focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tripShareUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2500);
                      addApiLog('SHARE_LINK: Link invito copiato negli appunti');
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold shrink-0 transition flex items-center gap-1 ${
                      linkCopied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {linkCopied ? 'Copiato!' : 'Copia'}
                  </button>
                </div>
              </div>

              {/* Real-time Status Card */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1.5 font-mono">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Sincronizzazione Cloud & Multi-Device Attiva</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans leading-normal">
                  Tutti i dispositivi connessi tramite il link ricevono e inviano le modifiche <strong>in tempo reale</strong>.
                </p>
              </div>

              {/* Test Sync Simulation Button */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] text-zinc-400 font-mono block uppercase font-bold">🧪 Testa la Sincronizzazione Ora:</span>
                <button
                  onClick={() => {
                    const friendExp: TravelExpense = {
                      id: Date.now(),
                      title: 'Cena Trattoria da Marco (Aggiunta da Marco su Galaxy S24)',
                      amountEur: 48.00,
                      category: 'FOOD',
                      date: new Date().toLocaleDateString('it-IT'),
                      paidByParticipantId: 'p2', // Marco
                      isShared: true,
                      splitWithParticipantIds: participants.map(p => p.id)
                    };

                    setExpenses(prev => {
                      const nextExp = [friendExp, ...prev];
                      broadcastTripState(nextExp, stops, participants, 'Marco ha inserito "Cena Trattoria (€48.00)" dal suo telefono!', 'Marco');
                      return nextExp;
                    });

                    setSyncToast('🔄 Sincronizzato Live: Marco ha aggiunto "Cena Trattoria (€48.00)" dal suo dispositivo!');
                    setTimeout(() => setSyncToast(null), 4000);
                    addApiLog('WEBSOCKET/SYNC -> Ricevuta spesa remota da Marco (Galaxy S24)');
                  }}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow transition"
                >
                  <Smartphone className="w-4 h-4" />
                  Simula Modifica da Telefono di Marco
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end font-mono">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded font-bold"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
