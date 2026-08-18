import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Loan, Book, Member, LibrarySettings, Visit } from '../../types';
import {
  Repeat,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  ScanLine,
  RotateCw,
  AlertCircle,
  FileCheck,
  X,
  User,
  BookOpen,
  ArrowRight,
  Zap,
  Camera,
  RefreshCw,
  ListChecks,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface CirculationViewProps {
  loans: Loan[];
  books: Book[];
  members: Member[];
  settings: LibrarySettings;
  onAddLoan: (loan: Omit<Loan, 'id'>) => void;
  onAddVisit: (visit: Omit<Visit, 'id'>) => void;
  onReturnBook: (loanId: string, returnDate: string, fineAmount: number) => void;
  onExtendLoan: (loanId: string, newDueDate: string) => void;
  onOpenScanner: () => void;
  isLoanModalOpen: boolean;
  setIsLoanModalOpen: (open: boolean) => void;
}

// ── Inline mini scanner input (hardware + camera toggle) ──────────────────────
function ScanInput({
  onDetect,
  placeholder,
}: {
  onDetect: (code: string) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cameraOn) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    setCamError(null);
    const t = setTimeout(() => {
      try {
        const s = new Html5QrcodeScanner(
          'scan-input-cam-region',
          { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1 },
          false
        );
        s.render(
          (text) => {
            s.clear().catch(console.error);
            setCameraOn(false);
            onDetect(text.trim());
          },
          () => {}
        );
        scannerRef.current = s;
      } catch {
        setCamError('Kamera tidak tersedia.');
        setCameraOn(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [cameraOn]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.trim()) { onDetect(val.trim()); setVal(''); }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={submit}>
        <div className="relative">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-2 border-emerald-500 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all pr-24"
          />
          <div className="absolute right-3 top-3.5 flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Siap Scan</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[10px] text-slate-400 font-bold">Tekan <code>ENTER</code> atau tembak laser scanner.</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setCameraOn(!cameraOn)}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                cameraOn
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
              }`}
            >
              <Camera className="w-3 h-3" />
              {cameraOn ? 'Matikan Kamera' : 'Kamera HP'}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg cursor-pointer"
            >
              Proses
            </button>
          </div>
        </div>
      </form>

      {camError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {camError}
        </div>
      )}
      {cameraOn && !camError && (
        <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-300 min-h-[220px] flex items-center justify-center animate-in slide-in-from-top-2 duration-200">
          <div id="scan-input-cam-region" className="w-full text-white" />
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const CirculationView: React.FC<CirculationViewProps> = ({
  loans,
  books,
  members,
  settings,
  onAddLoan,
  onAddVisit,
  onReturnBook,
  onExtendLoan,
  onOpenScanner,
  isLoanModalOpen,
  setIsLoanModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Dipinjam' | 'Terlambat' | 'Dikembalikan'>('all');

  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<Loan | null>(null);
  const [selectedLoanForExtend, setSelectedLoanForExtend] = useState<Loan | null>(null);

  // Manual form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + (settings.loan_duration_days || 7) * 86400000)
    .toISOString().split('T')[0];
  const [customDueDate, setCustomDueDate] = useState(defaultDueDate);

  // ── Quick Borrow Scan flow (2 steps) ────────────────────────────────────────
  const [quickBorrowOpen, setQuickBorrowOpen] = useState(false);
  const [qbStep, setQbStep] = useState<'member' | 'book' | 'confirm'>('member');
  const [qbMember, setQbMember] = useState<Member | null>(null);
  const [qbBook, setQbBook] = useState<Book | null>(null);
  const [qbDueDate, setQbDueDate] = useState(defaultDueDate);
  const [qbError, setQbError] = useState<string | null>(null);

  // ── Quick Return Scan flow ───────────────────────────────────────────────────
  const [quickReturnOpen, setQuickReturnOpen] = useState(false);
  const [qrMember, setQrMember] = useState<Member | null>(null);
  const [qrStep, setQrStep] = useState<'member' | 'choose'>('member');
  const [qrError, setQrError] = useState<string | null>(null);

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

  const selectedBook = useMemo(() => books.find((b) => b.id === selectedBookId), [books, selectedBookId]);
  const selectedMember = useMemo(() => members.find((m) => m.id === selectedMemberId), [members, selectedMemberId]);

  // Active loans for quick-return member
  const qrActiveLoans = useMemo(() => {
    if (!qrMember) return [];
    return loans.filter((l) => l.member_id === qrMember.id && l.status !== 'Dikembalikan');
  }, [loans, qrMember]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const timeNow = () =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const resetQuickBorrow = () => {
    setQbStep('member');
    setQbMember(null);
    setQbBook(null);
    setQbError(null);
    setQbDueDate(defaultDueDate);
  };

  const resetQuickReturn = () => {
    setQrStep('member');
    setQrMember(null);
    setQrError(null);
  };

  // ── Quick Borrow: scan member ────────────────────────────────────────────────
  const handleQbScanMember = (code: string) => {
    const found = members.find(
      (m) => m.member_number === code || m.id === code || m.barcode === code
    );
    if (!found) {
      setQbError(`Kode "${code}" tidak cocok dengan anggota manapun. Pastikan scan kartu anggota.`);
      return;
    }
    setQbError(null);
    setQbMember(found);
    setQbStep('book');
  };

  // ── Quick Borrow: scan book ──────────────────────────────────────────────────
  const handleQbScanBook = (code: string) => {
    const found = books.find(
      (b) => b.barcode === code || b.isbn === code || b.id === code
    );
    if (!found) {
      setQbError(`Kode "${code}" tidak cocok dengan buku manapun. Pastikan scan barcode buku.`);
      return;
    }
    if (found.available_stock <= 0) {
      setQbError(`Buku "${found.title}" stoknya habis dipinjam saat ini.`);
      return;
    }
    setQbError(null);
    setQbBook(found);
    setQbStep('confirm');
  };

  // ── Quick Borrow: confirm & save ─────────────────────────────────────────────
  const handleQbConfirm = () => {
    if (!qbMember || !qbBook) return;
    onAddLoan({
      book_id: qbBook.id,
      member_id: qbMember.id,
      loan_date: todayStr,
      due_date: qbDueDate,
      status: 'Dipinjam',
      fine_amount: 0,
      extensions_count: 0,
      book_title: qbBook.title,
      book_isbn: qbBook.isbn,
      member_name: qbMember.name,
      member_number: qbMember.member_number,
      member_class: qbMember.class_or_position,
    });
    // Auto-log visit
    onAddVisit({
      member_id: qbMember.id,
      visitor_name: qbMember.name,
      visitor_number: qbMember.member_number,
      role: qbMember.role,
      class_or_position: qbMember.class_or_position,
      visit_date: todayStr,
      visit_time: timeNow(),
      purpose: 'Meminjam Buku',
    });
    resetQuickBorrow();
    setQuickBorrowOpen(false);
  };

  // ── Quick Return: scan member ────────────────────────────────────────────────
  const handleQrScanMember = (code: string) => {
    const found = members.find(
      (m) => m.member_number === code || m.id === code || m.barcode === code
    );
    if (!found) {
      setQrError(`Kode "${code}" tidak cocok dengan anggota manapun.`);
      return;
    }
    const hasActive = loans.some((l) => l.member_id === found.id && l.status !== 'Dikembalikan');
    if (!hasActive) {
      setQrError(`${found.name} tidak memiliki buku pinjaman aktif saat ini.`);
      return;
    }
    setQrError(null);
    setQrMember(found);
    setQrStep('choose');
  };

  // ── Quick Return: confirm return ─────────────────────────────────────────────
  const handleQrConfirmReturn = (loan: Loan) => {
    onReturnBook(loan.id, todayStr, loan.fine_amount);
    // Auto-log visit
    if (qrMember) {
      onAddVisit({
        member_id: qrMember.id,
        visitor_name: qrMember.name,
        visitor_number: qrMember.member_number,
        role: qrMember.role,
        class_or_position: qrMember.class_or_position,
        visit_date: todayStr,
        visit_time: timeNow(),
        purpose: 'Mengembalikan Buku',
      });
    }
    resetQuickReturn();
    setQuickReturnOpen(false);
  };

  // ── Manual loan form ─────────────────────────────────────────────────────────
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
    onReturnBook(selectedLoanForReturn.id, todayStr, selectedLoanForReturn.fine_amount);
    setSelectedLoanForReturn(null);
  };

  const handleConfirmExtension = () => {
    if (!selectedLoanForExtend) return;
    const currentDue = new Date(selectedLoanForExtend.due_date);
    const newDue = new Date(currentDue.getTime() + (settings.loan_duration_days || 7) * 86400000)
      .toISOString().split('T')[0];
    onExtendLoan(selectedLoanForExtend.id, newDue);
    setSelectedLoanForExtend(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-600" />
            Sirkulasi Peminjaman &amp; Pengembalian Buku
          </h2>
          <p className="text-xs text-slate-500">
            Scan 2x untuk pinjam atau scan kartu untuk kembalikan — kunjungan tercatat otomatis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Borrow scan */}
          <button
            onClick={() => { resetQuickBorrow(); setQuickBorrowOpen(true); }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Scan Pinjam</span>
          </button>
          {/* Quick Return scan */}
          <button
            onClick={() => { resetQuickReturn(); setQuickReturnOpen(true); }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/10 hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Kembali</span>
          </button>
          {/* Manual */}
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Manual</span>
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
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Cari ID transaksi, nama peminjam, NIS/NIP, atau judul buku..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
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
                <th className="py-3.5 px-4">ID &amp; Judul Buku</th>
                <th className="py-3.5 px-4">Nama Peminjam</th>
                <th className="py-3.5 px-4">Tgl Pinjam / Jatuh Tempo</th>
                <th className="py-3.5 px-4">Status &amp; Denda</th>
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
                      {l.return_date && <div className="text-[10px] text-slate-400">Kembali: {l.return_date}</div>}
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        l.status === 'Terlambat'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : l.status === 'Dipinjam'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
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
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Kembalikan</span>
                          </button>
                          <button
                            onClick={() => setSelectedLoanForExtend(l)}
                            disabled={l.extensions_count >= (settings.max_extensions || 2)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>Halaman {currentPage} dari {totalPages} ({filteredLoans.length} Transaksi)</div>
          <div className="flex gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 font-semibold cursor-pointer">Sebelumnya</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 font-semibold cursor-pointer">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* ── QUICK BORROW MODAL ───────────────────────────────────────────────── */}
      {quickBorrowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden text-left">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Scan Pinjam Cepat</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    Kunjungan akan tercatat otomatis setelah transaksi selesai
                  </p>
                </div>
              </div>
              <button onClick={() => { resetQuickBorrow(); setQuickBorrowOpen(false); }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              {(['member', 'book', 'confirm'] as const).map((step, i) => {
                const labels = ['1. Scan Kartu Anggota', '2. Scan Buku', '3. Konfirmasi'];
                const done = ['member', 'book', 'confirm'].indexOf(qbStep) > i;
                const active = qbStep === step;
                return (
                  <div key={step} className={`flex-1 py-2.5 text-center text-[10px] font-extrabold border-b-2 transition-colors ${
                    active ? 'border-emerald-600 text-emerald-800 bg-white' :
                    done ? 'border-emerald-200 text-emerald-600' :
                    'border-transparent text-slate-400'
                  }`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline mr-1" /> : null}
                    {labels[i]}
                  </div>
                );
              })}
            </div>

            <div className="p-6 space-y-4">
              {/* Error banner */}
              {qbError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{qbError}</span>
                </div>
              )}

              {/* Step 1: Scan Member */}
              {qbStep === 'member' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Tembakkan laser ke Kartu Anggota (NIS/NIP)</span>
                  </div>
                  <ScanInput onDetect={handleQbScanMember} placeholder="Scan atau ketik NIS/NIP anggota..." />
                </div>
              )}

              {/* Step 2: Scan Book */}
              {qbStep === 'book' && qbMember && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-emerald-900">{qbMember.name}</div>
                      <div className="text-emerald-700 font-bold">{qbMember.member_number} • {qbMember.class_or_position}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Tembakkan laser ke Barcode / QR Code Buku</span>
                  </div>
                  <ScanInput onDetect={handleQbScanBook} placeholder="Scan atau ketik barcode buku..." />
                  <button onClick={() => { setQbStep('member'); setQbError(null); }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                    ← Kembali ganti anggota
                  </button>
                </div>
              )}

              {/* Step 3: Confirm */}
              {qbStep === 'confirm' && qbMember && qbBook && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs shadow-3xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ringkasan Transaksi
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="text-slate-500 font-bold">Anggota</div>
                      <div className="font-extrabold text-slate-900">{qbMember.name}</div>
                      <div className="text-slate-500 font-bold">NIS/NIP</div>
                      <div className="font-bold text-slate-700">{qbMember.member_number}</div>
                      <div className="text-slate-500 font-bold">Kelas/Jabatan</div>
                      <div className="font-bold text-slate-700">{qbMember.class_or_position}</div>
                      <div className="text-slate-500 font-bold">Buku</div>
                      <div className="font-extrabold text-slate-900">{qbBook.title}</div>
                      <div className="text-slate-500 font-bold">ISBN</div>
                      <div className="font-mono text-slate-600">{qbBook.isbn}</div>
                      <div className="text-slate-500 font-bold">Tgl Pinjam</div>
                      <div className="font-bold text-slate-700">{todayStr}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block font-extrabold text-slate-700 mb-1">Tanggal Jatuh Tempo</label>
                      <input
                        type="date"
                        value={qbDueDate}
                        onChange={(e) => setQbDueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-extrabold text-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-semibold flex items-center gap-2">
                    <ListChecks className="w-4 h-4 shrink-0" />
                    Kunjungan dengan tujuan <strong>"Meminjam Buku"</strong> akan dicatat otomatis ke buku tamu hari ini.
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setQbStep('book'); setQbError(null); }}
                      className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer">
                      ← Ganti Buku
                    </button>
                    <button onClick={handleQbConfirm}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer transition-all">
                      Catat Peminjaman
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK RETURN MODAL ───────────────────────────────────────────────── */}
      {quickReturnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Scan Pengembalian Cepat</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    Scan kartu anggota → pilih buku yang dikembalikan
                  </p>
                </div>
              </div>
              <button onClick={() => { resetQuickReturn(); setQuickReturnOpen(false); }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {qrError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{qrError}</span>
                </div>
              )}

              {qrStep === 'member' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>Scan Kartu Anggota yang Ingin Mengembalikan Buku</span>
                  </div>
                  <ScanInput onDetect={handleQrScanMember} placeholder="Scan atau ketik NIS/NIP anggota..." />
                </div>
              )}

              {qrStep === 'choose' && qrMember && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-amber-900">{qrMember.name}</div>
                      <div className="text-amber-700 font-bold">{qrMember.member_number} • {qrMember.class_or_position}</div>
                    </div>
                  </div>

                  <div className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Pilih buku yang dikembalikan ({qrActiveLoans.length} pinjaman aktif):</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {qrActiveLoans.map((loan) => (
                      <div key={loan.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-3xs">
                        <div className="text-xs font-extrabold text-slate-900">{loan.book_title}</div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          Jatuh Tempo: <span className={loan.status === 'Terlambat' ? 'text-rose-700 font-extrabold' : 'text-slate-600'}>{loan.due_date}</span>
                          {loan.fine_amount > 0 && (
                            <span className="ml-2 text-rose-700 font-extrabold"> • Denda: Rp {loan.fine_amount.toLocaleString('id-ID')}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleQrConfirmReturn(loan)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Kembalikan Buku Ini
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" />
                      Kunjungan "Mengembalikan Buku" dicatat otomatis.
                    </div>
                    <button onClick={() => { setQrStep('member'); setQrError(null); setQrMember(null); }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                      ← Ganti Anggota
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal (from table) */}
      {selectedLoanForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">Konfirmasi Pengembalian</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1">Sirkulasi buku perpustakaan</p>
                </div>
              </div>
              <button onClick={() => setSelectedLoanForReturn(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs shadow-3xs">
                <div className="font-extrabold text-slate-900 text-sm">{selectedLoanForReturn.book_title}</div>
                <div className="text-slate-600 font-semibold">Peminjam: {selectedLoanForReturn.member_name} ({selectedLoanForReturn.member_number})</div>
                <div className="text-slate-500 font-semibold">Jatuh Tempo: {selectedLoanForReturn.due_date}</div>
              </div>
              {selectedLoanForReturn.fine_amount > 0 ? (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs space-y-1.5 shadow-3xs">
                  <div className="font-extrabold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Terdeteksi Keterlambatan!</span>
                  </div>
                  <div className="text-rose-950 font-black text-base">
                    Denda: Rp {selectedLoanForReturn.fine_amount.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[10px] text-rose-700 font-semibold">
                    Pastikan siswa menyerahkan pembayaran denda kepada petugas perpus.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 shadow-3xs font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Pengembalian Tepat Waktu (Bebas Denda).</span>
                </div>
              )}
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={() => setSelectedLoanForReturn(null)}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer">
                  Batal
                </button>
                <button onClick={handleConfirmReturn}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer">
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
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">Perpanjangan Peminjaman</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1">Sirkulasi buku perpustakaan</p>
                </div>
              </div>
              <button onClick={() => setSelectedLoanForExtend(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 shadow-3xs">
                <div className="font-extrabold text-slate-900 text-sm">{selectedLoanForExtend.book_title}</div>
                <div className="text-slate-600 font-semibold">Peminjam: {selectedLoanForExtend.member_name}</div>
                <div className="text-slate-500 font-semibold">Jatuh Tempo Saat Ini: {selectedLoanForExtend.due_date}</div>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1.5 text-emerald-900 shadow-3xs font-semibold">
                <div className="font-extrabold">Masa Pinjam Ditambah {settings.loan_duration_days || 7} Hari</div>
                <div>Jumlah perpanjangan: {selectedLoanForExtend.extensions_count + 1} dari maks. {settings.max_extensions || 2} kali</div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={() => setSelectedLoanForExtend(null)}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer">
                  Batal
                </button>
                <button onClick={handleConfirmExtension}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer">
                  Konfirmasi Perpanjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Loan Manual Modal */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsLoanModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">Peminjaman Buku (Manual)</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1.5">Pilih anggota &amp; buku dari dropdown</p>
                </div>
              </div>
              <button onClick={() => setIsLoanModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLoanSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Pilih Anggota *</label>
                <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs cursor-pointer" required>
                  <option value="">-- Pilih Anggota (Siswa / Guru) --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.member_number} - {m.class_or_position})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Pilih Buku *</label>
                <select value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs cursor-pointer" required>
                  <option value="">-- Pilih Buku Dari Koleksi --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.available_stock <= 0}>
                      {b.title} (Stok: {b.available_stock}/{b.stock})
                    </option>
                  ))}
                </select>
              </div>
              {selectedBook && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 shadow-3xs">
                  <div className="font-extrabold text-slate-900">{selectedBook.title}</div>
                  <div className="text-slate-500 font-semibold">Lokasi: {selectedBook.shelf_location} • Kategori: {selectedBook.category}</div>
                  <div className="text-emerald-700 font-extrabold">Tersedia {selectedBook.available_stock} Eksemplar</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Tanggal Pinjam</label>
                  <input type="date" value={todayStr} disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 shadow-3xs" />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Tanggal Jatuh Tempo *</label>
                  <input type="date" value={customDueDate} onChange={(e) => setCustomDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs" required />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer">
                  Batal
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer">
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
