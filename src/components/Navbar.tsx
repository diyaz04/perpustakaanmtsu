import React, { useState, useEffect } from 'react';
import { LibrarySettings } from '../types';
import { BookOpen, Shield, LogOut, Lock, Scan, Clock, School, Search, Bell, Library, Menu, X, XCircle } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      {/* 1. Desktop Main Header */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 items-center justify-between gap-4">
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
            <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
              MTs KH A Wahab Muhsin
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold leading-none mt-0.5 uppercase tracking-wide">
              Perpustakaan Digital
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-500">
          <button className="text-emerald-600 border-b-2 border-emerald-500 py-6 px-1 cursor-pointer">
            Beranda
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('koleksi-katalog');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="hover:text-slate-900 transition-colors py-6 px-1 cursor-pointer"
          >
            Koleksi
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('kategori-katalog');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="hover:text-slate-900 transition-colors py-6 px-1 cursor-pointer"
          >
            Kategori
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('sirkulasi-checker');
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="hover:text-slate-900 transition-colors py-6 px-1 cursor-pointer"
          >
            Layanan
          </button>
          <button 
            className="hover:text-slate-900 transition-colors py-6 px-1 cursor-pointer"
          >
            Tentang
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full w-56 relative focus-within:ring-2 focus-within:ring-emerald-400/30 transition-all">
            <input
              type="text"
              placeholder="Cari buku, anggota, atau ISBN..."
              className="bg-transparent text-[11px] text-slate-700 focus:outline-none w-full font-medium placeholder:text-slate-400"
              onClick={() => setActiveMode('public')}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 cursor-pointer" />
          </div>

          {/* Portal Admin Button */}
          <button
            onClick={() => {
              if (isAdminAuthenticated) {
                setActiveMode('admin');
              } else {
                onOpenLoginModal();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border rounded-xl transition-all cursor-pointer shadow-3xs ${
              activeMode === 'admin'
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${activeMode === 'admin' ? 'text-white' : 'text-slate-500'}`} />
            <span>Portal Admin</span>
          </button>
        </div>
      </div>

      {/* 2. Mobile Main Header */}
      <div className="flex lg:hidden items-center justify-between px-4 h-16">
        {/* Branding (Mobile style) */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveMode('public')}>
          <div className="w-9 h-9 bg-white border border-slate-200/80 rounded-xl p-1 flex items-center justify-center shadow-md shadow-slate-100 shrink-0 overflow-hidden">
            <img
              src={settings.logo_url || 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt'}
              alt="Logo Perpustakaan"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-extrabold text-emerald-600 uppercase leading-none">Perpustakaan Digital</div>
            <div className="text-xs font-black text-slate-900 leading-tight">MTs KH A Wahab Muhsin</div>
            <div className="text-[8px] text-slate-400 font-bold leading-none mt-0.5">Literasi Hari Ini, Prestasi Esok Hari</div>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              const el = document.getElementById('koleksi-katalog');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="p-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Cari"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-755 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-64 bg-white h-full p-5 shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Navigasi Portal</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4 text-xs font-bold text-slate-600 text-left">
                <button onClick={() => { setIsMobileMenuOpen(false); }} className="text-emerald-600 text-left py-2 cursor-pointer">Beranda</button>
                <button onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById('koleksi-katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }} className="hover:text-slate-900 text-left py-2 cursor-pointer">Koleksi</button>
                <button onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById('kategori-katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }} className="hover:text-slate-900 text-left py-2 cursor-pointer">Kategori</button>
                <button onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById('sirkulasi-checker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }} className="hover:text-slate-900 text-left py-2 cursor-pointer">Layanan</button>
                <button onClick={() => { setIsMobileMenuOpen(false); }} className="hover:text-slate-900 text-left py-2 cursor-pointer">Tentang</button>
              </nav>
            </div>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (isAdminAuthenticated) {
                  setActiveMode('admin');
                } else {
                  onOpenLoginModal();
                }
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Portal Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

