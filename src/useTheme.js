import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'aia-theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const CYCLE = ['auto', 'light', 'dark']

export default function useTheme() {
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto'
    } catch {
      return 'auto'
    }
  })

  const [systemTheme, setSystemTheme] = useState(getSystemTheme)

  // Listen for OS theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => setSystemTheme(mq.matches ? 'light' : 'dark')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolved = preference === 'auto' ? systemTheme : preference

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
    document.documentElement.style.colorScheme = resolved
  }, [resolved])

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // ignore
    }
  }, [preference])

  const cycle = useCallback(() => {
    setPreference(prev => {
      const i = CYCLE.indexOf(prev)
      return CYCLE[(i + 1) % CYCLE.length]
    })
  }, [])

  return { preference, resolved, cycle }
}
