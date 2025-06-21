
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
      console.error('Catbox upload failed:', error);
      return null;
    }
  };

  const downloadImageAsFile = async (imageUrl: string): Promise<File | null> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      
      const blob = await response.blob();
      const filename = imageUrl.split('/').pop() || 'image';
      const extension = blob.type.split('/')[1] || 'jpg';
      
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
      const compressedFile = await imageCompression(file, options);
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
    if (!imageUrl || !title) return null;

    setIsProcessing(true);

    try {
      // Step 1: Download the original image
      console.log('Downloading image from URL...');
      const originalFile = await downloadImageAsFile(imageUrl);
      if (!originalFile) {
        console.error('Failed to download image');
        return null;
      }

      // Step 2: Compress the image
      console.log('Compressing image...');
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

      console.log('Image processing completed successfully');
      return {
        originalUrl,
        compressedUrl
      };

    } catch (error) {
      console.error('Image processing failed:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing };
};
