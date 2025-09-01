import { createContext, useContext, useEffect, useState } from "react"
import { db } from "@/lib/db"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await db.settings.get('app-settings')
        if (settings?.theme) {
          setTheme(settings.theme)
        }
      } catch (error) {
        console.error("Failed to load theme setting:", error)
      }
    }
    
    loadTheme()
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: async (newTheme: Theme) => {
      setTheme(newTheme)
      try {
        // Save to database
        const settings = await db.settings.get('app-settings') || { id: 'app-settings' }
        await db.settings.put({
          ...settings,
          theme: newTheme
        })
      } catch (error) {
        console.error("Failed to save theme setting:", error)
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
