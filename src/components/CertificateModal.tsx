import React, { useRef, useState } from 'react';
import { Member, LibrarySettings } from '../types';
import { Award, Printer, X, Sparkles, School, Check, ShieldCheck, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | {
    name: string;
    member_number: string;
    class_or_position: string;
  };
  visitCount: number;
  loanCount: number;
  monthYearStr: string; // e.g. "Juli 2026"
  rankNumber?: number; // 1, 2, 3, etc.
  settings: LibrarySettings;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  member,
  visitCount,
  loanCount,
  monthYearStr,
  rankNumber = 1,
  settings,
}) => {
  const [awardTitle, setAwardTitle] = useState('PENGUNJUNG PERPUSTAKAAN TERFAVORIT');
  const [certificateNo, setCertificateNo] = useState(
    `00${rankNumber}/PIAGAM-PERPUS/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
  );
  const [issueDate, setIssueDate] = useState(
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  // Background template states
  const [useCustomBg, setUseCustomBg] = useState(false);
  const [customBgUrl, setCustomBgUrl] = useState<string>('/assets/certificate-template.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBgUrl(event.target.result as string);
          setUseCustomBg(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getRankBadgeText = (rank: number) => {
    if (rank === 1) return 'JUARA I (TERTERAJIN)';
    if (rank === 2) return 'JUARA II';
    if (rank === 3) return 'JUARA III';
    return `PERINGKAT ${rank}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Print Styles Injection for A4 Landscape */}
      <style>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full my-6 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Non-printable) */}
        <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Piagam Penghargaan Ukuran A4 Landscape</h3>
              <p className="text-[11px] text-slate-400">Presisi standar cetak A4 (297 x 210 mm) dengan Opsi Background Custom Asset</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Controls (Non-printable) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 text-xs no-print">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Judul / Gelar Piagam:</label>
              <select
                value={awardTitle}
                onChange={(e) => setAwardTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PENGUNJUNG PERPUSTAKAAN TERFAVORIT">PENGUNJUNG PERPUSTAKAAN TERFAVORIT</option>
                <option value="DUTA BACA TERRAJIN">DUTA BACA TERRAJIN</option>
                <option value="PEMINJAM BUKU TERBANYAK">PEMINJAM BUKU TERBANYAK</option>
                <option value="SISWA GEMAR MEMBACA BUKU">SISWA GEMAR MEMBACA BUKU</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Piagam:</label>
              <input
                type="text"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Terbit:</label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Template Image Background Settings */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={useCustomBg}
                  onChange={(e) => setUseCustomBg(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Gunakan Gambar Template Background / Asset</span>
              </label>

              {useCustomBg && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBgFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-[11px] rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Template A4 (PNG/JPG)</span>
                  </button>

                  <input
                    type="text"
                    value={customBgUrl}
                    onChange={(e) => setCustomBgUrl(e.target.value)}
                    placeholder="Atau path asset: /assets/template.png"
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono text-[11px] w-56 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Ukuran Rasio Cetak A4 Landscape (297 mm x 210 mm)
            </p>
          </div>
        </div>

        {/* Certificate Preview Container */}
        <div className="p-6 md:p-8 bg-slate-200 overflow-x-auto flex justify-center">
          <div
            id="printable-certificate"
            className={`w-[842px] h-[595px] bg-white p-8 relative shadow-2xl flex flex-col justify-between select-none text-slate-900 overflow-hidden ${
              !useCustomBg ? 'border-[10px] border-double border-amber-600 rounded-2xl' : 'rounded-none'
            }`}
            style={{
              backgroundImage: useCustomBg
                ? `url("${customBgUrl}")`
                : 'radial-gradient(#fef3c7 0.75px, transparent 0.75px)',
              backgroundSize: useCustomBg ? 'cover' : '24px 24px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Custom Background Image Fallback Error or Overlay */}
            {useCustomBg && (
              <img
                src={customBgUrl}
                alt="Certificate Template"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                onError={(e) => {
                  // If asset file doesn't exist yet, show friendly indicator
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}

            {/* Inner Gold Frame Border (Only when NOT using full custom template background) */}
            {!useCustomBg && (
              <div className="absolute inset-3 border-2 border-emerald-700 rounded-lg pointer-events-none flex flex-col justify-between p-4 z-10">
                <div className="w-12 h-12 border-t-4 border-l-4 border-amber-600 absolute -top-1 -left-1" />
                <div className="w-12 h-12 border-t-4 border-r-4 border-amber-600 absolute -top-1 -right-1" />
                <div className="w-12 h-12 border-b-4 border-l-4 border-amber-600 absolute -bottom-1 -left-1" />
                <div className="w-12 h-12 border-b-4 border-r-4 border-amber-600 absolute -bottom-1 -right-1" />
              </div>
            )}

            {/* Certificate Header */}
            <div className="text-center relative z-20 space-y-1 mt-1">
              <div className="flex items-center justify-center gap-3 mb-1">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-800 text-amber-400 flex items-center justify-center font-bold text-xl border-2 border-amber-500 shadow-xs">
                    <School className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    PERPUSTAKAAN {settings.library_name.toUpperCase()}
                  </h4>
                  <h2 className="text-base font-extrabold uppercase tracking-wide text-emerald-900">
                    {settings.school_name.toUpperCase()}
                  </h2>
                  <p className="text-[10px] text-slate-600 italic">{settings.address}</p>
                </div>
              </div>

              <div className="w-2/3 mx-auto border-b-2 border-amber-600/70 my-2" />

              <div className="space-y-0.5">
                <h1 className="text-2xl font-black tracking-widest text-amber-800 uppercase font-serif drop-shadow-2xs">
                  PIAGAM PENGHARGAAN
                </h1>
                <p className="text-[11px] font-mono font-bold text-slate-700">
                  Nomor: {certificateNo}
                </p>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-center relative z-20 space-y-3 my-auto px-8">
              <p className="text-xs font-semibold text-slate-700">
                Kepala Perpustakaan {settings.school_name} memberikan penghargaan setinggi-tingginya kepada:
              </p>

              <div className="py-1">
                <h2 className="text-2xl font-black text-emerald-950 font-serif underline underline-offset-8 decoration-amber-500 tracking-wide drop-shadow-2xs">
                  {member.name}
                </h2>
                <p className="text-xs font-bold text-slate-800 mt-2">
                  NIS/NIP: <span className="font-mono">{member.member_number}</span> &nbsp;|&nbsp; Kelas / Jabatan: <span>{member.class_or_position}</span>
                </p>
              </div>

              <div className="max-w-xl mx-auto bg-amber-50/90 backdrop-blur-xs border border-amber-300 p-3 rounded-2xl space-y-1 shadow-2xs">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Atas Prestasi Istimewa Sebagai:
                </p>
                <div className="text-sm font-extrabold text-emerald-900 tracking-wide font-serif">
                  "{awardTitle} {getRankBadgeText(rankNumber)}"
                </div>
                <p className="text-[11px] text-slate-800 font-semibold">
                  Periode: <span className="font-bold text-slate-900">{monthYearStr}</span> dengan pencapaian total{' '}
                  <span className="font-bold text-emerald-900">{visitCount} Kali Kunjungan</span> &amp;{' '}
                  <span className="font-bold text-emerald-900">{loanCount} Buku Dipinjam</span>.
                </p>
              </div>

              <p className="text-[11px] text-slate-600 italic max-w-xl mx-auto leading-relaxed font-medium">
                Semoga piagam ini menjadi motivasi untuk senantiasa meningkatkan minat membaca, menuntut ilmu, dan menjadi inspirasi bagi rekan-rekan siswa lainnya.
              </p>
            </div>

            {/* Certificate Footer / Signature Section */}
            <div className="flex justify-between items-end relative z-20 px-8 mb-1 text-xs">
              {/* Gold Seal / Badge Icon */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex flex-col items-center justify-center p-1 border-2 border-white shadow-md relative">
                  <Award className="w-8 h-8 text-amber-950" />
                  <span className="text-[8px] font-black tracking-tighter text-amber-950 uppercase">OFFICIAL</span>
                </div>
                <span className="text-[9px] font-bold text-amber-900 uppercase mt-1">Cap Resmi Perpus</span>
              </div>

              {/* Signature Box */}
              <div className="text-center space-y-1">
                <p className="text-[11px] text-slate-700">
                  Diterbitkan pada: <span className="font-bold text-slate-900">{issueDate}</span>
                </p>
                <p className="text-xs font-bold text-slate-900">Kepala Perpustakaan,</p>

                {/* Digital Stamp / Signature Placeholder */}
                <div className="h-12 flex items-center justify-center relative my-1">
                  <div className="w-28 h-10 border border-dashed border-emerald-400 rounded-lg bg-emerald-50/70 flex items-center justify-center text-[9px] text-emerald-900 font-bold italic">
                    [ Tanda Tangan &amp; Stempel ]
                  </div>
                </div>

                <div className="border-b border-slate-900 font-bold text-slate-900 text-xs px-2 inline-block">
                  {settings.head_librarian}
                </div>
                <p className="text-[10px] font-mono text-slate-700 font-medium">NIP. {settings.nip_head}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

