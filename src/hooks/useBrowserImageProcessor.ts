import { useState } from "react";
import imageCompression from 'browser-image-compression';

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

export const useBrowserImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadToCatbox = async (file: File, filename: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append('fileToUpload', file);
    formData.append('reqtype', 'fileupload');

    try {
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const url = await response.text();
        return url.trim();
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const downloadImageAsFile = async (imageUrl: string): Promise<File | null> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) return null;
      const filename = imageUrl.split('/').pop()?.split('?')[0] || 'image';
      const extension = blob.type.split('/')[1] || 'jpg';
      return new File([blob], `${filename}.${extension}`, { type: blob.type });
    } catch (error) {
      return null;
    }
  };

  const compressImage = async (file: File): Promise<File | null> => {
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      initialQuality: 0.2,
      fileType: file.type,
    };

    try {
      return await imageCompression(file, options);
    } catch (err) {
      return null;
    }
  };

  const generateRandomId = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) return null;
    setIsProcessing(true);

    try {
      // Step 1: Download original image
      const originalFile = await downloadImageAsFile(imageUrl);
      if (!originalFile) return null;

      // Step 2: Upload to Catbox (always use this result for both fields on fallback)
      const randomId = generateRandomId();
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const originalFilename = `${cleanTitle}_original_${randomId}`;
      const originalCatboxUrl = await uploadToCatbox(originalFile, originalFilename);

      if (!originalCatboxUrl) return null;

      // Step 3: Download from Catbox (for CORS) and compress
      const catboxFile = await downloadImageAsFile(originalCatboxUrl);
      let compressedCatboxUrl = null;

      if (catboxFile) {
        const compressedFile = await compressImage(catboxFile);
        if (compressedFile) {
          const compressedFilename = `${cleanTitle}_compressed_${randomId}`;
          compressedCatboxUrl = await uploadToCatbox(compressedFile, compressedFilename);
        }
      }

      // If compression/upload failed, fallback: both fields use Catbox original
      return {
        originalUrl: originalCatboxUrl,
        compressedUrl: compressedCatboxUrl || originalCatboxUrl
      };

    } catch (error) {
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing };
};
