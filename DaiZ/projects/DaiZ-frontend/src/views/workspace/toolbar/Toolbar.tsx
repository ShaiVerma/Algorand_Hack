import { Button } from '../../../components/ui/button'

export function Toolbar() {
  return (
    <div className="flex items-center justify-between gap-3 border-b p-3 text-xl">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-secondary px-3 py-1.5 font-semibold tracking-wide">DAISY</span>
      </div>
      <div className="flex items-center gap-2">
        {/* Intentionally minimal: removed model and temperature controls */}
        <Button variant="ghost" size="sm" aria-label="Brand" className="pointer-events-none opacity-70">
          Decentralized AI Search
        </Button>
      </div>
    </div>
  )
}
