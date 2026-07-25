import React from 'react';
import { Database, Smartphone, Code2, Layers, Terminal, Sun, Moon, User, LogIn, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'simulator' | 'code' | 'ideas' | 'tech' | 'mysql';
  setActiveTab: (tab: 'simulator' | 'code' | 'ideas' | 'tech' | 'mysql') => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  themeMode,
  setThemeMode,
  currentUser,
  onOpenAuthModal,
}) => {
  const isDark = themeMode === 'dark';

  return (
    <header className={`${isDark ? 'bg-[#0c0c0e] border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-800'} border-b sticky top-0 z-30 shadow-md transition-colors duration-200`}>
      {/* Top IDE Window Control Bar */}
      <div className={`flex h-10 items-center justify-between px-4 border-b ${isDark ? 'border-zinc-800/80 bg-zinc-950/80 text-zinc-400' : 'border-slate-200 bg-slate-100 text-slate-600'} text-[11px] font-mono`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          <span className="font-semibold tracking-widest uppercase text-[10px]">
            TRAVELPULSE // JAVA SPRING & MOBILE WORKBENCH
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans font-medium transition ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
            }`}
            title="Cambia tema Chiaro / Scuro"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Modalità Chiara</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span>Modalità Scura</span>
              </>
            )}
          </button>

          {/* User Auth Status / Login Button */}
          {currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700 hover:bg-emerald-900/80 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[120px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Accedi / Registrati</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            MYSQL:3306
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-slate-100 border-slate-300'} border flex items-center justify-center text-blue-500 shadow-inner`}>
              <Code2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'} font-sans`}>
                  TravelPulse • Pianificatore Viaggi & App Mobile
                </h1>
                <span className="text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                  Spring Boot & React
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Itinerario, consumi benzina/veicolo, galleria foto luoghi e simulatore iOS / Android.
              </p>
            </div>
          </div>

          {/* Badges Tecnologici */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className={`flex items-center gap-1.5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-300'} border px-2.5 py-1 rounded text-amber-500 text-[11px]`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Java 21 / Spring Boot 3
            </span>
            <span className={`flex items-center gap-1.5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-300'} border px-2.5 py-1 rounded text-sky-500 text-[11px]`}>
              <Database className="w-3 h-3 text-sky-500" />
              MySQL 8.0
            </span>
            <span className={`flex items-center gap-1.5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-300'} border px-2.5 py-1 rounded text-indigo-500 text-[11px]`}>
              <Smartphone className="w-3 h-3 text-indigo-500" />
              Capacitor / Mobile
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`flex space-x-1 border-t ${isDark ? 'border-zinc-800/80' : 'border-slate-200'} overflow-x-auto py-1.5`}>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-blue-600/20 text-blue-500 border border-blue-500/40 font-semibold'
                : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Simulatore Mobile App
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-blue-600/20 text-blue-500 border border-blue-500/40 font-semibold'
                : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Codice /backend & /frontend
          </button>

          <button
            onClick={() => setActiveTab('mysql')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap ${
              activeTab === 'mysql'
                ? 'bg-blue-600/20 text-blue-500 border border-blue-500/40 font-semibold'
                : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Guida MySQL Workbench 8.0
          </button>

          <button
            onClick={() => setActiveTab('tech')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap ${
              activeTab === 'tech'
                ? 'bg-blue-600/20 text-blue-500 border border-blue-500/40 font-semibold'
                : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Consiglio Frontend & Stack
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded transition-all whitespace-nowrap ${
              activeTab === 'ideas'
                ? 'bg-blue-600/20 text-blue-500 border border-blue-500/40 font-semibold'
                : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Idee per la Tua App
          </button>
        </nav>
      </div>
    </header>
  );
};


