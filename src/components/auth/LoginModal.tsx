import React, { useState } from 'react';
import { 
  X, Lock, Mail, ShieldCheck, CheckCircle2, ArrowRight, 
  Globe, ChevronDown, Eye, EyeOff, Facebook, Instagram, 
  Youtube, BookOpen, Clock, Shield 
} from 'lucide-react';
import { Manager } from '../../types';
import libraryLandingHero from '../../../assets/library_landing_hero.jpg';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
  managers: Manager[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  managers,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (!email || !password) {
        setError('Email dan password harus diisi!');
        setLoading(false);
        return;
      }

      const manager = managers.find(
        (m) => m.email.toLowerCase() === email.toLowerCase()
      );

      if (!manager) {
        setError('Email tidak terdaftar sebagai pengelola. Hubungi administrator.');
        setLoading(false);
        return;
      }

      if (manager.password !== password) {
        setError('Password salah. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      onLoginSuccess(email);
      setLoading(false);
      onClose();
    }, 400);
  };


  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col justify-between overflow-y-auto text-slate-800 animate-in fade-in duration-200">
      {/* Top Navigation Row (Language & Back to catalog) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-10 shrink-0">
        {/* Logo and school branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0">
            <img
              src="https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-extrabold text-emerald-600 uppercase leading-none">Perpustakaan Digital</div>
            <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">MTs KH A Wahab Muhsin</div>
            <div className="text-[8px] sm:text-[9px] text-slate-450 text-slate-400 font-bold leading-none mt-0.5">Literasi Hari Ini, Prestasi Esok Hari</div>
          </div>
        </div>

        {/* Right tools: Language selector and Close button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700 shadow-3xs cursor-pointer">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Bahasa Indonesia</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Kembali ke Beranda"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 py-6">
        {/* Left Column: Visual illustration and details */}
        <div className="flex-1 hidden lg:flex flex-col space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100/50 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
            Selamat Datang Kembali!
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Masuk untuk mengakses dunia <br />
              ilmu <span className="text-emerald-600">tanpa batas.</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-lg font-medium leading-relaxed">
              Perpustakaan Digital MTs KH A Wahab Muhsin menyediakan ribuan koleksi buku, materi pembelajaran, dan referensi terpercaya kapan saja dan di mana saja.
            </p>
          </div>

          {/* Landing Page Image Mockup integrated here */}
          <div className="relative w-full max-w-md aspect-[16/10] overflow-hidden rounded-2xl shadow-lg border border-slate-250 border-slate-200">
            <img
              src={libraryLandingHero}
              alt="Library Mockup"
              className="w-full h-full object-cover"
            />
            {/* Floating Quote Box */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs border border-slate-100 rounded-xl p-3.5 shadow-md">
              <div className="flex gap-2">
                <span className="text-emerald-500 font-serif text-2xl leading-none font-bold">“</span>
                <div>
                  <p className="text-[10px] text-slate-700 font-extrabold leading-relaxed">
                    Membaca adalah jendela dunia, belajar adalah kuncinya.
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold mt-1.5 uppercase">
                    – MTs KH A Wahab Muhsin
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards stack */}
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2 shadow-3xs">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-[9px] text-slate-800 leading-none">Koleksi Lengkap</h5>
                <p className="text-[8px] text-slate-400 font-semibold leading-tight mt-1">Buku pelajaran, fiksi, dsb.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2 shadow-3xs">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-[9px] text-slate-800 leading-none">Akses Mudah</h5>
                <p className="text-[8px] text-slate-400 font-semibold leading-tight mt-1">Cari, baca, dan pinjam.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2 shadow-3xs">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-[9px] text-slate-800 leading-none">Aman Terpercaya</h5>
                <p className="text-[8px] text-slate-400 font-semibold leading-tight mt-1">Akses pribadi aman.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Box Card */}
        <div className="w-full max-w-[440px]">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 text-left">
            {/* Form top illustration */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-650 shadow-3xs">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-none">Masuk ke Akun Anda</h3>
                <p className="text-xs text-slate-450 text-slate-400 font-semibold max-w-xs leading-relaxed mt-1">
                  Masukkan kredensial Anda untuk melanjutkan ke Perpustakaan Digital MTs KH A Wahab Muhsin
                </p>
              </div>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-700">
                  Username / NIS / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan username, NIS atau email"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-700">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember me & forgot password */}
              <div className="flex items-center justify-between text-[11px] font-bold">
                <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                  />
                  <span>Ingat saya</span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10"
              >
                <span>{loading ? 'Memproses...' : 'Masuk'}</span>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-white border-t border-slate-200 py-6 z-10 w-full shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-xs font-bold text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 text-center md:text-left">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[10px] sm:text-xs">Perpustakaan Digital MTs KH A Wahab Muhsin © 2026 All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-[10px] sm:text-xs">
            <button type="button" className="hover:text-slate-800 cursor-pointer">Tentang Kami</button>
            <button type="button" className="hover:text-slate-800 cursor-pointer">Kebijakan Privasi</button>
            <button type="button" className="hover:text-slate-800 cursor-pointer">Syarat & Ketentuan</button>
            <button type="button" className="hover:text-slate-800 cursor-pointer">Bantuan</button>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Ikuti kami:</span>
            <button type="button" className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-3xs cursor-pointer">
              <Facebook className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-3xs cursor-pointer">
              <Instagram className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-3xs cursor-pointer">
              <Youtube className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
