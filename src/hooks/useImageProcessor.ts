
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) return null;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-image', {
        body: { imageUrl, title }
      });

      if (error) {
        console.error('Image processing error:', error);
        return null;
      }

      if (!data.success) {
        console.error('Image processing failed:', data.error);
        return null;
      }

      return {
        originalUrl: data.originalUrl,
        compressedUrl: data.compressedUrl
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
