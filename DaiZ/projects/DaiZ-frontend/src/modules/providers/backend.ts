export async function createChat({ prompt, model, temperature }: { prompt: string; model: string; temperature: number }) {
  const res = await fetch(import.meta.env.VITE_DAISY_SERVER_URL || 'http://localhost:8787' + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model, temperature })
  })
  if (!res.ok) throw new Error('Server error creating chat')
  return (await res.json()) as { id: string }
}

export async function* streamChat(id: string): AsyncGenerator<string> {
  const base = (import.meta.env.VITE_DAISY_SERVER_URL as string) || 'http://localhost:8787'
  const url = `${base}/api/stream/${id}`
  const es = new EventSource(url)
  let done = false
  const queue: string[] = []
  es.addEventListener('delta', (e) => {
    try {
      const data = JSON.parse((e as MessageEvent).data) as { delta?: string }
      if (data.delta) queue.push(data.delta)
    } catch {}
  })
  es.addEventListener('done', () => {
    done = true
    es.close()
  })
  while (!done || queue.length) {
    if (queue.length) yield queue.shift() as string
    else await new Promise((r) => setTimeout(r, 50))
  }
}

