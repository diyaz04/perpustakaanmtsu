import React, { useRef, useState, useEffect } from 'react';
import { Member, LibrarySettings } from '../../types';
import { X, Printer, CreditCard, AlertCircle, Download, FileText, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface BulkMemberCardPrintModalProps {
  selectedMembers: Member[];
  settings: LibrarySettings;
  onClose: () => void;
}

export const BulkMemberCardPrintModal: React.FC<BulkMemberCardPrintModalProps> = ({
  selectedMembers,
  settings,
  onClose,
}) => {
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const [template, setTemplate] = useState<'siswa' | 'perpus'>('siswa');
  const [qrDataUrls, setQrDataUrls] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const backCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateQRs = async () => {
      const urls = await Promise.all(
        selectedMembers.map((m) =>
          QRCode.toDataURL(m.member_number, {
            width: 200,
            margin: 1,
            color: { dark: '#064e3b', light: '#ffffff' },
          })
        )
      );
      setQrDataUrls(urls);
    };
    generateQRs();
  }, [selectedMembers]);

  const handlePrint = async () => {
    if (qrDataUrls.length === 0) return;

    const frontImgSrc = template === 'siswa' ? '/assets/card-front.png' : '/assets/card-front-perpus.png';
    const backImgSrc = template === 'siswa' ? '/assets/card-back.png' : '/assets/card-back-perpus.png';

    const cardsHtml = selectedMembers
      .map((member, idx) => {
        const dateStr = new Date(member.registered_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const qrUrl = qrDataUrls[idx];
        const photoUrl = member.photo_url || 'https://via.placeholder.com/150';
        const nisNisnStr = member.nis || member.nisn ? [member.nis, member.nisn].filter(Boolean).join(' / ') : member.member_number;
        const placeStr = member.place_of_birth || 'TASIKMALAYA';
        const dateBirthStr = member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : dateStr;
        const regionStr = member.subdistrict || member.city ? [member.subdistrict, member.city].filter(Boolean).join(' - ') : member.class_or_position;

        return `
          <div class="card card-front">
            <img class="bg-img" src="${frontImgSrc}" alt="Front" />
            <div class="card-content">
              <div class="photo-box">
                <img src="${photoUrl}" alt="Photo" />
              </div>
              <div class="details">
                <div class="name">${member.name}</div>
                <div class="number">${nisNisnStr}</div>
                <div class="date">${placeStr}, ${dateBirthStr}</div>
                <div class="position">${regionStr}</div>
              </div>
              <div class="qr-box">
                <img src="${qrUrl}" alt="QR" />
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    const backCardHtml = `
      <div class="card card-back page-break-before">
        <img class="bg-img" src="${backImgSrc}" alt="Back" />
      </div>
    `;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Cetak Kartu Anggota</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Arial', sans-serif; 
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* ISO ID-1 Size */
  @page {
    size: 53.98mm 85.6mm portrait;
    margin: 0;
  }
  
  .card {
    width: 53.98mm;
    height: 85.6mm;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }

  .bg-img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    z-index: 1;
  }
  
  .card-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 24mm;
  }

  .photo-box {
    width: 20mm;
    height: 25mm;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(255,255,255,0.2);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin: 0 auto;
  }
  
  .photo-box img { width: 100%; height: 100%; object-fit: cover; }
  
  .details {
    margin-top: 4mm;
    text-align: center;
    width: 100%;
    padding: 0 2mm;
  }
  
  .name { font-size: 8pt; font-weight: 900; color: #266b44; text-transform: uppercase; line-height: 1.1; }
  .number { font-size: 6pt; font-weight: bold; color: #3a835a; margin-top: 1mm; letter-spacing: 0.5pt; }
  .date { font-size: 4.5pt; font-weight: bold; color: #3a835a; margin-top: 1.5mm; text-transform: uppercase; }
  .position { font-size: 4.5pt; font-weight: bold; color: #3a835a; margin-top: 0.5mm; text-transform: uppercase; }
  
  .qr-box {
    position: absolute;
    bottom: 5mm;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    padding: 1mm;
    border-radius: 2px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .qr-box img { width: 11mm; height: 11mm; display: block; }
</style>
</head>
<body>
  ${cardsHtml}
  ${backCardHtml}
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
    }, 800);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      
      const cardW = 53.98;
      const cardH = 85.6;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [cardW, cardH],
      });

      // Capture all front cards
      for (let i = 0; i < selectedMembers.length; i++) {
        const el = cardsRef.current[i];
        if (!el) continue;
        
        if (i > 0) pdf.addPage([cardW, cardH], 'portrait');
        const dataUrl = await toPng(el, { pixelRatio: 4, cacheBust: true });
        pdf.addImage(dataUrl, 'PNG', 0, 0, cardW, cardH);
      }

      // Add back card
      if (backCardRef.current) {
        pdf.addPage([cardW, cardH], 'portrait');
        const backDataUrl = await toPng(backCardRef.current, { pixelRatio: 4, cacheBust: true });
        pdf.addImage(backDataUrl, 'PNG', 0, 0, cardW, cardH);
      }

      pdf.save('Kartu_Anggota_Massal.pdf');

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal mengeksport PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Printer className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cetak Massal Kartu Anggota</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Mencetak {selectedMembers.length} bagian depan dan 1 bagian belakang
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2">Pilih Template Kartu</label>
            <select 
              value={template} 
              onChange={e => setTemplate(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="siswa">Template Siswa (Default)</option>
              <option value="perpus">Template Kartu Tanda Perpustakaan</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <div className="font-extrabold text-emerald-900">
                Total kartu yang dicetak: <span className="text-emerald-600 text-base">{selectedMembers.length}</span> kartu
              </div>
              <div className="text-emerald-700 font-semibold mt-0.5">
                Bagian depan ({selectedMembers.length} lbr) + Bagian belakang (1 lbr)
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <span>
              Cetak massal akan di-generate dalam bentuk file PDF full satu halaman penuh per satu orang anggota (ukuran 53.98mm x 85.6mm).
              Sisi belakang kartu hanya akan di-generate 1 kali di halaman paling akhir.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer">
            Batal
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || qrDataUrls.length === 0}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            {isDownloading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : downloadSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>{isDownloading ? 'Memproses...' : downloadSuccess ? 'Berhasil' : 'Download PDF'}</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={isDownloading || qrDataUrls.length === 0}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            Proses Cetak
          </button>
        </div>
      </div>
      <iframe ref={printFrameRef} style={{ display: 'none' }} title="Print Frame" />

      {/* HIDDEN ELEMENTS FOR PDF */}
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
        {selectedMembers.map((member, i) => (
          <div
            key={`front-${member.id}`}
            ref={(el) => (cardsRef.current[i] = el)}
            className="w-[224px] h-[356px] relative bg-white"
            style={{ aspectRatio: '53.98/85.6' }}
          >
            <img src={template === 'siswa' ? "/assets/card-front.png" : "/assets/card-front-perpus.png"} alt="bg" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="relative z-10 h-full flex flex-col items-center pt-[100px]">
              <div className="w-[85px] h-[105px] rounded-xl overflow-hidden bg-white/20 shadow-md">
                <img src={member.photo_url || 'https://via.placeholder.com/150'} alt="Foto" className="w-full h-full object-cover" crossOrigin="anonymous" />
              </div>
              <div className="mt-5 text-center w-full px-2 flex flex-col items-center">
                <div className="font-extrabold text-[12px] uppercase tracking-wide leading-tight text-[#266b44]">{member.name}</div>
                <div className="text-[9px] font-bold text-[#3a835a] mt-1 tracking-wider">{member.nis || member.nisn ? [member.nis, member.nisn].filter(Boolean).join(' / ') : member.member_number}</div>
                <div className="text-[7px] font-bold text-[#3a835a] mt-1.5 uppercase">
                  {member.place_of_birth || 'TASIKMALAYA'}, {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : new Date(member.registered_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                </div>
                <div className="text-[7px] font-bold text-[#3a835a] mt-0.5 uppercase">{member.subdistrict || member.city ? [member.subdistrict, member.city].filter(Boolean).join(' - ') : member.class_or_position}</div>
              </div>
              <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="bg-white rounded shadow-sm flex items-center justify-center p-0.5">
                  {qrDataUrls[i] ? (
                    <img src={qrDataUrls[i]} alt="QR" className="w-[45px] h-[45px] object-contain" />
                  ) : (
                    <div className="w-[45px] h-[45px] bg-slate-100" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div
          ref={backCardRef}
          className="w-[224px] h-[356px] relative bg-white"
          style={{ aspectRatio: '53.98/85.6' }}
        >
          <img src={template === 'siswa' ? "/assets/card-back.png" : "/assets/card-back-perpus.png"} alt="bg" className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>
      </div>
    </div>
  );
};
