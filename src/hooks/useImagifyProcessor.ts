
import { useState } from "react";

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

export const useImagifyProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateRandomId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sanitizeFilename = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const uploadToCatbox = async (imageBlob: Blob, filename: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', imageBlob, filename);

    try {
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const url = await response.text();
        return url.trim();
      }
      return null;
    } catch (error) {
      console.error('Catbox upload error:', error);
      return null;
    }
  };

  const compressWithImagify = async (imageBlob: Blob): Promise<Blob | null> => {
    // This would need the Imagify API key from Supabase secrets
    // For now, we'll create a placeholder that returns the original blob
    // The actual implementation should be done via a Supabase Edge Function
    console.log('Imagify compression would happen here');
    
    // Placeholder: return original blob (in real implementation, this would be compressed)
    return imageBlob;
  };

  const downloadImage = async (imageUrl: string): Promise<Blob | null> => {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Image download error:', error);
      return null;
    }
  };

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) return null;

    setIsProcessing(true);

    try {
      const randomId = generateRandomId();
      const sanitizedTitle = sanitizeFilename(title);

      // Step 1: Download the original image
      console.log('Downloading original image...');
      const originalBlob = await downloadImage(imageUrl);
      if (!originalBlob) {
        console.error('Failed to download original image');
        return null;
      }

      // Step 2: Compress with Imagify (placeholder for now)
      console.log('Compressing with Imagify...');
      const compressedBlob = await compressWithImagify(originalBlob);
      if (!compressedBlob) {
        console.error('Failed to compress image');
        return null;
      }

      // Step 3: Upload both to Catbox
      console.log('Uploading to Catbox...');
      const originalFilename = `${sanitizedTitle}_original_${randomId}.jpg`;
      const compressedFilename = `${sanitizedTitle}_compressed_${randomId}.jpg`;

      const [originalCatboxUrl, compressedCatboxUrl] = await Promise.all([
        uploadToCatbox(originalBlob, originalFilename),
        uploadToCatbox(compressedBlob, compressedFilename)
      ]);

      if (!originalCatboxUrl || !compressedCatboxUrl) {
        console.error('Failed to upload to Catbox');
        return null;
      }

      console.log('Image processing completed successfully');
      return {
        originalUrl: originalCatboxUrl,
        compressedUrl: compressedCatboxUrl
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
