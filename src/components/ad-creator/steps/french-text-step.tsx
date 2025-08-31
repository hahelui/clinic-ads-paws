import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCwIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { generateResponse, extractResponseText } from "@/lib/ai"
import type { AdFormData } from "../ad-form"

interface FrenchTextStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function FrenchTextStep({ formData, updateFormData }: FrenchTextStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate French text when entering this step if AI is enabled and prompt exists
  useEffect(() => {
    if (formData.useAi && formData.aiPrompt && !formData.frenchText) {
      generateFrenchText()
    }
  }, [])

  const generateFrenchText = async () => {
    if (!formData.aiPrompt) {
      toast.error("Veuillez d'abord fournir une description de l'annonce")
      return
    }

    setIsGenerating(true)
    try {
      let prompt = `Voici les détails d'une annonce pour une clinique vétérinaire: ${formData.aiPrompt}\n\nGénérer une version française professionnelle de cette annonce. Le texte doit être clair, concis et adapté à l'affichage public.`
      
      const response = await generateResponse(prompt, { temperature: 0.7 })
      const generatedText = extractResponseText(response)
      
      if (generatedText) {
        updateFormData({ frenchText: generatedText })
      } else {
        toast.error("Impossible de générer le texte. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Error generating French text:", error)
      toast.error("Erreur lors de la génération du texte. Vérifiez vos paramètres API.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefresh = () => {
    generateFrenchText()
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
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <RefreshCwIcon className="h-4 w-4" />
                <span>Régénérer</span>
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="french-text">Texte de l'annonce en français</Label>
        {isGenerating ? (
          <div className="min-h-[200px] border rounded-md p-3 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Génération du texte en français...</p>
            </div>
          </div>
        ) : (
          <Textarea
            id="french-text"
            placeholder="Entrez le texte de votre annonce en français"
            value={formData.frenchText}
            onChange={(e) => updateFormData({ frenchText: e.target.value })}
            className="min-h-[200px]"
          />
        )}
      </div>
    </div>
  )
}
