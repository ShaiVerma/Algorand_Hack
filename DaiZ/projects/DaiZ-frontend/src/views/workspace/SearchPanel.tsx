import { useState } from 'react'
import { ExternalLink, Plus } from 'lucide-react'
import { useSearchProvider } from '../../modules/search/search'
import { useContextStore } from '../../modules/context/context.store'

export function SearchPanel() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Array<{ title: string; url: string; snippet: string }>>([])
  const search = useSearchProvider()
  const addContext = useContextStore((s) => s.addWebResult)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const r = await search(q)
    setResults(r)
  }

  return (
    <div>
      <form className="mb-2 flex gap-2" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl bg-secondary/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Search the web (optional)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="rounded-xl bg-secondary px-3 py-2 text-sm">Search</button>
      </form>
      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="rounded-xl border p-2">
            <div className="flex items-center justify-between">
              <a href={r.url} target="_blank" className="font-medium hover:underline">
                {r.title}
              </a>
              <div className="flex items-center gap-1">
                <a className="rounded p-1 text-muted-foreground hover:bg-secondary" href={r.url} target="_blank" aria-label="Open">
                  <ExternalLink size={14} />
                </a>
                <button
                  className="rounded p-1 text-muted-foreground hover:bg-secondary"
                  onClick={() => addContext({ title: r.title, url: r.url, snippet: r.snippet })}
                  aria-label="Add to context"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="truncate text-xs text-muted-foreground">{r.url}</div>
            <p className="mt-1 text-sm text-muted-foreground">{r.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

