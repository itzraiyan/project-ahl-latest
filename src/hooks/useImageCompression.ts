
import { useState, useCallback } from "react";

interface ImageCompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const useImageCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = useCallback(async (
    imageUrl: string, 
    options: ImageCompressionOptions = {}
  ): Promise<string> => {
    const { quality = 0.6, maxWidth = 400, maxHeight = 600 } = options;
    
    setIsCompressing(true);
    
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Enable CORS for external images
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const aspectRatio = width / height;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
          
          // Set canvas size
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress the image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedUrl = URL.createObjectURL(blob);
                resolve(compressedUrl);
              } else {
                resolve(imageUrl); // Fallback to original
              }
              setIsCompressing(false);
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => {
          setIsCompressing(false);
          resolve(imageUrl); // Fallback to original on error
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Image compression failed:', error);
      setIsCompressing(false);
      return imageUrl; // Fallback to original
    }
  }, []);

  return { compressImage, isCompressing };
};
