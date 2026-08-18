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

      // PDF page = exact card dimensions (ISO ID-1 / KTP)
      const cardW = 85.6;  // mm
      const cardH = 53.98; // mm

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [cardW, cardH], // custom page = card size
      });

      // Page 1 — Front card fills entire page
      pdf.addImage(frontDataUrl, 'PNG', 0, 0, cardW, cardH);

      // Page 2 — Back card fills entire page
      pdf.addPage([cardW, cardH], 'landscape');
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
            width: 85.6mm !important;
            height: 53.98mm !important;
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
            width: 85.6mm !important;
            height: 53.98mm !important;
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
                  className="w-[356px] h-[224px] rounded-2xl overflow-hidden relative shadow-2xl shrink-0 select-none"
                  style={{ aspectRatio: '85.6/53.98' }}
                >
                  {/* Base gradient background */}
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentMid} 55%, ${accentTo} 100%)` }}
                  />

                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 bg-white" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 bg-white" />
                  <div className="absolute top-6 right-16 w-16 h-16 rounded-full opacity-5 bg-white" />

                  {/* Horizontal accent stripe */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400" />

                  {/* Content layout */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Card header */}
                    <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
                      <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={settings.logo_url || 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt'}
                          alt="Logo"
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[7px] font-extrabold text-white/60 uppercase tracking-widest leading-none">
                          Kartu Anggota Perpustakaan
                        </div>
                        <div className="text-[10.5px] font-black text-white leading-tight truncate mt-0.5">
                          {settings.school_name}
                        </div>
                        <div className="text-[7.5px] text-white/70 font-semibold truncate leading-none">
                          {settings.library_name}
                        </div>
                      </div>
                      <div
                        className="shrink-0 px-2 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-wider"
                        style={{ background: 'rgba(251,191,36,0.9)', color: accentFrom }}
                      >
                        {isGuru ? 'GURU' : 'SISWA'}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-3.5 h-px bg-white/15" />

                    {/* Body */}
                    <div className="flex flex-1 items-center gap-3 px-3.5 py-2">
                      {/* Photo */}
                      <div className="shrink-0 relative">
                        <div className="w-[60px] h-[76px] rounded-xl overflow-hidden border-2 border-white/40 shadow-lg">
                          <img
                            src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white"
                          style={{ background: accentMid }}
                        >
                          ✓
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div>
                          <div className="text-[6.5px] font-extrabold text-white/50 uppercase tracking-widest">Nama Lengkap</div>
                          <div className="text-[12px] font-black text-white leading-tight truncate uppercase">{member.name}</div>
                        </div>
                        <div>
                          <div className="text-[6.5px] font-extrabold text-white/50 uppercase tracking-widest">
                            {isGuru ? 'NIP' : 'NIS / No. Anggota'}
                          </div>
                          <div
                            className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg inline-block"
                            style={{ background: 'rgba(255,255,255,0.15)', color: '#fef3c7', border: '1px solid rgba(255,255,255,0.25)' }}
                          >
                            {member.member_number}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <div className="text-[6.5px] font-extrabold text-white/50 uppercase tracking-widest">Kelas / Jabatan</div>
                            <div className="text-[8.5px] font-bold text-white/90 truncate">{member.class_or_position}</div>
                          </div>
                          <div>
                            <div className="text-[6.5px] font-extrabold text-white/50 uppercase tracking-widest">T.A. Berlaku</div>
                            <div className="text-[8.5px] font-bold text-white/90">2026/2027</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between px-3.5 py-1.5 shrink-0"
                      style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div className="text-[7px] font-bold text-white/60 italic">
                        Kartu ini adalah milik {settings.library_name}
                      </div>
                      {/* Mini QR */}
                      <div className="bg-white rounded p-0.5 shadow-sm">
                        <svg width="26" height="26" viewBox="0 0 21 21">
                          {qrMatrix.map((row, r) =>
                            row.map((cell, c) =>
                              cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={accentFrom} /> : null
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
                  className="w-[356px] h-[224px] rounded-2xl overflow-hidden relative shadow-2xl shrink-0 select-none bg-white"
                  style={{ aspectRatio: '85.6/53.98' }}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-10"
                    style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentMid})` }}
                  />
                  {/* Gold line */}
                  <div className="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400" />

                  {/* Top bar content */}
                  <div className="relative z-10 flex items-center gap-2 px-3.5 pt-2.5 pb-2">
                    <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40 overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={settings.logo_url || 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt'}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="text-[8px] font-extrabold text-white uppercase tracking-wide">
                      Tata Tertib Anggota Perpustakaan
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="relative z-10 px-3.5 pt-2 space-y-[3.5px]">
                    {[
                      'Wajib membawa kartu anggota saat berkunjung & meminjam buku.',
                      'Dilarang merusak, mencoret, atau merobek halaman buku.',
                      'Batas peminjaman maksimal 7 (tujuh) hari kerja.',
                      'Keterlambatan dikenakan denda sesuai ketentuan perpustakaan.',
                      'Kartu tidak boleh dipindahtangankan kepada orang lain.',
                    ].map((rule, i) => (
                      <div key={i} className="flex gap-1.5 items-start">
                        <span
                          className="text-[7.5px] font-extrabold w-3 shrink-0 leading-tight"
                          style={{ color: accentMid }}
                        >
                          {i + 1}.
                        </span>
                        <span className="text-[7.5px] text-slate-700 leading-tight">{rule}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3.5 pb-2 pt-1 border-t border-slate-100">
                    {/* Barcode */}
                    <div>
                      <div className="text-[6.5px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: accentMid }}>
                        ID Anggota
                      </div>
                      <div className="flex gap-px items-end h-5">
                        {barcodeWidths.map((w, i) => (
                          <div
                            key={i}
                            style={{ width: `${w * 1.5}px`, height: `${60 + (i % 3) * 15}%`, background: accentFrom }}
                          />
                        ))}
                      </div>
                      <div className="text-[7px] font-mono font-extrabold mt-0.5" style={{ color: accentFrom }}>
                        *{member.member_number}*
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="text-right">
                      <div className="text-[7px] text-slate-400 font-semibold">{settings.address?.split(',')[0] || 'Tasikmalaya'}, {new Date().getFullYear()}</div>
                      <div className="text-[7px] font-bold text-slate-600">Kepala Perpustakaan,</div>
                      <div className="h-4 my-0.5 flex justify-end items-center">
                        <span className="italic font-serif text-[9px] font-bold" style={{ color: accentMid }}>
                          {(settings.head_librarian || 'Zainul Muttaqin').split(',')[0]}
                        </span>
                      </div>
                      <div
                        className="text-[7px] font-extrabold border-t pt-0.5"
                        style={{ borderColor: accentLight, color: accentText }}
                      >
                        {settings.head_librarian || 'Zainul Muttaqin, S.Pd.I.'}
                      </div>
                    </div>
                  </div>

                  {/* Decorative subtle circle */}
                  <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full opacity-[0.04]"
                    style={{ background: accentFrom }}
                  />
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
