import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertCircle, ScanLine, Zap } from 'lucide-react';
import { Book, Member } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  title?: string;
  placeholderText?: string;
  books: Book[];
  members: Member[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan Barcode / QR Code',
  books = [],
  members = [],
}) => {
  const [code, setCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens or camera is deactivated
  useEffect(() => {
    if (isOpen && !isCameraActive) {
      const timeout = setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, isCameraActive]);

  // QR/Barcode camera scanner instance controller
  useEffect(() => {
    if (!isOpen || !isCameraActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    setCameraError(null);
    setIsScanning(true);

    const timeout = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'html5qr-code-full-region',
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            onScanSuccess(decodedText);
            scanner.clear().catch(console.error);
            setIsCameraActive(false);
            onClose();
          },
          (error) => {
            // Ignore standard frame scan errors
          }
        );

        scannerRef.current = scanner;
      } catch (err: any) {
        console.error('Camera scan init error:', err);
        setCameraError('Kamera tidak terdeteksi atau izin ditolak. Silakan gunakan scanner fisik atau masukkan kode manual.');
        setIsCameraActive(false);
      } finally {
        setIsScanning(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, isCameraActive]);

  // Generate real preset codes from existing books and members (no fallbacks)
  const presetCodes = useMemo(() => {
    const list: { label: string; code: string }[] = [];

    // Add first 3 real books
    books.slice(0, 3).forEach((b) => {
      list.push({
        label: `Buku: ${b.title} (${b.barcode})`,
        code: b.barcode,
      });
    });

    // Add first 3 real members
    members.slice(0, 3).forEach((m) => {
      list.push({
        label: `${m.role === 'guru' ? 'Guru' : 'Siswa'}: ${m.name} (${m.member_number})`,
        code: m.member_number,
      });
    });

    return list;
  }, [books, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onScanSuccess(code.trim());
      setCode('');
      setIsCameraActive(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">{title}</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1.5 font-semibold">Tembak laser scanner, ketik manual, atau pakai kamera HP</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCameraActive(false);
              onClose();
            }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Body */}
        <div className="p-6 space-y-4 text-left">
          {/* Main Input for Hardware Scanner & Manual Type */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700">
              Ketik Kode / Tembakkan Barcode Scanner
            </label>
            <div className="relative">
              <input
                ref={codeInputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Tembakkan laser scanner atau ketik di sini..."
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-2 border-emerald-500 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                autoFocus
              />
              <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Siap Scan</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-450 text-slate-400 font-bold pt-1">
              <span>Sistem mendeteksi tombol <code>ENTER</code> otomatis dari hardware scanner.</span>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
              >
                Proses Kode
              </button>
            </div>
          </form>

          {/* Camera Scanner Toggle section */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                <Camera className="w-4 h-4 text-slate-500" />
                <span>Scan Menggunakan Kamera HP / Web</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer border ${
                  isCameraActive
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {isCameraActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}
              </button>
            </div>

            {isCameraActive && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                {cameraError ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs text-center space-y-2 shadow-3xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 mx-auto animate-bounce" />
                    <p className="font-semibold">{cameraError}</p>
                  </div>
                ) : (
                  <div className="relative min-h-[260px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
                    <div id="html5qr-code-full-region" className="w-full text-white"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real Preset/Sample Codes — only shown when database has data */}
          {presetCodes.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                Sampel Kode Riil Di Database (Untuk Tes Cepat):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {presetCodes.map((preset) => (
                  <button
                    key={preset.code}
                    onClick={() => {
                      onScanSuccess(preset.code);
                      setIsCameraActive(false);
                      onClose();
                    }}
                    className="w-full text-left px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between transition-all cursor-pointer shadow-3xs"
                  >
                    <span className="truncate">{preset.label}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={() => {
              setIsCameraActive(false);
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
