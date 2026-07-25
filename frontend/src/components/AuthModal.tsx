import React, { useState } from 'react';
import { UserProfile, FuelType, PackingItem } from '../types';
import { FUEL_TYPES_CONFIG } from '../data/travelData';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User, Car, CheckCircle2, LogOut, CheckSquare, Briefcase, Plus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  registeredUsers: UserProfile[];
  onRegisterUser: (newUser: UserProfile, password: string) => boolean;
  onUpdateVehicle: (fuelType: FuelType, vehicleName: string) => void;
  themeMode: 'dark' | 'light';
  packingList?: PackingItem[];
  onTogglePacking?: (id: number) => void;
  onAddPackingItem?: (itemName: string, category: PackingItem['category']) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  registeredUsers,
  onRegisterUser,
  onUpdateVehicle,
  themeMode,
  packingList = [],
  onTogglePacking,
  onAddPackingItem
}) => {
  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [profileTab, setProfileTab] = useState<'profile' | 'packing'>('profile');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [vehicleName, setVehicleName] = useState('Fiat 500X / Golf 1.5 TSI');

  // New packing item state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('CLOTHING');

  // Edit vehicle state (for logged in profile)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [profileFuelType, setProfileFuelType] = useState<FuelType>(currentUser?.fuelType || 'PETROL');
  const [profileVehicleName, setProfileVehicleName] = useState(currentUser?.vehicleName || 'La mia Auto');

  // Message / Error alerts
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const foundUser = registeredUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundUser) {
      setErrorMessage('Account non trovato con questa email. Effettua prima la Registrazione!');
      return;
    }

    onLogin(foundUser);
    setSuccessMessage(`Bentornata/o ${foundUser.name}! Accesso effettuato con successo.`);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Compila tutti i campi richiesti per la registrazione.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      fuelType,
      vehicleName: vehicleName.trim() || 'Auto Personale',
      authProvider: 'EMAIL',
      registeredAt: new Date().toLocaleDateString('it-IT')
    };

    const success = onRegisterUser(newUser, password);
    if (!success) {
      setErrorMessage('Un account con questa email esiste già! Vai alla scheda Accedi.');
      return;
    }

    onLogin(newUser);
    setSuccessMessage('Registrazione completata con successo! Account attivato.');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleSocialAuth = (provider: 'GOOGLE' | 'FACEBOOK') => {
    setErrorMessage('');
    const providerName = provider === 'GOOGLE' ? 'Google' : 'Facebook';
    
    const socialUser: UserProfile = {
      id: `usr_social_${Date.now()}`,
      name: provider === 'GOOGLE' ? 'Utente Google' : 'Utente Facebook',
      email: provider === 'GOOGLE' ? 'utente.google@gmail.com' : 'utente.fb@facebook.com',
      fuelType: 'PETROL',
      vehicleName: 'Auto ' + providerName,
      authProvider: provider,
      registeredAt: new Date().toLocaleDateString('it-IT')
    };

    onLogin(socialUser);
    setSuccessMessage(`Accesso effettuato tramite ${providerName}!`);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleSaveVehicleChange = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVehicle(profileFuelType, profileVehicleName);
    setIsEditingVehicle(false);
    setSuccessMessage('Tipologia veicolo e carburante aggiornati con successo!');
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    if (onAddPackingItem) {
      onAddPackingItem(newItemName.trim(), newItemCategory);
      setNewItemName('');
    }
  };

  const packedCount = packingList.filter(p => p.packed).length;
  const packedPct = packingList.length > 0 ? Math.round((packedCount / packingList.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-xl border p-5 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-[#0c0c0e] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b pb-3 mb-3 border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm uppercase font-mono">
              {currentUser ? `PROFILO DI ${currentUser.name.toUpperCase()}` : mode === 'login' ? 'ACCEDI A TRAVELPULSE' : 'REGISTRAZIONE NUOVO UTENTE'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-400"
          >
            ✕
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2 font-sans">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* IF USER IS LOGGED IN */}
        {currentUser ? (
          <div className="space-y-3">
            {/* Tab navigation inside user profile: Account vs Valigia */}
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setProfileTab('profile')}
                className={`w-1/2 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                  profileTab === 'profile' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Profilo & Veicolo
              </button>
              <button
                type="button"
                onClick={() => setProfileTab('packing')}
                className={`w-1/2 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                  profileTab === 'packing' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Valigia ({packedCount}/{packingList.length})
              </button>
            </div>

            {profileTab === 'profile' && (
              <div className="space-y-3">
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{currentUser.name}</h4>
                      <span className="text-xs text-zinc-400 block font-mono">{currentUser.email}</span>
                      <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono mt-1 inline-block">
                        Auth: {currentUser.authProvider}
                      </span>
                    </div>
                  </div>

                  {/* Current Vehicle Card */}
                  <div className="border-t pt-3 border-zinc-800 text-xs space-y-2 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-semibold flex items-center gap-1">
                        <Car className="w-4 h-4 text-sky-400" />
                        Veicolo Registrato:
                      </span>
                      <span className="font-bold text-blue-400">{currentUser.vehicleName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-semibold">Alimentazione Motore:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border font-bold ${
                        FUEL_TYPES_CONFIG[currentUser.fuelType]?.badgeColor
                      }`}>
                        {FUEL_TYPES_CONFIG[currentUser.fuelType]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Edit Vehicle */}
                {isEditingVehicle ? (
                  <form onSubmit={handleSaveVehicleChange} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3 text-xs font-sans">
                    <h5 className="font-bold text-blue-400 uppercase font-mono text-[11px]">Cambia Veicolo o Carburante</h5>
                    
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Nome / Modello Veicolo</label>
                      <input
                        type="text"
                        value={profileVehicleName}
                        onChange={e => setProfileVehicleName(e.target.value)}
                        className="w-full p-2 bg-black border border-zinc-800 rounded text-zinc-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Tipo Motore / Carburante</label>
                      <select
                        value={profileFuelType}
                        onChange={e => setProfileFuelType(e.target.value as FuelType)}
                        className="w-full p-2 bg-black border border-zinc-800 rounded text-zinc-200 font-mono"
                      >
                        {Object.values(FUEL_TYPES_CONFIG).map(f => (
                          <option key={f.type} value={f.type}>
                            {f.label} ({f.defaultConsumption} {f.consumptionUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingVehicle(false)}
                        className="w-1/2 py-2 rounded border border-zinc-700 text-zinc-300"
                      >
                        Annulla
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        Salva Modifiche
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setProfileFuelType(currentUser.fuelType);
                      setProfileVehicleName(currentUser.vehicleName);
                      setIsEditingVehicle(true);
                    }}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded border border-zinc-700 flex items-center justify-center gap-2 transition"
                  >
                    <Car className="w-4 h-4 text-amber-400" />
                    Modifica Tipologia Macchina / Carburante
                  </button>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 font-bold text-xs rounded flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnetti Account
                </button>
              </div>
            )}

            {/* TAB VALIGIA INSIDE PROFILE "CHIARA" */}
            {profileTab === 'packing' && (
              <div className="space-y-3 font-sans">
                {/* Progress bar */}
                <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      VALIGIA DI {currentUser.name.toUpperCase()}
                    </span>
                    <span className="text-zinc-300 font-bold">{packedPct}% Pronta</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${packedPct}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    {packedCount} oggetti pronti su {packingList.length} totali in valigia
                  </span>
                </div>

                {/* Add new packing item form */}
                <form onSubmit={handleAddNewItem} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Aggiungi alla valigia..."
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    className="flex-1 bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as any)}
                    className="bg-black border border-zinc-800 rounded px-2 py-1.5 text-[11px] text-zinc-300 font-mono"
                  >
                    <option value="CLOTHING">Abbigliamento</option>
                    <option value="DOCUMENTS">Documenti</option>
                    <option value="ELECTRONICS">Elettronica</option>
                    <option value="HEALTH">Salute</option>
                    <option value="MISC">Altro</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1 font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    +
                  </button>
                </form>

                {/* List of items */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {packingList.map(item => (
                    <button
                      key={item.id}
                      onClick={() => onTogglePacking && onTogglePacking(item.id)}
                      className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition ${
                        item.packed
                          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300 line-through opacity-80'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-medium">{item.itemName}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        item.packed ? 'bg-emerald-500 border-emerald-400' : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {item.packed && <CheckCircle2 className="w-3 h-3 text-black" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* IF USER IS NOT LOGGED IN */
          <div>
            {/* Login / Register Toggle Tabs */}
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 mb-4 text-xs font-mono">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className={`w-1/2 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                  mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Accedi
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className={`w-1/2 py-1.5 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                  mode === 'register' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Registrati
              </button>
            </div>

            {/* Social Authentication Buttons */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => handleSocialAuth('GOOGLE')}
                className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-sans font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {mode === 'login' ? 'Accedi con Google' : 'Registrati con Google'}
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('FACEBOOK')}
                className="w-full py-2 px-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/50 text-blue-200 font-sans font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {mode === 'login' ? 'Accedi con Facebook' : 'Registrati con Facebook'}
              </button>
            </div>

            <div className="relative my-3 text-center text-[10px] text-zinc-500 font-mono">
              <span className="bg-[#0c0c0e] px-2 relative z-10 uppercase">oppure con email</span>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Email Account</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="es. nome@email.it"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-blue-950/40 border border-blue-800/40 rounded text-[11px] text-blue-300 font-mono">
                  💡 Account demo pre-registrato: <br />
                  <strong className="text-emerald-400">chiara@travelpulse.it</strong> (Password: <strong>password123</strong>)
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow transition font-mono uppercase"
                >
                  Accedi al tuo Account
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Nome e Cognome</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="es. Chiara Rossi"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="es. chiara@email.it"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 text-[11px] font-mono">Crea Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-500" />
                    <input
                      type="password"
                      required
                      placeholder="Minimo 6 caratteri"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* VEHICLE SELECTION IN REGISTRATION */}
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <h5 className="font-mono font-bold text-sky-400 text-[11px] uppercase flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    Scegli il tuo Veicolo & Carburante
                  </h5>

                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px]">Nome Veicolo / Modello</label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={e => setVehicleName(e.target.value)}
                      className="w-full p-1.5 bg-black border border-zinc-800 rounded text-zinc-200 text-xs"
                      placeholder="es. Fiat 500 / Ford Fiesta"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px]">Tipo Alimentazione Motore</label>
                    <select
                      value={fuelType}
                      onChange={e => setFuelType(e.target.value as FuelType)}
                      className="w-full p-1.5 bg-black border border-zinc-800 rounded text-zinc-200 text-xs font-mono font-bold"
                    >
                      {Object.values(FUEL_TYPES_CONFIG).map(f => (
                        <option key={f.type} value={f.type}>
                          {f.label} ({f.defaultConsumption} {f.consumptionUnit})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow transition font-mono uppercase"
                >
                  Crea Account & Inizia
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
