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

  // Student loan search state
  const [searchMemberNo, setSearchMemberNo] = useState('');
  const [searchedMemberResult, setSearchedMemberResult] = useState<Member | null>(null);
  const [searchedLoansResult, setSearchedLoansResult] = useState<Loan[]>([]);
  const [hasSearchedLoans, setHasSearchedLoans] = useState(false);

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

  // Handle student loan history search
  const handleSearchLoans = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchMemberNo.trim()) return;

    const member = members.find(
      (m) =>
        m.member_number.toLowerCase() === searchMemberNo.trim().toLowerCase() ||
        m.name.toLowerCase().includes(searchMemberNo.trim().toLowerCase())
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
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-800 via-emerald-700 to-green-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <BookOpen className="w-96 h-96" />
        </div>

        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
            <School className="w-3.5 h-3.5 text-emerald-300" />
            Katalog Publik {settings.school_name}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Cari & Cek Ketersediaan Buku Koleksi Perpustakaan
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Temukan buku pelajaran, kitab keagamaan, karya ilmiah, hingga buku bacaan fiksi secara mudah. Cek status ketersediaan di rak secara real-time.
          </p>
        </div>

        {/* Quick Search Bar */}
        <div className="mt-6 relative z-10 max-w-xl">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik judul buku, pengarang, penerbit, atau ISBN..."
              className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 rounded-2xl shadow-lg border border-emerald-200 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-400/30 font-medium placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Bersihkan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student Self-Service Box (Cek Pinjaman Sendiri) */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Cek Riwayat & Jatuh Tempo Pinjaman Anda
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan NIS (Siswa) atau NIP (Guru) untuk mengecek buku yang sedang dipinjam
            </p>
          </div>

          <form onSubmit={handleSearchLoans} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchMemberNo}
              onChange={(e) => setSearchMemberNo(e.target.value)}
              placeholder="Masukkan NIS / NIP..."
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold rounded-xl hover:from-green-700 hover:to-emerald-600 shadow-xs shrink-0"
            >
              Cek Status
            </button>
          </form>
        </div>

        {/* Loan Search Result */}
        {hasSearchedLoans && (
          <div className="animate-in fade-in duration-200 pt-2">
            {searchedMemberResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={searchedMemberResult.photo_url}
                      alt={searchedMemberResult.name}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                    />
                    <div>
                      <div className="font-bold text-xs text-emerald-950">
                        {searchedMemberResult.name} ({searchedMemberResult.member_number})
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        {searchedMemberResult.class_or_position} • {searchedMemberResult.role.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenMemberCard(searchedMemberResult)}
                    className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-100"
                  >
                    Lihat Kartu Anggota
                  </button>
                </div>

                {searchedLoansResult.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchedLoansResult.map((loan) => (
                      <div
                        key={loan.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          loan.status === 'Terlambat'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : loan.status === 'Dipinjam'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="flex justify-between items-start font-bold">
                          <span className="line-clamp-1">{loan.book_title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                              loan.status === 'Terlambat'
                                ? 'bg-rose-600 text-white'
                                : loan.status === 'Dipinjam'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/50">
                          <span>Tgl Pinjam: {loan.loan_date}</span>
                          <span>Jatuh Tempo: <strong>{loan.due_date}</strong></span>
                        </div>
                        {loan.fine_amount > 0 && (
                          <div className="text-rose-700 font-bold text-xs bg-white/60 p-1.5 rounded border border-rose-200">
                            Estimasi Denda Keterlambatan: Rp {loan.fine_amount.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Tidak ada transaksi peminjaman aktif untuk anggota ini.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Anggota dengan NIS/NIP "{searchMemberNo}" tidak ditemukan. Silakan periksa kembali nomor Anda.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Pills & Availability Selector */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500">Status:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Koleksi</option>
              <option value="available">Tersedia Saja</option>
              <option value="borrowed">Sedang Dipinjam</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <strong>{filteredBooks.length}</strong> dari total {books.length} koleksi buku
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredBooks.map((book) => {
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Detail Koleksi Perpustakaan
              </span>
              <button
                onClick={() => setSelectedBookDetail(null)}
                className="p-1 rounded-full hover:bg-white/20 text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <img
                  src={selectedBookDetail.cover_url}
                  alt={selectedBookDetail.title}
                  className="w-full h-56 object-cover rounded-xl shadow-md border border-slate-200"
                />
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Status Stok</div>
                  <div className="text-sm font-extrabold text-emerald-950">
                    {selectedBookDetail.available_stock} dari {selectedBookDetail.stock} Eksemplar
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    {selectedBookDetail.available_stock > 0 ? 'Tersedia Dipinjam' : 'Sedang Habis Dipinjam'}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    {selectedBookDetail.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedBookDetail.title}</h3>
                  <p className="text-xs font-medium text-slate-500">Pengarang: {selectedBookDetail.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Penerbit</span>
                    <span className="font-semibold text-slate-800">{selectedBookDetail.publisher}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tahun Terbit</span>
                    <span className="font-semibold text-slate-800">{selectedBookDetail.year}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor ISBN</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedBookDetail.isbn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lokasi Rak</span>
                    <span className="font-bold text-emerald-700">{selectedBookDetail.shelf_location}</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-800 mb-1">Deskripsi Ringkas</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedBookDetail.description || 'Belum ada deskripsi tambahan untuk koleksi ini.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3">
                  {selectedBookDetail.e_book_url && (
                    <button
                      onClick={() => {
                        const bookToRead = selectedBookDetail;
                        setSelectedBookDetail(null);
                        setSelectedPdfBook(bookToRead);
                      }}
                      className="flex-1 min-w-[140px] py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2"
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
                    className="flex-1 min-w-[140px] py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Reservasi Buku Ini</span>
                  </button>
                  <button
                    onClick={() => setSelectedBookDetail(null)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100"
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-700 to-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">Form Reservasi Buku</h3>
              </div>
              <button
                onClick={() => setReserveBook(null)}
                className="p-1 rounded-full hover:bg-white/20 text-emerald-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReservationSubmit} className="p-5 space-y-4">
              {resSuccessMessage ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold">{resSuccessMessage}</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="text-slate-400 text-[10px] block">Judul Buku Yang Direservasi:</span>
                    <div className="font-bold text-slate-900">{reserveBook.title}</div>
                    <div className="text-[11px] text-emerald-700">Rak: {reserveBook.shelf_location}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap (Siswa / Guru) *
                    </label>
                    <input
                      type="text"
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      placeholder="Contoh: Muhammad Rayhan"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NIS (Siswa) atau NIP (Guru) *
                    </label>
                    <input
                      type="text"
                      value={resNumber}
                      onChange={(e) => setResNumber(e.target.value)}
                      placeholder="Contoh: 20237001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      No. HP / WhatsApp (Aktif)
                    </label>
                    <input
                      type="text"
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={resNotes}
                      onChange={(e) => setResNotes(e.target.value)}
                      placeholder="Rencana tanggal pengambil..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReserveBook(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
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
