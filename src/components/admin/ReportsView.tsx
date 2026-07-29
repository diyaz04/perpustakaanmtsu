import React, { useState, useMemo } from 'react';
import { Loan, Visit, Member, LibrarySettings } from '../../types';
import { exportLoansToExcel, exportLoansToPDF } from '../../lib/exportUtils';
import { CertificateModal } from '../CertificateModal';
import {
  FileSpreadsheet,
  Printer,
  Award,
  Users,
  Trophy,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Medal,
  ChevronRight,
  School,
  TrendingUp,
} from 'lucide-react';

interface ReportsViewProps {
  loans: Loan[];
  visits?: Visit[];
  members?: Member[];
  settings: LibrarySettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  loans = [],
  visits = [],
  members = [],
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'visitor_awards' | 'circulation'>('visitor_awards');

  // Circulation Report States
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Monthly Visitor Awards States
  const now = new Date();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [visitorRoleFilter, setVisitorRoleFilter] = useState<'siswa' | 'all'>('siswa');
  const [visitorSearch, setVisitorSearch] = useState('');

  // Modal State for Certificate
  const [selectedAwardMember, setSelectedAwardMember] = useState<{
    member: {
      name: string;
      member_number: string;
      class_or_position: string;
    };
    visitCount: number;
    loanCount: number;
    rank: number;
  } | null>(null);

  // Months map
  const monthNames: { [key: string]: string } = {
    '01': 'Januari',
    '02': 'Februari',
    '03': 'Maret',
    '04': 'April',
    '05': 'Mei',
    '06': 'Juni',
    '07': 'Juli',
    '08': 'Agustus',
    '09': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'Desember',
  };

  const monthYearFormatted = `${monthNames[selectedMonth] || 'Bulan Ini'} ${selectedYear}`;
  const targetPrefix = `${selectedYear}-${selectedMonth}`;

  // 1. Calculate Monthly Visitors Leaderboard
  const visitorLeaderboard = useMemo(() => {
    // Filter visits by selected YYYY-MM
    const monthVisits = visits.filter((v) => {
      const isMonth = v.visit_date.startsWith(targetPrefix);
      const isRole = visitorRoleFilter === 'all' || v.role === visitorRoleFilter;
      return isMonth && isRole;
    });

    // Filter loans by selected YYYY-MM
    const monthLoans = loans.filter((l) => l.loan_date.startsWith(targetPrefix));

    // Map visitor aggregated stats
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        number: string;
        class_or_position: string;
        role: string;
        photo_url?: string;
        visitCount: number;
        loanCount: number;
      }
    >();

    // Aggregate from visits
    monthVisits.forEach((v) => {
      const key = (v.visitor_number || v.visitor_name).trim().toLowerCase();
      const existing = map.get(key);

      // Try finding member photo if available
      const matchedMember = members.find(
        (m) =>
          m.member_number.toLowerCase() === (v.visitor_number || '').toLowerCase() ||
          m.name.toLowerCase() === v.visitor_name.toLowerCase()
      );

      if (existing) {
        existing.visitCount += 1;
      } else {
        map.set(key, {
          id: v.member_id || key,
          name: v.visitor_name,
          number: v.visitor_number || '-',
          class_or_position: v.class_or_position || matchedMember?.class_or_position || '-',
          role: v.role,
          photo_url: matchedMember?.photo_url,
          visitCount: 1,
          loanCount: 0,
        });
      }
    });

    // Aggregate loans count
    monthLoans.forEach((l) => {
      const key = (l.member_number || l.member_name || '').trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.loanCount += 1;
      } else if (l.member_name) {
        const matchedMember = members.find(
          (m) => m.member_number.toLowerCase() === (l.member_number || '').toLowerCase()
        );
        map.set(key, {
          id: l.member_id || key,
          name: l.member_name,
          number: l.member_number || '-',
          class_or_position: matchedMember?.class_or_position || '-',
          role: 'siswa',
          photo_url: matchedMember?.photo_url,
          visitCount: 0,
          loanCount: 1,
        });
      }
    });

    // Convert to array and sort descending by visitCount, then loanCount
    let list = Array.from(map.values());

    // Search filter
    if (visitorSearch.trim()) {
      const term = visitorSearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.number.toLowerCase().includes(term) ||
          item.class_or_position.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => b.visitCount - a.visitCount || b.loanCount - a.loanCount);
    return list;
  }, [visits, loans, members, targetPrefix, visitorRoleFilter, visitorSearch]);

  // Total stats for the month
  const totalMonthVisits = visits.filter((v) => v.visit_date.startsWith(targetPrefix)).length;
  const totalActiveStudentsCount = visitorLeaderboard.length;

  // 2. Circulation & Fines Filtered Data
  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const loanDate = l.loan_date;
      const matchDate = loanDate >= startDate && loanDate <= endDate;
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchSearch =
        (l.book_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.member_number || '').includes(searchTerm);

      return matchDate && matchStatus && matchSearch;
    });
  }, [loans, startDate, endDate, statusFilter, searchTerm]);

  const totalLoans = filteredLoans.length;
  const totalFineAmount = filteredLoans.reduce((acc, l) => acc + (l.fine_amount || 0), 0);
  const totalReturned = filteredLoans.filter((l) => l.status === 'Dikembalikan').length;
  const totalActive = filteredLoans.filter((l) => l.status === 'Dipinjam').length;
  const totalLate = filteredLoans.filter((l) => l.status === 'Terlambat').length;

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
        <button
          onClick={() => setActiveTab('visitor_awards')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'visitor_awards'
              ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>Laporan Kunjungan Bulanan &amp; Piagam Penghargaan Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('circulation')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'circulation'
              ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Laporan Sirkulasi &amp; Rekap Denda Peminjaman</span>
        </button>
      </div>

      {/* TAB 1: VISITOR AWARDS & MONTHLY LEADERBOARD */}
      {activeTab === 'visitor_awards' && (
        <div className="space-y-6">
          {/* Top Header & Filters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Siswa Teraktif Perpustakaan - {monthYearFormatted}
                </h2>
                <p className="text-xs text-slate-500">
                  Peringkat otomatis siswa yang paling sering berkunjung &amp; membaca buku. Siap buat Piagam Penghargaan instan!
                </p>
              </div>

              {/* Month/Year Picker Controls */}
              <div className="flex items-center gap-2">
                <div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(monthNames).map(([key, name]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  placeholder="Cari nama siswa / NIS / kelas..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={visitorRoleFilter}
                  onChange={(e) => setVisitorRoleFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="siswa">Khusus Siswa (Pengunjung Teraktif)</option>
                  <option value="all">Semua Kategori (Siswa, Guru, Tamu)</option>
                </select>
              </div>

              <div className="flex items-center justify-end text-xs text-slate-500 font-medium">
                Total <strong className="mx-1 text-slate-900">{totalMonthVisits}</strong> Kunjungan oleh{' '}
                <strong className="mx-1 text-slate-900">{totalActiveStudentsCount}</strong> Pengunjung
              </div>
            </div>
          </div>

          {/* TOP 3 PODIUM CARDS */}
          {visitorLeaderboard.length >= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visitorLeaderboard.slice(0, 3).map((item, index) => {
                const rank = index + 1;
                const isGold = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 overflow-hidden ${
                      isGold
                        ? 'bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 border-amber-300 text-amber-950'
                        : isSilver
                        ? 'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 border-slate-300 text-slate-900'
                        : 'bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 border-amber-600 text-amber-50'
                    }`}
                  >
                    {/* Crown Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-white/30 backdrop-blur-md">
                        {isGold ? (
                          <>
                            <Trophy className="w-4 h-4 text-amber-900 fill-amber-300" />
                            <span>JUARA 1 (TERRAJI)</span>
                          </>
                        ) : isSilver ? (
                          <>
                            <Medal className="w-4 h-4 text-slate-700" />
                            <span>JUARA 2</span>
                          </>
                        ) : (
                          <>
                            <Medal className="w-4 h-4 text-amber-200" />
                            <span>JUARA 3</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold opacity-80">
                        {monthYearFormatted}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/80 bg-white/40 shrink-0 shadow-xs flex items-center justify-center">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-7 h-7 opacity-70" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-snug line-clamp-1">{item.name}</h3>
                        <p className="text-xs font-medium opacity-90">
                          NIS: {item.number} &bull; {item.class_or_position}
                        </p>
                      </div>
                    </div>

                    {/* Stats Badge */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/10 backdrop-blur-xs text-center">
                      <div>
                        <div className="text-[10px] font-bold uppercase opacity-80">Kunjungan</div>
                        <div className="text-lg font-black">{item.visitCount} Kali</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase opacity-80">Buku Dipinjam</div>
                        <div className="text-lg font-black">{item.loanCount} Buku</div>
                      </div>
                    </div>

                    {/* Generate Certificate Button */}
                    <button
                      onClick={() =>
                        setSelectedAwardMember({
                          member: {
                            name: item.name,
                            member_number: item.number,
                            class_or_position: item.class_or_position,
                          },
                          visitCount: item.visitCount,
                          loanCount: item.loanCount,
                          rank,
                        })
                      }
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Buat Piagam Penghargaan</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* LEADERBOARD TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Daftar Lengkap Peringkat Pengunjung Perpustakaan ({monthYearFormatted})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3.5 px-4 w-16 text-center">Peringkat</th>
                    <th className="py-3.5 px-4">Nama Siswa / Pengunjung</th>
                    <th className="py-3.5 px-4">NIS / NIP</th>
                    <th className="py-3.5 px-4">Kelas / Jabatan</th>
                    <th className="py-3.5 px-4 text-center">Total Kunjungan</th>
                    <th className="py-3.5 px-4 text-center">Buku Dipinjam</th>
                    <th className="py-3.5 px-4 text-center">Aksi Piagam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visitorLeaderboard.length > 0 ? (
                    visitorLeaderboard.map((item, index) => {
                      const rank = index + 1;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-bold">
                            {rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs border border-amber-300">
                                🥇
                              </span>
                            ) : rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs border border-slate-300">
                                🥈
                              </span>
                            ) : rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-800 text-amber-100 font-black text-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="font-mono text-slate-500 font-bold">#{rank}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                              {item.photo_url ? (
                                <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <span>{item.name}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{item.number}</td>
                          <td className="py-3 px-4 font-medium text-slate-700">{item.class_or_position}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold rounded-lg text-xs">
                              {item.visitCount} Kali
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-700">
                            {item.loanCount} Buku
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() =>
                                setSelectedAwardMember({
                                  member: {
                                    name: item.name,
                                    member_number: item.number,
                                    class_or_position: item.class_or_position,
                                  },
                                  visitCount: item.visitCount,
                                  loanCount: item.loanCount,
                                  rank,
                                })
                              }
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-[11px] rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Cetak Piagam</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        Belum ada data kunjungan siswa pada bulan {monthYearFormatted}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CIRCULATION & FINES REPORT */}
      {activeTab === 'circulation' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Laporan Sirkulasi &amp; Rekap Denda Perpustakaan
              </h2>
              <p className="text-xs text-slate-500">
                Cetak laporan resmi bertanda tangan Kepala Perpustakaan {settings.school_name}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => exportLoansToExcel(filteredLoans, settings, `Laporan_Perpus_${startDate}_sd_${endDate}.xlsx`)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() =>
                  exportLoansToPDF(
                    filteredLoans,
                    settings,
                    'LAPORAN SIRKULASI PEMINJAMAN & DENGAN KETERLAMBATAN',
                    `Periode: ${startDate} s/d ${endDate}`
                  )
                }
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Export PDF</span>
              </button>
            </div>
          </div>

          {/* Date & Filter Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dari Tanggal *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sampai Tanggal *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Status</option>
                <option value="Dipinjam">Sedang Dipinjam</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Dikembalikan">Dikembalikan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Kata Kunci</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama/buku..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Total Transaksi</span>
              <div className="text-xl font-extrabold text-slate-900">{totalLoans} Transaksi</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Dikembalikan</span>
              <div className="text-xl font-extrabold text-emerald-700">{totalReturned} Buku</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Aktif / Terlambat</span>
              <div className="text-xl font-extrabold text-amber-700">{totalActive + totalLate} Buku</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Total Denda Terkumpul</span>
              <div className="text-xl font-extrabold text-rose-700">Rp {totalFineAmount.toLocaleString('id-ID')}</div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3.5 px-4">No</th>
                    <th className="py-3.5 px-4">ID Transaksi</th>
                    <th className="py-3.5 px-4">Judul Buku</th>
                    <th className="py-3.5 px-4">Nama Peminjam</th>
                    <th className="py-3.5 px-4">Tgl Pinjam</th>
                    <th className="py-3.5 px-4">Jatuh Tempo</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Denda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((l, index) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{l.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{l.book_title}</td>
                        <td className="py-3 px-4 text-slate-700">
                          {l.member_name} ({l.member_number})
                        </td>
                        <td className="py-3 px-4 text-slate-600">{l.loan_date}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-800">{l.due_date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              l.status === 'Terlambat'
                                ? 'bg-rose-100 text-rose-800'
                                : l.status === 'Dipinjam'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {l.fine_amount ? `Rp ${l.fine_amount.toLocaleString('id-ID')}` : 'Rp 0'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada data transaksi peminjaman pada filter periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Generator Modal */}
      {selectedAwardMember && (
        <CertificateModal
          isOpen={true}
          onClose={() => setSelectedAwardMember(null)}
          member={selectedAwardMember.member}
          visitCount={selectedAwardMember.visitCount}
          loanCount={selectedAwardMember.loanCount}
          monthYearStr={monthYearFormatted}
          rankNumber={selectedAwardMember.rank}
          settings={settings}
        />
      )}
    </div>
  );
};
