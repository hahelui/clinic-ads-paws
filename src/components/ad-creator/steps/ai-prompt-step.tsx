import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AdFormData } from "../ad-form"

interface AiPromptStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function AiPromptStep({ formData, updateFormData }: AiPromptStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-4">Détails de l'annonce</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Décrivez votre annonce en détail. Incluez toutes les informations importantes comme les dates, 
          les noms, les lieux, les prix, etc. L'IA utilisera ces informations pour générer votre annonce.
        </p>
        <div className="space-y-2">
          <Label htmlFor="ai-prompt">Description de l'annonce</Label>
          <Textarea
            id="ai-prompt"
            placeholder="Ex: Annonce pour une journée portes ouvertes à la clinique le 15 septembre 2025. Consultations gratuites de 9h à 17h. Dr. Martin et Dr. Ahmed seront présents."
            value={formData.aiPrompt}
            onChange={(e) => updateFormData({ aiPrompt: e.target.value })}
            className="min-h-[200px]"
          />
        </div>
      </div>
    </div>
  )
}
