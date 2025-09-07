import { useEffect, useRef, useState } from 'react'
import { Paperclip, CornerDownLeft, FileText, Image as ImageIcon, X as CloseIcon } from 'lucide-react'
import { useChatStore } from '../../../modules/chat/chat.store'
import { useWallet } from '../../../modules/wallet/wallet.store'

export function InputBar() {
  const { sendMessage } = useChatStore()
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  const { connected } = useWallet()
  type Att = { id: string; name: string; type: string; size: number }
  const [attachments, setAttachments] = useState<Att[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSend()
      }
    }
    document.addEventListener('keydown', handler)
    // Drag & drop anywhere to populate input
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault()
    }
    const onDrop = async (e: DragEvent) => {
      if (!e.dataTransfer) return
      const files = Array.from(e.dataTransfer.files || [])
      if (!files.length) return
      e.preventDefault()
      try {
        setAttachments((prev) => {
          const room = Math.max(0, 5 - prev.length)
          const toAdd = files.slice(0, room).map((f) => ({ id: `${Date.now()}-${f.name}-${f.size}-${Math.random()}`, name: f.name, type: f.type || 'file', size: f.size }))
          return [...prev, ...toAdd]
        })
        // Do not alter textbox content when a file is added
      } catch (err) {
        // Keep UX stable; do not inject text on error either
      }
    }
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('drop', onDrop)
    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('drop', onDrop)
    }
  }, [])

  function handleSend() {
    const text = value.trim()
    if (!text) return
    if (!connected) {
      alert('Please connect your wallet to use DAISY')
      return
    }
    setValue('')
    void sendMessage(text)
  }

  return (
    <div className="flex w-full items-end justify-center -mt-2">
      <div className="relative w-[850px] max-w-[calc(100%-48px)]">
        {/* Persistent chip rail with fixed height so layout doesn't shift */}
        <div className="mb-3 min-h-16">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <div key={a.id} className="inline-flex h-12 items-center gap-2 rounded-xl border bg-background/70 px-2 py-1 shadow">
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-secondary/30 text-secondary-foreground">
                    {a.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium leading-none">{a.name}</div>
                  </div>
                  <button
                    className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-secondary"
                    onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                    aria-label="Remove attachment"
                  >
                    <CloseIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Input area wrapped in its own relative container so the attach icon vertically centers to the textarea, not the whole block (which includes the chip rail). */}
        <div className="relative">
          {/* Left attach icon, centered against the textarea */}
          <label className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer rounded-full h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-secondary/40" aria-label="Attach file">
            <Paperclip size={20} />
            <input
              type="file"
              className="hidden"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                if (!files.length) return
                setAttachments((prev) => {
                  const room = Math.max(0, 5 - prev.length)
                  const toAdd = files.slice(0, room).map((f) => ({ id: `${Date.now()}-${f.name}-${f.size}-${Math.random()}`, name: f.name, type: f.type || 'file', size: f.size }))
                  return [...prev, ...toAdd]
                })
                // Clear to allow selecting the same files again later
                e.currentTarget.value = ''
              }}
            />
          </label>
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask anything…"
            rows={1}
            className="w-full h-16 resize-none rounded-full bg-secondary/20 pl-16 pr-14 text-3xl leading-[64px] outline-none placeholder:text-muted-foreground text-left shadow-lg border border-secondary/30"
            onInput={() => { /* fixed height; do not auto-resize; keep styling static */ }}
          />
        </div>
        {/* Shortcut hint removed per request */}
        {/* Send button inside the textbox area; shows only when there is content and user is connected */}
        {value.trim() && connected && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90"
            onClick={handleSend}
            aria-label="Send"
          >
            <CornerDownLeft size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
