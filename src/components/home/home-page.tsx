import { useState, useEffect, useRef } from "react"
import { PlusIcon, EditIcon, DownloadIcon, Loader2Icon, TrashIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
}

interface HomePageProps {
  onCreateAd: () => void
  onEditAd: (adId: string) => void
  onDeleteAd?: (adId: string) => void
}

export function HomePage({ onCreateAd, onEditAd, onDeleteAd }: HomePageProps) {
  const [ads, setAds] = useState<AdWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAds = async () => {
      try {
        const allAds = await getAllAds()
        setAds(allAds)
      } catch (error) {
        console.error("Failed to load ads:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAds()
  }, [])

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
          await downloadAdImage(ad)
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
    <div className="container py-6">
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
            <Card key={ad.id} className="overflow-hidden">
              <div className="relative h-40 bg-muted">
                {ad.header && (
                  <img
                    src={ad.header}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardHeader>
                <CardTitle>{ad.title || "Annonce sans titre"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {new Date(ad.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {ad.language === "both" 
                      ? "Français & Arabe" 
                      : ad.language === "french" 
                        ? "Français" 
                        : "Arabe"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(ad)}
                    className="flex items-center gap-1"
                  >
                    <EditIcon className="h-3 w-3" />
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteClick(ad)}
                    disabled={deletingId === ad.id}
                    className="flex items-center gap-1"
                  >
                    {deletingId === ad.id ? (
                      <Loader2Icon className="h-3 w-3 animate-spin" />
                    ) : (
                      <TrashIcon className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleDownload(ad)}
                  disabled={downloadingId === ad.id}
                  className="flex items-center gap-1"
                >
                  {downloadingId === ad.id ? (
                    <>
                      <Loader2Icon className="h-3 w-3 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="h-3 w-3" />
                      Télécharger
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
