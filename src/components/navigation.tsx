// Navigation component for the sidebar
import { HomeIcon, ImageIcon, SettingsIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface NavigationProps {
  activePage: "home" | "photos" | "settings"
  onNavigate: (page: "home" | "photos" | "settings") => void
}

export function Navigation({ activePage, onNavigate }: NavigationProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Accueil" 
          isActive={activePage === "home"}
          onClick={() => onNavigate("home")}
        >
          <HomeIcon />
          <span>Accueil</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Photos"
          isActive={activePage === "photos"}
          onClick={() => onNavigate("photos")}
        >
          <ImageIcon />
          <span>Photos</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Paramètres"
          isActive={activePage === "settings"}
          onClick={() => onNavigate("settings")}
        >
          <SettingsIcon />
          <span>Paramètres</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
