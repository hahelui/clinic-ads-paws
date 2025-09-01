import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusIcon, Loader2Icon } from "lucide-react"
import { PhotoGrid } from "./photo-grid"
import { UploadPhotoDialog } from "./upload-photo-dialog"
import { getAllPhotos, savePhoto, deletePhoto } from "@/lib/storage"

export type PhotoType = "header" | "background" | "signature"

export interface Photo {
  id: string
  name: string
  url: string
  type: PhotoType
}

export function PhotosPage() {
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<PhotoType>("header")
  const [isLoading, setIsLoading] = useState(true)

  // Load photos from IndexedDB when component mounts
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setIsLoading(true)
        const storedPhotos = await getAllPhotos()
        setAllPhotos(storedPhotos)
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
      setAllPhotos([...allPhotos, newPhoto])
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
      setAllPhotos(allPhotos.filter((photo: Photo) => photo.id !== id))
    } catch (error) {
      console.error('Failed to delete photo:', error)
      alert('Failed to delete photo. Please try again.')
    }
  }

  // No need to reload photos from database when changing tabs
  // We'll just filter the photos we already have in memory
  
  const headerPhotos = allPhotos.filter((photo: Photo) => photo.type === "header")
  const backgroundPhotos = allPhotos.filter((photo: Photo) => photo.type === "background")
  const signaturePhotos = allPhotos.filter((photo: Photo) => photo.type === "signature")
  
  // Get the photos for the current active tab
  const currentTabPhotos = allPhotos.filter((photo: Photo) => photo.type === activeTab)

  return (
    <div className="w-full space-y-6">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="header">En-têtes ({headerPhotos.length})</TabsTrigger>
          <TabsTrigger value="background">Arrière-plans ({backgroundPhotos.length})</TabsTrigger>
          <TabsTrigger value="signature">Signatures ({signaturePhotos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="header" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PhotoGrid photos={currentTabPhotos} onDelete={handleDeletePhoto} />
          )}
        </TabsContent>
        <TabsContent value="background" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PhotoGrid photos={currentTabPhotos} onDelete={handleDeletePhoto} />
          )}
        </TabsContent>
        <TabsContent value="signature" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PhotoGrid photos={currentTabPhotos} onDelete={handleDeletePhoto} />
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
