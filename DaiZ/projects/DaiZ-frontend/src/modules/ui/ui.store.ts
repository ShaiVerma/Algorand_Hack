import { create } from 'zustand'

type ThemeMode = 'dark' | 'light'

type UIState = {
  theme: ThemeMode
  rightRailOpen: boolean
  contextDrawerOpen: boolean
  commandPaletteOpen: boolean
  setTheme: (t: ThemeMode) => void
  toggleRightRail: () => void
  toggleContextDrawer: () => void
  setCommandPalette: (v: boolean) => void
}

const initialTheme: ThemeMode =
  (localStorage.getItem('daisy:theme') as ThemeMode) || 'dark'

export const useUIStore = create<UIState>((set) => ({
  theme: initialTheme,
  rightRailOpen: true,
  contextDrawerOpen: false,
  commandPaletteOpen: false,
  setTheme: (t) => {
    localStorage.setItem('daisy:theme', t)
    set({ theme: t })
  },
  toggleRightRail: () => set((s) => ({ rightRailOpen: !s.rightRailOpen })),
  toggleContextDrawer: () => set((s) => ({ contextDrawerOpen: !s.contextDrawerOpen })),
  setCommandPalette: (v) => set({ commandPaletteOpen: v })
}))

