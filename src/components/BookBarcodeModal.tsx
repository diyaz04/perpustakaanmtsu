import React from 'react';
import { Book, LibrarySettings } from '../types';
import { X, Printer, Barcode as BarcodeIcon, BookOpen } from 'lucide-react';

interface BookBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  settings: LibrarySettings;
}

export const BookBarcodeModal: React.FC<BookBarcodeModalProps> = ({
  isOpen,
  onClose,
  book,
  settings,
}) => {
  if (!isOpen || !book) return null;

  const handlePrint = () => {
    window.print();
  };

  const barcodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(book.barcode)}&color=0f172a`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarcodeIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">Label & Barcode Buku</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Label View */}
        <div className="p-6 bg-slate-50 flex flex-col items-center gap-4">
          <div className="w-[300px] bg-white p-4 rounded-xl border-2 border-dashed border-emerald-600 shadow-md text-center space-y-3">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-center gap-2">
              <img
                src={settings.logo_url || 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt'}
                alt="Logo Perpustakaan"
                className="w-7 h-7 object-contain rounded-md shrink-0"
              />
              <div className="text-left">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide leading-tight">
                  {settings.library_name}
                </div>
                <div className="text-[9px] text-slate-500 leading-tight">{settings.school_name}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 line-clamp-2" title={book.title}>
                {book.title}
              </div>
              <div className="text-[10px] text-slate-500">{book.author}</div>
            </div>

            <div className="flex justify-center my-2">
              <img src={barcodeApiUrl} alt="QR Barcode" className="w-28 h-28 object-contain border border-slate-200 p-1 rounded-md" />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-600 font-mono">
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">Kode / ISBN</span>
                <span className="font-bold text-slate-800">{book.barcode}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[8px] uppercase">Lokasi Rak</span>
                <span className="font-bold text-emerald-700">{book.shelf_location}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center max-w-xs">
            Label ini ditempelkan pada punggung atau sampul belakang buku untuk keperluan scan cepat saat transaksi.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
