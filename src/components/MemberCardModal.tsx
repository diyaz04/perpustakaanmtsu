import React, { useState, useRef } from 'react';
import { Member, LibrarySettings } from '../types';
import {
  X,
  Printer,
  Download,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  RotateCw,
  FileText,
  Check,
  CheckCircle2,
  Sparkles,
  Info,
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

  // Generate deterministic QR matrix grid for member_number
  const qrMatrix = generateQRMatrix(member.member_number);

  // Handle direct browser print
  const handlePrint = () => {
    window.print();
  };

  // Download card as crisp 300 DPI PNG image
  const handleDownloadPNG = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const targetRef = activeSide === 'front' ? cardFrontRef : activeSide === 'back' ? cardBackRef : cardBothRef;

      if (!targetRef.current) return;

      const dataUrl = await toPng(targetRef.current, {
        quality: 0.95,
        pixelRatio: 3, // High DPI output for crisp printing
        cacheBust: true,
      });

      const link = document.createElement('a');
      const sideName = activeSide === 'both' ? 'Lengkap' : activeSide === 'front' ? 'Depan' : 'Belakang';
      const cleanMemberName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Kartu_Anggota_${cleanMemberName}_${sideName}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal mengunduh kartu sebagai gambar:', err);
      alert('Gagal mengunduh kartu. Silakan gunakan tombol Cetak untuk menyimpan sebagai PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download as printable PDF sheet (A4 size with front + back aligned side by side)
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      if (!cardFrontRef.current || !cardBackRef.current) return;

      const frontDataUrl = await toPng(cardFrontRef.current, { pixelRatio: 3, cacheBust: true });
      const backDataUrl = await toPng(cardBackRef.current, { pixelRatio: 3, cacheBust: true });

      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait A4

      // Title & School Header in PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(22, 101, 52); // Emerald
      pdf.text(settings.school_name.toUpperCase(), 105, 18, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setTextColor(30, 41, 59);
      pdf.text('KARTU ANGGOTA PERPUSTAKAAN DIGITAL (STANDAR KTP / ID-1)', 105, 24, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Nama: ${member.name} | No. Anggota: ${member.member_number} | Status: ${member.role.toUpperCase()}`, 105, 29, { align: 'center' });

      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.line(15, 32, 195, 32);

      // KTP dimensions in mm: 85.6 mm x 53.98 mm
      const cardWidth = 85.6;
      const cardHeight = 53.98;

      // Position Cards on A4 sheet
      const xFront = 18;
      const xBack = 108;
      const yPos = 40;

      // Add Front Image
      pdf.addImage(frontDataUrl, 'PNG', xFront, yPos, cardWidth, cardHeight);
      pdf.rect(xFront, yPos, cardWidth, cardHeight); // Outline border

      // Add Back Image
      pdf.addImage(backDataUrl, 'PNG', xBack, yPos, cardWidth, cardHeight);
      pdf.rect(xBack, yPos, cardWidth, cardHeight); // Outline border

      // Instructions & Crop lines guide below
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Garis Potong Presisi (Gunting mengikuti garis luar kotak)', 105, yPos + cardHeight + 8, { align: 'center' });
      pdf.text('Dicetak dari Sistem Manajemen Perpustakaan MTs KH A Wahab Muhsin', 105, yPos + cardHeight + 13, { align: 'center' });

      const cleanMemberName = member.name.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Kartu_Anggota_${cleanMemberName}_PrintReady.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal membuat PDF kartu:', err);
      alert('Gagal mengeksport PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Kartu Anggota Perpustakaan (Ukuran KTP)</h3>
              <p className="text-[11px] text-slate-400">Standar ISO 85.6 x 54 mm • Siap Cetak & Download</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Controls & Side Toggle Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Side Selector Tabs */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveSide('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSide === 'both' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Depan & Belakang
            </button>
            <button
              onClick={() => setActiveSide('front')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSide === 'front' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tampak Depan
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSide === 'back' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tampak Belakang
            </button>
          </div>

          <div className="text-[11px] font-medium text-slate-500 hidden sm:flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Rasio KTP Presisi: 85.6mm × 53.98mm</span>
          </div>
        </div>

        {/* Modal Scrollable Canvas Body */}
        <div className="p-6 overflow-y-auto bg-slate-100/80 flex-1 flex flex-col items-center justify-center min-h-[300px]">
          {/* Printable Combined Container Ref */}
          <div ref={cardBothRef} className="p-2 flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {/* ======================================= */}
              {/* FRONT SIDE CARD (TAMPAK DEPAN)          */}
              {/* ======================================= */}
              {(activeSide === 'both' || activeSide === 'front') && (
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Sisi Depan (Front)
                  </span>
                  <div
                    id="printable-member-card-front"
                    ref={cardFrontRef}
                    className="w-[356px] h-[224px] bg-white rounded-xl shadow-lg border-2 border-emerald-700/80 overflow-hidden relative flex flex-col justify-between shrink-0 select-none print:m-0"
                    style={{
                      aspectRatio: '85.6 / 53.98',
                    }}
                  >
                    {/* Security Watermark Background Pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:8px_8px]" />

                    {/* Card Header (Kop Kartu) */}
                    <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 text-white p-2.5 flex items-center gap-2.5 relative border-b-2 border-amber-400 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-amber-300 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        <img
                          src={settings.logo_url || 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt'}
                          alt="Logo Perpustakaan"
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] uppercase tracking-widest font-black text-amber-300 leading-none">
                          KARTU ANGGOTA PERPUSTAKAAN
                        </div>
                        <div className="text-xs font-black tracking-tight text-white mt-0.5 truncate leading-tight">
                          {settings.school_name}
                        </div>
                        <div className="text-[8.5px] text-emerald-200 truncate leading-none">
                          {settings.library_name} • YAPIP SUKARAMA
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[8px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          DIGITAL
                        </span>
                      </div>
                    </div>

                    {/* Card Middle Body */}
                    <div className="px-3.5 py-2 flex items-center gap-3 flex-1 relative z-10">
                      {/* Photo Frame (3x4 proportion) */}
                      <div className="relative shrink-0">
                        <img
                          src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                          alt={member.name}
                          className="w-[66px] h-[84px] object-cover rounded-md border-2 border-emerald-600 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow-xs">
                          <ShieldCheck className="w-3 h-3" />
                        </span>
                      </div>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div>
                          <div className="text-[7.5px] uppercase font-bold text-slate-400 tracking-wider">
                            Nama Anggota
                          </div>
                          <div className="text-[12px] font-black text-slate-900 leading-tight truncate uppercase">
                            {member.name}
                          </div>
                        </div>

                        <div>
                          <div className="text-[7.5px] uppercase font-bold text-slate-400 tracking-wider">
                            {member.role === 'guru' ? 'NIP / ID' : 'NIS / No. Anggota'}
                          </div>
                          <div className="text-[11px] font-mono font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 inline-block">
                            {member.member_number}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-0.5">
                          <div>
                            <div className="text-[7.5px] uppercase font-bold text-slate-400 tracking-wider">
                              Status
                            </div>
                            <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-800 font-black rounded text-[8.5px] uppercase">
                              {member.role}
                            </span>
                          </div>
                          <div>
                            <div className="text-[7.5px] uppercase font-bold text-slate-400 tracking-wider">
                              Kelas / Jabatan
                            </div>
                            <div className="text-[9.5px] font-bold text-slate-800 truncate">
                              {member.class_or_position}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between shrink-0 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-[9px]">
                          ✓
                        </div>
                        <div>
                          <div className="text-[7px] uppercase font-bold text-slate-400 leading-none">
                            Masa Berlaku
                          </div>
                          <div className="text-[8.5px] font-bold text-slate-700 leading-tight">
                            Aktif s.d. Tahun Ajaran 2026/2027
                          </div>
                        </div>
                      </div>

                      {/* SVG Matrix QR Code */}
                      <div className="bg-white p-0.5 rounded border border-slate-300 shadow-2xs flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 21 21" className="shape-rendering-crisp">
                          {qrMatrix.map((row, r) =>
                            row.map((cell, c) =>
                              cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#065f46" /> : null
                            )
                          )}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* BACK SIDE CARD (TAMPAK BELAKANG)        */}
              {/* ======================================= */}
              {(activeSide === 'both' || activeSide === 'back') && (
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Sisi Belakang (Back)
                  </span>
                  <div
                    id="printable-member-card-back"
                    ref={cardBackRef}
                    className="w-[356px] h-[224px] bg-white rounded-xl shadow-lg border-2 border-emerald-700/80 overflow-hidden relative flex flex-col justify-between shrink-0 select-none print:m-0"
                    style={{
                      aspectRatio: '85.6 / 53.98',
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:8px_8px]" />

                    {/* Back Header */}
                    <div className="bg-slate-900 text-white p-2 border-b-2 border-emerald-500 shrink-0 flex items-center justify-center gap-2">
                      <img
                        src={settings.logo_url || 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt'}
                        alt="Logo"
                        className="w-5 h-5 object-contain rounded-full bg-white p-0.5"
                        crossOrigin="anonymous"
                      />
                      <div className="text-center">
                        <div className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400">
                          TATA TERTIB ANGGOTA PERPUSTAKAAN
                        </div>
                        <div className="text-[8px] text-slate-300 font-medium">
                          {settings.school_name}
                        </div>
                      </div>
                    </div>

                    {/* Rules List */}
                    <div className="px-3.5 py-1.5 text-[8px] leading-tight text-slate-700 space-y-1 flex-1">
                      <div className="flex gap-1.5 items-start">
                        <span className="font-bold text-emerald-700 shrink-0">1.</span>
                        <span>Wajib membawa Kartu Anggota saat berkunjung & meminjam buku.</span>
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <span className="font-bold text-emerald-700 shrink-0">2.</span>
                        <span>Dilarang merusak, mencoret, atau merobek halaman buku.</span>
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <span className="font-bold text-emerald-700 shrink-0">3.</span>
                        <span>Batas waktu peminjaman buku maksimal 7 (tujuh) hari kerja.</span>
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <span className="font-bold text-emerald-700 shrink-0">4.</span>
                        <span>Keterlambatan dikenakan denda sesuai ketentuan perpustakaan.</span>
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <span className="font-bold text-emerald-700 shrink-0">5.</span>
                        <span>Kartu tidak boleh dipindahtandagankan kepada orang lain.</span>
                      </div>
                    </div>

                    {/* Stamp & Signature Footer */}
                    <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                      {/* Barcode line */}
                      <div>
                        <div className="text-[7px] text-slate-400 font-bold uppercase">Barcode Anggota</div>
                        <div className="flex gap-0.5 items-end h-5 mt-0.5">
                          {[1, 2, 1, 3, 1, 2, 1, 1, 3, 1, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1].map((w, i) => (
                            <div
                              key={i}
                              className="bg-slate-800"
                              style={{ width: `${w}px`, height: '100%' }}
                            />
                          ))}
                        </div>
                        <div className="text-[7.5px] font-mono font-bold text-slate-700 mt-0.5">
                          *{member.member_number}*
                        </div>
                      </div>

                      {/* Signature Block */}
                      <div className="text-right text-[7.5px]">
                        <div className="text-slate-500 font-medium">Tasikmalaya, {new Date().getFullYear()}</div>
                        <div className="font-bold text-slate-800">Kepala Perpustakaan,</div>
                        <div className="h-5 my-0.5 flex justify-end items-center italic font-serif text-emerald-800 text-[9px] font-bold">
                          Zainul Muttaqin
                        </div>
                        <div className="font-bold text-slate-900 border-t border-slate-300 pt-0.5">
                          {settings.head_librarian || 'Zainul Muttaqin, S.Pd.I.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {downloadSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Berhasil Diunduh!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Download PNG Button */}
            <button
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{isDownloading ? 'Mengeksport...' : 'Download Gambar (PNG)'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Download PDF (Print Ready)</span>
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-green-100 flex items-center gap-1.5 transition-colors cursor-pointer"
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
