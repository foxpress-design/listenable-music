import { useState } from 'react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="admin-center">
        <h2 className="admin-title">Check Your Email</h2>
        <p className="admin-text">A login link has been sent if that email is registered.</p>
        <a href="/" className="admin-link">Back to site</a>
      </div>
    )
  }

  return (
    <div className="admin-center">
      <h2 className="admin-title">Admin Login</h2>
      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin email"
          className="admin-input"
          required
          disabled={loading}
        />
        <button type="submit" className="admin-btn" disabled={loading}>
          {loading ? '...' : 'Send Login Link'}
        </button>
      </form>
      <a href="/" className="admin-link">Back to site</a>
    </div>
  )
}
