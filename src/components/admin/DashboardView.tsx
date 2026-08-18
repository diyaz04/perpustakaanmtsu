import React from 'react';
import { Book, Member, Loan, Visit, LibrarySettings } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  BookOpen,
  Users,
  Repeat,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

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
  onNavigateTab,
}) => {
  // Key metrics calculations
  const totalBooks = books.length;
  const totalStock = books.reduce((acc, b) => acc + b.stock, 0);
  const totalMembers = members.length;
  const activeLoans = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  const overdueLoans = loans.filter((l) => l.status === 'Terlambat');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.visit_date === todayStr);

  // Weekly loans data for Recharts (Calculated from real loans data of the current week)
  const getWeeklyData = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    
    // Calculate Monday of the current week
    const monday = new Date(today);
    const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
    monday.setDate(today.getDate() - daysToSubtract);
    
    const daysName = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    return daysName.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      // Format as YYYY-MM-DD using local time zone offsets
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      const dateStr = localDate.toISOString().split('T')[0];
      
      const pinjamCount = loans.filter((l) => l.loan_date === dateStr).length;
      const kembaliCount = loans.filter((l) => l.return_date === dateStr && l.status === 'Dikembalikan').length;
      
      return {
        day,
        Pinjam: pinjamCount,
        Kembali: kembaliCount,
      };
    });
  };

  const weeklyData = getWeeklyData();

  // Most popular books calculation
  const popularBooks = [...books]
    .sort((a, b) => (b.stock - b.available_stock) - (a.stock - a.available_stock))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header Label */}
      <div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Dashboard Analitik & Statistik</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">Laporan ikhtisar data sirkulasi dan aktivitas perpustakaan</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Buku */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex justify-between items-center transition-all hover:shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Koleksi Buku</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{totalBooks.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold">{totalStock} Total Eksemplar</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Total Anggota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex justify-between items-center transition-all hover:shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Anggota</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{totalMembers.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold">Terdaftar aktif</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Sedang Dipinjam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex justify-between items-center transition-all hover:shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sedang Dipinjam</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{activeLoans.length.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold">Transaksi aktif</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
        </div>

        {/* Keterlambatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex justify-between items-center transition-all hover:shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Denda Terlambat</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{overdueLoans.length.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold">Kasus denda berjalan</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            overdueLoans.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHART & POPULAR ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">Tren Aktivitas Sirkulasi Mingguan</h4>
            <p className="text-[10px] text-slate-400">Statistik perbandingan peminjaman dan pengembalian buku</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                    padding: '10px 14px',
                  }}
                />
                <Bar dataKey="Pinjam" fill="#059669" name="Peminjaman" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Kembali" fill="#34d399" name="Pengembalian" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Books */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">Koleksi Terpopuler</h4>
              <p className="text-[10px] text-slate-400">Buku dengan tingkat sirkulasi tertinggi</p>
            </div>
            <div className="space-y-3.5">
              {popularBooks.slice(0, 4).map((book) => {
                const borrowCount = book.stock - book.available_stock;
                return (
                  <div key={book.id} className="flex gap-3 items-center">
                    <img src={book.cover_url} alt="" className="w-9 h-12 object-cover rounded shadow-3xs" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{book.title}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{book.author} • {book.category}</p>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                      {borrowCount}x Pinjam
                    </span>
                  </div>
                );
              })}
              {popularBooks.length === 0 && (
                <p className="text-[10px] text-slate-400 italic">Belum ada data sirkulasi terdeteksi.</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('books')}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Kelola Semua Buku
          </button>
        </div>
      </div>
    </div>
  );
};
