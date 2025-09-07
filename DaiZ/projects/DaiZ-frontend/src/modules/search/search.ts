export type SearchResult = { title: string; url: string; snippet: string }

// Pluggable search provider. Default is a local stub to avoid network during dev.
export function useSearchProvider() {
  const provider = localStorage.getItem('daisy:search:provider') || 'stub'
  if (provider === 'stub') return stubSearch
  return stubSearch
}

async function stubSearch(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []
  // Deterministic placeholder results
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

