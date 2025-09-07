import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useUIStore } from '../../modules/ui/ui.store'
import { Button } from '../../components/ui/button'
import { Sun, Moon } from 'lucide-react'
import { ConnectWalletButton } from '../../components/ConnectWalletButton'

export function AppLayout() {
  const { theme, setTheme } = useUIStore()
  const location = useLocation()
  return (
    <div className="grid h-dvh w-dvw grid-cols-[320px_1fr] grid-rows-[56px_1fr] gap-3 p-3">
      <header className="glass col-span-2 row-[1] flex items-center justify-between rounded-2xl px-3">
        <nav className="flex items-center gap-2 text-xl">
          <NavLink
            to="/app"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 ${isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`
            }
          >
            Workspace
          </NavLink>
          {/* About removed */}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <ConnectWalletButton />
        </div>
      </header>
      <aside className="glass col-[1] row-[2] rounded-2xl"><Sidebar /></aside>
      <main className="col-[2] row-[2] min-w-0"><Outlet key={location.key} /></main>
    </div>
  )
}
