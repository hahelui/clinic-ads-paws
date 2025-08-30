// App.tsx - Main application layout with sidebar
import { PawPrintIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import { AdForm } from "@/components/ad-creator/ad-form"
import { Navigation } from "@/components/navigation"
import { PhotosPage } from "@/components/photos/photos-page"
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
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <PawPrintIcon className="h-6 w-6" />
              <span className="font-semibold">Clinic Ads</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Navigation activePage={activePage} onNavigate={setActivePage} />
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 text-xs text-muted-foreground">
              Clinic Ads v0.1
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-full flex-col">
            <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Clinic Ads</h1>
              </div>

            </header>
            <main className="flex-1 overflow-auto p-4">
              <div className="mx-auto max-w-5xl">
                {showAdCreator ? (
                  <div className="bg-white rounded-lg shadow">
                    <div className="border-b p-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Créer une nouvelle annonce</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAdCreator(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                    <div className="p-6">
                      <AdForm />
                    </div>
                  </div>
                ) : activePage === "photos" ? (
                  <PhotosPage />
                ) : activePage === "settings" ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground mb-4">Paramètres (à venir)</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground mb-4">Bienvenue sur Clinic Ads</p>
                      <Button 
                        onClick={() => setShowAdCreator(true)}
                        className="flex items-center gap-1"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Créer une nouvelle annonce
                      </Button>
                    </div>
                  </div>
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
