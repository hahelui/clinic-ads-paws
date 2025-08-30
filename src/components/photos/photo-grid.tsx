import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import type { Photo } from "./photos-page"

interface PhotoGridProps {
  photos: Photo[]
  onDelete?: (id: string) => void
}

export function PhotoGrid({ photos, onDelete }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Aucune photo disponible</p>
        <p className="text-sm text-muted-foreground">Ajoutez des photos en cliquant sur le bouton "Ajouter une photo"</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={photo.url}
                alt={photo.name}
                className="object-cover w-full h-full transition-transform hover:scale-105"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-3">
            <p className="text-sm font-medium truncate">{photo.name}</p>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(photo.id)}
              >
                <Trash2Icon className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
