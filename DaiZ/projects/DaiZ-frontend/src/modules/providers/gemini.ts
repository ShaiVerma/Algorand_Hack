type StreamArgs = {
  prompt: string
  model: string
  temperature: number
}

const KEY_STORAGE = 'daisy:gemini:key'

export function getGeminiKey() {
  return localStorage.getItem(KEY_STORAGE) || ''
}

export function setGeminiKey(k: string) {
  localStorage.setItem(KEY_STORAGE, k)
}

export async function* streamGemini({ prompt, model, temperature }: StreamArgs): AsyncGenerator<string> {
  const key = getGeminiKey()
  if (!key) throw new Error('Missing Gemini API key. Add it in Settings.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${key}`
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
    generationConfig: { temperature }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  // If streaming is not supported (CORS/proxy), fall back to non-streaming
  const contentType = res.headers.get('content-type') || ''
  if (!res.body || !contentType.includes('application/json+stream')) {
    const data = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || ''
    yield text
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim()
      buffer = buffer.slice(idx + 1)
      if (!line) continue
      try {
        const json = JSON.parse(line)
        const parts: string = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || ''
        if (parts) yield parts
      } catch {
        // ignore malformed chunks
      }
    }
  }
}

