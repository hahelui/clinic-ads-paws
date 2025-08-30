import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusIcon, Loader2Icon } from "lucide-react"
import { PhotoGrid } from "./photo-grid"
import { UploadPhotoDialog } from "./upload-photo-dialog"
import { getAllPhotos, getPhotosByType, savePhoto, deletePhoto } from "@/lib/storage"

export type PhotoType = "header" | "background"

export interface Photo {
  id: string
  name: string
  url: string
  type: PhotoType
}

// Initial seed data - we'll use this to populate the database if it's empty
const seedPhotos: Photo[] = [
  {
    id: "header1",
    name: "En-tête standard",
    url: "https://placehold.co/600x200/e2e8f0/1e293b?text=En-tête+Standard",
    type: "header"
  },
  {
    id: "header2",
    name: "En-tête moderne",
    url: "https://placehold.co/600x200/e2e8f0/1e293b?text=En-tête+Moderne",
    type: "header"
  },
  {
    id: "bg1",
    name: "Fond blanc",
    url: "https://placehold.co/600x400/ffffff/cccccc?text=Fond+Blanc",
    type: "background"
  },
  {
    id: "bg2",
    name: "Fond bleu clair",
    url: "https://placehold.co/600x400/e6f7ff/0077cc?text=Fond+Bleu+Clair",
    type: "background"
  },
  {
    id: "bg3",
    name: "Fond motif médical",
    url: "https://placehold.co/600x400/f0f9ff/1e293b?text=Motif+Médical",
    type: "background"
  }
]

export function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<PhotoType>("header")
  const [isLoading, setIsLoading] = useState(true)

  // Load photos from IndexedDB when component mounts
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setIsLoading(true)
        const storedPhotos = await getAllPhotos()
        
        // If no photos in database, seed with initial data
        if (storedPhotos.length === 0) {
          // Save seed photos to IndexedDB
          await Promise.all(seedPhotos.map(photo => savePhoto(photo)))
          setPhotos(seedPhotos)
        } else {
          setPhotos(storedPhotos)
        }
      } catch (error) {
        console.error('Failed to load photos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPhotos()
  }, [])

  // Handle adding a new photo
  const handleAddPhoto = async (photo: Omit<Photo, "id">) => {
    try {
      const newPhoto: Photo = {
        ...photo,
        id: `photo-${Date.now()}`
      }
      
      // Save to IndexedDB
      await savePhoto(newPhoto)
      
      // Update state
      setPhotos([...photos, newPhoto])
      setIsUploadDialogOpen(false)
    } catch (error) {
      console.error('Failed to save photo:', error)
      alert('Failed to save photo. Please try again.')
    }
  }
  
  // Handle deleting a photo
  const handleDeletePhoto = async (id: string) => {
    try {
      // Delete from IndexedDB
      await deletePhoto(id)
      
      // Update state
      setPhotos(photos.filter(photo => photo.id !== id))
    } catch (error) {
      console.error('Failed to delete photo:', error)
      alert('Failed to delete photo. Please try again.')
    }
  }

  // Filter photos by type based on active tab
  useEffect(() => {
    const loadPhotosByType = async () => {
      try {
        setIsLoading(true)
        const filteredPhotos = await getPhotosByType(activeTab)
        setPhotos(filteredPhotos)
      } catch (error) {
        console.error(`Failed to load ${activeTab} photos:`, error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPhotosByType()
  }, [activeTab])
  
  const headerPhotos = photos.filter(photo => photo.type === "header")
  const backgroundPhotos = photos.filter(photo => photo.type === "background")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Photos</h1>
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter une photo
        </Button>
      </div>

      <Tabs defaultValue="header" value={activeTab} onValueChange={(value) => setActiveTab(value as PhotoType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="header">En-têtes ({headerPhotos.length})</TabsTrigger>
          <TabsTrigger value="background">Arrière-plans ({backgroundPhotos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="header" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PhotoGrid photos={headerPhotos} onDelete={handleDeletePhoto} />
          )}
        </TabsContent>
        <TabsContent value="background" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PhotoGrid photos={backgroundPhotos} onDelete={handleDeletePhoto} />
          )}
        </TabsContent>
      </Tabs>

      <UploadPhotoDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleAddPhoto}
        defaultType={activeTab}
      />
    </div>
  )
}
