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

  const printFrameRef = React.useRef<HTMLIFrameElement>(null);
  
  const handlePrint = async () => {
    import('qrcode').then(async (QRCode) => {
      const qrDataUrl = await QRCode.default.toDataURL(book.barcode, {
        width: 160,
        margin: 1,
        color: { dark: '#064e3b', light: '#ffffff' },
      });
      
      const libraryName = settings.library_name || 'Perpustakaan MTs';
      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Cetak QR Label 103</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; background: #fff; display: flex; justify-content: center; padding-top: 5mm; }
  .qr-card {
    width: 64mm;
    height: 32mm;
    border: 1px dashed #ccc;
    border-radius: 4px;
    padding: 3mm;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 2mm;
    overflow: hidden;
  }
  .qr-img { width: 26mm; height: 26mm; object-fit: contain; flex-shrink: 0; }
  .qr-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
  .qr-header { font-size: 7px; font-weight: 900; color: #065f46; text-transform: uppercase; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qr-title { font-size: 7px; font-weight: 700; color: #1e293b; line-height: 1.2; margin-bottom: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .qr-sub { font-size: 6px; color: #64748b; font-family: monospace; margin-bottom: 2px; }
  .qr-copy { font-size: 6px; color: #059669; font-weight: 700; border-top: 1px solid #a7f3d0; padding-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .qr-card { border: none; } }
</style>
</head>
<body>
  <div class="qr-card">
    <img class="qr-img" src="${qrDataUrl}" alt="QR" />
    <div class="qr-info">
      <div class="qr-header">${libraryName}</div>
      <div class="qr-title">${book.title.length > 25 ? book.title.slice(0, 23) + '…' : book.title}</div>
      <div class="qr-sub">${book.isbn}</div>
      <div class="qr-copy">${book.shelf_location.length > 15 ? book.shelf_location.slice(0,15)+'…' : book.shelf_location}</div>
    </div>
  </div>
</body>
</html>`;
      const iframe = printFrameRef.current!;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 600);
    });
  };

  const barcodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(book.barcode)}&color=0f172a`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">Label & Barcode Buku</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-455 text-slate-400 font-bold mt-1.5">Kartu sirkulasi buku perpustakaan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/10 shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Tutup"
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
      <iframe ref={printFrameRef} style={{ display: 'none' }} title="Print Frame" />
    </div>
  );
};
