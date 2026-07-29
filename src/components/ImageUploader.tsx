import React, { useRef, useState } from 'react';
import { Camera, Upload, Link as LinkIcon, Check, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { processAndUploadImage } from '../lib/imageUtils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  cloudName?: string;
  uploadPreset?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Foto / Gambar',
  placeholder = 'https://...',
  cloudName,
  uploadPreset,
  maxWidth = 800,
  maxHeight = 800,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setStatusMsg({ text: 'Harap pilih file gambar (JPG, PNG, WebP)', type: 'error' });
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMsg({ text: 'Mengompres gambar & memproses...', type: 'info' });

      const result = await processAndUploadImage(file, cloudName, uploadPreset, { maxWidth, maxHeight });

      onChange(result.url);

      if (result.isCloudinary) {
        setStatusMsg({
          text: `⚡ Berhasil terkompres & tersimpan di Cloudinary! Ukuran: ${result.sizeKB} KB (Hemat ${result.compressionRatio}%)`,
          type: 'success',
        });
      } else {
        setStatusMsg({
          text: `⚡ Foto terkompres otomatis! Ukuran: ${result.sizeKB} KB (Hemat ${result.compressionRatio}%)`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Error processing image:', err);
      setStatusMsg({ text: 'Gagal memproses gambar. Coba file lain.', type: 'error' });
    } finally {
      setIsProcessing(false);
      // Reset input value so re-selecting the same file works
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      {/* Preview and Upload Trigger Box */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {/* Thumbnail Preview */}
        <div className="relative w-16 h-20 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setStatusMsg(null);
              }}
              className="absolute top-1 right-1 p-0.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
              title="Hapus foto"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 w-full space-y-2">
          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Camera Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Kamera HP</span>
            </button>

            {/* Gallery Upload Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Pilih Gambar</span>
            </button>

            {/* Manual URL Link Button Toggle */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{showUrlInput ? 'Sembunyikan Link' : 'Input Link URL'}</span>
            </button>
          </div>

          {/* Optional Direct URL Input */}
          {showUrlInput && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          )}

          {/* Status / Compression Info Message */}
          {isProcessing ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Proses kompresi gambar otomatis...</span>
            </div>
          ) : statusMsg ? (
            <div
              className={`text-[11px] font-medium leading-tight flex items-start gap-1 ${
                statusMsg.type === 'success'
                  ? 'text-emerald-700'
                  : statusMsg.type === 'error'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
              <span>{statusMsg.text}</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400">
              Otomatis dikompresi maksimal (~20-50 KB) sebelum disimpan link/URL nya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
