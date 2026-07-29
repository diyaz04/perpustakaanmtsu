import React, { useMemo } from 'react';
import { XCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { Book } from '../types';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  if (!isOpen || !book || !book.e_book_url) return null;

  // Process the URL to ensure it's embeddable
  const processedUrl = useMemo(() => {
    const url = book.e_book_url;
    if (!url) return '';

    try {
      // Handle Google Drive links
      if (url.includes('drive.google.com')) {
        // Extract file ID
        // Typical format: https://drive.google.com/file/d/1X2Y3Z/view?usp=sharing
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          const fileId = match[1];
          // Use preview endpoint which hides some of the standard Google Drive UI
          return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
        }
      }
      
      // Handle standard PDF links (Cloudinary, etc.)
      // Add #toolbar=0 to disable the default browser PDF viewer toolbar (download/print)
      if (url.toLowerCase().endsWith('.pdf') && !url.includes('#toolbar=0')) {
        return `${url}#toolbar=0`;
      }

      return url;
    } catch (e) {
      return url;
    }
  }, [book.e_book_url]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-10 bg-white/10 rounded flex items-center justify-center shrink-0 border border-white/20">
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-[3px]" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base truncate">{book.title}</h3>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate">{book.author} • E-Library Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href={book.e_book_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors text-slate-200"
              title="Buka di tab baru (jika error)"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Buka Tab Baru</span>
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-slate-300 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Warning / Notice (Optional to assure users) */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center gap-2 text-[10px] sm:text-xs text-amber-800 shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-amber-600" />
          <p>
            <strong>Mode Terproteksi:</strong> Dokumen ini dilindungi dan hanya dapat dibaca melalui portal e-library. Beberapa fitur mungkin dinonaktifkan oleh pemilik dokumen.
          </p>
        </div>

        {/* Iframe Content */}
        <div className="flex-1 w-full bg-slate-100 relative">
          {processedUrl ? (
            <iframe
              src={processedUrl}
              className="absolute inset-0 w-full h-full border-0"
              title={`E-Book: ${book.title}`}
              allow="autoplay; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-400">
              URL E-Book tidak valid.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
