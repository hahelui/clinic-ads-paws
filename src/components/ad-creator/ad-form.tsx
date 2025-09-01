import * as React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { saveAd } from "@/lib/storage"

import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
} from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { LanguageStep } from "./steps/language-step"
import { AiPromptStep } from "./steps/ai-prompt-step"
import { FrenchTextStep } from "./steps/french-text-step"
import { ArabicTextStep } from "./steps/arabic-text-step"
import { DesignStep } from "./steps/design-step"

export interface AdFormProps {
  initialData?: AdFormData & { id?: string } | null
  onSaveSuccess?: (adId: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export type AdFormData = {
  title: string
  language: "french" | "arabic" | "both"
  useAi: boolean
  aiPrompt: string
  frenchText: string
  arabicText: string
  header: string | null
  background: string | null
  signature: string | null
  contactInfo: string
  previewImage?: string | null
}

export function AdForm({ initialData, onSaveSuccess, open, onOpenChange }: AdFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  
  // Default form data
  const defaultFormData: AdFormData = {
    title: "",
    language: "both",
    useAi: true,
    aiPrompt: "",
    frenchText: "",
    arabicText: "",
    header: null,
    background: null,
    signature: null,
    contactInfo: "",
  }
  
  // Initialize with default form data
  const [formData, setFormData] = useState<AdFormData>(defaultFormData)
  
  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      // Make sure to extract only the properties we need for AdFormData
      const {
        title = "",
        language = "both",
        useAi = true,
        aiPrompt = "",
        frenchText = "",
        arabicText = "",
        header = null,
        background = null,
        signature = null,
        contactInfo = "",
        previewImage = null
      } = initialData;
      
      setFormData({
        title,
        language: language as "french" | "arabic" | "both",
        useAi,
        aiPrompt,
        frenchText,
        arabicText,
        header,
        background,
        signature,
        contactInfo,
        previewImage
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData])

  const updateFormData = (data: Partial<AdFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }
  
  const [isSaving, setIsSaving] = useState(false)

  // Image generation and download will be handled in the home page

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      // No need to generate image in the form
      
      // Save the form data to IndexedDB (pass the ID if editing)
      const adId = await saveAd(formData, initialData?.id)
      console.log("Ad saved with ID:", adId)
      
      // Call the onSaveSuccess callback if provided
      if (onSaveSuccess) {
        onSaveSuccess(adId)
      } else {
        // Reset the form after successful save
        setFormData({
          title: "",
          language: "both",
          useAi: true,
          aiPrompt: "",
          frenchText: "",
          arabicText: "",
          header: null,
          background: null,
          signature: null,
          contactInfo: "",
          previewImage: null
        })
      }
      
      // Return to the first step
      setCurrentStep(0)
      
      // Notify the user that the ad was saved successfully
      toast.success(initialData ? "Annonce mise à jour avec succès" : "Annonce enregistrée avec succès")
    } catch (error) {
      console.error("Failed to save ad:", error)
      toast.error("Erreur lors de l'enregistrement de l'annonce")
    } finally {
      setIsSaving(false)
    }
  }

  const steps = [
    {
      component: (
        <LanguageStep
          formData={formData}
          updateFormData={updateFormData}
        />
      ),
    },
    {
      component: formData.useAi ? (
        <AiPromptStep
          formData={formData}
          updateFormData={updateFormData}
        />
      ) : null,
      skip: !formData.useAi,
    },
    {
      component: (
        <FrenchTextStep
          formData={formData}
          updateFormData={updateFormData}
        />
      ),
      skip: formData.language === "arabic",
    },
    {
      component: (
        <ArabicTextStep
          formData={formData}
          updateFormData={updateFormData}
        />
      ),
      skip: formData.language === "french",
    },
    {
      component: (
        <DesignStep
          formData={formData}
          updateFormData={updateFormData}
        />
      ),
    },
  ]

  // Filter out steps that should be skipped
  const activeSteps = steps.filter((step) => !step.skip)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier l'annonce" : "Créer une nouvelle annonce"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="w-full max-w-3xl mx-auto py-4">
          <Stepper
            value={currentStep}
            onValueChange={setCurrentStep}
            className="mb-8"
          >
            {activeSteps.map((_, index) => (
              <React.Fragment key={index}>
                <StepperItem step={index}>
                  <StepperTrigger>
                    <StepperIndicator />
                  </StepperTrigger>
                </StepperItem>
                {index < activeSteps.length - 1 && <StepperSeparator />}
              </React.Fragment>
            ))}
          </Stepper>

          <div className="mb-6">
            <div>
              {activeSteps[currentStep]?.component}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="flex justify-center sm:justify-start">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-full sm:w-auto"
            >
              Précédent
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            {currentStep === activeSteps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? "Enregistrement..." : initialData ? "Mettre à jour" : "Enregistrer"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto">Suivant</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
