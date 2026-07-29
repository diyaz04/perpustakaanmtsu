import React, { useState, useEffect } from 'react';
import {
  Book,
  Member,
  Loan,
  Visit,
  Reservation,
  LibrarySettings,
} from './types';
import {
  loadStorageData,
  saveStorageData,
  resetToDefaultData,
  updateFinesAndStatus,
} from './lib/storage';

// Navigation & Auth
import { Navbar } from './components/Navbar';
import { Sidebar, AdminTab } from './components/Sidebar';
import { LoginModal } from './components/auth/LoginModal';

// Modals
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { MemberCardModal } from './components/MemberCardModal';
import { BookBarcodeModal } from './components/BookBarcodeModal';

// Views
import { PublicCatalog } from './components/catalog/PublicCatalog';
import { DashboardView } from './components/admin/DashboardView';
import { BooksManagementView } from './components/admin/BooksManagementView';
import { MembersManagementView } from './components/admin/MembersManagementView';
import { CirculationView } from './components/admin/CirculationView';
import { AttendanceView } from './components/admin/AttendanceView';
import { ReservationsView } from './components/admin/ReservationsView';
import { ReportsView } from './components/admin/ReportsView';
import { SettingsView } from './components/admin/SettingsView';

import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState(() => loadStorageData());
  const [activeMode, setActiveMode] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Auth State (Default true for smooth demo access, can be toggled)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedMemberCard, setSelectedMemberCard] = useState<Member | null>(null);
  const [selectedBookBarcode, setSelectedBookBarcode] = useState<Book | null>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync to local storage whenever appData changes
  useEffect(() => {
    saveStorageData(appData);
  }, [appData]);

  // Update Document Title and Favicon based on settings
  useEffect(() => {
    const { library_name, logo_url } = appData.settings;
    if (library_name) {
      document.title = library_name;
    }
    if (logo_url) {
      let favicon = document.getElementById('dynamic-favicon') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.id = 'dynamic-favicon';
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = logo_url;
    }
  }, [appData.settings.library_name, appData.settings.logo_url]);

  // Recalculate fines on mount
  useEffect(() => {
    setAppData((prev) => updateFinesAndStatus(prev));
  }, []);

  const { books, members, loans, visits, reservations, settings } = appData;

  // Counts for sidebar badges
  const counts = {
    books: books.length,
    members: members.length,
    activeLoans: loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat').length,
    overdueLoans: loans.filter((l) => l.status === 'Terlambat').length,
    todayVisits: visits.filter((v) => v.visit_date === new Date().toISOString().split('T')[0]).length,
    pendingReservations: reservations.filter((r) => r.status === 'Menunggu').length,
  };

  // ---------------- Handlers ----------------
  const handleAddBook = (newBookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...newBookData,
      id: `BOK-${String(books.length + 1).padStart(3, '0')}`,
    };
    setAppData((prev) => ({
      ...prev,
      books: [newBook, ...prev.books],
    }));
    showToast('Buku Ditambahkan', `Buku "${newBook.title}" telah didaftarkan.`);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setAppData((prev) => ({
      ...prev,
      books: prev.books.map((b) => (b.id === updatedBook.id ? updatedBook : b)),
    }));
    showToast('Buku Diperbarui', `Data buku "${updatedBook.title}" berhasil diubah.`);
  };

  const handleDeleteBook = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== id),
    }));
    showToast('Buku Dihapus', 'Buku telah dihapus dari koleksi.', 'info');
  };

  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'registered_at'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: `MEM-${String(members.length + 1).padStart(3, '0')}`,
      registered_at: new Date().toISOString().split('T')[0],
    };
    setAppData((prev) => ({
      ...prev,
      members: [newMember, ...prev.members],
    }));
    showToast('Anggota Terdaftar', `Anggota "${newMember.name}" berhasil ditambahkan.`);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setAppData((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
    }));
    showToast('Anggota Diperbarui', `Data anggota "${updatedMember.name}" telah diubah.`);
  };

  const handleDeleteMember = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
    showToast('Anggota Dihapus', 'Data anggota telah dihapus.', 'info');
  };

  const handleAddLoan = (newLoanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...newLoanData,
      id: `PIN-${new Date().getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`,
    };

    // Auto-decrement available stock
    const updatedBooks = books.map((b) => {
      if (b.id === newLoan.book_id) {
        return { ...b, available_stock: Math.max(0, b.available_stock - 1) };
      }
      return b;
    });

    setAppData((prev) => ({
      ...prev,
      loans: [newLoan, ...prev.loans],
      books: updatedBooks,
    }));

    showToast('Peminjaman Berhasil', `Transaksi ${newLoan.id} telah dicatat.`);
  };

  const handleReturnBook = (loanId: string, returnDate: string, fineAmount: number) => {
    const loanToReturn = loans.find((l) => l.id === loanId);

    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'Dikembalikan' as const,
          return_date: returnDate,
          fine_amount: fineAmount,
        };
      }
      return l;
    });

    // Auto-increment available stock
    let updatedBooks = books;
    if (loanToReturn) {
      updatedBooks = books.map((b) => {
        if (b.id === loanToReturn.book_id) {
          return { ...b, available_stock: b.available_stock + 1 };
        }
        return b;
      });
    }

    setAppData((prev) => ({
      ...prev,
      loans: updatedLoans,
      books: updatedBooks,
    }));

    showToast('Pengembalian Dicatat', 'Buku telah dikembalikan dan stok diperbarui.');
  };

  const handleExtendLoan = (loanId: string, newDueDate: string) => {
    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          due_date: newDueDate,
          extensions_count: (l.extensions_count || 0) + 1,
          status: 'Dipinjam' as const,
        };
      }
      return l;
    });

    setAppData((prev) => ({ ...prev, loans: updatedLoans }));
    showToast('Masa Pinjam Diperpanjang', `Jatuh tempo baru: ${newDueDate}`);
  };

  const handleAddVisit = (newVisitData: Omit<Visit, 'id'>) => {
    const newVisit: Visit = {
      ...newVisitData,
      id: `VIS-${String(visits.length + 1).padStart(3, '0')}`,
    };
    setAppData((prev) => ({
      ...prev,
      visits: [newVisit, ...prev.visits],
    }));
    showToast('Kehadiran Dicatat', `Terima kasih atas kunjungan ${newVisit.visitor_name}`);
  };

  const handleAddReservation = (
    resData: Omit<Reservation, 'id' | 'status' | 'reservation_date'>
  ) => {
    const newRes: Reservation = {
      ...resData,
      id: `RES-${String(reservations.length + 1).padStart(3, '0')}`,
      status: 'Menunggu',
      reservation_date: new Date().toISOString().split('T')[0],
    };
    setAppData((prev) => ({
      ...prev,
      reservations: [newRes, ...prev.reservations],
    }));
    showToast('Reservasi Terkirim', 'Permintaan reservasi Anda telah terdaftar.');
  };

  const handleUpdateReservationStatus = (id: string, status: Reservation['status']) => {
    setAppData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
    showToast('Status Reservasi', `Reservasi diubah menjadi "${status}".`);
  };

  const handleSaveSettings = (newSettings: LibrarySettings) => {
    setAppData((prev) => updateFinesAndStatus({ ...prev, settings: newSettings }));
    showToast('Pengaturan Disimpan', 'Identitas & aturan sirkulasi telah diperbarui.');
  };

  const handleResetData = () => {
    const fresh = resetToDefaultData();
    setAppData(fresh);
    showToast('Data Direset', 'Semua data dikembalikan ke data awal MTs KH A Wahab Muhsin.', 'info');
  };

  // Barcode Scanner Smart Result Handler
  const handleScanSuccess = (scannedCode: string) => {
    // Check if code matches a book barcode or ISBN
    const matchBook = books.find(
      (b) => b.barcode === scannedCode || b.isbn === scannedCode || b.id === scannedCode
    );

    // Check if code matches a member NIS/NIP
    const matchMember = members.find(
      (m) => m.member_number === scannedCode || m.id === scannedCode
    );

    if (matchBook) {
      if (activeMode === 'admin') {
        setSelectedBookBarcode(matchBook);
        showToast('Buku Terdeteksi', `Barcode mencocokkan buku: ${matchBook.title}`);
      } else {
        showToast('Katalog Buku', `Ditemukan: ${matchBook.title} (${matchBook.shelf_location})`);
      }
      return;
    }

    if (matchMember) {
      setSelectedMemberCard(matchMember);
      showToast('Anggota Terdeteksi', `Kartu Anggota: ${matchMember.name}`);
      return;
    }

    showToast('Hasil Scan', `Kode terdeteksi: "${scannedCode}". Silakan gunakan di pencarian.`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogoutAdmin={() => {
          setIsAdminAuthenticated(false);
          setActiveMode('public');
          showToast('Petugas Keluar', 'Anda telah keluar dari portal admin.', 'info');
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeMode === 'public' ? (
          /* Public Catalog View */
          <PublicCatalog
            books={books}
            members={members}
            loans={loans}
            settings={settings}
            onAddReservation={handleAddReservation}
            onOpenMemberCard={(m) => setSelectedMemberCard(m)}
          />
        ) : (
          /* Admin Portal Layout */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <Sidebar
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              counts={counts}
            />

            {/* Admin Content View */}
            <div className="flex-1 min-w-0">
              {adminTab === 'dashboard' && (
                <DashboardView
                  books={books}
                  members={members}
                  loans={loans}
                  visits={visits}
                  settings={settings}
                  onNavigateTab={(t) => setAdminTab(t)}
                  onOpenNewLoan={() => setIsLoanModalOpen(true)}
                />
              )}

              {adminTab === 'books' && (
                <BooksManagementView
                  books={books}
                  settings={settings}
                  onAddBook={handleAddBook}
                  onUpdateBook={handleUpdateBook}
                  onDeleteBook={handleDeleteBook}
                  onOpenBarcodeModal={(b) => setSelectedBookBarcode(b)}
                />
              )}

              {adminTab === 'members' && (
                <MembersManagementView
                  members={members}
                  loans={loans}
                  settings={settings}
                  onAddMember={handleAddMember}
                  onUpdateMember={handleUpdateMember}
                  onDeleteMember={handleDeleteMember}
                  onOpenMemberCard={(m) => setSelectedMemberCard(m)}
                />
              )}

              {adminTab === 'loans' && (
                <CirculationView
                  loans={loans}
                  books={books}
                  members={members}
                  settings={settings}
                  onAddLoan={handleAddLoan}
                  onReturnBook={handleReturnBook}
                  onExtendLoan={handleExtendLoan}
                  onOpenScanner={() => setIsScannerOpen(true)}
                  isLoanModalOpen={isLoanModalOpen}
                  setIsLoanModalOpen={setIsLoanModalOpen}
                />
              )}

              {adminTab === 'visits' && (
                <AttendanceView
                  visits={visits}
                  members={members}
                  settings={settings}
                  onAddVisit={handleAddVisit}
                  onOpenScanner={() => setIsScannerOpen(true)}
                />
              )}

              {adminTab === 'reservations' && (
                <ReservationsView
                  reservations={reservations}
                  onUpdateReservationStatus={handleUpdateReservationStatus}
                  onOpenNewLoanWithBookAndMember={() => setIsLoanModalOpen(true)}
                />
              )}

              {adminTab === 'reports' && (
                <ReportsView loans={loans} visits={visits} members={members} settings={settings} />
              )}

              {adminTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  onResetData={handleResetData}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Global Toast Message */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-md">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-white">{toastMsg.title}</div>
            <div className="text-slate-300">{toastMsg.desc}</div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(email) => {
          setIsAdminAuthenticated(true);
          setActiveMode('admin');
          showToast('Login Berhasil', `Selamat bertugas, ${email}`);
        }}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <MemberCardModal
        isOpen={!!selectedMemberCard}
        onClose={() => setSelectedMemberCard(null)}
        member={selectedMemberCard}
        settings={settings}
      />

      <BookBarcodeModal
        isOpen={!!selectedBookBarcode}
        onClose={() => setSelectedBookBarcode(null)}
        book={selectedBookBarcode}
        settings={settings}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} <strong>{settings.school_name}</strong>. System Management Perpustakaan Digital.
          </p>
          <p className="text-[11px] text-slate-400">
            {settings.library_name} • Designed for School Accreditation
          </p>
        </div>
      </footer>
    </div>
  );
}
