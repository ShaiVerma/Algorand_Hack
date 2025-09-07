import { useContextStore } from '../../modules/context/context.store'

export function ContextDrawer() {
  const { webResults, files, systemPrompt } = useContextStore()
  return (
    <div className="space-y-3">
      <section>
        <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Web context</h3>
        <div className="space-y-2">
          {webResults.map((r, i) => (
            <div key={i} className="rounded-xl border p-2 text-sm">
              <a href={r.url} target="_blank" className="font-medium hover:underline">
                {r.title}
              </a>
              <p className="text-muted-foreground">{r.snippet}</p>
            </div>
          ))}
          {webResults.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}
        </div>
      </section>
      <section>
        <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Files</h3>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files uploaded.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {files.map((f, i) => (
              <li key={i} className="truncate">{f.name}</li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">System prompt</h3>
        <pre className="max-h-40 overflow-auto rounded-xl bg-secondary/50 p-2 text-xs text-muted-foreground">
{systemPrompt}
        </pre>
      </section>
    </div>
  )
}

