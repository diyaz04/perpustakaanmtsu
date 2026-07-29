import React, { useState, useMemo } from 'react';
import { Loan, Book, Member, LibrarySettings } from '../../types';
import {
  Repeat,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  ScanLine,
  XCircle,
  RotateCw,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface CirculationViewProps {
  loans: Loan[];
  books: Book[];
  members: Member[];
  settings: LibrarySettings;
  onAddLoan: (loan: Omit<Loan, 'id'>) => void;
  onReturnBook: (loanId: string, returnDate: string, fineAmount: number) => void;
  onExtendLoan: (loanId: string, newDueDate: string) => void;
  onOpenScanner: () => void;
  isLoanModalOpen: boolean;
  setIsLoanModalOpen: (open: boolean) => void;
}

export const CirculationView: React.FC<CirculationViewProps> = ({
  loans,
  books,
  members,
  settings,
  onAddLoan,
  onReturnBook,
  onExtendLoan,
  onOpenScanner,
  isLoanModalOpen,
  setIsLoanModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Dipinjam' | 'Terlambat' | 'Dikembalikan'>('all');

  // Return & Extension modal state
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<Loan | null>(null);
  const [selectedLoanForExtend, setSelectedLoanForExtend] = useState<Loan | null>(null);

  // Loan Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + (settings.loan_duration_days || 7) * 86400000)
    .toISOString()
    .split('T')[0];
  const [customDueDate, setCustomDueDate] = useState(defaultDueDate);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const matchSearch =
        (l.book_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.member_number || '').includes(searchTerm) ||
        l.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [loans, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage) || 1;
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId),
    [books, selectedBookId]
  );
  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId),
    [members, selectedMemberId]
  );

  const handleCreateLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember) return;

    if (selectedBook.available_stock <= 0) {
      alert('Stok buku ini sedang habis dipinjam!');
      return;
    }

    onAddLoan({
      book_id: selectedBook.id,
      member_id: selectedMember.id,
      loan_date: todayStr,
      due_date: customDueDate,
      status: 'Dipinjam',
      fine_amount: 0,
      extensions_count: 0,
      book_title: selectedBook.title,
      book_isbn: selectedBook.isbn,
      member_name: selectedMember.name,
      member_number: selectedMember.member_number,
      member_class: selectedMember.class_or_position,
    });

    setIsLoanModalOpen(false);
    setSelectedBookId('');
    setSelectedMemberId('');
  };

  const handleConfirmReturn = () => {
    if (!selectedLoanForReturn) return;
    onReturnBook(
      selectedLoanForReturn.id,
      todayStr,
      selectedLoanForReturn.fine_amount
    );
    setSelectedLoanForReturn(null);
  };

  const handleConfirmExtension = () => {
    if (!selectedLoanForExtend) return;
    const currentDue = new Date(selectedLoanForExtend.due_date);
    const newDue = new Date(
      currentDue.getTime() + (settings.loan_duration_days || 7) * 86400000
    )
      .toISOString()
      .split('T')[0];

    onExtendLoan(selectedLoanForExtend.id, newDue);
    setSelectedLoanForExtend(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-600" />
            Sirkulasi Peminjaman & Pengembalian Buku
          </h2>
          <p className="text-xs text-slate-500">
            Proses cepat transaksi peminjaman, otomatis deteksi keterlambatan, hitung denda, dan perpanjangan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span>Scan Cepat</span>
          </button>
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Peminjaman Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari ID transaksi, nama peminjam, NIS/NIP, atau judul buku..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="Dipinjam">Sedang Dipinjam</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Dikembalikan">Sudah Dikembalikan</option>
          </select>
        </div>
      </div>

      {/* Circulation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">ID & Judul Buku</th>
                <th className="py-3.5 px-4">Nama Peminjam</th>
                <th className="py-3.5 px-4">Tgl Pinjam / Jatuh Tempo</th>
                <th className="py-3.5 px-4">Status & Denda</th>
                <th className="py-3.5 px-4 text-center">Perpanjangan</th>
                <th className="py-3.5 px-4 text-center">Aksi Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLoans.length > 0 ? (
                paginatedLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{l.book_title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {l.id} • ISBN: {l.book_isbn}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{l.member_name}</div>
                      <div className="text-[10px] text-slate-500">{l.member_number} ({l.member_class})</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div>Pinjam: {l.loan_date}</div>
                      <div className="font-bold text-emerald-800">Tempo: {l.due_date}</div>
                      {l.return_date && (
                        <div className="text-[10px] text-slate-400">Kembali: {l.return_date}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          l.status === 'Terlambat'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : l.status === 'Dipinjam'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {l.status}
                      </span>
                      {l.fine_amount > 0 && (
                        <div className="text-rose-700 font-bold text-[11px]">
                          Denda: Rp {l.fine_amount.toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                      {l.extensions_count} / {settings.max_extensions || 2} Kali
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {l.status !== 'Dikembalikan' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedLoanForReturn(l)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Kembalikan</span>
                          </button>
                          <button
                            onClick={() => setSelectedLoanForExtend(l)}
                            disabled={l.extensions_count >= (settings.max_extensions || 2)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                            title="Perpanjang Masa Pinjam"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                            <span>Perpanjang</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi sirkulasi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Halaman {currentPage} dari {totalPages} ({filteredLoans.length} Transaksi)
          </div>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 font-semibold"
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 font-semibold"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Return Confirmation Modal */}
      {selectedLoanForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Konfirmasi Pengembalian Buku</h3>
              <button
                onClick={() => setSelectedLoanForReturn(null)}
                className="p-1 rounded-full hover:bg-white/20 text-emerald-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-slate-900">{selectedLoanForReturn.book_title}</div>
                <div className="text-slate-600">Peminjam: {selectedLoanForReturn.member_name} ({selectedLoanForReturn.member_number})</div>
                <div className="text-slate-500">Jatuh Tempo: {selectedLoanForReturn.due_date}</div>
              </div>

              {selectedLoanForReturn.fine_amount > 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Terdeteksi Keterlambatan!</span>
                  </div>
                  <div className="text-rose-900 font-extrabold text-sm">
                    Denda: Rp {selectedLoanForReturn.fine_amount.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Pastikan siswa menyerahkan pembayaran denda kepada petugas perpus.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Pengembalian Tepat Waktu (Bebas Denda).</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedLoanForReturn(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmReturn}
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Proses Pengembalian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extension Confirmation Modal */}
      {selectedLoanForExtend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-700 to-emerald-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Perpanjangan Masa Pinjam</h3>
              <button
                onClick={() => setSelectedLoanForExtend(null)}
                className="p-1 rounded-full hover:bg-white/20 text-emerald-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">{selectedLoanForExtend.book_title}</div>
                <div className="text-slate-600">Peminjam: {selectedLoanForExtend.member_name}</div>
                <div className="text-slate-500">Jatuh Tempo Saat Ini: {selectedLoanForExtend.due_date}</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
                <div className="font-bold">Masa Pinjam Ditambah {settings.loan_duration_days || 7} Hari</div>
                <div>Jumlah perpanjangan: {selectedLoanForExtend.extensions_count + 1} dari maks. {settings.max_extensions || 2} kali</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedLoanForExtend(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmExtension}
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Konfirmasi Perpanjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Loan Modal */}
      {isLoanModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsLoanModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-green-700 to-emerald-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Form Peminjaman Buku Baru</h3>
              <button
                onClick={() => setIsLoanModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-emerald-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoanSubmit} className="p-5 space-y-4">
              {/* Select Member */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Pilih Anggota *</label>
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Scan Kartu Anggota</span>
                  </button>
                </div>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Pilih Anggota (Siswa / Guru) --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.member_number} - {m.class_or_position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Book */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Pilih Buku *</label>
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Scan Barcode Buku</span>
                  </button>
                </div>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Pilih Buku Dari Koleksi --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.available_stock <= 0}>
                      {b.title} (Stok: {b.available_stock}/{b.stock})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBook && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-900">{selectedBook.title}</div>
                  <div className="text-slate-600">Lokasi: {selectedBook.shelf_location} • Kategori: {selectedBook.category}</div>
                  <div className="text-emerald-700 font-bold">Tersedia {selectedBook.available_stock} Eksemplar</div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pinjam</label>
                  <input
                    type="date"
                    value={todayStr}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo *</label>
                  <input
                    type="date"
                    value={customDueDate}
                    onChange={(e) => setCustomDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Proses Transaksi Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
