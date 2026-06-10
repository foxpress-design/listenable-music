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

  // Per-event selected subscriber IDs: { [tag]: Set<id> }
  const [selectedSubs, setSelectedSubs] = useState({})

  function toggleSub(tag, id) {
    setSelectedSubs(prev => {
      const set = new Set(prev[tag] || [])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, [tag]: set }
    })
  }

  function toggleAll(tag, subscribers) {
    setSelectedSubs(prev => {
      const set = prev[tag] || new Set()
      const allSelected = subscribers.every(s => set.has(s.id))
      return { ...prev, [tag]: allSelected ? new Set() : new Set(subscribers.map(s => s.id)) }
    })
  }

  async function handleRemoveSub(tag, id, email) {
    if (!window.confirm(`Remove ${email} from this event list?`)) return
    try {
      const res = await fetch(`/api/admin/events/subscriber?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSelectedSubs(prev => {
          const set = new Set(prev[tag] || [])
          set.delete(id)
          return { ...prev, [tag]: set }
        })
        loadEvents()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(`Remove failed: ${data.error || res.status}`)
      }
    } catch (err) {
      alert(`Remove failed: ${err.message}`)
    }
  }

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

    const selected = selectedSubs[emailTarget.tag] || new Set()
    const allSubs = emailTarget.subscribers || []
    let emailsFilter = null

    if (selected.size > 0) {
      emailsFilter = allSubs.filter(s => selected.has(s.id)).map(s => s.email)
      const confirmed = window.confirm(
        `Send to ${emailsFilter.length} selected subscriber${emailsFilter.length === 1 ? '' : 's'}?`
      )
      if (!confirmed) return
    } else {
      const confirmed = window.confirm(
        `Email all ${emailTarget.subscriber_count} recipient${emailTarget.subscriber_count === 1 ? '' : 's'}?`
      )
      if (!confirmed) return
    }

    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/events/email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag: emailTarget.tag,
          subject: emailSubject,
          body: emailBody,
          ...(emailsFilter ? { emails: emailsFilter } : {}),
        }),
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
                  <th style={{ width: '2rem' }}>
                    <input
                      type="checkbox"
                      title="Select all"
                      checked={evt.subscribers.length > 0 && evt.subscribers.every(s => selectedSubs[evt.tag]?.has(s.id))}
                      onChange={() => toggleAll(evt.tag, evt.subscribers)}
                    />
                  </th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Signed Up</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {evt.subscribers.map(s => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSubs[evt.tag]?.has(s.id) || false}
                        onChange={() => toggleSub(evt.tag, s.id)}
                      />
                    </td>
                    <td>{s.email}</td>
                    <td>{s.name || '-'}</td>
                    <td>{new Date(s.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        title="Remove from event"
                        onClick={() => handleRemoveSub(evt.tag, s.id, s.email)}
                      >
                        Remove
                      </button>
                    </td>
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
              {(() => {
                const selCount = selectedSubs[evt.tag]?.size || 0
                if (selCount > 0) return `Email ${selCount} selected`
                return `Email ${evt.subscriber_count} attendee${evt.subscriber_count === 1 ? '' : 's'}`
              })()}
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
