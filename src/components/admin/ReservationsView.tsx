import React, { useState } from 'react';
import { Reservation, LibrarySettings } from '../../types';
import {
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  User,
  BookOpen,
} from 'lucide-react';

interface ReservationsViewProps {
  reservations: Reservation[];
  onUpdateReservationStatus: (id: string, status: Reservation['status']) => void;
  onOpenNewLoanWithBookAndMember: (bookTitle: string, memberNumber: string) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  onUpdateReservationStatus,
  onOpenNewLoanWithBookAndMember,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('Menunggu');

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-600" />
            Permintaan Reservasi Buku Oleh Siswa
          </h2>
          <p className="text-xs text-slate-500">
            Kelola antrean pemesanan buku yang diajukan melalui katalog publik
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Menunggu">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Selesai">Selesai Dipinjam</option>
            <option value="Dibatalkan">Dibatalkan</option>
            <option value="all">Semua Status</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((r) => (
            <div
              key={r.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {r.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{r.reservation_date}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900 line-clamp-2">{r.book_title}</div>
                  <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.member_name} ({r.member_number})</span>
                  </div>
                  {r.contact_phone && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{r.contact_phone}</span>
                    </div>
                  )}
                </div>

                {r.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                    "{r.notes}"
                  </p>
                )}
              </div>

              {r.status === 'Menunggu' && (
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => onUpdateReservationStatus(r.id, 'Disetujui')}
                    className="flex-1 py-1.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => onUpdateReservationStatus(r.id, 'Dibatalkan')}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2 text-slate-400">
            <BookmarkCheck className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada antrean reservasi buku</p>
          </div>
        )}
      </div>
    </div>
  );
};
