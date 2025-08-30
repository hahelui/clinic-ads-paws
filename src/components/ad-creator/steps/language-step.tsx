import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import type { AdFormData } from "../ad-form"

interface LanguageStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function LanguageStep({ formData, updateFormData }: LanguageStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="ad-title" className="text-base font-medium">Titre de l'annonce</Label>
          <Input
            id="ad-title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Entrez un titre pour identifier cette annonce"
            className="mt-1.5"
          />
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Langue de l'annonce</h3>
        <RadioGroup
          value={formData.language}
          onValueChange={(value: string) => 
            updateFormData({ language: value as "french" | "arabic" | "both" })
          }
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="french" id="french" />
            <Label htmlFor="french">Français uniquement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="arabic" id="arabic" />
            <Label htmlFor="arabic">Arabe uniquement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both">Français et Arabe</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="use-ai">Utiliser l'IA pour générer l'annonce</Label>
            <p className="text-sm text-muted-foreground">
              L'IA créera automatiquement le texte de votre annonce
            </p>
          </div>
          <Switch
            id="use-ai"
            checked={formData.useAi}
            onCheckedChange={(checked) => updateFormData({ useAi: checked })}
          />
        </div>
      </div>
    </div>
  )
}
