import React, { useState } from 'react';
import { Visit, Member, LibrarySettings } from '../../types';
import { exportVisitsToExcel } from '../../lib/exportUtils';
import {
  UserCheck,
  Search,
  ScanLine,
  Plus,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Users,
  School,
  Calendar,
} from 'lucide-react';

interface AttendanceViewProps {
  visits: Visit[];
  members: Member[];
  settings: LibrarySettings;
  onAddVisit: (visit: Omit<Visit, 'id'>) => void;
  onOpenScanner: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  visits,
  members,
  settings,
  onAddVisit,
  onOpenScanner,
}) => {
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<Visit['purpose']>('Membaca');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<'siswa' | 'guru' | 'tamu'>('siswa');
  const [customClass, setCustomClass] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(todayStr);

  const filteredVisits = visits.filter((v) => v.visit_date === filterDate);

  const handleQuickScanCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberQuery.trim()) return;

    // Search member by NIS/NIP or name
    const foundMember = members.find(
      (m) =>
        m.member_number.toLowerCase() === memberQuery.trim().toLowerCase() ||
        m.name.toLowerCase().includes(memberQuery.trim().toLowerCase())
    );

    const timeNow = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (foundMember) {
      onAddVisit({
        member_id: foundMember.id,
        visitor_name: foundMember.name,
        visitor_number: foundMember.member_number,
        role: foundMember.role,
        class_or_position: foundMember.class_or_position,
        visit_date: todayStr,
        visit_time: timeNow,
        purpose: selectedPurpose,
      });

      setSuccessMsg(`Berhasil mencatat kehadiran ${foundMember.name} (${foundMember.class_or_position})!`);
    } else {
      // Record as guest or manual name
      onAddVisit({
        visitor_name: customName || memberQuery,
        visitor_number: memberQuery,
        role: customRole,
        class_or_position: customClass || 'Tamu / Umum',
        visit_date: todayStr,
        visit_time: timeNow,
        purpose: selectedPurpose,
      });

      setSuccessMsg(`Berhasil mencatat pengunjung ${customName || memberQuery}!`);
    }

    setMemberQuery('');
    setCustomName('');
    setCustomClass('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Absensi Digital Kunjungan Perpustakaan (Akreditasi)
          </h2>
          <p className="text-xs text-slate-500">
            Catat kunjungan manual untuk pengunjung yang tidak melakukan aktivitas peminjaman atau pengembalian buku
          </p>
        </div>

        <button
          onClick={() => exportVisitsToExcel(filteredVisits, settings)}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-2 shrink-0 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Excel Rekap Kunjungan</span>
        </button>
      </div>

      {/* Fast Check-In Card */}
      <div className="bg-gradient-to-br from-green-900 to-emerald-800 text-white rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
            Mesin Absensi Kunjungan Cepat
          </span>
          <button
            onClick={onOpenScanner}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/20 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ScanLine className="w-4 h-4 text-emerald-300" />
            <span>Scan QR Kartu Anggota</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/30 border border-emerald-400/50 rounded-xl text-emerald-100 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleQuickScanCheckin} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Ketik NIS / NIP atau Nama Anggota *
            </label>
            <input
              type="text"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Contoh: 20237001 atau Rayhan..."
              className="w-full px-3.5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Tujuan Kunjungan *
            </label>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="Membaca">Membaca Buku</option>
              <option value="Diskusi/Belajar">Diskusi / Belajar Kelompok</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Catat Masuk</span>
            </button>
          </div>
        </form>

        {/* Info: borrow/return auto-logged */}
        <div className="mt-1 p-3 bg-blue-50/80 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-500" />
          <span>Kunjungan dengan tujuan <strong>Meminjam Buku</strong> &amp; <strong>Mengembalikan Buku</strong> dicatat <strong>otomatis</strong> oleh sistem Sirkulasi saat menggunakan fitur Scan Pinjam / Scan Kembali.</span>
        </div>
      </div>

      {/* Filter Date & Visitor List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Log Kehadiran Pengunjung</h3>
            <p className="text-xs text-slate-500">Total {filteredVisits.length} pengunjung pada tanggal ini</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Pilih Tanggal:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Nama Pengunjung</th>
                <th className="py-3 px-4">NIS / NIP</th>
                <th className="py-3 px-4">Kategori & Kelas</th>
                <th className="py-3 px-4">Tujuan Kunjungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{v.visit_time}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{v.visitor_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{v.visitor_number || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold text-[10px] uppercase mr-2">
                        {v.role}
                      </span>
                      <span className="text-slate-600">{v.class_or_position}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{v.purpose}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada data kunjungan tercatat pada tanggal {filterDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
