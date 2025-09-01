import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
import { getPhotosByType } from "@/lib/storage"
import type { Photo, PhotoType } from "@/components/photos/photos-page"

interface ImageSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imageUrl: string, imageName: string) => void
  type: PhotoType
  title: string
}

export function ImageSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  type,
  title
}: ImageSelectionDialogProps) {
  const [images, setImages] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null)

  // Load images from storage when dialog opens
  useEffect(() => {
    if (open) {
      const loadImages = async () => {
        try {
          setIsLoading(true)
          const photos = await getPhotosByType(type)
          setImages(photos)
          setSelectedImage(null) // Reset selection when dialog opens
        } catch (error) {
          console.error(`Failed to load ${type} images:`, error)
        } finally {
          setIsLoading(false)
        }
      }
      
      loadImages()
    }
  }, [open, type])

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage.url, selectedImage.name)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12 flex-1">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground flex-1">
            Aucune image disponible. Veuillez ajouter des images dans la section Photos.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 py-4 overflow-y-auto flex-1">
            {images.map((image) => (
              <div 
                key={image.id} 
                className={`border rounded-md p-2 cursor-pointer transition-all ${
                  selectedImage?.id === image.id 
                    ? "ring-2 ring-primary border-primary" 
                    : "hover:border-muted-foreground"
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square overflow-hidden mb-2">
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm truncate text-center">{image.name}</p>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={!selectedImage || isLoading}
          >
            Sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
