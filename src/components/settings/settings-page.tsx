import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { getSettings, saveSettings } from "@/lib/storage"
import type { AppSettings } from "@/lib/storage"

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: "",
    systemPrompt: ""
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getSettings()
        setSettings(savedSettings)
      } catch (error) {
        console.error("Failed to load settings:", error)
        toast.error("Erreur lors du chargement des paramètres")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveSettings(settings)
      toast.success("Paramètres enregistrés avec succès")
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error("Erreur lors de l'enregistrement des paramètres")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration de l'IA</CardTitle>
            <CardDescription>
              Configurez les paramètres pour la génération de texte par IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Clé API</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={settings.apiKey || ""}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Votre clé API pour accéder aux services d'IA. Cette clé reste stockée localement sur votre appareil.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-prompt">Prompt système</Label>
              <Textarea
                id="system-prompt"
                placeholder="Tu es un assistant spécialisé dans la création d'annonces pour cliniques médicales..."
                className="min-h-[150px]"
                value={settings.systemPrompt || ""}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Instructions générales pour l'IA qui guideront la génération de texte pour vos annonces.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="ml-auto"
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>À propos</CardTitle>
            <CardDescription>
              Informations sur l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Clinic Ads</strong> - Version 1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              Application de création d'annonces pour cliniques médicales.
              Fonctionne entièrement hors ligne avec stockage local.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
