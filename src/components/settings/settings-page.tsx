import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2Icon, SaveIcon, DownloadIcon, UploadIcon, TrashIcon } from "lucide-react"
import { getSettings, saveSettings, exportData, importData } from "@/lib/storage"
import type { AppSettings } from "@/lib/storage"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: "",
    systemPrompt: ""
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  
  // Handle backup/export data
  const handleExportData = async () => {
    try {
      setIsExporting(true)
      const data = await exportData()
      
      // Create a blob and download link
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      // Set download attributes
      const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      link.download = `clinic-ads-backup-${date}.json`
      link.href = url
      
      // Trigger download and cleanup
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success("Sauvegarde exportée avec succès")
    } catch (error) {
      console.error("Failed to export data:", error)
      toast.error("Erreur lors de l'exportation des données")
    } finally {
      setIsExporting(false)
    }
  }
  
  // Handle restore/import data
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      setIsImporting(true)
      
      // Read file contents
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const jsonData = e.target?.result as string
          await importData(jsonData)
          toast.success("Données importées avec succès")
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          
          // Reload the page to reflect changes
          window.location.reload()
        } catch (error) {
          console.error("Failed to import data:", error)
          toast.error("Erreur lors de l'importation des données. Le fichier pourrait être corrompu.")
        } finally {
          setIsImporting(false)
        }
      }
      
      reader.onerror = () => {
        toast.error("Erreur lors de la lecture du fichier")
        setIsImporting(false)
      }
      
      reader.readAsText(file)
    } catch (error) {
      console.error("Failed to process import:", error)
      toast.error("Erreur lors du traitement du fichier")
      setIsImporting(false)
    }
  }
  
  // Handle clear all data
  const handleClearData = async () => {
    try {
      setIsClearing(true)
      
      // Open the database directly
      const db = await window.indexedDB.open('clinic-ads-db')
      
      db.onsuccess = () => {
        try {
          const database = db.result
          const transaction = database.transaction(['photos', 'ads', 'settings'], 'readwrite')
          
          // Clear photos store
          const photosStore = transaction.objectStore('photos')
          photosStore.clear()
          
          // Clear ads store
          const adsStore = transaction.objectStore('ads')
          adsStore.clear()
          
          // Clear settings store
          const settingsStore = transaction.objectStore('settings')
          settingsStore.clear()
          
          transaction.oncomplete = () => {
            database.close()
            setIsClearing(false)
            toast.success("Données effacées avec succès")
            
            // Reload the page to reflect changes
            window.location.reload()
          }
          
          transaction.onerror = (event) => {
            console.error("Transaction error:", event)
            database.close()
            setIsClearing(false)
            toast.error("Erreur lors de l'effacement des données")
          }
        } catch (err) {
          console.error("Error in database operation:", err)
          db.result.close()
          setIsClearing(false)
          toast.error("Erreur lors de l'effacement des données")
        }
      }
      
      db.onerror = (event) => {
        console.error("Database error:", event)
        setIsClearing(false)
        toast.error("Erreur lors de l'accès à la base de données")
      }
    } catch (error) {
      console.error("Failed to clear data:", error)
      toast.error("Erreur lors de l'effacement des données")
      setIsClearing(false)
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
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de l'application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'IA</CardTitle>
          <CardDescription>
            Configurez les paramètres de l'IA pour la génération de texte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Clé API</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Entrez votre clé API"
              value={settings.apiKey}
              onChange={(e) =>
                setSettings({ ...settings, apiKey: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Prompt système</Label>
            <Textarea
              id="systemPrompt"
              placeholder="Entrez le prompt système pour l'IA"
              value={settings.systemPrompt}
              onChange={(e) =>
                setSettings({ ...settings, systemPrompt: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
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
          <CardTitle>Gestion des données</CardTitle>
          <CardDescription>
            Sauvegardez, restaurez ou effacez les données de l'application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Sauvegarde</h3>
              <p className="text-sm text-muted-foreground">
                Exportez toutes les données de l'application dans un fichier JSON.
              </p>
              <Button 
                onClick={handleExportData} 
                disabled={isExporting} 
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Exportation...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Exporter les données
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Restauration</h3>
              <p className="text-sm text-muted-foreground">
                Importez des données à partir d'un fichier de sauvegarde JSON.
              </p>
              <div className="flex items-center space-x-2">
                <input 
                  type="file" 
                  id="import-file" 
                  accept=".json" 
                  ref={fileInputRef}
                  onChange={handleImportData}
                  className="hidden" 
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isImporting} 
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Importation...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Importer les données
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Effacement</h3>
              <p className="text-sm text-muted-foreground">
                Effacez toutes les données de l'application (photos, annonces et paramètres).
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Effacer les données
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Effacer toutes les données?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera définitivement toutes vos photos, annonces et paramètres (y compris la clé API).
                      Cette action est irréversible et ne peut pas être annulée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearData}
                      disabled={isClearing}
                    >
                      {isClearing ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Effacement...
                        </>
                      ) : (
                        "Oui, effacer tout"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>À propos</CardTitle>
          <CardDescription>
            Informations sur l'application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Clinic Ads Creator</strong> - Version 1.0.0
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Développé par l'équipe Clinic Ads
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
