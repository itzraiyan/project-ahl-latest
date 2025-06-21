
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
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', imageBlob, filename);

    console.log(`Uploading to Catbox: ${filename}, size: ${imageBlob.size} bytes`);

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const url = await response.text();
      console.log(`Catbox upload successful: ${url.trim()}`);
      return url.trim();
    } else {
      console.error('Catbox upload failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Catbox upload error:', error);
    return null;
  }
};

const compressWithImagify = async (imageBlob: Blob, apiKey: string): Promise<Blob | null> => {
  try {
    console.log(`Starting Imagify compression, image size: ${imageBlob.size} bytes`);
    
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('data', JSON.stringify({ ultra: true }));

    console.log('Sending request to Imagify API...');

    const response = await fetch('https://app.imagify.io/api/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiKey}`
        // Note: Do NOT set Content-Type when using FormData
      },
      body: formData
    });

    console.log(`Imagify API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagify API error:', response.status, response.statusText, errorText);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('Imagify API returned non-JSON response:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('Imagify API response:', result);
    
    if (!result.success) {
      console.error('Imagify compression failed:', result);
      return null;
    }

    // Download the compressed image from Imagify
    console.log(`Downloading compressed image from: ${result.image}`);
    const compressedResponse = await fetch(result.image);
    
    if (compressedResponse.ok) {
      const compressedBlob = await compressedResponse.blob();
      console.log(`Imagify compression successful. Original: ${imageBlob.size} bytes, Compressed: ${compressedBlob.size} bytes`);
      return compressedBlob;
    } else {
      console.error('Failed to download compressed image from Imagify');
      return null;
    }
    
  } catch (error) {
    console.error('Imagify compression error:', error);
    return null;
  }
};

const downloadImage = async (imageUrl: string): Promise<Blob | null> => {
  try {
    console.log(`Downloading image from: ${imageUrl}`);
    const response = await fetch(imageUrl);
    
    if (response.ok) {
      const blob = await response.blob();
      console.log(`Image downloaded successfully, size: ${blob.size} bytes, type: ${blob.type}`);
      
      // Validate that it's an image
      if (!blob.type.startsWith('image/')) {
        console.error('Downloaded file is not an image:', blob.type);
        return null;
      }
      
      return blob;
    } else {
      console.error('Failed to download image:', response.status, response.statusText);
      return null;
    }
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
    console.log('=== Starting image processing workflow ===');
    
    const { imageUrl, title }: RequestBody = await req.json();

    if (!imageUrl || !title) {
      console.error('Missing required parameters:', { imageUrl: !!imageUrl, title: !!title });
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
      console.error('IMAGIFY_API_KEY environment variable not found');
      return new Response(
        JSON.stringify({ success: false, error: 'Imagify API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Imagify API key found, proceeding with processing...');

    const randomId = generateRandomId();
    const sanitizedTitle = sanitizeFilename(title);

    // Step 1: Download the original image
    console.log('Step 1: Downloading original image...');
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
    console.log('Step 2: Compressing with Imagify...');
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
    console.log('Step 3: Uploading to Catbox...');
    const originalFilename = `${sanitizedTitle}_original_${randomId}.jpg`;
    const compressedFilename = `${sanitizedTitle}_compressed_${randomId}.jpg`;

    console.log(`Uploading files: ${originalFilename}, ${compressedFilename}`);

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

    console.log('=== Image processing completed successfully ===');
    console.log('Original URL:', originalCatboxUrl);
    console.log('Compressed URL:', compressedCatboxUrl);

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
