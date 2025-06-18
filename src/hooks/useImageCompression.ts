// This file is now deprecated - image compression is handled server-side
// Keeping for backwards compatibility but functionality moved to useImageProcessor

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
    // Return original URL - compression now handled server-side
    return imageUrl;
  }, []);

  return { compressImage, isCompressing };
};
