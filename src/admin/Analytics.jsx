import { useState, useEffect } from 'react'

function formatTrackName(src) {
  if (!src) return '-'
  // Strip path prefix and .mp3 extension
  return src.replace(/^.*\//, '').replace(/\.mp3$/i, '')
}

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Analytics({ token }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function loadData() {
    fetch('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json()
      })
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [token])

  if (loading) {
    return <p className="admin-placeholder">Loading analytics...</p>
  }

  if (error) {
    return <p className="admin-placeholder">Error: {error}</p>
  }

  const pendingSubmissions = data.submissionStats?.pending || 0

  return (
    <div>
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-value">{data.subscribers}</div>
          <div className="admin-stat-label">Subscribers</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{data.totalPlays ?? 0}</div>
          <div className="admin-stat-label">Total Plays</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{pendingSubmissions}</div>
          <div className="admin-stat-label">Pending Submissions</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{data.emailsSent}</div>
          <div className="admin-stat-label">Emails Sent</div>
        </div>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-analytics-section">
          <h3 className="admin-analytics-heading">Top Tracks</h3>
          {data.topTracks && data.topTracks.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Track</th>
                  <th>Plays</th>
                </tr>
              </thead>
              <tbody>
                {data.topTracks.map((track, i) => (
                  <tr key={track.track_src}>
                    <td className="admin-table-rank">{i + 1}</td>
                    <td>{formatTrackName(track.track_src)}</td>
                    <td>{track.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-placeholder">No play data yet.</p>
          )}
        </div>

        <div className="admin-analytics-section">
          <h3 className="admin-analytics-heading">Recent Emails</h3>
          {data.recentEmails && data.recentEmails.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Recipients</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEmails.map((email, i) => (
                  <tr key={i}>
                    <td>{email.subject}</td>
                    <td>{email.recipient_count}</td>
                    <td>{formatDate(email.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-placeholder">No emails sent yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
