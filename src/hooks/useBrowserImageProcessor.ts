import { useState } from "react";
import imageCompression from 'browser-image-compression';

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

const uploadToCatbox = async (file: File, filename: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('fileToUpload', file);
  formData.append('reqtype', 'fileupload');
  try {
    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });
    if (res.ok) return (await res.text()).trim();
    console.error("Catbox upload failed with status", res.status);
    return null;
  } catch (e) {
    console.error("Catbox upload failed", e);
    return null;
  }
};

const downloadImageAsFile = async (url: string): Promise<File | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Image download failed", res.status, res.statusText);
      return null;
    }
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) {
      console.error("Downloaded file is not an image, type:", blob.type);
      return null;
    }
    const filename = url.split('/').pop()?.split('?')[0] || 'image';
    const ext = blob.type.split('/')[1] || 'jpg';
    return new File([blob], `${filename}.${ext}`, { type: blob.type });
  } catch (e) {
    console.error("Image download threw an error", e);
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
  } catch (e) {
    console.error("Compression failed", e);
    return null;
  }
};

export const useBrowserImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) return null;
    setIsProcessing(true);

    try {
      // 1. Download original from external URL
      const originalFile = await downloadImageAsFile(imageUrl);
      if (!originalFile) {
        alert("Could not download image. Check the URL or CORS restrictions (try a different image host).");
        return null;
      }

      // 2. Upload to Catbox
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const randomId = Math.floor(1000 + Math.random() * 9000).toString();
      const originalFilename = `${cleanTitle}_original_${randomId}`;
      const originalCatboxUrl = await uploadToCatbox(originalFile, originalFilename);
      if (!originalCatboxUrl) {
        alert("Could not upload to Catbox. Try again later.");
        return null;
      }

      // 3. Download from Catbox (for CORS-safe file)
      const catboxFile = await downloadImageAsFile(originalCatboxUrl);
      if (!catboxFile) {
        // Fallback: use Catbox original for both
        return {
          originalUrl: originalCatboxUrl,
          compressedUrl: originalCatboxUrl
        };
      }

      // 4. Try to compress and upload compressed to Catbox
      let compressedCatboxUrl: string | null = null;
      const compressedFile = await compressImage(catboxFile);
      if (compressedFile) {
        const compressedFilename = `${cleanTitle}_compressed_${randomId}`;
        compressedCatboxUrl = await uploadToCatbox(compressedFile, compressedFilename);
      }

      // 5. If compression/upload fails, use Catbox original for both
      return {
        originalUrl: originalCatboxUrl,
        compressedUrl: compressedCatboxUrl || originalCatboxUrl
      };
    } catch (e) {
      console.error("Image processing error", e);
      alert("Unknown error processing image. See console for details.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing };
};      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) {
        console.error("Downloaded file is not an image, type:", blob.type);
        return null;
      }
      const filename = url.split('/').pop()?.split('?')[0] || 'image';
      const ext = blob.type.split('/')[1] || 'jpg';
      return new File([blob], `${filename}.${ext}`, { type: blob.type });
    } catch (e) {
      console.error("Image download threw an error", e);
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
    } catch (e) {
      console.error("Compression failed", e);
      return null;
    }
  };

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) return null;
    setIsProcessing(true);

    try {
      // 1. Download original from external URL
      const originalFile = await downloadImageAsFile(imageUrl);
      if (!originalFile) {
        alert("Could not download image. Check the URL or CORS restrictions (try a different image host).");
        return null;
      }

      // 2. Upload to Catbox
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const randomId = Math.floor(1000 + Math.random() * 9000).toString();
      const originalFilename = `${cleanTitle}_original_${randomId}`;
      const originalCatboxUrl = await uploadToCatbox(originalFile, originalFilename);
      if (!originalCatboxUrl) {
        alert("Could not upload to Catbox. Try again later.");
        return null;
      }

      // 3. Download from Catbox (for CORS-safe file)
      const catboxFile = await downloadImageAsFile(originalCatboxUrl);
      if (!catboxFile) {
        // Fallback: use Catbox original for both
        return {
          originalUrl: originalCatboxUrl,
          compressedUrl: originalCatboxUrl
        };
      }

      // 4. Try to compress and upload compressed to Catbox
      let compressedCatboxUrl: string | null = null;
      const compressedFile = await compressImage(catboxFile);
      if (compressedFile) {
        const compressedFilename = `${cleanTitle}_compressed_${randomId}`;
        compressedCatboxUrl = await uploadToCatbox(compressedFile, compressedFilename);
      }

      // 5. If compression/upload fails, use Catbox original for both
      return {
        originalUrl: originalCatboxUrl,
        compressedUrl: compressedCatboxUrl || originalCatboxUrl
      };
    } catch (e) {
      console.error("Image processing error", e);
      alert("Unknown error processing image. See console for details.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing };
};import { useState } from "react";
import imageCompression from 'browser-image-compression';

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

export const useBrowserImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Upload file to Catbox and return the URL
  const uploadToCatbox = async (file: File, filename: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append('fileToUpload', file);
    formData.append('reqtype', 'fileupload');
    try {
      const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      if (res.ok) return (await res.text()).trim();
      return null;
    } catch {
      return null;
    }
  };

  // Download an image as a File
  const downloadImageAsFile = async (url: string): Promise<File | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) return null;
      const filename = url.split('/').pop()?.split('?')[0] || 'image';
      const ext = blob.type.split('/')[1] || 'jpg';
      return new File([blob], `${filename}.${ext}`, { type: blob.type });
    } catch {
      return null;
    }
  };

  // Compress a File (returns null if fails)
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
    } catch {
      return null;
    }
  };

  // Main function
  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) return null;
    setIsProcessing(true);

    try {
      // 1. Download original from external URL
      const originalFile = await downloadImageAsFile(imageUrl);
      if (!originalFile) return null;

      // 2. Upload to Catbox
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const randomId = Math.floor(1000 + Math.random() * 9000).toString();
      const originalFilename = `${cleanTitle}_original_${randomId}`;
      const originalCatboxUrl = await uploadToCatbox(originalFile, originalFilename);
      if (!originalCatboxUrl) return null;

      // 3. Download from Catbox (for CORS-safe file)
      const catboxFile = await downloadImageAsFile(originalCatboxUrl);

      // 4. Try to compress and upload compressed to Catbox
      let compressedCatboxUrl: string | null = null;
      if (catboxFile) {
        const compressedFile = await compressImage(catboxFile);
        if (compressedFile) {
          const compressedFilename = `${cleanTitle}_compressed_${randomId}`;
          compressedCatboxUrl = await uploadToCatbox(compressedFile, compressedFilename);
        }
      }

      // 5. If any step fails, use Catbox original for both
      return {
        originalUrl: originalCatboxUrl,
        compressedUrl: compressedCatboxUrl || originalCatboxUrl
      };
    } catch {
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing };
};
