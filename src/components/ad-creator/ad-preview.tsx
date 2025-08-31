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
            opacity: 0.2,
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
        <div className="flex-1 px-6 py-4 flex flex-col">


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

          {/* Contact info at the bottom left */}
          <div className="mt-auto flex justify-between items-end pt-4">
            {adData.contactInfo && (
              <div className="text-sm text-left">
                {adData.contactInfo}
              </div>
            )}
            
            {/* Signature/stamp at the bottom right */}
            {adData.signature && (
              <div className="ml-auto" style={{ width: `${width * 0.125}px` }}>
                <img 
                  src={adData.signature} 
                  alt="Signature" 
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

// Function to generate an image from the ad preview using pure canvas rendering
export async function generateAdImage(adData: AdFormData): Promise<string> {
  try {
    // Create a high-resolution canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    // Set canvas dimensions with higher resolution
    const width = 1200
    const height = 1800
    canvas.width = width
    canvas.height = height
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // Fill background with white
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    // Draw background image if exists
    if (adData.background) {
      const bgImg = await loadImage(adData.background)
      
      // Calculate dimensions for background image (60% of width, centered)
      const bgWidth = width * 0.6 // 60% of ad width
      const bgHeight = (bgImg.height / bgImg.width) * bgWidth // Preserve aspect ratio
      const bgX = (width - bgWidth) / 2 // Center horizontally
      const bgY = (height - bgHeight) / 2 // Center vertically
      
      // Draw with opacity
      ctx.globalAlpha = 0.2
      ctx.drawImage(bgImg, bgX, bgY, bgWidth, bgHeight)
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
    const padding = 32 // Doubled padding for higher resolution
    yOffset += padding
    
    // Draw Arabic text if applicable
    if (adData.language !== "french" && adData.arabicText) {
      ctx.fillStyle = '#000000'
      const textPadding = 60 // 30px padding * 2 for higher resolution
      const maxWidth = width - (textPadding * 2)
      
      // Draw Arabic title
      ctx.font = '44px Arial, sans-serif' // Bigger font for title
      ctx.textAlign = 'center' // Center align the title
      ctx.fillText('إعلان للجمهور', width / 2, yOffset + 44)
      yOffset += 70 // Add space after title
      
      // Draw Arabic content
      ctx.font = '36px Arial' // Regular font for content
      ctx.textAlign = 'right' // Right align for Arabic text
      
      // Set RTL text direction for Arabic if supported by the browser
      if ('direction' in ctx) {
        ctx.direction = 'rtl'
      }
      
      // Process each paragraph (separated by newlines)
      const paragraphs = adData.arabicText.split('\n')
      paragraphs.forEach((paragraph: string) => {
        // Wrap text within the available width
        const wrappedLines = wrapText(ctx, paragraph, maxWidth, true)
        
        // Draw each wrapped line
        wrappedLines.forEach((line: string) => {
          // For RTL text, we need to draw at the right edge minus padding
          ctx.fillText(line, width - textPadding, yOffset + 36)
          yOffset += 52 // Doubled line height + margin
        })
        
        yOffset += 20 // Extra margin between paragraphs
      })
      
      yOffset += 20 // Extra margin between text blocks
    }
    
    // Draw French text if applicable
    if (adData.language !== "arabic" && adData.frenchText) {
      // Reset direction to LTR for French text
      if ('direction' in ctx) {
        ctx.direction = 'ltr'
      }
      ctx.fillStyle = '#000000'
      const textPadding = 60 // 30px padding * 2 for higher resolution
      const maxWidth = width - (textPadding * 2)
      
      // Draw French title
      ctx.font = '40px Arial, sans-serif' // Bigger font for title
      ctx.textAlign = 'center' // Center align the title
      ctx.fillText('Note d\'information', width / 2, yOffset + 40)
      yOffset += 64 // Add space after title
      
      // Draw French content
      ctx.font = '32px Arial' // Regular font for content
      ctx.textAlign = 'left' // Left align for French text
      
      // Process each paragraph (separated by newlines)
      const paragraphs = adData.frenchText.split('\n')
      paragraphs.forEach((paragraph: string) => {
        // Wrap text within the available width
        const wrappedLines = wrapText(ctx, paragraph, maxWidth, false)
        
        // Draw each wrapped line
        wrappedLines.forEach((line: string) => {
          ctx.fillText(line, textPadding, yOffset + 32)
          yOffset += 48 // Doubled line height + margin
        })
        
        yOffset += 20 // Extra margin between paragraphs
      })
      
      yOffset += 20 // Extra margin between text blocks
    }
    
    // Draw contact info if exists
    if (adData.contactInfo) {
      ctx.fillStyle = '#000000'
      ctx.font = '32px Arial' // Doubled font size for higher resolution
      ctx.textAlign = 'left'
      const textPadding = 60 // 30px padding * 2 for higher resolution
      ctx.fillText(adData.contactInfo, textPadding, height - padding - 28)
    }
    
    // Draw signature/stamp if exists
    if (adData.signature) {
      const signatureImg = await loadImage(adData.signature)
      
      // Calculate dimensions for signature (1/5 of width)
      const signatureWidth = width * 0.2 // 1/5 of ad width
      const signatureHeight = (signatureImg.height / signatureImg.width) * signatureWidth // Preserve aspect ratio
      
      // Position in bottom right with padding
      const signatureX = width - signatureWidth - padding
      const signatureY = height - signatureHeight - padding
      
      // Draw the signature
      ctx.drawImage(signatureImg, signatureX, signatureY, signatureWidth, signatureHeight)
    }
    
    // Use higher quality settings for the PNG export
    return canvas.toDataURL('image/png', 1.0)
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

// Helper function to wrap text within a specified width
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, isRTL: boolean): string[] {
  // For RTL languages like Arabic, we need a different approach
  if (isRTL) {
    return wrapRTLText(ctx, text, maxWidth)
  } else {
    return wrapLTRText(ctx, text, maxWidth)
  }
}

// Helper function for wrapping left-to-right text (e.g., French)
function wrapLTRText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const testLine = currentLine + ' ' + word
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  lines.push(currentLine)
  return lines
}

// Helper function for wrapping right-to-left text (e.g., Arabic)
function wrapRTLText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // For RTL text, we need to handle words in reverse order for proper line breaking
  // but maintain the original word order within each line
  const words = text.split(' ')
  const lines: string[] = []
  
  // Start with an empty line
  let currentLineWords: string[] = []
  let currentWidth = 0
  
  // Process each word
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    // Add space width except for first word in a line
    const spaceWidth = currentLineWords.length > 0 ? ctx.measureText(' ').width : 0
    const wordWidth = ctx.measureText(word).width
    
    if (currentWidth + spaceWidth + wordWidth <= maxWidth || currentLineWords.length === 0) {
      // Word fits on current line
      currentLineWords.push(word)
      currentWidth += spaceWidth + wordWidth
    } else {
      // Word doesn't fit, start a new line
      // For RTL, we join with spaces but don't reverse the words
      // The browser/canvas will handle the RTL display
      lines.push(currentLineWords.join(' '))
      currentLineWords = [word]
      currentWidth = wordWidth
    }
  }
  
  // Add the last line if not empty
  if (currentLineWords.length > 0) {
    lines.push(currentLineWords.join(' '))
  }
  
  return lines
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
