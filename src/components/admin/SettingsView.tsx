import React, { useState } from 'react';
import { LibrarySettings } from '../../types';
import { ImageUploader } from '../ImageUploader';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Coins,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface SettingsViewProps {
  settings: LibrarySettings;
  onSaveSettings: (newSettings: LibrarySettings) => void;
  onResetData: () => void;
  onSyncToSupabase?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  onSyncToSupabase,
}) => {
  const [formData, setFormData] = useState<LibrarySettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-600" />
            Pengaturan Sistem & Aturan Sirkulasi
          </h2>
          <p className="text-xs text-slate-500">
            Atur durasi peminjaman, tarif denda keterlambatan, identitas sekolah, dan koneksi Supabase
          </p>
        </div>

        {saveSuccess && (
          <div className="p-2.5 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aturan Sirkulasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Coins className="w-4 h-4 text-emerald-600" />
            Aturan Peminjaman & Tarif Denda
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lama Pinjam Default (Hari) *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.loan_duration_days}
                onChange={(e) =>
                  setFormData({ ...formData, loan_duration_days: parseInt(e.target.value) || 7 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 7 Hari</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tarif Denda Per Hari (Rp) *
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.fine_per_day}
                onChange={(e) =>
                  setFormData({ ...formData, fine_per_day: parseInt(e.target.value) || 1000 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: Rp 1.000 / hari</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batas Maks. Perpanjangan (Kali) *
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.max_extensions}
                onChange={(e) =>
                  setFormData({ ...formData, max_extensions: parseInt(e.target.value) || 2 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 2 Kali</span>
            </div>
          </div>
        </div>

        {/* Identitas Sekolah & Perpustakaan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Identitas Lembaga & Kop Laporan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah / Madrasah *</label>
              <input
                type="text"
                value={formData.school_name}
                onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Perpustakaan *</label>
              <input
                type="text"
                value={formData.library_name}
                onChange={(e) => setFormData({ ...formData, library_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Perpustakaan *</label>
              <input
                type="text"
                value={formData.head_librarian}
                onChange={(e) => setFormData({ ...formData, head_librarian: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Perpustakaan</label>
              <input
                type="text"
                value={formData.nip_head}
                onChange={(e) => setFormData({ ...formData, nip_head: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                label="Logo Lembaga / Perpustakaan (Kamera / File Gambar)"
                value={formData.logo_url || ''}
                onChange={(url) => setFormData({ ...formData, logo_url: url })}
                placeholder="https://..."
                cloudName={formData.cloudinary_cloud_name}
                uploadPreset={formData.cloudinary_upload_preset}
                maxWidth={400}
                maxHeight={400}
              />
            </div>
          </div>
        </div>
        {/* Submit & Reset Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (confirm('Atur ulang seluruh data aplikasi ke sampel default MTs KH A Wahab Muhsin?')) {
                onResetData();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Ke Sampel Default</span>
          </button>
          
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
