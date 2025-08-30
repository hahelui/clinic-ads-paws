import * as React from "react"
import { useState } from "react"
import { saveAd } from "@/lib/storage"

import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
} from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { LanguageStep } from "./steps/language-step"
import { AiPromptStep } from "./steps/ai-prompt-step"
import { FrenchTextStep } from "./steps/french-text-step"
import { ArabicTextStep } from "./steps/arabic-text-step"
import { DesignStep } from "./steps/design-step"

export type AdFormData = {
  language: "french" | "arabic" | "both"
  useAi: boolean
  aiPrompt: string
  frenchText: string
  arabicText: string
  header: string | null
  backgroundImage: string | null
  contactInfo: string
}

export function AdForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<AdFormData>({
    language: "both",
    useAi: true,
    aiPrompt: "",
    frenchText: "",
    arabicText: "",
    header: null,
    backgroundImage: null,
    contactInfo: "",
  })

  const updateFormData = (data: Partial<AdFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }
  
  const handleSubmit = async () => {
    try {
      // Save the form data to IndexedDB
      const adId = await saveAd(formData)
      console.log("Ad saved with ID:", adId)
      
      // Reset the form after successful save
      setFormData({
        language: "both",
        useAi: true,
        aiPrompt: "",
        frenchText: "",
        arabicText: "",
        header: null,
        backgroundImage: null,
        contactInfo: "",
      })
      
      // Return to the first step
      setCurrentStep(0)
      
      // Alert the user that the ad was saved successfully
      alert("Annonce enregistrée avec succès!")
    } catch (error) {
      console.error("Failed to save ad:", error)
      alert("Erreur lors de l'enregistrement de l'annonce. Veuillez réessayer.")
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
    <div className="w-full max-w-3xl mx-auto">
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

      <div className="border rounded-lg p-6 mb-6">
        {activeSteps[currentStep]?.component}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Précédent
        </Button>
        <Button
          onClick={currentStep === activeSteps.length - 1 ? handleSubmit : handleNext}
        >
          {currentStep === activeSteps.length - 1 ? "Valider" : "Suivant"}
        </Button>
      </div>
    </div>
  )
}
