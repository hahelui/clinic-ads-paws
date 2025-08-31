import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ImageIcon, UploadIcon } from "lucide-react"
import type { PhotoType } from "./photos-page"

interface UploadPhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (photo: { name: string; url: string; type: PhotoType }) => void
  defaultType?: PhotoType
}

export function UploadPhotoDialog({
  open,
  onOpenChange,
  onUpload,
  defaultType = "header",
}: UploadPhotoDialogProps) {
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [photoType, setPhotoType] = useState<PhotoType>(defaultType)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Create a preview URL
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreviewUrl(objectUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !file) return
    
    try {
      // Convert the file to a data URL for storage in IndexedDB
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          const dataUrl = event.target.result
          
          // Pass the data URL to the onUpload handler
          onUpload({
            name,
            url: dataUrl,
            type: photoType,
          })
          
          // Reset form
          resetForm()
        }
      }
      
      reader.onerror = () => {
        alert('Failed to read file. Please try again.')
      }
      
      // Read the file as a data URL
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Failed to process file. Please try again.')
    }
  }
  
  const resetForm = () => {
    setName("")
    setFile(null)
    setPreviewUrl(null)
    setPhotoType(defaultType)
  }
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle photo</DialogTitle>
            <DialogDescription>
              Téléchargez une image pour l'utiliser comme en-tête ou arrière-plan dans vos annonces.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="photo-name">Nom de la photo</Label>
              <Input
                id="photo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Logo de la clinique"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Type de photo</Label>
              <RadioGroup
                value={photoType}
                onValueChange={(value: string) => setPhotoType(value as PhotoType)}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="header" id="header" />
                  <Label htmlFor="header" className="flex-1 cursor-pointer">En-tête</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="background" id="background" />
                  <Label htmlFor="background" className="flex-1 cursor-pointer">Arrière-plan</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="signature" id="signature" />
                  <Label htmlFor="signature" className="flex-1 cursor-pointer">Signature</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="photo-file">Fichier image</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer" onClick={() => document.getElementById("photo-file")?.click()}>
                {previewUrl ? (
                  <div className="w-full">
                    <img 
                      src={previewUrl} 
                      alt="Aperçu" 
                      className="max-h-[200px] mx-auto object-contain"
                    />
                    <p className="text-sm text-center mt-2 text-muted-foreground">
                      {file?.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">Cliquez pour sélectionner une image</p>
                    <p className="text-xs">ou glissez-déposez un fichier ici</p>
                  </div>
                )}
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!name || !file} className="flex items-center gap-1">
              <UploadIcon className="h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
