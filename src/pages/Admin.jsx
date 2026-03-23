import { useState } from 'react'

export default function Admin() {
  return (
    <div className="app" style={{ padding: '2rem' }}>
      <h1 style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
        Admin Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
        Coming soon. Magic link auth will be added next.
      </p>
      <a href="/" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
        Back to site
      </a>
    </div>
  )
}
