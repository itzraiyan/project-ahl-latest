
import { useState } from "react";
import { useBrowserImageProcessor } from "./useBrowserImageProcessor";

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

export const useImageProcessor = () => {
  const { processImage: processBrowserImage, isProcessing } = useBrowserImageProcessor();

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    return await processBrowserImage(imageUrl, title);
  };

  return { processImage, isProcessing };
};
