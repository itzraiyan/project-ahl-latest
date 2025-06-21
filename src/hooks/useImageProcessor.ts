
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProcessImageResult {
  originalUrl: string;
  compressedUrl: string;
}

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (imageUrl: string, title: string): Promise<ProcessImageResult | null> => {
    if (!imageUrl || !title) {
      console.error('Missing required parameters for image processing');
      return null;
    }

    setIsProcessing(true);

    try {
      console.log('Starting Imagify + Catbox image processing...');
      console.log('Image URL:', imageUrl);
      console.log('Title:', title);
      
      const { data, error } = await supabase.functions.invoke('process-image-imagify', {
        body: { imageUrl, title }
      });

      if (error) {
        console.error('Supabase function invocation error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return null;
      }

      console.log('Function response received:', data);

      if (!data) {
        console.error('No data received from function');
        return null;
      }

      if (!data.success) {
        console.error('Image processing failed:', data.error);
        return null;
      }

      console.log('Image processing completed successfully');
      console.log('Original URL:', data.originalUrl);
      console.log('Compressed URL:', data.compressedUrl);
      
      return {
        originalUrl: data.originalUrl,
        compressedUrl: data.compressedUrl
      };

    } catch (error) {
      console.error('Image processing failed with exception:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processImage, isProcessing };
};
