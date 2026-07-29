import React, { useState, useEffect } from 'react';
import { LibrarySettings } from '../types';
import { BookOpen, Shield, LogOut, Lock, Scan, Clock, School, Search, Bell, Library } from 'lucide-react';

interface NavbarProps {
  settings: LibrarySettings;
  activeMode: 'public' | 'admin';
  setActiveMode: (mode: 'public' | 'admin') => void;
  isAdminAuthenticated: boolean;
  onOpenLoginModal: () => void;
  onLogoutAdmin: () => void;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeMode,
  setActiveMode,
  isAdminAuthenticated,
  onOpenLoginModal,
  onLogoutAdmin,
  onOpenScanner,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dayDateStr, setDayDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDayDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      {/* Utility Announcement Top Strip - Clean Light Theme */}
      <div className="bg-emerald-50/80 border-b border-emerald-100/80 text-slate-700 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 font-bold text-emerald-800">
            <School className="w-3.5 h-3.5 text-emerald-600" />
            {settings.school_name}
          </span>
          <span className="hidden md:inline text-emerald-300">•</span>
          <span className="hidden md:inline text-slate-500 font-medium text-[11px]">{settings.address}</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600 text-[11px] font-medium">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            {dayDateStr}
          </span>
          <span className="text-emerald-300">•</span>
          <span className="flex items-center gap-1.5 font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200/80 shadow-2xs">
            <Clock className="w-3 h-3 text-emerald-600" />
            {timeStr}
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveMode('public')}>
          <div className="w-10 h-10 bg-white border border-slate-200/80 rounded-xl p-1 flex items-center justify-center shadow-md shadow-slate-100 shrink-0 overflow-hidden">
            <img
              src={settings.logo_url || 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt'}
              alt="Logo Perpustakaan"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight flex items-center gap-2">
              Perpustakaan Digital
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block">
                MTs KH A Wahab Muhsin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">{settings.library_name}</p>
          </div>
        </div>

        {/* Center Search Input Bar (Sleek Theme feature) */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80 w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari buku, anggota, atau ISBN..."
            className="bg-transparent text-xs text-slate-700 focus:outline-none w-full font-medium placeholder:text-slate-400"
            onClick={() => setActiveMode('public')}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Scanner */}
          <button
            onClick={onOpenScanner}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            title="Scan Barcode / QR Code"
          >
            <Scan className="w-4 h-4 text-emerald-600" />
            <span>Scan Kamera</span>
          </button>

          {/* Mode Selector Pill */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveMode('public')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'public'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Katalog Publik
            </button>
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setActiveMode('admin');
                } else {
                  onOpenLoginModal();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'admin'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md shadow-green-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Portal Admin</span>
            </button>
          </div>

          {/* Auth State Button */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Admin Active
              </span>
              <button
                onClick={onLogoutAdmin}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Keluar Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors sm:hidden cursor-pointer"
              title="Login Admin"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

