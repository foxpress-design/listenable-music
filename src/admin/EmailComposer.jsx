import { useState, useEffect } from 'react'

export default function EmailComposer({ token }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(false)
  const [recipientCount, setRecipientCount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [emailHistory, setEmailHistory] = useState([])
  const [previewEmail, setPreviewEmail] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  function loadHistory() {
    fetch('/api/admin/emails', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setEmailHistory(data.emails || []))
      .catch(() => {})
  }

  async function openPreview(id) {
    setLoadingPreview(true)
    try {
      const res = await fetch(`/api/admin/emails?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.email) setPreviewEmail(data.email)
    } catch {} finally {
      setLoadingPreview(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [token])

  useEffect(() => {
    fetch('/api/admin/subscribers', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.subscribers) {
          const active = data.subscribers.filter(s => !s.unsubscribed_at)
          setRecipientCount(active.length)
        }
      })
      .catch(() => setRecipientCount(0))
  }, [token])

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required.')
      return
    }

    const confirmed = window.confirm(
      `Send to ${recipientCount} subscriber${recipientCount === 1 ? '' : 's'}?`
    )
    if (!confirmed) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, body }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Send failed.')
      } else {
        setResult(data)
        setSubject('')
        setBody('')
        setPreview(false)
        loadHistory()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const previewHtml = body.replace(/\n/g, '<br>')

  return (
    <div className="email-form">
      <div className="email-form-meta">
        {recipientCount !== null && (
          <span className="email-recipient-count">
            {recipientCount} active subscriber{recipientCount === 1 ? '' : 's'}
          </span>
        )}
        <button
          type="button"
          className="admin-btn email-preview-toggle"
          onClick={() => setPreview(p => !p)}
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {!preview ? (
        <>
          <input
            className="admin-input email-subject"
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={loading}
          />
          <textarea
            className="admin-input email-body"
            placeholder="Email body (plain text, line breaks become paragraph breaks)"
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={loading}
          />
        </>
      ) : (
        <div className="email-preview">
          <div className="email-preview-subject">
            <span className="email-preview-label">Subject:</span> {subject || <em>No subject</em>}
          </div>
          <div
            className="email-preview-body"
            dangerouslySetInnerHTML={{ __html: previewHtml || '<em>No body</em>' }}
          />
          <hr className="email-preview-hr" />
          <p className="email-preview-unsub">
            <a href="#" style={{ color: '#999', fontSize: '12px' }}>Unsubscribe</a>
          </p>
        </div>
      )}

      {error && <p className="email-error">{error}</p>}

      {result && (
        <div className="email-result">
          <span className="email-result-sent">{result.sent} sent</span>
          {result.failed > 0 && (
            <span className="email-result-failed">{result.failed} failed</span>
          )}
          <span className="email-result-total">of {result.total} total</span>
        </div>
      )}

      <div className="email-actions">
        <button
          type="button"
          className="admin-btn"
          onClick={handleSend}
          disabled={loading || recipientCount === 0}
        >
          {loading ? 'Sending...' : `Send${recipientCount !== null ? ` to ${recipientCount}` : ''}`}
        </button>
      </div>

      {emailHistory.length > 0 && (
        <div className="email-history">
          <h4 className="admin-section-title" style={{ marginTop: '2rem' }}>All Emails ({emailHistory.length})</h4>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>To</th>
                <th>Sent By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {emailHistory.map((e) => (
                <tr key={e.id} onClick={() => openPreview(e.id)} style={{ cursor: 'pointer' }} className="email-history-row">
                  <td>{e.subject}</td>
                  <td>{e.recipient_count}</td>
                  <td><span className={`email-sent-by ${e.sent_by === 'system' ? 'email-sent-system' : ''}`}>{e.sent_by === 'system' ? 'system' : 'manual'}</span></td>
                  <td>{e.sent_at ? new Date(e.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewEmail && (
        <div className="email-preview-overlay" onClick={() => setPreviewEmail(null)}>
          <div className="email-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="email-preview-modal-header">
              <h4>{previewEmail.subject}</h4>
              <button className="email-preview-modal-close" onClick={() => setPreviewEmail(null)}>x</button>
            </div>
            <div className="email-preview-modal-meta">
              <span>To: {previewEmail.recipient_count} recipient{previewEmail.recipient_count === 1 ? '' : 's'}</span>
              <span>By: {previewEmail.sent_by}</span>
              <span>{previewEmail.sent_at ? new Date(previewEmail.sent_at).toLocaleString() : ''}</span>
            </div>
            <div className="email-preview-modal-body">
              {previewEmail.body_html ? (
                <div dangerouslySetInnerHTML={{ __html: previewEmail.body_html }} />
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{previewEmail.body_preview || 'No preview available'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {loadingPreview && (
        <div className="email-preview-overlay">
          <p style={{ color: 'var(--accent)' }}>Loading...</p>
        </div>
      )}
    </div>
  )
}
