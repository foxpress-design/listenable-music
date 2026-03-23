import { useState, useEffect } from 'react'

export default function EmailComposer({ token }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(false)
  const [recipientCount, setRecipientCount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
    </div>
  )
}
