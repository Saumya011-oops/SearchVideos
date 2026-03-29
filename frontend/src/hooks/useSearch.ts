import { useState, useCallback } from 'react'
import { SearchResult, SearchResponse } from '../types'
import { search as apiSearch } from '../services/api'

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState('')

  const doSearch = useCallback(async (query: string, videoId?: string, topK = 10) => {
    if (!query.trim()) return
    try {
      setLoading(true)
      setError(null)
      setLastQuery(query)
      const data: SearchResponse = await apiSearch(query, videoId, topK)
      setResults(data.results)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, lastQuery, doSearch }
}
