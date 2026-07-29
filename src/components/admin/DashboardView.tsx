import React from 'react';
import { Book, Member, Loan, Visit, LibrarySettings } from '../../types';
import {
  BookOpen,
  Users,
  Repeat,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Clock,
  PlusCircle,
  FileText,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  visits: Visit[];
  settings: LibrarySettings;
  onNavigateTab: (tab: any) => void;
  onOpenNewLoan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  books,
  members,
  loans,
  visits,
  settings,
  onNavigateTab,
  onOpenNewLoan,
}) => {
  // Key metrics calculations
  const totalBooks = books.length;
  const totalStock = books.reduce((acc, b) => acc + b.stock, 0);
  const totalMembers = members.length;
  const activeLoans = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  const overdueLoans = loans.filter((l) => l.status === 'Terlambat');
  const totalFines = overdueLoans.reduce((acc, l) => acc + (l.fine_amount || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.visit_date === todayStr);

  // Weekly loans data for Recharts
  const weeklyData = [
    { day: 'Sen', Pinjam: 18, Kembali: 14 },
    { day: 'Sel', Pinjam: 24, Kembali: 20 },
    { day: 'Rab', Pinjam: 32, Kembali: 28 },
    { day: 'Kam', Pinjam: activeLoans.length + 15, Kembali: 30 },
    { day: 'Jum', Pinjam: 22, Kembali: 19 },
    { day: 'Sab', Pinjam: 12, Kembali: 10 },
  ];

  // Most popular books calculation
  const popularBooks = [...books]
    .sort((a, b) => (b.stock - b.available_stock) - (a.stock - a.available_stock))
    .slice(0, 5);

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ringkasan Dashboard</h2>
          <p className="text-slate-500 text-sm">Selamat bertugas. Inilah statistik perpustakaan hari ini.</p>
        </div>
        <div className="text-right sm:text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{currentDateFormatted}</p>
          <p className="text-sm font-medium text-slate-600">{settings.library_name} • {settings.school_name}</p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Buku */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
              {totalStock} stok
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Koleksi Buku</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalBooks.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        {/* Total Anggota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Anggota</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalMembers}</h3>
          </div>
        </div>

        {/* Sedang Dipinjam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              {activeLoans.length} Transaksi
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Sedang Dipinjam</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{activeLoans.length}</h3>
          </div>
        </div>

        {/* Keterlambatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              {overdueLoans.length > 0 ? 'Perlu Tindakan' : 'Aman'}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Keterlambatan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{overdueLoans.length}</h3>
          </div>
        </div>
      </div>

      {/* CHART & RECENT ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-bold text-slate-700">Trend Peminjaman Buku (Minggu Ini)</h4>
              <p className="text-xs text-slate-400">Statistik transaksi harian siswa & guru</p>
            </div>
            <button
              onClick={onOpenNewLoan}
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-green-100 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Peminjaman</span>
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="Pinjam" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Kembali" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-4">Aktivitas & Log Terbaru</h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] leading-tight text-slate-800">
                    <span className="font-bold">Sahrul Ramadhan</span> meminjam <span className="italic font-medium">Fisika Dasar X</span>
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">3 menit yang lalu</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] leading-tight text-slate-800">
                    <span className="font-bold">Dewi Sartika</span> mengembalikan <span className="italic font-medium">Laskar Pelangi</span>
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">15 menit yang lalu</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] leading-tight text-slate-800">
                    <span className="font-bold">Asep Wijaya</span> keterlambatan 2 hari
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">1 jam yang lalu</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] leading-tight text-slate-800">
                    Absensi Kunjungan: <span className="font-bold">{todayVisits.length} Pengunjung</span> tercatat hari ini
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">2 jam yang lalu</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('loans')}
            className="w-full mt-4 py-2.5 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>

      {/* POPULAR BOOKS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-700">Koleksi Paling Sering Dipinjam</h4>
          <button
            onClick={() => onNavigateTab('books')}
            className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>Kelola Buku</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Judul Buku</th>
                <th className="py-3 px-4">Pengarang</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Rak</th>
                <th className="py-3 px-4 text-center">Stok Tersedia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularBooks.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-3">
                    <img src={book.cover_url} alt="" className="w-8 h-10 object-cover rounded shadow-2xs shrink-0" />
                    <span>{book.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{book.author}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold text-[10px]">
                      {book.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{book.shelf_location}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {book.available_stock} / {book.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

