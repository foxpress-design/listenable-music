import { useState } from 'react'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Subscribed. Thank you.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <form className="subscribe-form" onSubmit={handleSubmit}>
      <div className="subscribe-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="subscribe-input"
          required
          disabled={status === 'sending'}
        />
        <button
          type="submit"
          className="subscribe-btn"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? '...' : 'Subscribe'}
        </button>
      </div>
      {status === 'success' && <p className="subscribe-msg subscribe-success">{message}</p>}
      {status === 'error' && <p className="subscribe-msg subscribe-error">{message}</p>}
    </form>
  )
}
