import React, { useState, useRef } from 'react';
import { Member, LibrarySettings } from '../types';
import {
  X,
  Printer,
  Download,
  CreditCard,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { generateQRMatrix } from '../lib/qrUtils';

interface MemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  settings: LibrarySettings;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  isOpen,
  onClose,
  member,
  settings,
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('both');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const cardBothRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !member) return null;

  const qrMatrix = generateQRMatrix(member.member_number);
  const isGuru = member.role === 'guru';
  const isFrontVisible = activeSide === 'both' || activeSide === 'front';
  const isBackVisible = activeSide === 'both' || activeSide === 'back';

  // Accent color based on role
  const accentFrom = isGuru ? '#1e3a5f' : '#064e3b';
  const accentTo = isGuru ? '#1d4ed8' : '#065f46';
  const accentMid = isGuru ? '#1e40af' : '#047857';
  const accentLight = isGuru ? '#dbeafe' : '#d1fae5';
  const accentText = isGuru ? '#1e3a5f' : '#064e3b';

  const handlePrint = () => window.print();

  const handleDownloadPNG = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      const targetRef = activeSide === 'front' ? cardFrontRef : activeSide === 'back' ? cardBackRef : cardBothRef;
      if (!targetRef.current) return;
      const dataUrl = await toPng(targetRef.current, { quality: 0.96, pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      const sideName = activeSide === 'both' ? 'Lengkap' : activeSide === 'front' ? 'Depan' : 'Belakang';
      link.download = `Kartu_Anggota_${member.name.replace(/[^a-zA-Z0-9]/g, '_')}_${sideName}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch { alert('Gagal mengunduh kartu. Gunakan tombol Cetak.'); }
    finally { setIsDownloading(false); }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      if (!cardFrontRef.current || !cardBackRef.current) return;

      const frontDataUrl = await toPng(cardFrontRef.current, { pixelRatio: 4, cacheBust: true });
      const backDataUrl  = await toPng(cardBackRef.current,  { pixelRatio: 4, cacheBust: true });

      // PDF page = exact card dimensions (ISO ID-1 / KTP portrait)
      const cardW = 53.98;  // mm
      const cardH = 85.6; // mm

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [cardW, cardH], // custom page = card size
      });

      // Page 1 — Front card fills entire page
      pdf.addImage(frontDataUrl, 'PNG', 0, 0, cardW, cardH);

      // Page 2 — Back card fills entire page
      pdf.addPage([cardW, cardH], 'portrait');
      pdf.addImage(backDataUrl, 'PNG', 0, 0, cardW, cardH);

      pdf.save(`Kartu_Anggota_${member.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch { alert('Gagal mengeksport PDF.'); }
    finally { setIsDownloading(false); }
  };

  // Minimal barcode strips visual
  const barcodeWidths = [1,2,1,3,1,2,1,1,3,1,2,1,3,1,2,1,1,2,3,1,2,1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <style>{`
        @page {
          size: 85.6mm 53.98mm landscape;
          margin: 0;
        }
        @media screen {
          .screen-only-hidden {
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            pointer-events: none !important;
            opacity: 0 !important;
          }
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only-hidden {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-member-card-front,
          #printable-member-card-front *,
          #printable-member-card-back,
          #printable-member-card-back * {
            visibility: visible !important;
          }
          #printable-member-card-front {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 53.98mm !important;
            height: 85.6mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-member-card-back {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 53.98mm !important;
            height: 85.6mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Kartu Anggota Perpustakaan</h3>
              <p className="text-[11px] text-slate-400 font-bold">Standar ISO 85.6 × 53.98 mm (Ukuran KTP)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side toggle */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl gap-1 shadow-2xs">
            {(['both', 'front', 'back'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveSide(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeSide === s
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s === 'both' ? 'Depan & Belakang' : s === 'front' ? 'Tampak Depan' : 'Tampak Belakang'}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-bold hidden sm:block">85.6 × 53.98 mm • ISO ID-1</span>
        </div>

        {/* Card Canvas */}
        <div className="p-6 overflow-y-auto bg-[#f1f5f9] flex-1 flex flex-col items-center justify-center gap-6">
          <div ref={cardBothRef} className="flex flex-wrap items-center justify-center gap-6 p-2">

            {/* ── FRONT ────────────────────────────────────────────── */}
            <div className={`flex flex-col items-center gap-1.5 ${isFrontVisible ? '' : 'screen-only-hidden'} ${isFrontVisible ? '' : 'print-only-hidden'}`}>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest no-print">Sisi Depan</span>
                <div
                  ref={cardFrontRef}
                  id="printable-member-card-front"
                  className="w-[224px] h-[356px] rounded-xl overflow-hidden relative shadow-2xl shrink-0 select-none bg-white"
                  style={{ aspectRatio: '53.98/85.6' }}
                >
                  {/* Background Image */}
                  <img src="/assets/card-front.png" alt="Card Front Background" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                  
                  {/* Content layout */}
                  <div className="relative z-10 h-full flex flex-col items-center pt-[100px]">
                    {/* Photo */}
                    <div className="w-[85px] h-[105px] rounded-xl overflow-hidden bg-white/20 shadow-md">
                      <img
                        src={member.photo_url || 'https://via.placeholder.com/150'}
                        alt="Foto"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="mt-5 text-center w-full px-2 flex flex-col items-center">
                      <div className="font-extrabold text-[12px] uppercase tracking-wide leading-tight text-[#266b44]">
                        {member.name}
                      </div>
                      <div className="text-[9px] font-bold text-[#3a835a] mt-1 tracking-wider">
                        {member.member_number}
                      </div>
                      <div className="text-[7px] font-bold text-[#3a835a] mt-1.5 uppercase">
                        TASIKMALAYA, {new Date(member.registered_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                      </div>
                      <div className="text-[7px] font-bold text-[#3a835a] mt-0.5 uppercase">
                        {member.class_or_position}
                      </div>
                    </div>
                    
                    {/* QR Code at the bottom center */}
                    <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                      <div className="bg-white rounded shadow-sm flex items-center justify-center p-0.5">
                        <svg width="45" height="45" viewBox="0 0 21 21">
                          {qrMatrix.map((row, r) =>
                            row.map((cell, c) =>
                              cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#064e3b" /> : null
                            )
                          )}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* ── BACK ─────────────────────────────────────────────── */}
            <div className={`flex flex-col items-center gap-1.5 ${isBackVisible ? '' : 'screen-only-hidden'} ${isBackVisible ? '' : 'print-only-hidden'}`}>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest no-print">Sisi Belakang</span>
              <div
                ref={cardBackRef}
                id="printable-member-card-back"
                className="w-[224px] h-[356px] rounded-xl overflow-hidden relative shadow-2xl shrink-0 select-none bg-white"
                style={{ aspectRatio: '53.98/85.6' }}
              >
                <img src="/assets/card-back.png" alt="Card Back Background" className="w-full h-full object-cover" crossOrigin="anonymous" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {downloadSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Berhasil Diunduh!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{isDownloading ? 'Memproses...' : 'PNG'}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>PDF Print Ready</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
