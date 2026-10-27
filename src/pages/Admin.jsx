import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin from '../admin/AdminLogin'
import AdminLayout from '../admin/AdminLayout'
import '../admin/admin.css'

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('admin_token')
    return stored ? JSON.parse(stored) : null
  })
  const [verifying, setVerifying] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setAuth(null)
  }, [])

  // A stored token can outlive its 7-day server session; drop it on 401 so the login form shows.
  useEffect(() => {
    if (!auth || searchParams.get('token')) return
    fetch('/api/admin/session', { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => { if (r.status === 401) logout() })
      .catch(() => {})
  }, [auth, searchParams, logout])

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    setVerifying(true)
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          const authData = { token: data.token, email: data.email }
          localStorage.setItem('admin_token', JSON.stringify(authData))
          setAuth(authData)
          setSearchParams({})
        }
      })
      .finally(() => setVerifying(false))
  }, [searchParams, setSearchParams])

  if (verifying) {
    return (
      <div className="admin-page">
        <div className="admin-center">Verifying...</div>
      </div>
    )
  }

  if (!auth) {
    return (
      <div className="admin-page">
        <AdminLogin />
      </div>
    )
  }

  return (
    <AdminLayout auth={auth} onLogout={logout} />
  )
}
