import { useState, useEffect, useRef } from "react"
import { PlusIcon, EditIcon, DownloadIcon, Loader2Icon, TrashIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAllAds, deleteAd } from "@/lib/storage"
import { AdPreview, downloadAdImage } from "@/components/ad-creator/ad-preview"
import type { AdFormData } from "@/components/ad-creator/ad-form"

interface AdWithId extends AdFormData {
  id: string
  createdAt: number
  updatedAt: number
  cachedPreview?: string
}

interface HomePageProps {
  onCreateAd: () => void
  onEditAd: (adId: string) => void
  onDeleteAd?: (adId: string) => void
  refreshTrigger?: number
}

export function HomePage({ onCreateAd, onEditAd, onDeleteAd, refreshTrigger = 0 }: HomePageProps) {
  const [ads, setAds] = useState<AdWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAds = async () => {
      try {
        setIsLoading(true)
        const allAds = await getAllAds()
        setAds(allAds)
      } catch (error) {
        console.error("Failed to load ads:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAds()
  }, [refreshTrigger])

  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [adToDelete, setAdToDelete] = useState<AdWithId | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewAd, setPreviewAd] = useState<AdWithId | null>(null)

  const handleDownload = async (ad: AdWithId) => {
    try {
      setDownloadingId(ad.id)
      setPreviewAd(ad)
      
      // Wait a bit for the preview to render
      setTimeout(async () => {
        try {
          // Pass a refresh callback to update the UI after caching the preview
          await downloadAdImage(ad, () => {
            // Trigger a refresh of the ads list to show updated preview
            if (onDeleteAd && refreshTrigger !== undefined) {
              onDeleteAd(ad.id) // Reuse onDeleteAd as it calls refreshAdData
            }
          })
          toast.success("Image téléchargée avec succès")
        } catch (error) {
          console.error("Failed to download image:", error)
          toast.error("Erreur lors du téléchargement de l'image")
        } finally {
          setDownloadingId(null)
          setPreviewAd(null)
        }
      }, 100)
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Erreur lors du téléchargement")
      setDownloadingId(null)
      setPreviewAd(null)
    }
  }

  const handleEdit = (ad: AdWithId) => {
    // Make sure we have the latest data before editing
    onEditAd(ad.id)
  }

  const handleDeleteClick = (ad: AdWithId) => {
    setAdToDelete(ad)
    setShowDeleteDialog(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!adToDelete) return
    
    try {
      setDeletingId(adToDelete.id)
      await deleteAd(adToDelete.id)
      toast.success("Annonce supprimée avec succès")
      
      // Update the ads list
      setAds(ads.filter(a => a.id !== adToDelete.id))
      
      // Call the onDeleteAd callback if provided
      if (onDeleteAd) {
        onDeleteAd(adToDelete.id)
      }
    } catch (error) {
      console.error("Failed to delete ad:", error)
      toast.error("Erreur lors de la suppression de l'annonce")
    } finally {
      setDeletingId(null)
      setAdToDelete(null)
      setShowDeleteDialog(false)
    }
  }
  
  const handleDeleteCancel = () => {
    setAdToDelete(null)
    setShowDeleteDialog(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full py-6">
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette annonce sera définitivement supprimée
              de votre appareil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Hidden preview for download */}
      {previewAd && (
        <div className="fixed left-[-9999px] top-[-9999px]">
          <AdPreview ref={previewRef} adData={previewAd} />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes annonces</h1>
        <Button onClick={onCreateAd} className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          Nouvelle annonce
        </Button>
      </div>

      {ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Vous n'avez pas encore créé d'annonces
          </p>
          <Button onClick={onCreateAd} className="flex items-center gap-1">
            <PlusIcon className="h-4 w-4" />
            Créer votre première annonce
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden flex flex-col">
              {/* Image container with 2:3 aspect ratio */}
              <div className="relative bg-muted aspect-[2/3] w-full">
                {/* Use cached preview if available, otherwise fall back to header image */}
                {(ad.cachedPreview || ad.header) && (
                  <img
                    src={ad.cachedPreview || ad.header || ''}
                    alt={ad.title || ''}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Compact info section */}
              <div className="pl-3 pr-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm truncate">{ad.title || "Annonce sans titre"}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {ad.language === "both" 
                      ? "FR/AR" 
                      : ad.language === "french" 
                        ? "FR" 
                        : "AR"}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-25"
                      onClick={() => handleEdit(ad)}
                    >
                      <EditIcon className="h-4 w-4" />
                      Modifier
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-10 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(ad)}
                      disabled={deletingId === ad.id}
                    >
                      {deletingId === ad.id ? (
                        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <TrashIcon className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-30 text-primary hover:text-primary"
                      onClick={() => handleDownload(ad)}
                      disabled={downloadingId === ad.id}
                    >
                      {downloadingId === ad.id ? (
                        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <DownloadIcon className="h-3.5 w-3.5" />
                      )}
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
