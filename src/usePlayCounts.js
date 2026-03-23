import { useState, useEffect, useCallback } from 'react'

const API = '/api'

export default function usePlayCounts() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    fetch(`${API}/counts`)
      .then(r => r.json())
      .then(setCounts)
      .catch(() => {})
  }, [])

  const recordPlay = useCallback((trackSrc) => {
    fetch(`${API}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track: trackSrc }),
    })
      .then(r => r.json())
      .then(({ track, count }) => {
        setCounts(prev => ({ ...prev, [track]: count }))
      })
      .catch(() => {})
  }, [])

  return { counts, recordPlay }
}
