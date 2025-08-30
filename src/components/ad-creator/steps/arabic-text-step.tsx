import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCwIcon } from "lucide-react"
import type { AdFormData } from "../ad-form"

interface ArabicTextStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function ArabicTextStep({ formData, updateFormData }: ArabicTextStepProps) {
  const handleRefresh = () => {
    // This will be implemented later when we add AI functionality
    console.log("Refreshing Arabic text with AI...")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Texte arabe</h3>
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
        <Label htmlFor="arabic-text">Texte de l'annonce en arabe</Label>
        <Textarea
          id="arabic-text"
          placeholder="أدخل نص الإعلان بالعربية"
          value={formData.arabicText}
          onChange={(e) => updateFormData({ arabicText: e.target.value })}
          className="min-h-[200px] text-right"
          dir="rtl"
        />
      </div>
    </div>
  )
}
