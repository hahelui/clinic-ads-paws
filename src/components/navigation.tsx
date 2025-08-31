// Navigation component for the sidebar
import { HomeIcon, ImageIcon, SettingsIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"

interface NavigationProps {
  activePage: "home" | "photos" | "settings"
  onNavigate: (page: "home" | "photos" | "settings") => void
}

export function Navigation({ activePage, onNavigate }: NavigationProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  
  // Handler to navigate and close sidebar on mobile
  const handleNavigate = (page: "home" | "photos" | "settings") => {
    onNavigate(page)
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Accueil" 
          isActive={activePage === "home"}
          onClick={() => handleNavigate("home")}
          size="lg" // Increased size
          className="font-medium"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Accueil</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Photos"
          isActive={activePage === "photos"}
          onClick={() => handleNavigate("photos")}
          size="lg" // Increased size
          className="font-medium"
        >
          <ImageIcon className="h-5 w-5" />
          <span>Photos</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Paramètres"
          isActive={activePage === "settings"}
          onClick={() => handleNavigate("settings")}
          size="lg" // Increased size
          className="font-medium"
        >
          <SettingsIcon className="h-5 w-5" />
          <span>Paramètres</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
