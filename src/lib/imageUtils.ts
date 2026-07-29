/**
 * Utility for image compression and Cloudinary upload.
 */

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
}

/**
 * Compress image using Canvas API
 * Resizes max width/height to target size and reduces JPEG quality
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.72
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKB = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio resizing
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Convert dataUrl back to a compressed File object
        const head = 'data:image/jpeg;base64,';
        const imgFileSize = Math.round(((dataUrl.length - head.length) * 3) / 4);
        const compressedSizeKB = Math.round(imgFileSize / 1024);

        // Convert base64 string to Blob -> File
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '_compressed.jpg', {
          type: 'image/jpeg',
        });

        const ratio = Math.round((1 - compressedSizeKB / (originalSizeKB || 1)) * 100);

        resolve({
          file: compressedFile,
          dataUrl,
          originalSizeKB,
          compressedSizeKB,
          compressionRatio: Math.max(0, ratio),
        });
      };

      img.onerror = () => reject(new Error('Gagal membaca file gambar'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Gagal memuat file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Cloudinary if configured, otherwise fallback to compressed Data URL
 */
export async function processAndUploadImage(
  file: File,
  cloudName?: string,
  uploadPreset?: string,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<{ url: string; isCloudinary: boolean; sizeKB: number; compressionRatio: number }> {
  // 1. Compress image first
  const compressed = await compressImage(
    file,
    options?.maxWidth || 800,
    options?.maxHeight || 800,
    options?.quality || 0.72
  );

  // 2. Try Cloudinary upload if cloudName and preset are provided
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return {
            url: data.secure_url,
            isCloudinary: true,
            sizeKB: compressed.compressedSizeKB,
            compressionRatio: compressed.compressionRatio,
          };
        }
      } else {
        console.warn('Cloudinary upload warning:', await response.text());
      }
    } catch (err) {
      console.warn('Gagal upload ke Cloudinary, menggunakan URL terkompresi lokal:', err);
    }
  }

  // 3. Fallback to lightweight compressed Data URL
  return {
    url: compressed.dataUrl,
    isCloudinary: false,
    sizeKB: compressed.compressedSizeKB,
    compressionRatio: compressed.compressionRatio,
  };
}
