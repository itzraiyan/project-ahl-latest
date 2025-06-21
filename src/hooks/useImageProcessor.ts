import { useBrowserImageProcessor } from "./useBrowserImageProcessor";

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

export const useImageProcessor = () => {
  const { processImage, isProcessing } = useBrowserImageProcessor();
  return { processImage, isProcessing };
};
