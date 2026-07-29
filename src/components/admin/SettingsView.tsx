import React, { useState } from 'react';
import { LibrarySettings } from '../../types';
import { ImageUploader } from '../ImageUploader';
import { Cloud, Upload } from 'lucide-react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Database,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck,
} from 'lucide-react';

interface SettingsViewProps {
  settings: LibrarySettings;
  onSaveSettings: (newSettings: LibrarySettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
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

        {/* Cloudinary Integration Options */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Cloud className="w-4 h-4 text-emerald-600" />
            Integrasi Penyimpanan Gambar Cloudinary (Opsional)
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Jika diisi, semua foto profil anggota dan sampul buku akan diupload langsung ke <strong>Cloudinary</strong>, dan URL gambar otomatis disimpan di sistem/Supabase. Jika dikosongkan, gambar tetap otomatis dikompres super ringan (&lt;50 KB) &amp; disimpan secara aman.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cloudinary Cloud Name
              </label>
              <input
                type="text"
                value={formData.cloudinary_cloud_name || ''}
                onChange={(e) => setFormData({ ...formData, cloudinary_cloud_name: e.target.value })}
                placeholder="Contoh: dxy123abc"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unsigned Upload Preset Name
              </label>
              <input
                type="text"
                value={formData.cloudinary_upload_preset || ''}
                onChange={(e) => setFormData({ ...formData, cloudinary_upload_preset: e.target.value })}
                placeholder="Contoh: perpustakaan_preset"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Database & Supabase Options */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-emerald-600" />
            Konfigurasi Database Supabase & Data Pemulihan
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Project URL (Opsional)
              </label>
              <input
                type="text"
                value={formData.supabase_url || ''}
                onChange={(e) => setFormData({ ...formData, supabase_url: e.target.value })}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Anon Key (Opsional)
              </label>
              <input
                type="password"
                value={formData.supabase_anon_key || ''}
                onChange={(e) => setFormData({ ...formData, supabase_anon_key: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                Aplikasi ini mendukung penyimpanan offline terintegrasi & sync Supabase.
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Atur ulang seluruh data aplikasi ke sampel default MTs KH A Wahab Muhsin?')) {
                    onResetData();
                  }
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Ke Sampel Default</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
