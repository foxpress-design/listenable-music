import { useState, useEffect } from 'react'

export default function SubscriberList({ token }) {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/admin/subscribers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setSubscribers(data.subscribers || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  function formatDate(iso) {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function exportCSV() {
    const active = subscribers.filter(s => !s.unsubscribed_at)
    const header = 'email,name,subscribed_at,source'
    const rows = active.map(s => {
      const email = `"${(s.email || '').replace(/"/g, '""')}"`
      const name = `"${(s.name || '').replace(/"/g, '""')}"`
      const date = s.subscribed_at || ''
      const source = `"${(s.source || '').replace(/"/g, '""')}"`
      return [email, name, date, source].join(',')
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <p className="admin-placeholder">Loading subscribers...</p>
  }

  if (error) {
    return <p className="admin-placeholder">Error: {error}</p>
  }

  const active = subscribers.filter(s => !s.unsubscribed_at)
  const unsubscribed = subscribers.filter(s => s.unsubscribed_at)

  return (
    <div>
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-value">{subscribers.length}</div>
          <div className="admin-stat-label">Total</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{active.length}</div>
          <div className="admin-stat-label">Active</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{unsubscribed.length}</div>
          <div className="admin-stat-label">Unsubscribed</div>
        </div>
      </div>

      <div className="admin-actions">
        <button className="admin-btn admin-btn-sm" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {subscribers.length === 0 ? (
        <p className="admin-placeholder">No subscribers yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(s => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>{formatDate(s.subscribed_at)}</td>
                <td>
                  {s.unsubscribed_at
                    ? <span className="status-inactive">Unsubscribed</span>
                    : <span className="status-active">Active</span>
                  }
                </td>
                <td>{s.source || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
