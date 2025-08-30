import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import type { AdFormData } from "../ad-form"
import { ImageSelectionDialog } from "../image-selection-dialog"

interface DesignStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function DesignStep({ formData, updateFormData }: DesignStepProps) {
  const [useHeader, setUseHeader] = useState(!!formData.header)
  const [useBackground, setUseBackground] = useState(!!formData.background)
  const [useContactInfo, setUseContactInfo] = useState(!!formData.contactInfo)
  const [headerName, setHeaderName] = useState<string>("") 
  const [backgroundName, setBackgroundName] = useState<string>("") 
  const [isHeaderDialogOpen, setIsHeaderDialogOpen] = useState(false)
  const [isBackgroundDialogOpen, setIsBackgroundDialogOpen] = useState(false)

  // Set initial names if editing an existing ad
  useEffect(() => {
    // Reset the state when form data changes
    setUseHeader(!!formData.header)
    setUseBackground(!!formData.background)
    setUseContactInfo(!!formData.contactInfo)
    
    if (formData.header) {
      setHeaderName("Image sélectionnée")
    } else {
      setHeaderName("")
    }
    
    if (formData.background) {
      setBackgroundName("Image sélectionnée")
    } else {
      setBackgroundName("")
    }
  }, [formData])

  return (
    <div className="space-y-6">
      {/* Header selection */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="use-header">Utiliser un en-tête</Label>
            <p className="text-sm text-muted-foreground">
              Ajouter un en-tête à votre annonce
            </p>
          </div>
          <Switch
            id="use-header"
            checked={useHeader}
            onCheckedChange={(checked) => {
              setUseHeader(checked)
              if (!checked) updateFormData({ header: null })
            }}
          />
        </div>

        {useHeader && (
          <div className="mt-4">
            <div className="flex gap-4 items-center">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsHeaderDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Choisir une image
              </Button>
              
              {formData.header && (
                <div className="flex items-center gap-2">
                  <div className="border rounded-md overflow-hidden w-12 h-12">
                    <img 
                      src={formData.header} 
                      alt="En-tête sélectionné" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm">{headerName}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <ImageSelectionDialog
          open={isHeaderDialogOpen}
          onOpenChange={setIsHeaderDialogOpen}
          onSelect={(imageUrl, imageName) => {
            updateFormData({ header: imageUrl })
            setHeaderName(imageName)
          }}
          type="header"
          title="Sélectionner un en-tête"
        />
      </div>

      {/* Background selection */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="use-background">Utiliser une image de fond</Label>
            <p className="text-sm text-muted-foreground">
              Ajouter une image de fond à votre annonce
            </p>
          </div>
          <Switch
            id="use-background"
            checked={useBackground}
            onCheckedChange={(checked) => {
              setUseBackground(checked)
              if (!checked) updateFormData({ background: null })
            }}
          />
        </div>

        {useBackground && (
          <div className="mt-4">
            <div className="flex gap-4 items-center">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsBackgroundDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Choisir une image
              </Button>
              
              {formData.background && (
                <div className="flex items-center gap-2">
                  <div className="border rounded-md overflow-hidden w-12 h-12">
                    <img 
                      src={formData.background} 
                      alt="Arrière-plan sélectionné" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm">{backgroundName}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <ImageSelectionDialog
          open={isBackgroundDialogOpen}
          onOpenChange={setIsBackgroundDialogOpen}
          onSelect={(imageUrl, imageName) => {
            updateFormData({ background: imageUrl })
            setBackgroundName(imageName)
          }}
          type="background"
          title="Sélectionner un arrière-plan"
        />
      </div>

      {/* Contact info */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="use-contact">Ajouter des informations de contact</Label>
            <p className="text-sm text-muted-foreground">
              Ajouter des numéros de téléphone ou autres coordonnées
            </p>
          </div>
          <Switch
            id="use-contact"
            checked={useContactInfo}
            onCheckedChange={(checked) => {
              setUseContactInfo(checked)
              if (!checked) updateFormData({ contactInfo: "" })
            }}
          />
        </div>

        {useContactInfo && (
          <div className="space-y-2">
            <Label htmlFor="contact-info">Informations de contact</Label>
            <Textarea
              id="contact-info"
              placeholder="Ex: Tél: 01 23 45 67 89, Email: contact@clinique.com"
              value={formData.contactInfo}
              onChange={(e) => updateFormData({ contactInfo: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        )}
      </div>
    </div>
  )
}
