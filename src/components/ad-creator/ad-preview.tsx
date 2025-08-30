import { forwardRef, useRef } from 'react'
import type { AdFormData } from './ad-form'

interface AdPreviewProps {
  adData: Partial<AdFormData>
  width?: number
  height?: number
  scale?: number
}

export const AdPreview = forwardRef<HTMLDivElement, AdPreviewProps>((
  { adData, width = 600, height = 800, scale = 1 }, 
  ref
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const actualRef = ref || containerRef

  // Calculate aspect ratio for responsive scaling
  const aspectRatio = width / height

  return (
    <div 
      className="relative mx-auto overflow-hidden border border-border rounded-md shadow-sm"
      style={{ 
        aspectRatio: `${aspectRatio}`,
        maxWidth: `${width * scale}px`,
        maxHeight: `${height * scale}px`,
      }}
      ref={actualRef}
    >
      {/* Background image with opacity */}
      {adData.background && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${adData.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
          }}
        />
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header image */}
        {adData.header && (
          <div className="w-full">
            <img 
              src={adData.header} 
              alt="Header" 
              className="w-full object-contain"
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 p-4 flex flex-col">


          {/* Arabic text - if applicable */}
          {adData.language !== "french" && adData.arabicText && (
            <div 
              className="mb-4 text-right font-arabic" 
              dir="rtl"
              style={{ fontSize: `${18 * scale}px` }}
            >
              {adData.arabicText.split('\n').map((line: string, i: number) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          )}

          {/* French text - if applicable */}
          {adData.language !== "arabic" && adData.frenchText && (
            <div 
              className="mb-4"
              style={{ fontSize: `${16 * scale}px` }}
            >
              {adData.frenchText.split('\n').map((line: string, i: number) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          )}

          {/* Contact info at the bottom */}
          {adData.contactInfo && (
            <div className="mt-auto text-center text-sm">
              {adData.contactInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

// Function to generate an image from the ad preview using pure canvas rendering
export async function generateAdImage(adData: AdFormData): Promise<string> {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    // Set canvas dimensions
    const width = 600
    const height = 800
    canvas.width = width
    canvas.height = height
    
    // Fill background with white
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    // Draw background image if exists
    if (adData.background) {
      const bgImg = await loadImage(adData.background)
      
      // Draw with opacity
      ctx.globalAlpha = 0.35
      drawImageCovered(ctx, bgImg, 0, 0, width, height)
      ctx.globalAlpha = 1.0
    }
    
    // Draw header image if exists
    let yOffset = 0
    if (adData.header) {
      const headerImg = await loadImage(adData.header)
      
      // Calculate height while preserving aspect ratio
      const headerHeight = (headerImg.height / headerImg.width) * width
      
      // Draw the image at full width while preserving aspect ratio
      ctx.drawImage(headerImg, 0, 0, width, headerHeight)
      yOffset = headerHeight
    }
    
    // Content area padding
    const padding = 16
    yOffset += padding
    
    // Draw Arabic text if applicable
    if (adData.language !== "french" && adData.arabicText) {
      ctx.fillStyle = '#000000'
      ctx.font = '18px Arial'
      ctx.textAlign = 'right'
      
      const lines = adData.arabicText.split('\n')
      lines.forEach((line: string) => {
        ctx.fillText(line, width - padding, yOffset + 18)
        yOffset += 26 // Line height + margin
      })
      
      yOffset += 10 // Extra margin between text blocks
    }
    
    // Draw French text if applicable
    if (adData.language !== "arabic" && adData.frenchText) {
      ctx.fillStyle = '#000000'
      ctx.font = '16px Arial'
      ctx.textAlign = 'left'
      
      const lines = adData.frenchText.split('\n')
      lines.forEach((line: string) => {
        ctx.fillText(line, padding, yOffset + 16)
        yOffset += 24 // Line height + margin
      })
      
      yOffset += 10 // Extra margin between text blocks
    }
    
    // Draw contact info if exists
    if (adData.contactInfo) {
      ctx.fillStyle = '#000000'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(adData.contactInfo, width / 2, height - padding - 14)
    }
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error("Error generating image:", error)
    return adData.header || 'placeholder-image-url'
  }
}

// Helper function to load an image and return a promise
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // Enable CORS
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

// Helper function to draw an image covering the target area (like background-size: cover)
function drawImageCovered(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const imgRatio = img.width / img.height
  const targetRatio = w / h
  
  let drawWidth = w
  let drawHeight = h
  let offsetX = 0
  let offsetY = 0
  
  // Calculate dimensions to cover the area while maintaining aspect ratio
  if (imgRatio > targetRatio) {
    // Image is wider than target area
    drawHeight = h
    drawWidth = h * imgRatio
    offsetX = (w - drawWidth) / 2
  } else {
    // Image is taller than target area
    drawWidth = w
    drawHeight = w / imgRatio
    offsetY = (h - drawHeight) / 2
  }
  
  ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight)
}

// Function to download the generated image
export async function downloadAdImage(adData: AdFormData): Promise<void> {
  try {
    const imageUrl = await generateAdImage(adData)
    
    // Create a temporary link element
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${adData.title || 'annonce'}-${new Date().getTime()}.png`
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error downloading image:", error)
  }
}
