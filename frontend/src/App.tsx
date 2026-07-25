import React, { useState } from 'react';
import { Header } from './components/Header';
import { MobileSimulator } from './components/MobileSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { MySQLGuide } from './components/MySQLGuide';
import { TechComparison } from './components/TechComparison';
import { AppIdeaSelector } from './components/AppIdeaSelector';
import { AuthModal } from './components/AuthModal';
import { UserProfile, FuelType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'ideas' | 'tech' | 'mysql'>('simulator');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Registered users state
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([
    {
      id: 'usr_demo_1',
      name: 'Chiara Rossi',
      email: 'chiara@travelpulse.it',
      fuelType: 'PETROL',
      vehicleName: 'Volkswagen Golf 1.5 TSI / Fiat 500X',
      authProvider: 'EMAIL',
      registeredAt: '2026-07-24'
    }
  ]);

  // Passwords storage (for demo validation)
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({
    'chiara@travelpulse.it': 'password123'
  });

  // Current logged in user (defaults to demo user)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(registeredUsers[0]);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const handleRegisterUser = (newUser: UserProfile, password: string): boolean => {
    // Check duplicate
    if (registeredUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return false;
    }
    setRegisteredUsers(prev => [...prev, newUser]);
    setUserPasswords(prev => ({ ...prev, [newUser.email.toLowerCase()]: password }));
    return true;
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateVehicle = (fuelType: FuelType, vehicleName: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, fuelType, vehicleName };
    setCurrentUser(updatedUser);
    setRegisteredUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const isDark = themeMode === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#09090b] text-zinc-200' : 'bg-slate-100 text-slate-800'
    } font-sans antialiased selection:bg-blue-600 selection:text-white`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        currentUser={currentUser}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      <main className="transition-all duration-200 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {activeTab === 'simulator' && (
          <MobileSimulator
            themeMode={themeMode}
            currentUser={currentUser}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onToggleThemeMode={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
          />
        )}
        {activeTab === 'code' && <CodeExplorer />}
        {activeTab === 'mysql' && <MySQLGuide />}
        {activeTab === 'tech' && <TechComparison />}
        {activeTab === 'ideas' && <AppIdeaSelector />}
      </main>

      {/* Auth & Vehicle Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        registeredUsers={registeredUsers}
        onRegisterUser={handleRegisterUser}
        onUpdateVehicle={handleUpdateVehicle}
        themeMode={themeMode}
      />

      {/* Footer / Status Bar */}
      <footer className={`border-t ${isDark ? 'border-zinc-800/80 bg-[#0c0c0e] text-zinc-500' : 'border-slate-200 bg-white text-slate-500'} py-4 px-4 mt-8 text-center text-xs font-mono`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
            Generato per Sviluppatrici Java Spring Boot & React Mobile App • VS Code + MySQL Workbench 8.0 + Capacitor iOS/Android
          </p>
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-semibold">Java 17</span>
            <span>•</span>
            <span className="text-sky-500 font-semibold">Spring Boot 3</span>
            <span>•</span>
            <span className="text-indigo-500 font-semibold">React + Vite + Capacitor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
