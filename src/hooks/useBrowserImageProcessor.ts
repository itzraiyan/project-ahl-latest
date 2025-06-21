
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
      console.log('Uploading to Catbox:', filename);
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const url = await response.text();
        console.log('Catbox upload successful:', url.trim());
        return url.trim();
      } else {
        console.error('Catbox upload failed with status:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Catbox upload failed:', error);
      return null;
    }
  };

  const downloadImageAsFile = async (imageUrl: string): Promise<File | null> => {
    try {
      // Try direct fetch first
      console.log('Attempting direct fetch of image:', imageUrl);
      let response = await fetch(imageUrl);
      
      if (!response.ok) {
        console.log('Direct fetch failed, trying CORS proxy...');
        // Try with CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
        response = await fetch(proxyUrl);
      }
      
      if (!response.ok) {
        console.error('Both direct and proxy fetch failed');
        return null;
      }
      
      const blob = await response.blob();
      
      // Validate that we got an image
      if (!blob.type.startsWith('image/')) {
        console.error('Downloaded content is not an image, type:', blob.type);
        return null;
      }
      
      const filename = imageUrl.split('/').pop()?.split('?')[0] || 'image';
      const extension = blob.type.split('/')[1] || 'jpg';
      
      console.log('Successfully downloaded image:', blob.size, 'bytes');
      return new File([blob], `${filename}.${extension}`, { type: blob.type });
    } catch (error) {
      console.error('Failed to download image:', error);
      return null;
    }
  };

  const compressImage = async (file: File): Promise<File | null> => {
    const options = {
      maxSizeMB: 0.1, // target super small size
      maxWidthOrHeight: 800,
      useWebWorker: true,
      initialQuality: 0.2,
      fileType: file.type,
    };

    try {
      console.log('Compressing image. Original size:', file.size, 'bytes');
      const compressedFile = await imageCompression(file, options);
      console.log('Compression successful. Compressed size:', compressedFile.size, 'bytes');
      return compressedFile;
    } catch (err) {
      console.error('Compression failed:', err);
      return null;
    }
  };

  const generateRandomId = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) {
      console.error('Image URL and title are required');
      return null;
    }

    setIsProcessing(true);

    try {
      // Step 1: Download the original image
      console.log('Starting image processing for:', imageUrl);
      const originalFile = await downloadImageAsFile(imageUrl);
      if (!originalFile) {
        console.error('Failed to download image from URL');
        return null;
      }

      // Step 2: Compress the image
      console.log('Downloaded successfully, now compressing...');
      const compressedFile = await compressImage(originalFile);
      if (!compressedFile) {
        console.error('Failed to compress image');
        return null;
      }

      // Step 3: Generate filenames with random 4-digit number
      const randomId = generateRandomId();
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      
      const originalFilename = `${cleanTitle}_original_${randomId}`;
      const compressedFilename = `${cleanTitle}_compressed_${randomId}`;

      // Step 4: Upload both images to Catbox
      console.log('Uploading original image to Catbox...');
      const originalUrl = await uploadToCatbox(originalFile, originalFilename);
      
      if (!originalUrl) {
        console.error('Failed to upload original image to Catbox');
        return null;
      }

      console.log('Uploading compressed image to Catbox...');
      const compressedUrl = await uploadToCatbox(compressedFile, compressedFilename);
      
      if (!compressedUrl) {
        console.error('Failed to upload compressed image to Catbox');
        return null;
      }

      console.log('Image processing completed successfully!');
      console.log('Original URL:', originalUrl);
      console.log('Compressed URL:', compressedUrl);
      
      return {
        originalUrl,
        compressedUrl
      };

    } catch (error) {
      console.error('Image processing failed with error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing };
};
