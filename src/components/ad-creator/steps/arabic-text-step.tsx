import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCwIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { generateResponse, extractResponseText } from "@/lib/ai"
import type { AdFormData } from "../ad-form"

interface ArabicTextStepProps {
  formData: AdFormData
  updateFormData: (data: Partial<AdFormData>) => void
}

export function ArabicTextStep({ formData, updateFormData }: ArabicTextStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate Arabic text when entering this step if AI is enabled and prompt exists
  useEffect(() => {
    if (formData.useAi && !formData.arabicText) {
      if (formData.language === "both" && formData.frenchText) {
        // If both languages are selected and French text exists, translate from French
        console.log('Arabic step: Initiating translation from French')
        generateArabicFromFrench()
      } else if (formData.aiPrompt) {
        // Otherwise generate from prompt
        console.log('Arabic step: Initiating generation from prompt')
        generateArabicText()
      }
    }
  }, [formData.useAi, formData.arabicText, formData.language, formData.frenchText, formData.aiPrompt])

  const generateArabicText = async () => {
    if (!formData.aiPrompt) {
      toast.error("Veuillez d'abord fournir une description de l'annonce")
      return
    }

    setIsGenerating(true)
    try {
      let prompt = `Voici les détails d'une annonce: ${formData.aiPrompt}\n\nGénérer une version arabe professionnelle de cette annonce. Le texte doit être clair, concis et adapté à l'affichage public.`
      
      console.log('Arabic step: Sending prompt to AI:', prompt)
      const response = await generateResponse(prompt, { temperature: 0.7 })
      console.log('Arabic step: Received AI response')
      
      const generatedText = extractResponseText(response)
      console.log('Arabic step: Extracted text:', generatedText)
      
      if (generatedText) {
        console.log('Arabic step: Updating form data with generated text')
        updateFormData({ arabicText: generatedText })
        
        // Verify the update happened
        setTimeout(() => {
          console.log('Arabic step: Form data after update:', formData.arabicText)
          if (!formData.arabicText) {
            console.warn('Arabic step: Form data not updated immediately - this is expected with React state')
          }
        }, 100)
      } else {
        console.error('Arabic step: No text was extracted from the AI response')
        toast.error("Impossible de générer le texte. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Error generating Arabic text:", error)
      toast.error("Erreur lors de la génération du texte. Vérifiez vos paramètres API.")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateArabicFromFrench = async () => {
    if (!formData.frenchText) {
      toast.error("Le texte français est requis pour la traduction")
      return
    }

    setIsGenerating(true)
    try {
      let prompt = `Voici la version française approuvée d'une annonce :\n\n${formData.frenchText}\n\nVeuillez traduire ce texte en arabe de manière professionnelle et adaptée au contexte culturel. Assurez-vous que la traduction est fidèle au contenu original tout en étant naturelle en arabe.`
      
      console.log('Arabic step: Sending translation prompt to AI:', prompt)
      const response = await generateResponse(prompt, { temperature: 0.7 })
      console.log('Arabic step: Received translation response')
      
      const generatedText = extractResponseText(response)
      console.log('Arabic step: Extracted translation:', generatedText)
      
      if (generatedText) {
        console.log('Arabic step: Updating form data with translated text')
        updateFormData({ arabicText: generatedText })
        
        // Verify the update happened
        setTimeout(() => {
          console.log('Arabic step: Form data after translation update:', formData.arabicText)
          if (!formData.arabicText) {
            console.warn('Arabic step: Form data not updated immediately - this is expected with React state')
          }
        }, 100)
      } else {
        console.error('Arabic step: No translation was extracted from the AI response')
        toast.error("Impossible de générer la traduction. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Error generating Arabic translation:", error)
      toast.error("Erreur lors de la traduction. Vérifiez vos paramètres API.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefresh = () => {
    if (formData.language === "both" && formData.frenchText) {
      generateArabicFromFrench()
    } else {
      generateArabicText()
    }
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
                <span>{formData.language === "both" && formData.frenchText ? "Traduire" : "Régénérer"}</span>
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="arabic-text">Texte de l'annonce en arabe</Label>
        {isGenerating ? (
          <div className="min-h-[200px] border rounded-md p-3 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {formData.language === "both" && formData.frenchText 
                  ? "Traduction du texte en arabe..." 
                  : "Génération du texte en arabe..."}
              </p>
            </div>
          </div>
        ) : (
          <Textarea
            id="arabic-text"
            placeholder="أدخل نص الإعلان بالعربية"
            value={formData.arabicText}
            onChange={(e) => updateFormData({ arabicText: e.target.value })}
            className="min-h-[400px] text-right"
            dir="rtl"
          />
        )}
      </div>
    </div>
  )
}
