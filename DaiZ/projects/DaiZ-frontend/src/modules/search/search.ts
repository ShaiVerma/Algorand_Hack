export type SearchResult = { title: string; url: string; snippet: string }

// Pluggable search provider. Calls FastAPI backend if provider is 'api'
export function useSearchProvider() {
  return async function search(q: string) {
    if (!q.trim()) return []

    try {
      const res = await fetch('http://localhost:4001/post-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: q }),
      })

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      // For now, backend just returns { "txId": "success" }
      // You can return dummy results in the same format as before
      return [
        {
          title: `Result for "${q}" — Example.org`,
          url: 'https://example.org',
          snippet: 'This is a placeholder result from FastAPI.'
        },
        {
          title: 'Algorand Developer Portal',
          url: 'https://developer.algorand.org',
          snippet: 'Docs, SDKs and Algokit for building on Algorand.'
        }
      ]
    } catch (err) {
      console.error('Search failed', err)
      return []
    }
  }
}

async function stubSearch(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []
  return [
    {
      title: `Result for "${q}" — Example.org`,
      url: 'https://example.org',
      snippet: 'This is a placeholder search result. Configure a real provider in settings.'
    },
    {
      title: 'Algorand Developer Portal',
      url: 'https://developer.algorand.org',
      snippet: 'Docs, SDKs and Algokit for building on Algorand.'
    }
  ]
}

async function apiSearch(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []

  try {
    const res = await fetch(`http://localhost:4001//post-query?q=${encodeURIComponent(q)}`)
    if (!res.ok) throw new Error('Search API request failed')
    const data = await res.json()
    return data as SearchResult[]
  } catch (err) {
    console.error('API search error:', err)
    return []
  }
}
