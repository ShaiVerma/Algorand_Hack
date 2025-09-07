import { useUIStore } from '../../modules/ui/ui.store'
import { Button } from '../../components/ui/button'
import { PanelRightClose, Globe, FileText } from 'lucide-react'
import { SearchPanel } from '../workspace/SearchPanel'
import { ContextDrawer } from '../workspace/ContextDrawer'

export function RightRail() {
  const { toggleRightRail } = useUIStore()
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe size={16} /> Search • <FileText size={16} /> Context
        </div>
        <Button size="icon" variant="ghost" onClick={toggleRightRail} aria-label="Close right rail">
          <PanelRightClose size={16} />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3">
        <SearchPanel />
        <ContextDrawer />
      </div>
    </div>
  )
}

