import { Button } from '../../components/ui/button'
import { Plus, Pin, Search, Edit3 } from 'lucide-react'
import { useChatStore } from '../../modules/chat/chat.store'
import { useState } from 'react'

export function Sidebar() {
  const { conversations, currentId, createConversation, renameConversation, setCurrent } = useChatStore()
  const [filter, setFilter] = useState('')
  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()))
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            className="w-full rounded-xl bg-secondary/50 px-3 py-2 text-xl outline-none placeholder:text-muted-foreground"
            placeholder="Search chats"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search size={16} className="pointer-events-none absolute right-3 top-2.5 text-muted-foreground" />
        </div>
        <Button onClick={() => createConversation()} size="sm" className="shrink-0">
          <Plus size={16} className="mr-1" /> New
        </Button>
      </div>
      <div className="flex-1 space-y-1 overflow-auto pr-1">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => setCurrent(c.id)}
            className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xl hover:bg-secondary/60 ${
              currentId === c.id ? 'bg-secondary' : ''
            }`}
          >
            <span className="truncate">{c.title}</span>
            <span className="ml-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                className="rounded p-1 text-muted-foreground hover:bg-secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  const name = prompt('Rename conversation', c.title)
                  if (name) renameConversation(c.id, name)
                }}
                aria-label="Rename"
              >
                <Edit3 size={14} />
              </button>
              <button className="rounded p-1 text-muted-foreground hover:bg-secondary" aria-label="Pin">
                <Pin size={14} />
              </button>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
