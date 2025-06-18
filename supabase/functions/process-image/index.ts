import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, title } = await req.json()

    if (!imageUrl || !title) {
      return new Response(
        JSON.stringify({ error: 'Image URL and title are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing image:', imageUrl, 'for title:', title)

    // Download the original image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageUint8Array = new Uint8Array(imageBuffer)

    // Generate filename
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000
    const cleanTitle = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)
    
    const baseFilename = `${cleanTitle}-${randomSuffix}`

    // Function to upload to Catbox
    const uploadToCatbox = async (fileData: Uint8Array, filename: string) => {
      const formData = new FormData()
      const blob = new Blob([fileData], { type: 'image/jpeg' })
      formData.append('reqtype', 'fileupload')
      formData.append('fileToUpload', blob, filename)

      const uploadResponse = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Catbox upload failed: ${uploadResponse.statusText}`)
      }

      return await uploadResponse.text()
    }

    // Upload original image
    const originalFilename = `${baseFilename}-original.jpg`
    const originalUrl = await uploadToCatbox(imageUint8Array, originalFilename)

    // Create compressed version using Canvas API (available in Deno)
    // For compression, we'll reduce quality and potentially resize
    const compressedImageData = await compressImage(imageUint8Array)
    const compressedFilename = `${baseFilename}.jpg`
    const compressedUrl = await uploadToCatbox(compressedImageData, compressedFilename)

    console.log('Upload successful:', { originalUrl, compressedUrl })

    return new Response(
      JSON.stringify({
        success: true,
        originalUrl: originalUrl.trim(),
        compressedUrl: compressedUrl.trim()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Image processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process image', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Simple image compression function using Canvas
async function compressImage(imageData: Uint8Array): Promise<Uint8Array> {
  try {
    // Create image from buffer
    const blob = new Blob([imageData])
    const imageBitmap = await createImageBitmap(blob)
    
    // Calculate new dimensions to keep under 60KB
    let { width, height } = imageBitmap
    const maxWidth = 400
    const maxHeight = 600
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }
    
    // Create canvas and compress
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    ctx.drawImage(imageBitmap, 0, 0, width, height)
    
    // Convert to blob with compression
    const compressedBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.6
    })
    
    const arrayBuffer = await compressedBlob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
    
  } catch (error) {
    console.error('Compression failed, returning original:', error)
    return imageData
  }
}
