
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  imageUrl: string;
  title: string;
}

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

const compressWithImagify = async (imageBlob: Blob, apiKey: string): Promise<Blob | null> => {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('data', JSON.stringify({ ultra: true }));

    const response = await fetch('https://app.imagify.io/api/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      console.error('Imagify API error:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (!result.success) {
      console.error('Imagify compression failed:', result);
      return null;
    }

    // Download the compressed image from Imagify
    const compressedResponse = await fetch(result.image);
    if (compressedResponse.ok) {
      return await compressedResponse.blob();
    }
    
    return null;
  } catch (error) {
    console.error('Imagify compression error:', error);
    return null;
  }
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, title }: RequestBody = await req.json();

    if (!imageUrl || !title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing imageUrl or title' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Imagify API key from Supabase secrets
    const imagifyApiKey = Deno.env.get('IMAGIFY_API_KEY');
    if (!imagifyApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Imagify API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const randomId = generateRandomId();
    const sanitizedTitle = sanitizeFilename(title);

    // Step 1: Download the original image
    console.log('Downloading original image...');
    const originalBlob = await downloadImage(imageUrl);
    if (!originalBlob) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to download original image' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 2: Compress with Imagify
    console.log('Compressing with Imagify...');
    const compressedBlob = await compressWithImagify(originalBlob, imagifyApiKey);
    if (!compressedBlob) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to compress image with Imagify' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to upload to Catbox' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Image processing completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        originalUrl: originalCatboxUrl,
        compressedUrl: compressedCatboxUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
