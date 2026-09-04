import React, { useRef, useState } from 'react';
import { Book, LibrarySettings } from '../../types';
import { X, Printer, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';

interface BulkQRPrintModalProps {
  selectedBooks: Book[];
  settings: LibrarySettings;
  onClose: () => void;
  onPrintDone: (bookIds: string[]) => void;
}

export const BulkQRPrintModal: React.FC<BulkQRPrintModalProps> = ({
  selectedBooks,
  settings,
  onClose,
  onPrintDone,
}) => {
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const [reprintAll, setReprintAll] = useState(false);

  // Total QR codes
  const totalQrCount = selectedBooks.reduce((sum, b) => {
    if (reprintAll) return sum + b.stock;
    const printed = b.qr_printed_count || 0;
    return sum + Math.max(0, b.stock - printed);
  }, 0);

  const handlePrint = async () => {
    const copies: { book: Book; copyIndex: number }[] = [];
    for (const book of selectedBooks) {
      if (reprintAll) {
        for (let i = 1; i <= book.stock; i++) {
          copies.push({ book, copyIndex: i });
        }
      } else {
        const printed = book.qr_printed_count || 0;
        const unprinted = Math.max(0, book.stock - printed);
        for (let i = 1; i <= unprinted; i++) {
          copies.push({ book, copyIndex: printed + i });
        }
      }
    }

    if (copies.length === 0) {
      alert("Semua label QR untuk buku-buku yang dipilih sudah pernah dicetak. Tidak ada label baru yang perlu dicetak.");
      return;
    }

    // Generate QR data URLs for all copies
    const qrDataUrls: string[] = await Promise.all(
      copies.map(({ book }) =>
        QRCode.toDataURL(book.barcode, {
          width: 160,
          margin: 1,
          color: { dark: '#064e3b', light: '#ffffff' },
        })
      )
    );

    const libraryName = settings.library_name || 'Perpustakaan MTs';

    // Build the print HTML
    const qrCells = copies
      .map(
        ({ book, copyIndex }, idx) => `
        <div class="qr-card">
          <img class="qr-img" src="${qrDataUrls[idx]}" alt="QR" />
          <div class="qr-info">
            <div class="qr-header">${libraryName}</div>
            <div class="qr-title">${book.title.length > 25 ? book.title.slice(0, 23) + '…' : book.title}</div>
            <div class="qr-sub">${book.isbn}</div>
            <div class="qr-copy">Eks. ${copyIndex}/${book.stock} • ${book.shelf_location.length > 10 ? book.shelf_location.slice(0,10)+'…' : book.shelf_location}</div>
          </div>
        </div>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Cetak QR Label 103</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; background: #fff; }
  
  /* Container diset untuk 3 kolom */
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 64mm);
    gap: 2mm;
    padding: 5mm; /* Margin tepi kertas */
    justify-content: center;
  }
  
  /* Ukuran presisi Label 103 (64x32mm) */
  .qr-card {
    width: 64mm;
    height: 32mm;
    border: 1px dashed #ccc; /* Garis potong bantu, hilangkan jika tidak perlu */
    border-radius: 4px;
    padding: 3mm;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 2mm;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  .qr-img {
    width: 26mm;
    height: 26mm;
    object-fit: contain;
    flex-shrink: 0;
  }
  
  .qr-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .qr-header {
    font-size: 7px;
    font-weight: 900;
    color: #065f46;
    text-transform: uppercase;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .qr-title {
    font-size: 7px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
    margin-bottom: 2px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .qr-sub {
    font-size: 6px;
    color: #64748b;
    font-family: monospace;
    margin-bottom: 2px;
  }
  
  .qr-copy {
    font-size: 6px;
    color: #059669;
    font-weight: 700;
    border-top: 1px solid #a7f3d0;
    padding-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .qr-card { border: none; } /* Hilangkan border saat benar-benar dicetak di label */
  }
</style>
</head>
<body>
<div class="grid">${qrCells}</div>
</body>
</html>`;

    // Write into hidden iframe and print
    const iframe = printFrameRef.current!;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Mark books as printed
      onPrintDone(selectedBooks.map((b) => b.id));
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cetak QR Code Buku</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Setiap eksemplar fisik mendapatkan 1 label QR
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Summary */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-3 flex-1">
              <Printer className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-extrabold text-emerald-900">
                  Total QR yang akan dicetak: <span className="text-emerald-600 text-base">{totalQrCount}</span> lembar
                </div>
                <div className="text-emerald-700 font-semibold mt-0.5">
                  dari {selectedBooks.length} judul buku yang dipilih
                </div>
              </div>
            </div>
            
            {/* Reprint Toggle */}
            <button
              onClick={() => setReprintAll(!reprintAll)}
              className={`px-3 py-2 text-[10px] font-extrabold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer h-fit sm:self-center ${
                reprintAll 
                  ? 'bg-amber-100 border-amber-200 text-amber-800 shadow-sm' 
                  : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reprintAll ? 'animate-spin-slow' : ''}`} />
              {reprintAll ? 'Cetak Ulang Semua Aktif' : 'Cetak Ulang yang Sudah'}
            </button>
          </div>

          {/* Per-book breakdown */}
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Rincian per judul:
            </div>
            {selectedBooks.map((book) => {
              const printed = book.qr_printed_count ?? 0;
              const total = book.stock;
              const allPrinted = printed >= total;
              const toPrint = reprintAll ? total : Math.max(0, total - printed);

              return (
                <div key={book.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-8 h-11 object-cover rounded border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-slate-900 text-xs truncate">{book.title}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{book.isbn}</div>
                    <div className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                      Akan cetak: <span className="text-emerald-800">{toPrint}</span> QR {reprintAll ? '(= semua eksemplar)' : 'baru'}
                    </div>
                  </div>
                  <div className={`text-right shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-lg ${
                    allPrinted
                      ? 'bg-emerald-100 text-emerald-700'
                      : printed > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {allPrinted ? '✓ Sudah' : printed > 0 ? `${printed}/${total}` : 'Belum'}<br />
                    <span className="font-bold">dicetak</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info note */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <span>
              Label QR dicetak <strong>5 kolom per baris</strong> dengan ukuran kecil ± 3×3 cm, cocok untuk kertas A4. 
              Tempelkan 1 label di setiap buku fisik. Setelah menekan Cetak, status buku akan berubah menjadi <strong>"Sudah Dicetak"</strong>.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer">
            Batal
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak {totalQrCount} QR Code Sekarang
          </button>
        </div>
      </div>

      {/* Hidden print iframe */}
      <iframe ref={printFrameRef} style={{ display: 'none' }} title="print-qr" />
    </div>
  );
};
