import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  Member,
  Loan,
  Visit,
  Reservation,
  LibrarySettings,
  Manager,
} from './types';
import {
  loadStorageData,
  saveStorageData,
  resetToDefaultData,
  updateFinesAndStatus,
} from './lib/storage';
import {
  getSupabase,
  fetchSupabaseData,
  syncBook,
  deleteBookFromSupabase,
  syncMember,
  deleteMemberFromSupabase,
  syncLoan,
  deleteLoanFromSupabase,
  syncVisit,
  deleteVisitFromSupabase,
  syncReservation,
  deleteReservationFromSupabase,
  syncSettings,
  syncAllLocalDataToSupabase,
  syncManager,
  deleteManagerFromSupabase,
} from './lib/supabaseClient';

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
import { MenuView } from './components/admin/MenuView';
import { BooksManagementView } from './components/admin/BooksManagementView';
import { LaptopsManagementView } from './components/admin/LaptopsManagementView';
import { MembersManagementView } from './components/admin/MembersManagementView';
import { CirculationView } from './components/admin/CirculationView';
import { AttendanceView } from './components/admin/AttendanceView';
import { ReservationsView } from './components/admin/ReservationsView';
import { ReportsView } from './components/admin/ReportsView';
import { SettingsView } from './components/admin/SettingsView';
import { ManagersManagementView } from './components/admin/ManagersManagementView';

import { CheckCircle2, AlertCircle, Bell, Calendar, Menu, X, BookOpen, Users, Repeat, UserCheck, AlertTriangle } from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState(() => loadStorageData());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('mts_library_admin_authenticated') === 'true';
  });
  const [activeMode, setActiveMode] = useState<'public' | 'admin'>(() => {
    const isAuth = localStorage.getItem('mts_library_admin_authenticated') === 'true';
    return isAuth ? 'admin' : 'public';
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('menu');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentManagerEmail, setCurrentManagerEmail] = useState(() => {
    return localStorage.getItem('mts_library_current_manager_email') || '';
  });

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedMemberCard, setSelectedMemberCard] = useState<Member | null>(null);
  const [selectedBookBarcode, setSelectedBookBarcode] = useState<Book | null>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

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

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      const client = getSupabase();
      if (!client) {
        setDbError('NOT_CONNECTED');
        return;
      }

      try {
        const data = await fetchSupabaseData();
        if (data) {
          // Handle diagnostic errors with specific messages
          if (data.diagnosticError) {
            setDbError(data.diagnosticError);
            return;
          }

          const isSupabaseEmpty = data.books.length === 0 && data.members.length === 0 && data.loans.length === 0;
          let currentManagers = data.managers || [];

          if (isSupabaseEmpty) {
            console.log('Supabase is connected and tables are empty. Ready to use.');
            // Seed settings only so the app has basic config
            try {
              await syncSettings(appData.settings);
              // Also seed managers ONLY IF Supabase has absolutely no managers
              if (data.managers.length === 0 && appData.managers && appData.managers.length > 0) {
                await syncAllLocalDataToSupabase({ ...appData, books: [], members: [], loans: [], visits: [], reservations: [] });
                currentManagers = appData.managers; // Use the seeded ones for this session
              }
            } catch (seedErr) {
              console.warn('Non-critical: failed to seed initial settings/managers:', seedErr);
            }
            showToast('Database Online', 'Supabase terhubung. Database siap digunakan.');
          } else {
            showToast('Database Online', 'Berhasil terhubung & sinkron dengan Supabase.');
          }
          
          // ALWAYS update app state with whatever is in Supabase (or fallback to local settings if null)
          const finalSettings = data.settings || appData.settings;
          setAppData(updateFinesAndStatus({
            books: data.books,
            members: data.members,
            loans: data.loans,
            visits: data.visits,
            reservations: data.reservations,
            settings: finalSettings,
            managers: currentManagers,
          }));
          
          setDbError(null);
        }
      } catch (err: any) {
        const errDetail = err?.message || err?.code || JSON.stringify(err);
        console.error('Failed to load data from Supabase:', errDetail);
        setDbError(`FETCH_FAILED: ${errDetail}`);
      }
    }

    loadData();
  }, []);

  const { books, members, loans, visits, reservations, settings: rawSettings, managers } = appData;

  const settings = useMemo(() => {
    const headManager = managers.find(
      (m) =>
        m.position.toLowerCase().includes('kepala perpustakaan') ||
        m.position.toLowerCase().includes('kepala perpus')
    );
    return {
      ...rawSettings,
      head_librarian: headManager ? headManager.name : rawSettings.head_librarian,
    };
  }, [rawSettings, managers]);

  const isSupabaseConnected = getSupabase() !== null;

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
  const handleAddBook = async (newBookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...newBookData,
      id: `BOK-${String(books.length + 1).padStart(3, '0')}`,
    };
    try {
      await syncBook(newBook);
      setAppData((prev) => ({
        ...prev,
        books: [newBook, ...prev.books],
      }));
      showToast('Buku Ditambahkan', `Buku "${newBook.title}" telah didaftarkan.`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleUpdateBook = async (updatedBook: Book) => {
    try {
      await syncBook(updatedBook);
      setAppData((prev) => ({
        ...prev,
        books: prev.books.map((b) => (b.id === updatedBook.id ? updatedBook : b)),
      }));
      showToast('Buku Diperbarui', `Data buku "${updatedBook.title}" berhasil diubah.`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  // Mark QR codes as printed for selected books (qr_printed_count = book.stock)
  const handleMarkQrPrinted = async (bookIds: string[]) => {
    const updated: Book[] = [];
    setAppData((prev) => {
      const newBooks = prev.books.map((b) => {
        if (bookIds.includes(b.id)) {
          const u = { ...b, qr_printed_count: b.stock };
          updated.push(u);
          return u;
        }
        return b;
      });
      return { ...prev, books: newBooks };
    });
    // Sync each updated book to Supabase if connected
    for (const book of updated) {
      try { await syncBook(book); } catch { /* offline ok */ }
    }
    showToast('QR Tercetak', `Status ${bookIds.length} buku diperbarui: QR sudah tercetak semua eksemplar.`);
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBookFromSupabase(id);
      setAppData((prev) => ({
        ...prev,
        books: prev.books.filter((b) => b.id !== id),
      }));
      showToast('Buku Dihapus', 'Buku telah dihapus dari koleksi.', 'info');
    } catch (err: any) {
      showToast('Gagal Hapus Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleAddMember = async (newMemberData: Omit<Member, 'id' | 'registered_at'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: `MEM-${String(members.length + 1).padStart(3, '0')}`,
      registered_at: new Date().toISOString().split('T')[0],
    };
    try {
      await syncMember(newMember);
      setAppData((prev) => ({
        ...prev,
        members: [newMember, ...prev.members],
      }));
      showToast('Anggota Terdaftar', `Anggota "${newMember.name}" berhasil ditambahkan.`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleImportMembers = async (newMembersList: Omit<Member, 'id' | 'registered_at'>[]) => {
    try {
      const startLength = members.length;
      const preparedMembers: Member[] = newMembersList.map((m, idx) => ({
        ...m,
        id: `MEM-${String(startLength + idx + 1).padStart(3, '0')}`,
        registered_at: new Date().toISOString().split('T')[0],
      }));

      for (const m of preparedMembers) {
        await syncMember(m);
      }

      setAppData((prev) => ({
        ...prev,
        members: [...preparedMembers, ...prev.members],
      }));

      showToast('Impor Anggota', `Berhasil mengimpor ${preparedMembers.length} anggota baru!`);
    } catch (err: any) {
      showToast('Gagal Impor', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    try {
      await syncMember(updatedMember);
      setAppData((prev) => ({
        ...prev,
        members: prev.members.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
      }));
      showToast('Anggota Diperbarui', `Data anggota "${updatedMember.name}" telah diubah.`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteMemberFromSupabase(id);
      setAppData((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
      }));
      showToast('Anggota Dihapus', 'Data anggota telah dihapus.', 'info');
    } catch (err: any) {
      showToast('Gagal Hapus Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleDeleteMembers = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await deleteMemberFromSupabase(id);
      }
      setAppData((prev) => ({
        ...prev,
        members: prev.members.filter((m) => !ids.includes(m.id)),
      }));
      showToast('Anggota Dihapus', `${ids.length} data anggota telah dihapus.`, 'info');
    } catch (err: any) {
      showToast('Gagal Hapus Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleAddManager = async (newManager: Manager) => {
    try {
      await syncManager(newManager);
      setAppData((prev) => ({
        ...prev,
        managers: [newManager, ...prev.managers],
      }));
      showToast('Pengelola Ditambahkan', `Akun "${newManager.name}" telah didaftarkan.`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleUpdateManager = async (updatedManager: Manager) => {
    try {
      await syncManager(updatedManager);
      setAppData((prev) => ({
        ...prev,
        managers: prev.managers.map((m) => (m.id === updatedManager.id ? updatedManager : m)),
      }));
      showToast('Pengelola Diperbarui', `Akses pengelola "${updatedManager.name}" telah diubah.`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleDeleteManager = async (id: string) => {
    try {
      await deleteManagerFromSupabase(id);
      setAppData((prev) => ({
        ...prev,
        managers: prev.managers.filter((m) => m.id !== id),
      }));
      showToast('Pengelola Dihapus', 'Akun pengelola telah dihapus dari sistem.', 'info');
    } catch (err: any) {
      showToast('Gagal Hapus Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleAddLoan = async (newLoanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...newLoanData,
      id: `PIN-${new Date().getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`,
    };

    const updatedBooks = books.map((b) => {
      if (b.id === newLoan.book_id) {
        const updated = { ...b, available_stock: Math.max(0, b.available_stock - 1) };
        syncBook(updated).catch((e) => console.error('Failed to sync book stock', e));
        return updated;
      }
      return b;
    });

    try {
      await syncLoan(newLoan);
      setAppData((prev) => ({
        ...prev,
        loans: [newLoan, ...prev.loans],
        books: updatedBooks,
      }));
      showToast('Peminjaman Berhasil', `Transaksi ${newLoan.id} telah dicatat.`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleReturnBook = async (loanId: string, returnDate: string, fineAmount: number) => {
    const loanToReturn = loans.find((l) => l.id === loanId);
    if (!loanToReturn) return;

    const updatedLoan = {
      ...loanToReturn,
      status: 'Dikembalikan' as const,
      return_date: returnDate,
      fine_amount: fineAmount,
    };

    const updatedBooks = books.map((b) => {
      if (b.id === loanToReturn.book_id) {
        const updated = { ...b, available_stock: b.available_stock + 1 };
        syncBook(updated).catch((e) => console.error('Failed to sync book stock', e));
        return updated;
      }
      return b;
    });

    try {
      await syncLoan(updatedLoan);
      setAppData((prev) => ({
        ...prev,
        loans: prev.loans.map((l) => (l.id === loanId ? updatedLoan : l)),
        books: updatedBooks,
      }));
      showToast('Pengembalian Dicatat', 'Buku telah dikembalikan dan stok diperbarui.');
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleExtendLoan = async (loanId: string, newDueDate: string) => {
    const loanToExtend = loans.find((l) => l.id === loanId);
    if (!loanToExtend) return;

    const updatedLoan = {
      ...loanToExtend,
      due_date: newDueDate,
      extensions_count: (loanToExtend.extensions_count || 0) + 1,
      status: 'Dipinjam' as const,
    };

    try {
      await syncLoan(updatedLoan);
      setAppData((prev) => ({
        ...prev,
        loans: prev.loans.map((l) => (l.id === loanId ? updatedLoan : l)),
      }));
      showToast('Masa Pinjam Diperpanjang', `Jatuh tempo baru: ${newDueDate}`);
    } catch (err: any) {
      showToast('Gagal Perpanjang Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleAddVisit = async (newVisitData: Omit<Visit, 'id'>) => {
    const newVisit: Visit = {
      ...newVisitData,
      id: `VIS-${String(visits.length + 1).padStart(3, '0')}`,
    };
    try {
      await syncVisit(newVisit);
      setAppData((prev) => ({
        ...prev,
        visits: [newVisit, ...prev.visits],
      }));
      showToast('Kehadiran Dicatat', `Terima kasih atas kunjungan ${newVisit.visitor_name}`);
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleAddReservation = async (
    resData: Omit<Reservation, 'id' | 'status' | 'reservation_date'>
  ) => {
    const newRes: Reservation = {
      ...resData,
      id: `RES-${String(reservations.length + 1).padStart(3, '0')}`,
      status: 'Menunggu',
      reservation_date: new Date().toISOString().split('T')[0],
    };
    try {
      await syncReservation(newRes);
      setAppData((prev) => ({
        ...prev,
        reservations: [newRes, ...prev.reservations],
      }));
      showToast('Reservasi Terkirim', 'Permintaan reservasi Anda telah terdaftar.');
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleUpdateReservationStatus = async (id: string, status: Reservation['status']) => {
    const resToUpdate = reservations.find((r) => r.id === id);
    if (!resToUpdate) return;

    const updatedRes = { ...resToUpdate, status };

    try {
      await syncReservation(updatedRes);
      setAppData((prev) => ({
        ...prev,
        reservations: prev.reservations.map((r) => (r.id === id ? updatedRes : r)),
      }));
      showToast('Status Reservasi', `Reservasi diubah menjadi "${status}".`);
    } catch (err: any) {
      showToast('Gagal Perbarui Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleSaveSettings = async (newSettings: LibrarySettings) => {
    try {
      await syncSettings(newSettings);
      setAppData((prev) => updateFinesAndStatus({ ...prev, settings: newSettings }));
      showToast('Pengaturan Disimpan', 'Identitas & aturan sirkulasi telah diperbarui.');
    } catch (err: any) {
      showToast('Gagal Simpan Database', err.message || 'Terjadi kesalahan.', 'info');
    }
  };

  const handleResetData = async () => {
    const fresh = resetToDefaultData();
    try {
      const client = getSupabase();
      if (client) {
        await syncAllLocalDataToSupabase(fresh);
      }
      setAppData(fresh);
      showToast('Data Direset', 'Semua data dikembalikan ke data awal MTs KH A Wahab Muhsin.', 'info');
    } catch (err: any) {
      console.error(err);
      setAppData(fresh);
      showToast('Data Direset Lokal', 'Gagal reset online, reset lokal berhasil.', 'info');
    }
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

  const getInitials = (name: string) => {
    if (!name) return 'AP';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('mts_library_admin_authenticated');
    setCurrentManagerEmail('');
    localStorage.removeItem('mts_library_current_manager_email');
    setActiveMode('public');
    showToast('Petugas Keluar', 'Anda telah keluar dari portal admin.', 'info');
  };

  if (!isSupabaseConnected || dbError) {
    const errorConfig: Record<string, { title: string; desc: string; steps: string[] }> = {
      'NOT_CONNECTED': {
        title: 'Database Tidak Terhubung',
        desc: 'Koneksi ke database Cloud Supabase belum dikonfigurasi. Mode lokal dinonaktifkan untuk production.',
        steps: [
          'Buka file .env di root folder proyek, atau Environment Variables di Vercel.',
          'Masukkan VITE_SUPABASE_URL (contoh: https://xxxxx.supabase.co)',
          'Masukkan VITE_SUPABASE_ANON_KEY (contoh: eyJhbG...)',
          'Jika di Vercel, lakukan Redeploy setelah menambahkan variabel.',
        ],
      },
      'TABLES_NOT_CREATED': {
        title: 'Tabel Database Belum Dibuat',
        desc: 'Koneksi ke Supabase berhasil, tetapi tabel-tabel yang dibutuhkan belum ada di database.',
        steps: [
          'Buka Supabase Dashboard → SQL Editor.',
          'Copy seluruh isi file supabase_schema.sql dari proyek Anda.',
          'Paste dan klik Run di SQL Editor.',
          'Refresh halaman ini setelah tabel berhasil dibuat.',
        ],
      },
      'RLS_BLOCKING': {
        title: 'Akses Database Diblokir (RLS)',
        desc: 'Row Level Security (RLS) di Supabase memblokir akses dari aplikasi. Anon key tidak memiliki izin.',
        steps: [
          'Buka Supabase Dashboard → SQL Editor.',
          'Jalankan perintah: ALTER TABLE books DISABLE ROW LEVEL SECURITY;',
          'Ulangi untuk semua tabel: members, loans, visits, reservations, settings, managers.',
          'Atau jalankan ulang file supabase_schema.sql yang sudah termasuk perintah disable RLS.',
        ],
      },
      'INVALID_KEY': {
        title: 'API Key Supabase Tidak Valid',
        desc: 'Anon Key yang digunakan salah atau tidak cocok dengan URL project Supabase Anda.',
        steps: [
          'Buka Supabase Dashboard → Project Settings → API.',
          'Salin Project URL dan anon (public) key yang benar.',
          'Perbarui VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Environment Variables.',
          'Jika di Vercel, lakukan Redeploy setelah mengubah variabel.',
        ],
      },
    };

    const errKey = dbError?.startsWith('FETCH_FAILED') ? 'FETCH_FAILED' : (dbError || 'NOT_CONNECTED');
    const config = errorConfig[errKey] || {
      title: 'Gagal Memuat Database',
      desc: dbError?.replace('FETCH_FAILED: ', '') || 'Terjadi kesalahan saat menghubungi Supabase. Pastikan URL dan Key sudah benar, serta tabel sudah dibuat dan RLS sudah dinonaktifkan.',
      steps: [
        'Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah benar.',
        'Pastikan tabel sudah dibuat dengan menjalankan supabase_schema.sql di SQL Editor.',
        'Pastikan RLS sudah dinonaktifkan untuk semua tabel.',
        'Jika di Vercel, pastikan sudah Redeploy setelah mengubah Environment Variables.',
      ],
    };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight leading-tight">{config.title}</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {config.desc}
            </p>
          </div>

          <div className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 text-left text-[11px] text-slate-400 space-y-2 font-medium leading-relaxed">
            <p className="font-bold text-slate-200">Cara Memperbaiki:</p>
            <ol className="list-decimal pl-4 space-y-1">
              {config.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          {dbError && dbError.startsWith('FETCH_FAILED') && (
            <div className="w-full bg-rose-950/30 border border-rose-900/30 rounded-2xl p-3 text-left">
              <p className="text-[10px] font-bold text-rose-400 mb-1">Detail Error:</p>
              <p className="text-[9px] text-rose-300/70 font-mono break-all leading-relaxed">
                {dbError.replace('FETCH_FAILED: ', '')}
              </p>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer"
          >
            Coba Lagi (Refresh)
          </button>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Perpustakaan Digital MTs KH A Wahab Muhsin
          </p>
        </div>
      </div>
    );
  }

  if (activeMode === 'public') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
        {/* Top Navbar */}
        <Navbar
          settings={settings}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogoutAdmin={handleLogoutAdmin}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <PublicCatalog
            books={books}
            members={members}
            loans={loans}
            settings={settings}
            onAddReservation={handleAddReservation}
            onOpenMemberCard={(m) => setSelectedMemberCard(m)}
          />
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
          managers={managers}
          onLoginSuccess={(email) => {
            setIsAdminAuthenticated(true);
            localStorage.setItem('mts_library_admin_authenticated', 'true');
            setCurrentManagerEmail(email);
            localStorage.setItem('mts_library_current_manager_email', email);
            setActiveMode('admin');
            showToast('Login Berhasil', `Selamat bertugas, ${email}`);
          }}
        />

        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
          books={books}
          members={members}
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

  // Admin Portal Layout - Fullscreen Layout with responsive sidebar (desktop side / mobile drawer) and bottom navigation
  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden animate-in fade-in duration-300">
      {/* Sidebar on left - Desktop only */}
      <div className={`hidden lg:flex h-screen sticky top-0 border-r border-slate-200 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <Sidebar
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          counts={counts}
          settings={settings}
          onLogout={handleLogoutAdmin}
          onBackToLanding={() => setActiveMode('public')}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Sidebar Drawer on left - Mobile only */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          {/* Drawer Panel */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Close Button inside drawer */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer z-50"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              counts={counts}
              settings={settings}
              onLogout={() => {
                handleLogoutAdmin();
                setIsMobileSidebarOpen(false);
              }}
              onBackToLanding={() => {
                setActiveMode('public');
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area on right - scrollable */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-4 sm:p-8 space-y-5 pb-24 lg:pb-8">
        {/* Global Admin Header Bar (Mockup Style) */}
        <div className="flex items-center justify-between gap-4 shrink-0 bg-white lg:bg-transparent -mx-4 -mt-4 lg:mx-0 lg:mt-0 p-4 lg:p-0 border-b lg:border-none border-slate-250/60">
          {/* Left Side: Desktop Date Badge or Mobile Hamburger + Brand */}
          <div className="flex items-center gap-3.5">
            {/* Hamburger Menu on Mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Name on Mobile */}
            <span className="lg:hidden font-black text-slate-800 tracking-tight text-[15px] uppercase">
              {settings.school_name ? settings.school_name.replace('MTs KH A ', '') : 'ESKAHADE'}
            </span>

            {/* Date Badge (Desktop only) */}
            <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs w-fit">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700 capitalize">{currentDateFormatted}</span>
            </div>
          </div>

          {/* Right Side: Notification Bell & Profile Pill */}
          <div className="flex items-center gap-2.5">
            {/* Database Connection Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-extrabold select-none transition-all duration-300 shadow-3xs ${
              isSupabaseConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                : 'bg-amber-50 text-amber-700 border-amber-200/60 animate-pulse'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-600' : 'bg-amber-600 animate-ping'}`} />
              <span className="hidden sm:inline">
                {isSupabaseConnected ? 'Supabase Terhubung' : 'Database Lokal (Belum Sinkron)'}
              </span>
              <span className="sm:hidden">
                {isSupabaseConnected ? 'Cloud' : 'Lokal'}
              </span>
            </div>

            {/* Notification Bell */}
            <button className="w-9 h-9 lg:w-10 lg:h-10 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-3xs text-slate-500 hover:text-slate-800 transition-all relative cursor-pointer">
              <Bell className="w-4 h-4" />
              {counts.overdueLoans > 0 && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            {/* Profile Avatar Initials Circle (Mobile only) */}
            <div className="lg:hidden w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-250 shrink-0">
              {getInitials(settings.head_librarian || 'Ayu')}
            </div>

            {/* Profile Pill (Desktop only) */}
            <div className="hidden lg:flex items-center gap-3 bg-white p-1.5 pr-4 pl-3 rounded-2xl border border-slate-200/80 shadow-3xs">
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[120px]">
                  {settings.head_librarian || 'Ayu Siti Fatimah'}
                </p>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Kepala Perpus</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                {getInitials(settings.head_librarian || 'Ayu')}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Views */}
        <div className="flex-1 min-w-0">
          {adminTab === 'menu' && (
            <MenuView
              books={books}
              members={members}
              loans={loans}
              visits={visits}
              settings={settings}
              onNavigateTab={(t) => setAdminTab(t)}
              onOpenNewLoan={() => setIsLoanModalOpen(true)}
              isSupabaseConnected={isSupabaseConnected}
            />
          )}

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
              books={books.filter(b => b.category !== 'Laptop')}
              settings={settings}
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
              onOpenBarcodeModal={setSelectedBookBarcode}
              onMarkQrPrinted={handleMarkQrPrinted}
            />
          )}

          {adminTab === 'laptops' && (
            <LaptopsManagementView
              laptops={books.filter(b => b.category === 'Laptop')}
              settings={settings}
              onAddLaptop={handleAddBook}
              onUpdateLaptop={handleUpdateBook}
              onDeleteLaptop={handleDeleteBook}
              onOpenBarcodeModal={setSelectedBookBarcode}
              onMarkQrPrinted={handleMarkQrPrinted}
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
              onDeleteMembers={handleDeleteMembers}
              onOpenMemberCard={(m) => setSelectedMemberCard(m)}
              onImportMembers={handleImportMembers}
            />
          )}

          {adminTab === 'loans' && (
            <CirculationView
              loans={loans}
              books={books}
              members={members}
              settings={settings}
              onAddLoan={handleAddLoan}
              onAddVisit={handleAddVisit}
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
              onSyncToSupabase={async () => {
                await syncAllLocalDataToSupabase(appData);
                showToast('Sinkronisasi Berhasil', 'Seluruh data lokal telah diunggah ke Supabase.');
              }}
            />
          )}

          {adminTab === 'managers' && (
            <ManagersManagementView
              managers={managers || []}
              settings={settings}
              onAddManager={handleAddManager}
              onUpdateManager={handleUpdateManager}
              onDeleteManager={handleDeleteManager}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile Tab Bar) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/80 z-40 lg:hidden flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] pb-safe">
        {/* Tab 1: Koleksi */}
        <button
          onClick={() => setAdminTab('books')}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            adminTab === 'books' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate w-full text-center">Koleksi</span>
        </button>

        {/* Tab 2: Anggota */}
        <button
          onClick={() => setAdminTab('members')}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            adminTab === 'members' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <Users className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate w-full text-center">Anggota</span>
        </button>

        {/* Tab 3: Centered Floating MENU button */}
        <div className="relative w-16 h-full flex items-center justify-center -mt-6">
          <button
            onClick={() => setAdminTab('menu')}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-4 ring-slate-50 ${
              adminTab === 'menu'
                ? 'bg-emerald-600 text-white shadow-emerald-250'
                : 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-emerald-100'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className={`absolute bottom-1.5 text-[9px] tracking-tight font-bold ${
            adminTab === 'menu' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 font-bold'
          }`}>
            MENU
          </span>
        </div>

        {/* Tab 4: Sirkulasi */}
        <button
          onClick={() => setAdminTab('loans')}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            adminTab === 'loans' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <Repeat className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate w-full text-center">Sirkulasi</span>
        </button>

        {/* Tab 5: Absensi */}
        <button
          onClick={() => setAdminTab('visits')}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            adminTab === 'visits' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <UserCheck className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate w-full text-center">Absensi</span>
        </button>
      </div>

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

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        managers={managers}
        onLoginSuccess={(email) => {
          setIsAdminAuthenticated(true);
          localStorage.setItem('mts_library_admin_authenticated', 'true');
          setCurrentManagerEmail(email);
          localStorage.setItem('mts_library_current_manager_email', email);
          setActiveMode('admin');
          setAdminTab('menu');
          showToast('Login Berhasil', `Selamat bertugas, ${email}`);
        }}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        books={books}
        members={members}
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
    </div>
  );
}
