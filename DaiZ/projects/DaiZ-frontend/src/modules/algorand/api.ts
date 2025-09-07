export async function getSuggestedParams() {
  const base = (import.meta.env.VITE_DAISY_SERVER_URL as string) || 'http://localhost:8787'
  const res = await fetch(base + '/api/algorand/params')
  if (!res.ok) throw new Error('Failed to fetch params')
  return await res.json()
}

export async function sendSignedTx(stx: Uint8Array) {
  const base = (import.meta.env.VITE_DAISY_SERVER_URL as string) || 'http://localhost:8787'
  const res = await fetch(base + '/api/algorand/sendtx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stx: btoa(String.fromCharCode(...stx)) })
  })
  if (!res.ok) throw new Error('Broadcast failed')
  return await res.json()
}

