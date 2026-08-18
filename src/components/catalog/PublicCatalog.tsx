import React, { useState, useMemo } from 'react';
import { Book, Member, Loan, BookCategory, Reservation, LibrarySettings } from '../../types';
import { PdfViewerModal } from '../PdfViewerModal';
import {
  Search,
  Filter,
  BookOpen,
  MapPin,
  CheckCircle2,
  XCircle,
  BookmarkCheck,
  UserCheck,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  School,
  AlertCircle,
  FileText,
  Users,
  X,
} from 'lucide-react';

interface PublicCatalogProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  settings: LibrarySettings;
  onAddReservation: (reservation: Omit<Reservation, 'id' | 'status' | 'reservation_date'>) => void;
  onOpenMemberCard: (member: Member) => void;
}

export const PublicCatalog: React.FC<PublicCatalogProps> = ({
  books,
  members,
  loans,
  settings,
  onAddReservation,
  onOpenMemberCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null);
  const [reserveBook, setReserveBook] = useState<Book | null>(null);
  const [selectedPdfBook, setSelectedPdfBook] = useState<Book | null>(null);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'all' | 'new' | 'popular' | 'recommended'>('all');

  // Student loan search state
  const [searchMemberNo, setSearchMemberNo] = useState('');
  const [searchedMemberResult, setSearchedMemberResult] = useState<Member | null>(null);
  const [searchedLoansResult, setSearchedLoansResult] = useState<Loan[]>([]);
  const [hasSearchedLoans, setHasSearchedLoans] = useState(false);

  const searchedActiveLoans = useMemo(() => {
    return searchedLoansResult.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  }, [searchedLoansResult]);

  const searchedHistoryLoans = useMemo(() => {
    return searchedLoansResult.filter((l) => l.status === 'Dikembalikan');
  }, [searchedLoansResult]);

  // Reservation Form state
  const [resName, setResName] = useState('');
  const [resNumber, setResNumber] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resNotes, setResNotes] = useState('');
  const [resSuccessMessage, setResSuccessMessage] = useState<string | null>(null);

  const categoriesList: ('Semua' | BookCategory)[] = [
    'Semua',
    'Agama Islam',
    'Bahasa & Sastra',
    'Matematika & IPA',
    'IPS & Sejarah',
    'Teknologi & Umum',
    'Fiksi & Novel',
    'Kamus & Referensi',
  ];

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm) ||
        book.barcode.includes(searchTerm);

      const matchesCategory =
        selectedCategory === 'Semua' || book.category === selectedCategory;

      const matchesAvailability =
        availabilityFilter === 'all'
          ? true
          : availabilityFilter === 'available'
          ? book.available_stock > 0
          : book.available_stock === 0;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [books, searchTerm, selectedCategory, availabilityFilter]);

  const sortedAndFilteredBooks = useMemo(() => {
    let result = [...filteredBooks];
    if (activeCatalogTab === 'new') {
      result.reverse(); // Show newly added books first
    } else if (activeCatalogTab === 'popular') {
      result.sort((a, b) => (b.stock - b.available_stock) - (a.stock - a.available_stock));
    } else if (activeCatalogTab === 'recommended') {
      result.sort((a, b) => b.available_stock - a.available_stock);
    }
    return result;
  }, [filteredBooks, activeCatalogTab]);

  // Handle student/teacher loan history search
  const handleSearchLoans = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchMemberNo.trim().toLowerCase();
    if (!query) return;

    const member = members.find(
      (m) =>
        m.id.toLowerCase() === query ||
        m.member_number.toLowerCase() === query ||
        m.name.toLowerCase().includes(query)
    );

    if (member) {
      setSearchedMemberResult(member);
      const memberLoans = loans.filter((l) => l.member_id === member.id);
      setSearchedLoansResult(memberLoans);
    } else {
      setSearchedMemberResult(null);
      setSearchedLoansResult([]);
    }
    setHasSearchedLoans(true);
  };

  // Submit reservation
  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveBook || !resName || !resNumber) return;

    onAddReservation({
      book_id: reserveBook.id,
      book_title: reserveBook.title,
      member_name: resName,
      member_number: resNumber,
      contact_phone: resPhone || '-',
      notes: resNotes,
    });

    setResSuccessMessage(`Reservasi buku "${reserveBook.title}" berhasil dikirim! Silakan hubungi petugas perpus saat mengambil.`);
    setTimeout(() => {
      setResSuccessMessage(null);
      setReserveBook(null);
      setResName('');
      setResNumber('');
      setResPhone('');
      setResNotes('');
    }, 2500);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Desktop Hero Banner Section */}
      <div className="relative hidden lg:flex bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-10 lg:p-12 flex-col lg:flex-row items-center gap-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-green-500/5 to-transparent pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        {/* Left Column - Hero Content & Search */}
        <div className="flex-1 space-y-6 relative z-10 w-full text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100/80 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
            Selamat datang di
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Perpustakaan Digital <br />
              <span className="text-emerald-600">MTs KH A Wahab Muhsin</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
              Sumber belajar tanpa batas untuk mendukung prestasi, literasi, dan kecintaan terhadap ilmu pengetahuan.
            </p>
          </div>

          {/* Large Search Input */}
          <div className="max-w-xl bg-white border border-slate-200 shadow-lg shadow-slate-100 rounded-2xl p-1.5 flex items-center gap-2 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari buku, judul, pengarang, penerbit, atau ISBN..."
              className="w-full pl-3 text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-semibold"
            />
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 sm:p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <Search className="w-4.5 h-4.5 sm:w-5 h-5" />
            </button>
          </div>

          {/* Popular Searches Tags */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold text-slate-400">Pencarian populer:</span>
            {['Fiqih', 'Sejarah Islam', 'Bahasa Arab', 'IPA', 'Matematika'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-905 font-bold rounded-lg transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Device Mockup & Stats Cards */}
        <div className="flex-1 relative flex items-center justify-center w-full lg:w-auto">
          {/* Main Illustration mockup */}
          <div className="relative w-full max-w-md aspect-[16/9] lg:aspect-square overflow-hidden rounded-2xl shadow-lg border border-slate-200/80">
            <img
              src="/assets/library_landing_hero.jpg"
              alt="Mockup Aplikasi Perpustakaan Digital"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card 1: Total Books (Floating Top Left) */}
          <div className="absolute top-4 -left-4 sm:-left-8 bg-white border border-slate-100 rounded-2xl p-3 shadow-md flex items-center gap-3 w-36 sm:w-44 animate-bounce-slow">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Koleksi Buku</p>
              <p className="font-extrabold text-sm sm:text-base text-slate-900 leading-none mt-0.5">{books.length}</p>
              <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Total Tersedia</p>
            </div>
          </div>

          {/* Card 2: Total Members (Floating Middle Right) */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 bg-white border border-slate-100 rounded-2xl p-3 shadow-md flex items-center gap-3 w-36 sm:w-44">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Anggota Terdaftar</p>
              <p className="font-extrabold text-sm sm:text-base text-slate-900 leading-none mt-0.5">{members.length}</p>
              <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Siswa & Guru</p>
            </div>
          </div>

          {/* Card 3: Quote Card (Floating Bottom Left) */}
          <div className="absolute -bottom-4 -left-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-md w-60 text-left hidden sm:block">
            <div className="flex gap-2">
              <span className="text-emerald-500 font-serif text-3xl leading-none font-bold">“</span>
              <div>
                <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                  Membaca adalah jendela dunia, belajar adalah kuncinya.
                </p>
                <p className="text-[8px] text-slate-400 font-bold mt-1.5 uppercase">
                  – MTs KH A Wahab Muhsin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mobile Hero Banner Section */}
      <div className="lg:hidden bg-gradient-to-br from-emerald-500/5 via-green-500/10 to-emerald-500/5 border border-emerald-100 rounded-3xl p-5 text-left relative overflow-hidden flex flex-col gap-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-805 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
          Selamat datang di
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Perpustakaan Digital <br />
            <span className="text-emerald-600">MTs KH A Wahab Muhsin</span>
          </h1>
          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
            Temukan buku pelajaran, kitab keagamaan, karya ilmiah, hingga bacaan fiksi secara mudah. Akses dimana saja, kapan saja untuk mendukung prestasi dan literasi Anda.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-[280px] aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
            <img
              src="/assets/library_landing_hero.jpg"
              alt="Mockup Digital"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-1.5 flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari buku, judul, pengarang..."
            className="w-full pl-3 text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 font-semibold"
          />
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Mobile Stats Row (Grid of 3 cards) */}
      <div className="lg:hidden grid grid-cols-3 gap-2.5">
        {/* Card 1: Total Koleksi */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-3xs">
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-left w-full text-center">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wide leading-none">Total Koleksi</span>
            <span className="block text-xs font-black text-slate-900 mt-1 leading-none">
              {books.length.toLocaleString('id-ID')}
            </span>
            <span className="block text-[8px] font-bold text-slate-500 mt-1 leading-none">Buku Tersedia</span>
          </div>
        </div>

        {/* Card 2: Anggota Terdaftar */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-3xs">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-left w-full text-center">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wide leading-none">Anggota</span>
            <span className="block text-xs font-black text-slate-900 mt-1 leading-none">
              {members.length.toLocaleString('id-ID')}
            </span>
            <span className="block text-[8px] font-bold text-slate-500 mt-1 leading-none">Siswa & Guru</span>
          </div>
        </div>

        {/* Card 3: Peminjaman Hari Ini */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-3xs">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left w-full text-center">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wide leading-none">Hari Ini</span>
            <span className="block text-xs font-black text-slate-900 mt-1 leading-none">
              {loans.filter(l => l.loan_date === new Date().toISOString().split('T')[0]).length}
            </span>
            <span className="block text-[8px] font-bold text-slate-500 mt-1 leading-none">Buku Dipinjam</span>
          </div>
        </div>
      </div>

      {/* 4. Mobile Popular Categories Section */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Kategori Populer</h3>
          <button 
            onClick={() => {
              const el = document.getElementById('kategori-katalog');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            { cat: 'Agama Islam', icon: School },
            { cat: 'Bahasa & Sastra', icon: FileText },
            { cat: 'Matematika & IPA', icon: Sparkles },
            { cat: 'IPS & Sejarah', icon: BookOpen },
            { cat: 'Teknologi & Umum', icon: Layers }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedCategory === item.cat;
            return (
              <button
                key={item.cat}
                onClick={() => {
                  setSelectedCategory(item.cat);
                  document.getElementById('koleksi-katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`snap-start shrink-0 w-24 p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${
                  isSelected ? 'bg-emerald-100' : 'bg-slate-50'
                }`}>
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[9px] font-extrabold leading-tight block truncate w-full">{item.cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Mobile Promo Banner */}
      <div className="lg:hidden bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5 flex flex-row items-center justify-between gap-4 text-left shadow-3xs">
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
            Ribuan buku menanti <br /> untuk dibaca!
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Temukan, baca, dan pinjam buku favoritmu dengan mudah.
          </p>
          <button 
            onClick={() => {
              const el = document.getElementById('koleksi-katalog');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua Koleksi</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="w-20 shrink-0 flex items-center justify-center">
          <BookOpen className="w-14 h-14 text-emerald-600 opacity-20" />
        </div>
      </div>

      {/* 6. Desktop Category Grid Section */}
      <div id="kategori-katalog" className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circle Icons grid */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 shadow-2xs rounded-2xl p-6 flex flex-col justify-between">
          <div className="text-left">
            <h3 className="text-[10px] font-extrabold text-slate-400 mb-4 uppercase tracking-widest">
              Pilih Kategori Buku
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      const el = document.getElementById('koleksi-katalog');
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-350 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
                      isSelected ? 'bg-emerald-100' : 'bg-slate-50'
                    }`}>
                      {cat === 'Semua' ? (
                        <Layers className="w-5 h-5 text-emerald-600" />
                      ) : cat === 'Agama Islam' ? (
                        <School className="w-5 h-5 text-emerald-600" />
                      ) : cat === 'Bahasa & Sastra' ? (
                        <FileText className="w-5 h-5 text-emerald-600" />
                      ) : cat === 'Matematika & IPA' ? (
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold leading-tight">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 shadow-2xs rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 text-left">
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight">
              Temukan, baca, dan pinjam buku favoritmu dengan mudah.
            </h3>
            <button 
              onClick={() => {
                const el = document.getElementById('koleksi-katalog');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2 bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Lihat Semua Koleksi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="w-20 shrink-0 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-emerald-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Cek Status Pinjaman Checker Bar */}
      <div id="sirkulasi-checker" className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-3xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Cek Riwayat & Jatuh Tempo Pinjaman Anda
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Masukkan NIS (Siswa) atau NIP (Guru) untuk mengecek buku yang sedang dipinjam.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchLoans} className="flex gap-2 w-full lg:w-auto max-w-md shrink-0">
          <input
            type="text"
            value={searchMemberNo}
            onChange={(e) => setSearchMemberNo(e.target.value)}
            placeholder="Masukkan NIS / NIP..."
            className="flex-grow pl-4 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-3xs"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
          >
            <Clock className="w-4 h-4" />
            <span>Cek Status</span>
          </button>
        </form>
      </div>

      {/* Loan Search Result Box */}
      {hasSearchedLoans && (
        <div className="bg-white border border-slate-200/80 shadow-md rounded-2xl p-6 relative animate-in slide-in-from-top duration-300 text-left">
          <button
            onClick={() => {
              setHasSearchedLoans(false);
              setSearchMemberNo('');
              setSearchedMemberResult(null);
              setSearchedLoansResult([]);
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>

          {searchedMemberResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm">
                  {searchedMemberResult.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{searchedMemberResult.name}</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase">
                    {searchedMemberResult.role} • {searchedMemberResult.member_number} • {searchedMemberResult.class_or_position}
                  </p>
                </div>
              </div>

              {/* Separate Active and History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Loans (Belum Dikembalikan) */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-xs text-rose-700 uppercase tracking-wider flex items-center gap-1.5 bg-rose-50 px-2.5 py-2 rounded-xl border border-rose-100/50">
                    <Clock className="w-3.5 h-3.5" />
                    Belum Dikembalikan ({searchedActiveLoans.length})
                  </h5>
                  {searchedActiveLoans.length > 0 ? (
                    <div className="space-y-3">
                      {searchedActiveLoans.map((loan) => {
                        const isOverdue = loan.status === 'Terlambat';
                        return (
                          <div
                            key={loan.id}
                            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                              isOverdue
                                ? 'bg-rose-50/50 border-rose-250 border-rose-200 text-rose-950 shadow-3xs'
                                : 'bg-amber-50/30 border-amber-200/80 text-amber-950 shadow-3xs'
                            }`}
                          >
                            <div className="min-w-0 space-y-1">
                              <h5 className="font-bold text-xs truncate" title={loan.book_title}>{loan.book_title || 'Buku Tidak Diketahui'}</h5>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                Pinjam: {loan.loan_date} | Batas: <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>{loan.due_date}</span>
                              </p>
                              {isOverdue && loan.fine_amount > 0 && (
                                <p className="text-[10px] text-rose-700 font-extrabold bg-rose-100/50 px-1.5 py-0.5 rounded inline-block mt-1">
                                  Denda: Rp {loan.fine_amount.toLocaleString('id-ID')}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                isOverdue
                                  ? 'bg-rose-600 text-white shadow-3xs'
                                  : 'bg-amber-500 text-white shadow-3xs'
                              }`}
                            >
                              {loan.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      Semua buku telah dikembalikan.
                    </p>
                  )}
                </div>

                {/* Return History (Sudah Dikembalikan) */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 bg-emerald-50 px-2.5 py-2 rounded-xl border border-emerald-100/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Riwayat Selesai ({searchedHistoryLoans.length})
                  </h5>
                  {searchedHistoryLoans.length > 0 ? (
                    <div className="space-y-3">
                      {searchedHistoryLoans.map((loan) => (
                        <div
                          key={loan.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 flex items-center justify-between gap-4 shadow-3xs"
                        >
                          <div className="min-w-0 space-y-1 text-left">
                            <h5 className="font-bold text-xs truncate" title={loan.book_title}>{loan.book_title || 'Buku Tidak Diketahui'}</h5>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              Pinjam: {loan.loan_date} | Kembali: {loan.return_date || '-'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 bg-emerald-100 text-emerald-850">
                            Selesai
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      Belum ada riwayat pengembalian buku.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Anggota Tidak Ditemukan</h4>
              <p className="text-xs text-slate-450 text-slate-400 max-w-sm mx-auto font-medium">
                Kami tidak menemukan nomor anggota atau nama "{searchMemberNo}". Pastikan nomor NIS/NIP yang dimasukkan sudah terdaftar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Catalog Tabs & Sorting Filters */}
      <div id="koleksi-katalog" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-3xs text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all' as const, label: 'Temua Koleksi' },
            { id: 'new' as const, label: 'Terbaru' },
            { id: 'popular' as const, label: 'Terpopuler' },
            { id: 'recommended' as const, label: 'Direkomendasikan' }
          ].map((tab) => {
            const isTabActive = activeCatalogTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCatalogTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Status:</span>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-705 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Koleksi</option>
            <option value="available">Tersedia Saja</option>
            <option value="borrowed">Sedang Dipinjam</option>
          </select>
        </div>
      </div>

      {/* Book Grid Area */}
      {sortedAndFilteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {sortedAndFilteredBooks.map((book) => {
            const isAvailable = book.available_stock > 0;
            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Book Cover */}
                <div className="relative h-52 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedBookDetail(book)}>
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-xs ${
                        isAvailable
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isAvailable ? `Tersedia (${book.available_stock})` : 'Dipinjam Habis'}
                    </span>
                    {book.e_book_url && (
                      <span className="px-2 py-0.5 bg-blue-600/90 text-white rounded-full text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                        <FileText className="w-3 h-3" /> E-Book
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white rounded text-[10px] font-medium">
                      {book.category}
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4
                      onClick={() => setSelectedBookDetail(book)}
                      className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                      title={book.title}
                    >
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium truncate">{book.author}</p>
                    <p className="text-[11px] text-slate-400">{book.publisher} ({book.year})</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-semibold">{book.shelf_location}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedBookDetail(book)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Detail Buku
                      </button>
                      <button
                        onClick={() => setReserveBook(book)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                        title="Reservasi Buku"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700">Tidak ada buku yang cocok</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan kategori & status ketersediaan.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Semua');
              setAvailabilityFilter('all');
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBookDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-xl w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">Detail Koleksi Buku</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-450 text-slate-400 font-bold mt-1.5">Informasi buku perpustakaan</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookDetail(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <img
                  src={selectedBookDetail.cover_url}
                  alt={selectedBookDetail.title}
                  className="w-full h-56 object-cover rounded-2xl shadow-md border border-slate-200"
                />
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center space-y-1 shadow-3xs">
                  <div className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider">Status Stok</div>
                  <div className="text-xs font-black text-emerald-950">
                    {selectedBookDetail.available_stock} dari {selectedBookDetail.stock} Buku
                  </div>
                  <div className="text-[9px] text-emerald-700 font-bold">
                    {selectedBookDetail.available_stock > 0 ? 'Tersedia Dipinjam' : 'Sedang Habis Dipinjam'}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                    {selectedBookDetail.category}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-2 leading-snug">{selectedBookDetail.title}</h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Pengarang: {selectedBookDetail.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-150 shadow-3xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Penerbit</span>
                    <span className="font-bold text-slate-800 text-[11px]">{selectedBookDetail.publisher}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Tahun Terbit</span>
                    <span className="font-bold text-slate-800 text-[11px]">{selectedBookDetail.year}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Nomor ISBN</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{selectedBookDetail.isbn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Lokasi Rak</span>
                    <span className="font-black text-emerald-700 text-[11px]">{selectedBookDetail.shelf_location}</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-[11px] font-extrabold text-slate-800 mb-1 uppercase tracking-wider">Deskripsi Ringkas</h5>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {selectedBookDetail.description || 'Belum ada deskripsi tambahan untuk koleksi ini.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                  {selectedBookDetail.e_book_url && (
                    <button
                      onClick={() => {
                        const bookToRead = selectedBookDetail;
                        setSelectedBookDetail(null);
                        setSelectedPdfBook(bookToRead);
                      }}
                      className="flex-1 min-w-[120px] py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Baca E-Book</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const bookToReserve = selectedBookDetail;
                      setSelectedBookDetail(null);
                      setReserveBook(bookToReserve);
                    }}
                    className="flex-1 min-w-[120px] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Reservasi Buku</span>
                  </button>
                  <button
                    onClick={() => setSelectedBookDetail(null)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-extrabold rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Reservation Modal */}
      {reserveBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">Reservasi Buku</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-450 text-slate-400 font-bold mt-1.5">Pesan buku perpustakaan secara mandiri</p>
                </div>
              </div>
              <button
                onClick={() => setReserveBook(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReservationSubmit} className="p-6 space-y-4">
              {resSuccessMessage ? (
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs text-center space-y-2.5 shadow-3xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-extrabold text-sm">{resSuccessMessage}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 shadow-3xs">
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Judul Buku Yang Direservasi:</span>
                    <div className="font-extrabold text-slate-900 text-sm">{reserveBook.title}</div>
                    <div className="text-[10px] text-emerald-700 font-extrabold">Rak: {reserveBook.shelf_location}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Nama Lengkap (Siswa / Guru) *
                    </label>
                    <input
                      type="text"
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      placeholder="Contoh: Muhammad Rayhan"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      NIS (Siswa) atau NIP (Guru) *
                    </label>
                    <input
                      type="text"
                      value={resNumber}
                      onChange={(e) => setResNumber(e.target.value)}
                      placeholder="Contoh: 20237001"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      No. HP / WhatsApp (Aktif)
                    </label>
                    <input
                      type="text"
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={resNotes}
                      onChange={(e) => setResNotes(e.target.value)}
                      placeholder="Tulis rencana tanggal pengambilan buku..."
                      rows={2}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReserveBook(null)}
                      className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
                    >
                      Kirim Reservasi
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Pdf Viewer Modal */}
      <PdfViewerModal
        isOpen={!!selectedPdfBook}
        onClose={() => setSelectedPdfBook(null)}
        book={selectedPdfBook}
      />
    </div>
  );
};
