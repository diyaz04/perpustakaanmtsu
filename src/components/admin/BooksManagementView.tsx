import React, { useState, useMemo } from 'react';
import { Book, BookCategory, LibrarySettings } from '../../types';
import { ImageUploader } from '../ImageUploader';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Barcode as BarcodeIcon,
  BookOpen,
  Filter,
  CheckCircle2,
  XCircle,
  MapPin,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface BooksManagementViewProps {
  books: Book[];
  settings: LibrarySettings;
  onAddBook: (book: Omit<Book, 'id'>) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onOpenBarcodeModal: (book: Book) => void;
}

export const BooksManagementView: React.FC<BooksManagementViewProps> = ({
  books,
  settings,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onOpenBarcodeModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState(2023);
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState<BookCategory>('Agama Islam');
  const [stock, setStock] = useState(10);
  const [availableStock, setAvailableStock] = useState(10);
  const [shelfLocation, setShelfLocation] = useState('Rak A-01 (Fiqih)');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [eBookUrl, setEBookUrl] = useState('');

  const categories: BookCategory[] = [
    'Agama Islam',
    'Bahasa & Sastra',
    'Matematika & IPA',
    'IPS & Sejarah',
    'Teknologi & Umum',
    'Fiksi & Novel',
    'Kamus & Referensi',
  ];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn.includes(searchTerm) ||
        b.barcode.includes(searchTerm);
      const matchCat = selectedCategory === 'Semua' || b.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [books, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setPublisher('');
    setYear(new Date().getFullYear());
    setIsbn(`978-602-${Math.floor(100000 + Math.random() * 900000)}`);
    setCategory('Agama Islam');
    setStock(10);
    setAvailableStock(10);
    setShelfLocation('Rak A-01 (Agama)');
    setCoverUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500');
    setDescription('');
    setEBookUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher);
    setYear(book.year);
    setIsbn(book.isbn);
    setCategory(book.category);
    setStock(book.stock);
    setAvailableStock(book.available_stock);
    setShelfLocation(book.shelf_location);
    setCoverUrl(book.cover_url);
    setDescription(book.description || '');
    setEBookUrl(book.e_book_url || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeNumber = isbn.replace(/[^0-9]/g, '') || `${Date.now()}`;

    if (editingBook) {
      onUpdateBook({
        ...editingBook,
        title,
        author,
        publisher,
        year,
        isbn,
        category,
        stock,
        available_stock: availableStock,
        shelf_location: shelfLocation,
        cover_url: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
        barcode: barcodeNumber,
        description,
        e_book_url: eBookUrl,
      });
    } else {
      onAddBook({
        title,
        author,
        publisher,
        year,
        isbn,
        category,
        stock,
        available_stock: availableStock,
        shelf_location: shelfLocation,
        cover_url: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
        barcode: barcodeNumber,
        description,
        e_book_url: eBookUrl,
        created_at: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Manajemen Koleksi Buku Perpustakaan
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data buku, nomor ISBN, stok eksemplar, dan cetak label rak barcode
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
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
            placeholder="Cari judul, pengarang, ISBN, atau barcode..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Sampul & Judul Buku</th>
                <th className="py-3.5 px-4">Pengarang & Penerbit</th>
                <th className="py-3.5 px-4">ISBN / Barcode</th>
                <th className="py-3.5 px-4">Kategori & Rak</th>
                <th className="py-3.5 px-4 text-center">Stok (Tersedia/Total)</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs line-clamp-2" title={book.title}>
                            {book.title}
                          </div>
                          <div className="text-[10px] text-slate-400">ID: {book.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{book.author}</div>
                      <div className="text-[10px] text-slate-500">{book.publisher} ({book.year})</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div>{book.isbn}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">{book.barcode}</div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px]">
                        {book.category}
                      </span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{book.shelf_location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                          book.available_stock > 0
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {book.available_stock} / {book.stock}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenBarcodeModal(book)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Cetak Barcode & QR Label"
                        >
                          <BarcodeIcon className="w-4 h-4 text-emerald-700" />
                        </button>
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Edit Buku"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus buku "${book.title}" dari katalog?`)) {
                              onDeleteBook(book.id);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 rounded-lg transition-colors"
                          title="Hapus Buku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada koleksi buku yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Halaman {currentPage} dari {totalPages} ({filteredBooks.length} Buku)
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-green-700 to-emerald-600 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">
                {editingBook ? 'Edit Data Buku' : 'Tambah Koleksi Buku Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-emerald-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Buku *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Fiqih untuk MTs Kelas VIII"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pengarang *</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama Pengarang / Penulis"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Penerbit *</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Nama Penerbit"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor ISBN *</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-602-xxx-xxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Buku *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BookCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Terbit</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2023)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Rak *</label>
                  <input
                    type="text"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    placeholder="Contoh: Rak A-01 (Fiqih)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Stok</label>
                  <input
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setStock(val);
                      if (!editingBook) setAvailableStock(val);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Tersedia</label>
                  <input
                    type="number"
                    min="0"
                    max={stock}
                    value={availableStock}
                    onChange={(e) => setAvailableStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Gambar Sampul Buku (Kamera / File Gambar)"
                    value={coverUrl}
                    onChange={(url) => setCoverUrl(url)}
                    placeholder="https://images.unsplash.com/..."
                    cloudName={settings.cloudinary_cloud_name}
                    uploadPreset={settings.cloudinary_upload_preset}
                    maxWidth={800}
                    maxHeight={1000}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deskripsi / Sinopsis Buku
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Ringkasan isi materi buku..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link File E-Book / PDF (Opsional)
                  </label>
                  <input
                    type="url"
                    value={eBookUrl}
                    onChange={(e) => setEBookUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... atau https://res.cloudinary.com/.../file.pdf"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Masukkan link Google Drive atau link file PDF langsung. Buku akan otomatis tersedia di menu E-Library.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Simpan Data Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
