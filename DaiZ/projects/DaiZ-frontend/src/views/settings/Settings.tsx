import { useState } from 'react'
import { useUIStore } from '../../modules/ui/ui.store'
import { getGeminiKey, setGeminiKey } from '../../modules/providers/gemini'

export function Settings() {
  const MODE = (import.meta.env.VITE_DAISY_MODE as string) || 'server'
  const [server, setServer] = useState((import.meta.env.VITE_DAISY_SERVER_URL as string) || 'http://localhost:8787')
  const [apiKey, setApiKey] = useState(getGeminiKey())
  const { theme, setTheme } = useUIStore()
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {MODE === 'client' ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Provider: Google Gemini (client-only mode)</h2>
          <p className="text-sm text-muted-foreground">Your API key is stored locally in your browser.</p>
          <div className="flex gap-2">
            <input className="w-full rounded-xl bg-secondary/50 px-3 py-2 text-sm outline-none" placeholder="Paste Gemini API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <button className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={() => setGeminiKey(apiKey)}>Save</button>
          </div>
        </section>
      ) : (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Backend</h2>
          <p className="text-sm text-muted-foreground">The backend mediates blockchain events and LLM calls; API keys never touch the browser.</p>
          <div className="flex gap-2">
            <input className="w-full rounded-xl bg-secondary/50 px-3 py-2 text-sm outline-none" value={server} onChange={(e) => (setServer(e.target.value))} />
            <button className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={() => (window.location.href = '/app')}>Use</button>
          </div>
        </section>
      )}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={theme === 'dark'} onChange={() => setTheme('dark')} /> Dark
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={theme === 'light'} onChange={() => setTheme('light')} /> Light
          </label>
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Privacy</h2>
        <p className="text-sm text-muted-foreground">Telemetry is off by default. No data leaves your device except requests you make directly to Gemini and search providers.</p>
      </section>
    </div>
  )
}
