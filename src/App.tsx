// App.tsx - Main application layout with sidebar
import { Loader2Icon, PawPrintIcon } from "lucide-react"
import { useState, useEffect } from "react"

import { AdForm } from "@/components/ad-creator/ad-form"
import { getAd } from "@/lib/storage"
import type { AdFormData } from "@/components/ad-creator/ad-form"
import { generateAdImage } from "@/components/ad-creator/ad-preview"
import { HomePage } from "@/components/home/home-page"
import { Navigation } from "@/components/navigation"
import { PhotosPage } from "@/components/photos/photos-page"
import { SettingsPage } from "@/components/settings/settings-page"
import { Button } from "@/components/ui/button"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

function App() {
  const [showAdCreator, setShowAdCreator] = useState(false)
  const [activePage, setActivePage] = useState<"home" | "photos" | "settings">("home")
  const [currentAdId, setCurrentAdId] = useState<string | null>(null)
  const [adFormData, setAdFormData] = useState<AdFormData | null>(null)
  const [isLoadingAdData, setIsLoadingAdData] = useState(false)
  // Add a refresh trigger to force reload of ad data
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Function to refresh ad data after saving
  const refreshAdData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Load ad data when editing
  useEffect(() => {
    // Reset form data when changing ads to avoid stale data
    setAdFormData(null)
    
    const loadAdData = async () => {
      if (currentAdId) {
        try {
          setIsLoadingAdData(true)
          const ad = await getAd(currentAdId)
          if (ad) {
            // Keep the id but remove other metadata properties before passing to form
            const { createdAt, updatedAt, ...formDataWithId } = ad
            setAdFormData(formDataWithId as AdFormData & { id: string })
          }
        } catch (error) {
          console.error("Failed to load ad data:", error)
        } finally {
          setIsLoadingAdData(false)
        }
      }
    }
    
    loadAdData()
  }, [currentAdId, refreshTrigger])
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <PawPrintIcon className="h-6 w-6" />
              <span className="font-semibold">Create Ads</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Navigation activePage={activePage} onNavigate={setActivePage} />
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 text-xs text-muted-foreground">
              Create Ads v1.0.0
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-full flex-col">
            <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Create Ads</h1>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4">
              <div className="mx-auto max-w-5xl">
                {showAdCreator ? (
                  <div className="bg-white rounded-lg shadow">
                    <div className="border-b p-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        {currentAdId ? "Modifier l'annonce" : "Créer une nouvelle annonce"}
                      </h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAdCreator(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                    <div className="p-6">
                      {isLoadingAdData ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2Icon className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <AdForm 
                          initialData={adFormData} 
                          onSaveSuccess={async (adId) => {
                            try {
                              // Get the saved ad data
                              const savedAd = await getAd(adId)
                              if (savedAd) {
                                // Generate and cache a preview image with refresh callback
                                await generateAdImage(savedAd, true, refreshAdData)
                              }
                            } catch (error) {
                              console.error("Error generating preview:", error)
                            } finally {
                              // Refresh ad data after saving
                              refreshAdData()
                              setShowAdCreator(false)
                              setCurrentAdId(null)
                            }
                          }} 
                        />
                      )}
                    </div>
                  </div>
                ) : activePage === "photos" ? (
                  <PhotosPage />
                ) : activePage === "settings" ? (
                  <SettingsPage />
                ) : (
                  <HomePage 
                    refreshTrigger={refreshTrigger}
                    onCreateAd={() => {
                      setCurrentAdId(null)
                      setAdFormData(null)
                      setShowAdCreator(true)
                    }} 
                    onEditAd={(adId) => {
                      setCurrentAdId(adId)
                      setShowAdCreator(true)
                    }}
                    onDeleteAd={(adId) => {
                      // If we're currently editing this ad and it's deleted, close the editor
                      if (currentAdId === adId && showAdCreator) {
                        setShowAdCreator(false)
                        setCurrentAdId(null)
                        setAdFormData(null)
                      }
                      // Refresh the ad list after deletion
                      refreshAdData()
                    }}
                  />
                )}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default App
