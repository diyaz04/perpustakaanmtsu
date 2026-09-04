import React, { useState, useMemo } from 'react';
import { Laptop, LaptopCategory, LibrarySettings } from '../../types';
import { ImageUploader } from '../ImageUploader';
import { BulkQRPrintModal } from './BulkQRPrintModal';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Barcode as BarcodeIcon,
  Laptop,
  CheckCircle2,
  XCircle,
  MapPin,
  X,
  QrCode,
  Printer,
  CheckSquare,
  Square,
} from 'lucide-react';

interface LaptopsManagementViewProps {
  laptops: Laptop[];
  settings: LibrarySettings;
  onAddLaptop: (laptop: Omit<Laptop, 'id'>) => void;
  onUpdateLaptop: (laptop: Laptop) => void;
  onDeleteLaptop: (id: string) => void;
  onOpenBarcodeModal: (laptop: Laptop) => void;
  onMarkQrPrinted: (laptopIds: string[], count: number) => void;
}

export const LaptopsManagementView: React.FC<LaptopsManagementViewProps> = ({
  laptops,
  settings,
  onAddLaptop,
  onUpdateLaptop,
  onDeleteLaptop,
  onOpenBarcodeModal,
  onMarkQrPrinted,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [filterQr, setFilterQr] = useState<'all' | 'printed' | 'unprinted'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState(2023);
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState<LaptopCategory>('Agama Islam');
  const [stock, setStock] = useState(10);
  const [availableStock, setAvailableStock] = useState(10);
  const [shelfLocation, setShelfLocation] = useState('Rak A-01 (Fiqih)');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [eLaptopUrl, setELaptopUrl] = useState('');

  const categories: LaptopCategory[] = [
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

  const filteredLaptops = useMemo(() => {
    return laptops.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn.includes(searchTerm) ||
        b.barcode.includes(searchTerm);
      const matchCat = selectedCategory === 'Semua' || b.category === selectedCategory;
      const printed = (b.qr_printed_count ?? 0) >= b.stock;
      const matchQr =
        filterQr === 'all' ||
        (filterQr === 'printed' && printed) ||
        (filterQr === 'unprinted' && !printed);
      return matchSearch && matchCat && matchQr;
    });
  }, [laptops, searchTerm, selectedCategory, filterQr]);

  const totalPages = Math.ceil(filteredLaptops.length / itemsPerPage) || 1;
  const paginatedLaptops = filteredLaptops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Checkbox helpers
  const allPageSelected = paginatedLaptops.length > 0 && paginatedLaptops.every((b) => selectedIds.has(b.id));
  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedLaptops.forEach((b) => next.delete(b.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedLaptops.forEach((b) => next.add(b.id));
        return next;
      });
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectedLaptops = laptops.filter((b) => selectedIds.has(b.id));
  const totalQrToPrint = selectedLaptops.reduce((s, b) => {
    const printed = b.qr_printed_count || 0;
    return s + Math.max(0, b.stock - printed);
  }, 0);

  const openAddModal = () => {
    setEditingLaptop(null);
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
    setELaptopUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (laptop: Laptop) => {
    setEditingLaptop(laptop);
    setTitle(laptop.title);
    setAuthor(laptop.author);
    setPublisher(laptop.publisher);
    setYear(laptop.year);
    setIsbn(laptop.isbn);
    setCategory(laptop.category);
    setStock(laptop.stock);
    setAvailableStock(laptop.available_stock);
    setShelfLocation(laptop.shelf_location);
    setCoverUrl(laptop.cover_url);
    setDescription(laptop.description || '');
    setELaptopUrl(laptop.e_laptop_url || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeNumber = isbn.replace(/[^0-9]/g, '') || `${Date.now()}`;

    if (editingLaptop) {
      onUpdateLaptop({
        ...editingLaptop,
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
        e_laptop_url: eLaptopUrl,
      });
    } else {
      onAddLaptop({
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
        e_laptop_url: eLaptopUrl,
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
            <Laptop className="w-5 h-5 text-emerald-600" />
            Manajemen Koleksi Laptop Perpustakaan
          </h2>
          <p className="text-xs text-slate-500">
            {laptops.length} judul terdaftar • {laptops.reduce((s, b) => s + b.stock, 0)} total eksemplar •{' '}
            {laptops.filter((b) => (b.qr_printed_count ?? 0) >= b.stock).length} judul QR sudah tercetak
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setIsBulkPrintOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak QR ({totalQrToPrint} lembar)</span>
            </button>
          )}
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Laptop Baru</span>
          </button>
        </div>
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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <span className="text-xs font-semibold text-slate-500">Status QR:</span>
          <select
            value={filterQr}
            onChange={(e) => { setFilterQr(e.target.value as any); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua</option>
            <option value="printed">✓ Sudah Dicetak</option>
            <option value="unprinted">✗ Belum Dicetak</option>
          </select>
        </div>
      </div>

      {/* Laptops Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-3">
                  <button onClick={toggleAll} className="cursor-pointer text-emerald-600">
                    {allPageSelected
                      ? <CheckSquare className="w-4 h-4" />
                      : <Square className="w-4 h-4 text-slate-400" />}
                  </button>
                </th>
                <th className="py-3.5 px-4">Sampul &amp; Merek / Seri Laptop</th>
                <th className="py-3.5 px-4">Spesifikasi Utama &amp; Vendor / Sumber</th>
                <th className="py-3.5 px-4">ISBN / Barcode</th>
                <th className="py-3.5 px-4">Kategori &amp; Rak</th>
                <th className="py-3.5 px-4 text-center">Stok &amp; QR Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLaptops.length > 0 ? (
                paginatedLaptops.map((laptop) => {
                  const printed = laptop.qr_printed_count ?? 0;
                  const total = laptop.stock;
                  const allPrinted = printed >= total;
                  const partialPrinted = printed > 0 && printed < total;
                  return (
                  <tr key={laptop.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(laptop.id) ? 'bg-emerald-50/40' : ''}`}>
                    {/* Checkbox */}
                    <td className="py-3.5 px-3">
                      <button onClick={() => toggleOne(laptop.id)} className="cursor-pointer text-emerald-600">
                        {selectedIds.has(laptop.id)
                          ? <CheckSquare className="w-4 h-4" />
                          : <Square className="w-4 h-4 text-slate-300" />}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={laptop.cover_url}
                          alt={laptop.title}
                          className="w-10 h-14 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs line-clamp-2" title={laptop.title}>
                            {laptop.title}
                          </div>
                          <div className="text-[10px] text-slate-400">ID: {laptop.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{laptop.author}</div>
                      <div className="text-[10px] text-slate-500">{laptop.publisher} ({laptop.year})</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div>{laptop.isbn}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">{laptop.barcode}</div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px]">
                        {laptop.category}
                      </span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{laptop.shelf_location}</span>
                      </div>
                    </td>

                    {/* Stok + QR Status */}
                    <td className="py-3.5 px-4 text-center space-y-1.5">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                        laptop.available_stock > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {laptop.available_stock} / {laptop.stock}
                      </span>
                      {/* QR printed badge */}
                      <div>
                        {allPrinted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-extrabold">
                            <QrCode className="w-2.5 h-2.5" /> QR Tercetak Semua
                          </span>
                        ) : partialPrinted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-extrabold">
                            <QrCode className="w-2.5 h-2.5" /> {printed}/{total} Tercetak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[9px] font-extrabold">
                            <QrCode className="w-2.5 h-2.5" /> Belum Cetak
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenBarcodeModal(laptop)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Cetak Barcode & QR Label"
                        >
                          <BarcodeIcon className="w-4 h-4 text-emerald-700" />
                        </button>
                        <button
                          onClick={() => openEditModal(laptop)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Laptop"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus laptop "${laptop.title}" dari katalog?`)) {
                              onDeleteLaptop(laptop.id);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Laptop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada koleksi laptop yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Halaman {currentPage} dari {totalPages} ({filteredLaptops.length} Laptop)
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
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">
                    {editingLaptop ? 'Edit Data Laptop' : 'Tambah Koleksi Laptop Baru'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1.5">
                    {editingLaptop ? 'Sesuaikan informasi detail laptop perpustakaan' : 'Masukkan informasi laptop perpustakaan baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Merek / Seri Laptop *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Acer Aspire 3"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Spesifikasi Utama *</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama Spesifikasi Utama / Penulis"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Vendor / Sumber *</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Nama Vendor / Sumber"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">S/N atau Kode Inventaris *</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-602-xxx-xxx"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Kategori Laptop *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LaptopCategory)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Tahun Terbit</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2023)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Lokasi Rak *</label>
                  <input
                    type="text"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    placeholder="Contoh: Rak A-01 (Fiqih)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Total Stok</label>
                  <input
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setStock(val);
                      if (!editingLaptop) setAvailableStock(val);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Stok Tersedia</label>
                  <input
                    type="number"
                    min="0"
                    max={stock}
                    value={availableStock}
                    onChange={(e) => setAvailableStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs text-emerald-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Gambar Sampul Laptop (Kamera / File Gambar)"
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
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Deskripsi / Sinopsis Laptop
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Ringkasan isi materi laptop..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Link File E-Laptop / PDF (Opsional)
                  </label>
                  <input
                    type="url"
                    value={eLaptopUrl}
                    onChange={(e) => setELaptopUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... atau https://res.cloudinary.com/.../file.pdf"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  />
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                    Masukkan link Google Drive atau link file PDF langsung. Laptop akan otomatis tersedia di menu E-Library.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Simpan Data Laptop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk QR Print Modal */}
      {isBulkPrintOpen && (
        <BulkQRPrintModal
          selectedLaptops={selectedLaptops}
          settings={settings}
          onClose={() => setIsBulkPrintOpen(false)}
          onPrintDone={(ids) => {
            onMarkQrPrinted(ids, 0); // count handled inside onMarkQrPrinted per laptop
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
};
