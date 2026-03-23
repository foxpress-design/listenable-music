import { useState } from 'react'
import SubscriberList from './SubscriberList'
import Analytics from './Analytics.jsx'
import EmailComposer from './EmailComposer'
import SubmissionReview from './SubmissionReview'

const TABS = ['Subscribers', 'Email', 'Submissions', 'Analytics']

export default function AdminLayout({ auth, onLogout }) {
  const [activeTab, setActiveTab] = useState('Subscribers')

  function renderContent() {
    if (activeTab === 'Subscribers') {
      return <SubscriberList token={auth.token} />
    }
    if (activeTab === 'Analytics') {
      return <Analytics token={auth.token} />
    }
    if (activeTab === 'Email') {
      return <EmailComposer token={auth.token} />
    }
    if (activeTab === 'Submissions') {
      return <SubmissionReview token={auth.token} />
    }
    return <p className="admin-placeholder">This section will be implemented next.</p>
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <a href="/" className="admin-logo">Listenable Music</a>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="admin-header-right">
          <span className="admin-email">{auth.email}</span>
          <button onClick={onLogout} className="admin-logout">Logout</button>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        <h2 className="admin-section-title">{activeTab}</h2>
        {renderContent()}
      </main>
    </div>
  )
}
