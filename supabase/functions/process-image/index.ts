
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

    // Create compressed version using Canvas API
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

// Improved image compression function with aggressive compression
async function compressImage(imageData: Uint8Array): Promise<Uint8Array> {
  try {
    // Create image from buffer
    const blob = new Blob([imageData])
    const imageBitmap = await createImageBitmap(blob)
    
    // Calculate new dimensions to keep under 60KB
    let { width, height } = imageBitmap
    const maxWidth = 300  // Reduced from 400
    const maxHeight = 450 // Reduced from 600
    
    // Calculate aspect ratio
    const aspectRatio = width / height
    
    // Resize based on aspect ratio
    if (width > maxWidth || height > maxHeight) {
      if (aspectRatio > 1) {
        // Landscape
        width = maxWidth
        height = Math.round(width / aspectRatio)
      } else {
        // Portrait
        height = maxHeight
        width = Math.round(height * aspectRatio)
      }
    }
    
    // Create canvas and compress
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    // Apply smoothing for better quality at smaller sizes
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(imageBitmap, 0, 0, width, height)
    
    // Start with lower quality and iterate until we get desired file size
    let quality = 0.4 // Start with even lower quality
    let compressedBlob: Blob
    let attempts = 0
    const maxAttempts = 5
    const targetSize = 60 * 1024 // 60KB target
    
    do {
      compressedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: quality
      })
      
      console.log(`Compression attempt ${attempts + 1}: Quality ${quality}, Size: ${compressedBlob.size} bytes`)
      
      if (compressedBlob.size <= targetSize || attempts >= maxAttempts) {
        break
      }
      
      // Reduce quality more aggressively
      quality = Math.max(0.1, quality - 0.1)
      attempts++
      
    } while (attempts < maxAttempts)
    
    console.log(`Final compressed size: ${compressedBlob.size} bytes (${Math.round(compressedBlob.size / 1024)}KB)`)
    
    const arrayBuffer = await compressedBlob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
    
  } catch (error) {
    console.error('Compression failed, returning original:', error)
    return imageData
  }
}
