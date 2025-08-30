import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCwIcon } from "lucide-react"
import type { AdFormData } from "../ad-form"

interface FrenchTextStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function FrenchTextStep({ formData, updateFormData }: FrenchTextStepProps) {
  const handleRefresh = () => {
    // This will be implemented later when we add AI functionality
    console.log("Refreshing French text with AI...")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Texte français</h3>
        {formData.useAi && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCwIcon className="h-4 w-4" />
            <span>Régénérer</span>
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="french-text">Texte de l'annonce en français</Label>
        <Textarea
          id="french-text"
          placeholder="Entrez le texte de votre annonce en français"
          value={formData.frenchText}
          onChange={(e) => updateFormData({ frenchText: e.target.value })}
          className="min-h-[200px]"
        />
      </div>
    </div>
  )
}
