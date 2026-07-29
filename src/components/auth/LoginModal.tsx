import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@mts-wahabmuhsin.sch.id');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (email && password) {
        onLoginSuccess(email);
        setLoading(false);
        onClose();
      } else {
        setError('Email dan password harus diisi!');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemo = () => {
    setEmail('admin@mts-wahabmuhsin.sch.id');
    setPassword('admin123');
    onLoginSuccess('admin@mts-wahabmuhsin.sch.id');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h3 className="font-bold text-xl">Login Petugas Perpustakaan</h3>
          <p className="text-emerald-100 text-xs mt-1">
            Masuk untuk mengakses portal manajemen & sirkulasi MTs KH A Wahab Muhsin
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Petugas
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="petugas@mts-wahabmuhsin.sch.id"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Memproses Login...</span>
            ) : (
              <>
                <span>Masuk Ke Portal Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Shortcut */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200/80 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Login Cepat Mode Demo Petugas
              </span>
              <span className="text-[10px] uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                Akses Instan
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
