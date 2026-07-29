import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertCircle, ScanLine, Usb, Zap, Keyboard } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  title?: string;
  placeholderText?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan Barcode / QR Code',
  placeholderText = 'Arahkan kamera ke barcode buku atau QR kartu anggota',
}) => {
  const [activeTab, setActiveTab] = useState<'gun' | 'camera' | 'manual'>('gun');
  const [manualCode, setManualCode] = useState('');
  const [gunCode, setGunCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const gunInputRef = useRef<HTMLInputElement>(null);

  // Auto focus physical scanner input whenever modal opens or switching to 'gun' tab
  useEffect(() => {
    if (isOpen && activeTab === 'gun') {
      setTimeout(() => {
        gunInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    if (activeTab === 'camera') {
      setCameraError(null);
      setIsScanning(true);

      const timeout = setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            'html5qr-code-full-region',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              onScanSuccess(decodedText);
              scanner.clear().catch(console.error);
              onClose();
            },
            (error) => {
              // Ignore standard frame scan errors
            }
          );

          scannerRef.current = scanner;
        } catch (err: any) {
          console.error('Camera scan init error:', err);
          setCameraError('Kamera tidak terdeteksi atau izin ditolak. Silakan gunakan Scanner USB atau Input Manual.');
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
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleGunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gunCode.trim()) {
      onScanSuccess(gunCode.trim());
      setGunCode('');
      onClose();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  const presetCodes = [
    { label: 'Buku Fiqih (9786022931021)', code: '9786022931021' },
    { label: 'Buku Akidah (9786022932059)', code: '9786022932059' },
    { label: 'Siswa Rayhan (20237001)', code: '20237001' },
    { label: 'Siswa Aisyah (20237012)', code: '20237012' },
    { label: 'Guru Ust. Nurul (197805142005011002)', code: '197805142005011002' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ScanLine className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base leading-tight">{title}</h3>
              <p className="text-[11px] text-emerald-100">Kamera HP &amp; Support Scanner Minimarket (USB / Wireless)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('gun')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'gun'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Usb className="w-4 h-4 text-emerald-600" />
            Scanner Minimarket (USB/BT)
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-4 h-4 text-slate-600" />
            Kamera HP / Web
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Keyboard className="w-4 h-4 text-slate-600" />
            Input Manual
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {activeTab === 'gun' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-900">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Support 100% Scanner Barcode Minimarket (Plug &amp; Play)</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-700">
                  Tancapkan kabel <strong>USB Scanner / Receiver Wireless Minimarket</strong> ke komputer/laptop. Tembakkan laser ke Barcode / QR Code, hasil scan akan otomatis diproses instan tanpa perlu klik tombol!
                </p>
              </div>

              <form onSubmit={handleGunSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    ref={gunInputRef}
                    type="text"
                    value={gunCode}
                    onChange={(e) => setGunCode(e.target.value)}
                    placeholder="Tembakkan Scanner Minimarket di sini..."
                    className="w-full px-4 py-3 bg-white border-2 border-emerald-500 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 shadow-inner"
                    autoFocus
                  />
                  <div className="absolute right-3 top-3.5 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Siap Scan</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Sistem mendeteksi tombol <code>ENTER</code> otomatis dari hardware scanner.</span>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Proses Kode
                  </button>
                </div>
              </form>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                  Atau klik sampel kode untuk uji coba cepat tanpa alat:
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {presetCodes.map((preset) => (
                    <button
                      key={preset.code}
                      onClick={() => {
                        onScanSuccess(preset.code);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{preset.label}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            <div>
              <p className="text-xs text-slate-500 text-center mb-3">{placeholderText}</p>

              {cameraError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm text-center my-4 space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p>{cameraError}</p>
                  <button
                    onClick={() => setActiveTab('gun')}
                    className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                  >
                    Beralih ke Scanner USB Minimarket
                  </button>
                </div>
              ) : (
                <div className="relative min-h-[280px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <div id="html5qr-code-full-region" className="w-full text-white"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Ketik Nomor Barcode / NIS / NIP / ISBN
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Contoh: 9786022931021 atau 20237001"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-600 shadow-xs cursor-pointer"
                  >
                    Proses
                  </button>
                </div>
              </form>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Kode sampel untuk tes:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {presetCodes.map((preset) => (
                    <button
                      key={preset.code}
                      onClick={() => {
                        onScanSuccess(preset.code);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg text-xs font-medium text-emerald-900 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{preset.label}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

