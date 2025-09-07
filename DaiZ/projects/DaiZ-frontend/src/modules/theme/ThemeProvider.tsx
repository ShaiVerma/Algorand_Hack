import { PropsWithChildren, useEffect } from 'react'
import { useUIStore } from '../ui/ui.store'

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useUIStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])
  return children
}

