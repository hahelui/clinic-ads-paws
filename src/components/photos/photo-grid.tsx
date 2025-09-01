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
    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 w-full">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square sm:aspect-[4/3] md:aspect-[4/3] lg:aspect-[3/2] w-full overflow-hidden flex items-center justify-center bg-muted/10">
              <img
                src={photo.url}
                alt={photo.name}
                className="max-w-full max-h-full object-contain w-auto h-auto transition-transform hover:scale-105"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-2 sm:p-3 md:p-4">
            <p className="text-xs sm:text-sm md:text-base font-medium truncate max-w-[70%]">{photo.name}</p>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-destructive"
                onClick={() => onDelete(photo.id)}
              >
                <Trash2Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
