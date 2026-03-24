import { useState, useEffect } from 'react'

export default function EventsManager({ token }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ name: '', date: '', location: '', tag: '' })
  const [saving, setSaving] = useState(false)

  // Email state
  const [emailTarget, setEmailTarget] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  function loadEvents() {
    fetch('/api/admin/events', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setEvents(data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEvents() }, [token])

  async function handleAddEvent(e) {
    e.preventDefault()
    if (!newEvent.name || !newEvent.date || !newEvent.tag) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })
      if (res.ok) {
        setNewEvent({ name: '', date: '', location: '', tag: '' })
        setShowAddForm(false)
        loadEvents()
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  async function handleSendEmail() {
    if (!emailSubject.trim() || !emailBody.trim() || !emailTarget) return
    const confirmed = window.confirm(
      `Send to ${emailTarget.subscriber_count} subscriber${emailTarget.subscriber_count === 1 ? '' : 's'} signed up for "${emailTarget.name}"?`
    )
    if (!confirmed) return

    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/events/email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: emailTarget.tag, subject: emailSubject, body: emailBody }),
      })
      const data = await res.json()
      if (res.ok) {
        setSendResult(data)
        setEmailSubject('')
        setEmailBody('')
      }
    } catch {} finally {
      setSending(false)
    }
  }

  if (loading) return <p>Loading events...</p>

  return (
    <div className="events-manager">
      {events.length === 0 && !showAddForm && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No events yet.</p>
      )}

      {events.map(evt => (
        <div key={evt.tag} className="event-admin-card">
          <div className="event-admin-header">
            <div>
              <h3 className="event-admin-name">{evt.name}</h3>
              <p className="event-admin-meta">
                {evt.date}{evt.location ? `, ${evt.location}` : ''} &middot; Tag: <code>{evt.tag}</code>
              </p>
            </div>
            <span className="event-admin-count">{evt.subscriber_count} signed up</span>
          </div>

          {evt.subscribers && evt.subscribers.length > 0 && (
            <table className="admin-table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {evt.subscribers.map(s => (
                  <tr key={s.id}>
                    <td>{s.email}</td>
                    <td>{s.name || '-'}</td>
                    <td>{new Date(s.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="event-admin-actions">
            <button
              className="admin-btn"
              onClick={() => {
                setEmailTarget(evt)
                setEmailSubject(`Update: ${evt.name}`)
                setEmailBody('')
                setSendResult(null)
              }}
              disabled={evt.subscriber_count === 0}
            >
              Email {evt.subscriber_count} attendee{evt.subscriber_count === 1 ? '' : 's'}
            </button>
          </div>

          {emailTarget?.tag === evt.tag && (
            <div className="event-email-form">
              <input
                className="admin-input"
                type="text"
                placeholder="Subject"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                disabled={sending}
              />
              <textarea
                className="admin-input"
                placeholder="Email body (plain text)"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                disabled={sending}
                rows={5}
              />
              <div className="event-email-actions">
                <button className="admin-btn" onClick={handleSendEmail} disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
                <button className="admin-btn" onClick={() => { setEmailTarget(null); setSendResult(null) }} style={{ opacity: 0.7 }}>
                  Cancel
                </button>
              </div>
              {sendResult && (
                <p className="event-email-result">
                  Sent to {sendResult.sent} of {sendResult.total}
                  {sendResult.failed > 0 && `, ${sendResult.failed} failed`}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      {showAddForm ? (
        <form className="event-add-form" onSubmit={handleAddEvent}>
          <h4 style={{ marginBottom: '0.75rem' }}>Add Event</h4>
          <input
            className="admin-input"
            type="text"
            placeholder="Event name"
            value={newEvent.name}
            onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
            required
          />
          <input
            className="admin-input"
            type="text"
            placeholder="Date (e.g. June 17th, 2026)"
            value={newEvent.date}
            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
            required
          />
          <input
            className="admin-input"
            type="text"
            placeholder="Location (e.g. Toronto)"
            value={newEvent.location}
            onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
          />
          <input
            className="admin-input"
            type="text"
            placeholder="Subscriber tag (e.g. event-june17)"
            value={newEvent.tag}
            onChange={e => setNewEvent({ ...newEvent, tag: e.target.value })}
            required
          />
          <div className="event-email-actions">
            <button className="admin-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Add Event'}
            </button>
            <button className="admin-btn" type="button" onClick={() => setShowAddForm(false)} style={{ opacity: 0.7 }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="admin-btn" onClick={() => setShowAddForm(true)} style={{ marginTop: '1rem' }}>
          + Add Event
        </button>
      )}
    </div>
  )
}
