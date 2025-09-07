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

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault()
    }
    const onDrop = (e: DragEvent) => {
      if (!e.dataTransfer) return
      const files = Array.from(e.dataTransfer.files || [])
      if (!files.length) return
      e.preventDefault()
      setAttachments((prev) => {
        const room = Math.max(0, 5 - prev.length)
        const toAdd = files.slice(0, room).map((f) => ({
          id: `${Date.now()}-${f.name}-${f.size}-${Math.random()}`,
          name: f.name,
          type: f.type || 'file',
          size: f.size,
        }))
        return [...prev, ...toAdd]
      })
    }

    document.addEventListener('dragover', onDragOver)
    document.addEventListener('drop', onDrop)
    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('drop', onDrop)
    }
  }, [])

  async function handleSend() {
    const text = value.trim()
    if (!text) return

    setValue('')

    try {
      const res = await fetch('http://localhost:4000/post-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })

      const data = await res.json()
      console.log('API response:', data)

      void sendMessage(text)
    } catch (err) {
      console.error('Error posting to API:', err)
    }
  }

  return (
    <div className="flex w-full items-end justify-center -mt-2">
      <div className="relative w-[650px] max-w-[calc(100%-48px)]">
        {/* Attachments chip rail */}
        <div className="mb-3 min-h-16">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border bg-background/70 px-2 py-1 shadow"
                >
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

        {/* Input & controls */}
        <div className="relative flex items-center bg-gray-800 rounded-xl px-2">
          <textarea
            ref={ref}
            className="w-full rounded-xl bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400 resize-none text-white"
            placeholder="Type a message..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={1}
          />

          {/* File attach button on the right */}
          <label className="cursor-pointer grid h-10 w-10 place-items-center rounded-full text-gray-300 hover:bg-gray-700" aria-label="Attach file">
            <Paperclip size={20} />
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (!files.length) return
                setAttachments((prev) => {
                  const room = Math.max(0, 5 - prev.length)
                  const toAdd = files.slice(0, room).map((f) => ({
                    id: `${Date.now()}-${f.name}-${f.size}-${Math.random()}`,
                    name: f.name,
                    type: f.type || 'file',
                    size: f.size,
                  }))
                  return [...prev, ...toAdd]
                })
                e.currentTarget.value = ''
              }}
            />
          </label>

          {/* Send button */}
          {value.trim() && connected && (
            <button
              className="ml-2 grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-500"
              onClick={handleSend}
              aria-label="Send"
            >
              <CornerDownLeft size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
