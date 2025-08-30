import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { AdFormData } from "../ad-form"

interface DesignStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function DesignStep({ formData, updateFormData }: DesignStepProps) {
  const [useHeader, setUseHeader] = useState(!!formData.header)
  const [useBackground, setUseBackground] = useState(!!formData.backgroundImage)
  const [useContactInfo, setUseContactInfo] = useState(!!formData.contactInfo)

  // Mock data for headers and backgrounds - will be replaced with actual data later
  const headers = [
    { id: "header1", name: "En-tête standard" },
    { id: "header2", name: "En-tête moderne" },
    { id: "header3", name: "En-tête classique" },
  ]

  const backgrounds = [
    { id: "bg1", name: "Fond blanc" },
    { id: "bg2", name: "Fond bleu clair" },
    { id: "bg3", name: "Fond motif médical" },
  ]

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
          <RadioGroup
            value={formData.header || ""}
            onValueChange={(value: string) => updateFormData({ header: value })}
            className="grid grid-cols-3 gap-4 mt-2"
          >
            {headers.map((header) => (
              <div key={header.id} className="flex flex-col items-center">
                <div className="border rounded-md p-2 w-full h-16 flex items-center justify-center mb-2">
                  {/* Placeholder for header preview */}
                  <div className="w-full h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={header.id} id={header.id} />
                  <Label htmlFor={header.id}>{header.name}</Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
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
              if (!checked) updateFormData({ backgroundImage: null })
            }}
          />
        </div>

        {useBackground && (
          <RadioGroup
            value={formData.backgroundImage || ""}
            onValueChange={(value: string) => updateFormData({ backgroundImage: value })}
            className="grid grid-cols-3 gap-4 mt-2"
          >
            {backgrounds.map((bg) => (
              <div key={bg.id} className="flex flex-col items-center">
                <div className="border rounded-md p-2 w-full h-24 flex items-center justify-center mb-2">
                  {/* Placeholder for background preview */}
                  <div className={`w-full h-full rounded ${
                    bg.id === "bg1" ? "bg-white" : 
                    bg.id === "bg2" ? "bg-blue-100" : 
                    "bg-gray-100"
                  }`}></div>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={bg.id} id={bg.id} />
                  <Label htmlFor={bg.id}>{bg.name}</Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
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
