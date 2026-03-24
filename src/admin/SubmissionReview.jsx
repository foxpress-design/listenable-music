import { useState, useEffect, useCallback } from 'react'

const FILTERS = ['pending', 'approved', 'rejected']

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PhotoPreview({ token, id }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    fetch(`/api/admin/submission-file/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.blob())
      .then(blob => setSrc(URL.createObjectURL(blob)))
      .catch(() => {})
    return () => { if (src) URL.revokeObjectURL(src) }
  }, [token, id])
  if (!src) return null
  return <img className="submission-card-preview" src={src} alt="Submitted photo" />
}

function MemoryPreview({ token, id }) {
  const [text, setText] = useState(null)
  useEffect(() => {
    fetch(`/api/admin/submission-file/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.text())
      .then(setText)
      .catch(() => setText('(could not load)'))
  }, [token, id])
  if (!text) return null
  return <p className="submission-card-memory">{text}</p>
}

export default function SubmissionReview({ token }) {
  const [activeFilter, setActiveFilter] = useState('pending')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchSubmissions = useCallback(async (status) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/submissions?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Failed to load submissions (${res.status})`)
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchSubmissions(activeFilter)
  }, [activeFilter, fetchSubmissions])

  async function handleAction(id, status) {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error(`Action failed (${res.status})`)
      await fetchSubmissions(activeFilter)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="submission-review">
      <div className="submission-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`submission-filter ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="admin-placeholder">Loading submissions...</p>}
      {error && <p className="email-error">{error}</p>}

      {!loading && !error && submissions.length === 0 && (
        <p className="admin-placeholder">No {activeFilter} submissions.</p>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className="submission-cards">
          {submissions.map(sub => (
            <div key={sub.id} className="submission-card">
              <div className="submission-card-header">
                <div className="submission-card-header-left">
                  <span className="submission-card-name">{sub.name || 'Unknown'}</span>
                  <span className={`submission-type-badge submission-type-${sub.type}`}>
                    {sub.type === 'memory' ? 'Memory' : sub.type === 'music' ? 'Music' : 'Photo'}
                  </span>
                </div>
                <span className="submission-card-date">{formatDate(sub.submitted_at)}</span>
              </div>

              <div className="submission-card-meta">
                <span>{sub.email}</span>
                {sub.file_name && (
                  <span>
                    {sub.file_name}{sub.file_size ? ` (${formatBytes(sub.file_size)})` : ''}
                  </span>
                )}
              </div>

              {sub.type === 'photo' && sub.file_key && (
                <PhotoPreview token={token} id={sub.id} />
              )}

              {sub.type === 'memory' && sub.file_key && (
                <MemoryPreview token={token} id={sub.id} />
              )}

              {sub.caption && (
                <p className="submission-card-caption">{sub.caption}</p>
              )}

              <div className="submission-card-actions">
                {activeFilter !== 'approved' && (
                  <button
                    className="btn-approve"
                    disabled={actionLoading === sub.id}
                    onClick={() => handleAction(sub.id, 'approved')}
                  >
                    {actionLoading === sub.id ? '...' : 'Approve'}
                  </button>
                )}
                {activeFilter !== 'rejected' && (
                  <button
                    className="btn-reject"
                    disabled={actionLoading === sub.id}
                    onClick={() => handleAction(sub.id, 'rejected')}
                  >
                    {actionLoading === sub.id ? '...' : 'Reject'}
                  </button>
                )}
                <button
                  className="btn-reject"
                  disabled={actionLoading === sub.id}
                  onClick={() => handleAction(sub.id, 'deleted')}
                >
                  {actionLoading === sub.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
