# Listenable Music Platform Expansion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand listenablemusic.ca from a static tribute site into a community platform with email subscriptions, admin dashboard, community submissions, and Bandcamp integration.

**Architecture:** Migrate hosting from GitHub Pages to Cloudflare Pages with Functions (Workers) for the API layer. Use Cloudflare D1 (SQLite) for structured data, R2 for file uploads, and Resend for transactional email. Add react-router for client-side routing (/admin). Bandcamp collection data fetched and cached by a Worker.

**Tech Stack:** React + Vite, Cloudflare Pages/Functions/D1/R2, Resend API, react-router-dom

---

## Prerequisites (manual, not automated)

Before starting implementation, the following must be set up by the user:

1. **Resend account** - Create at resend.com, verify domain listenablemusic.ca, get API key
2. **Domain transfer** - Transfer listenablemusic.ca from Namecheap to Cloudflare (can run in parallel with development, takes up to 5 days)
3. **Cloudflare Pages project** - Create in dashboard under Foxpress Design account
4. **Cloudflare D1 database** - Create via `wrangler d1 create listenable-db`
5. **Cloudflare R2 bucket** - Create via `wrangler r2 create listenable-uploads`
6. **Secrets** - Set RESEND_API_KEY and ADMIN_EMAIL as Worker secrets

---

## Security Notes

These apply across all phases:

- **Rate limiting:** All public POST endpoints (`/api/subscribe`, `/api/auth/login`, `/api/submissions/upload`) must include rate limiting. Use Cloudflare's built-in rate limiting rules (configured in dashboard) or implement IP-based counters in D1.
- **CSRF protection:** Add `X-Requested-With` header validation in the API middleware for state-changing requests.
- **Unsubscribe compliance:** Every email sent must include a working unsubscribe link (CASL/.ca domain requirement). The `unsubscribe_tokens` table and `/api/unsubscribe` endpoint handle this.
- **File upload validation:** Server-side MIME type and file size checks on all uploads. R2 keys use timestamps to prevent overwrites.
- **Admin sessions:** Magic link tokens are single-use (`type = 'magic_link'`). Long-lived session tokens (`type = 'session'`) are separate. Admin middleware only accepts session tokens.

---

## Phase 1: Infrastructure Migration

### Overview

Move from GitHub Pages to Cloudflare Pages. Set up D1 database, R2 bucket, and the Pages Functions API layer. This phase produces a working site on Cloudflare with the same functionality as today, plus the backend infrastructure for all subsequent phases.

### File Structure

```
/
├── functions/                    # Cloudflare Pages Functions (API routes)
│   ├── api/
│   │   ├── _middleware.js        # CORS + auth middleware
│   │   ├── counts.js             # GET /api/counts (migrate from old worker)
│   │   ├── play.js               # POST /api/play (migrate from old worker)
│   │   ├── subscribe.js          # POST /api/subscribe
│   │   ├── auth/
│   │   │   ├── login.js          # POST /api/auth/login (send magic link)
│   │   │   └── verify.js         # GET /api/auth/verify (verify magic link token)
│   │   ├── admin/
│   │   │   ├── _middleware.js    # Auth guard for admin routes
│   │   │   ├── subscribers.js    # GET /api/admin/subscribers
│   │   │   ├── submissions.js    # GET/PATCH /api/admin/submissions
│   │   │   ├── analytics.js      # GET /api/admin/analytics
│   │   │   └── send-email.js     # POST /api/admin/send-email
│   │   ├── unsubscribe.js        # GET /api/unsubscribe
│   │   ├── submissions/
│   │   │   ├── upload.js         # POST /api/submissions/upload
│   │   │   └── approved.js       # GET /api/submissions/approved (public)
│   │   └── bandcamp/
│   │       └── collection.js     # GET /api/bandcamp/collection
│   └── [[path]].js              # SPA catch-all for client-side routing
├── migrations/                   # D1 schema migrations
│   └── 0001_initial.sql
├── src/
│   ├── App.jsx                   # Add router
│   ├── pages/
│   │   ├── Home.jsx              # Current single-page content (extracted from App.jsx)
│   │   └── Admin.jsx             # Admin dashboard shell
│   ├── admin/
│   │   ├── AdminLogin.jsx        # Magic link login form
│   │   ├── AdminLayout.jsx       # Admin layout with nav
│   │   ├── SubscriberList.jsx    # Subscriber management
│   │   ├── EmailComposer.jsx     # Compose and send emails
│   │   ├── SubmissionReview.jsx  # Moderate community submissions
│   │   └── Analytics.jsx         # Site analytics dashboard
│   ├── components/
│   │   ├── SubscribeForm.jsx     # Email subscribe widget
│   │   ├── SubmissionForm.jsx    # Photo/music upload form
│   │   └── BandcampPlayer.jsx    # Bandcamp collection player
│   └── ...existing files
├── wrangler.toml                 # NEW: top-level config for Pages
└── worker/                       # OLD: can be retired after migration
```

---

### Task 1: Create D1 Schema

**Files:**
- Create: `migrations/0001_initial.sql`

- [ ] **Step 1: Write the initial migration**

```sql
-- Subscribers
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT,
  source TEXT DEFAULT 'website'
);

CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Admin sessions (magic link auth)
CREATE TABLE admin_sessions (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'magic_link' CHECK(type IN ('magic_link', 'session')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0
);

-- Unsubscribe tokens
CREATE TABLE unsubscribe_tokens (
  token TEXT PRIMARY KEY,
  subscriber_id INTEGER NOT NULL REFERENCES subscribers(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Community submissions
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('photo', 'music')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  caption TEXT,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT
);

CREATE INDEX idx_submissions_status ON submissions(status);

-- Play counts (migrate from KV to D1 for unified data)
CREATE TABLE play_counts (
  track_src TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  last_played TEXT
);

-- Page views / analytics events
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Sent emails log
CREATE TABLE sent_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  body_preview TEXT,
  recipient_count INTEGER NOT NULL,
  sent_by TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bandcamp cache
CREATE TABLE bandcamp_cache (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

- [ ] **Step 2: Commit**

```bash
git add migrations/0001_initial.sql
git commit -m "feat: add D1 database schema for subscribers, submissions, analytics"
```

---

### Task 2: Configure Cloudflare Pages with D1 and R2

**Files:**
- Create: `wrangler.toml` (top-level, for Pages)
- Modify: `vite.config.js` (no changes needed unless build output changes)

- [ ] **Step 1: Create wrangler.toml for Cloudflare Pages**

```toml
name = "listenable-music"
compatibility_date = "2024-12-01"
pages_build_output_dir = "dist"
account_id = "da6ad62318a510735da0c69c5c5a9a30"

[[d1_databases]]
binding = "DB"
database_name = "listenable-db"
database_id = "" # Fill after running: wrangler d1 create listenable-db

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "listenable-uploads"

[vars]
ADMIN_EMAIL = "philip@foxpress.design"
SITE_URL = "https://listenablemusic.ca"

# RESEND_API_KEY set via: wrangler pages secret put RESEND_API_KEY
```

- [ ] **Step 2: Create the SPA catch-all for client-side routing**

```js
// functions/[[path]].js
// Serves index.html for all non-API, non-asset routes (SPA fallback)
export async function onRequest(context) {
  const response = await context.next();
  // If no static asset found, serve index.html for client-side routing
  if (response.status === 404) {
    const url = new URL(context.request.url);
    url.pathname = '/index.html';
    return context.env.ASSETS.fetch(url);
  }
  return response;
}
```

- [ ] **Step 3: Create API middleware (CORS)**

```js
// functions/api/_middleware.js
const ALLOWED_ORIGINS = [
  'https://listenablemusic.ca',
  'https://www.listenablemusic.ca',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8788',
];

export async function onRequest(context) {
  const origin = context.request.headers.get('Origin');
  const corsHeaders = {};

  if (ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, OPTIONS';
    corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const response = await context.next();
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
  return newResponse;
}
```

- [ ] **Step 4: Migrate play count endpoints to Pages Functions**

```js
// functions/api/play.js
export async function onRequestPost(context) {
  const { track } = await context.request.json();
  if (!track) {
    return Response.json({ error: 'Missing track' }, { status: 400 });
  }

  const db = context.env.DB;
  await db.prepare(
    `INSERT INTO play_counts (track_src, count, last_played)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(track_src) DO UPDATE SET
       count = count + 1,
       last_played = datetime('now')`
  ).bind(track).run();

  const row = await db.prepare('SELECT count FROM play_counts WHERE track_src = ?').bind(track).first();
  return Response.json({ track, count: row?.count || 1 });
}
```

```js
// functions/api/counts.js
export async function onRequestGet(context) {
  const db = context.env.DB;
  const { results } = await db.prepare('SELECT track_src, count FROM play_counts').all();
  const counts = {};
  for (const row of results) {
    counts[row.track_src] = row.count;
  }
  return Response.json(counts);
}
```

- [ ] **Step 5: Update usePlayCounts.js to use new API path**

Change the API base URL from `https://play-counter.foxpress.workers.dev` to `/api` (same-origin, no CORS needed in production).

- [ ] **Step 6: Run D1 migration and deploy**

```bash
wrangler d1 create listenable-db          # note the database_id
wrangler r2 create listenable-uploads
# Update wrangler.toml with database_id
wrangler d1 execute listenable-db --file=migrations/0001_initial.sql
wrangler pages deploy dist
```

- [ ] **Step 7: Migrate existing play count data from KV to D1**

Create a one-off Worker script to read KV and write to D1:

```js
// scripts/migrate-kv-to-d1.js (deploy as temporary worker with both KV and D1 bindings)
export default {
  async fetch(request, env) {
    const list = await env.PLAY_COUNTS.list();
    let migrated = 0;
    for (const key of list.keys) {
      const count = parseInt(await env.PLAY_COUNTS.get(key.name) || '0', 10);
      await env.DB.prepare(
        'INSERT OR REPLACE INTO play_counts (track_src, count) VALUES (?, ?)'
      ).bind(key.name, count).run();
      migrated++;
    }
    return new Response(`Migrated ${migrated} play count records from KV to D1`);
  }
};
```

Run via: `wrangler dev scripts/migrate-kv-to-d1.js --d1 DB=listenable-db --kv PLAY_COUNTS=<kv-id>`
Then hit localhost to trigger the migration. Verify counts match, then delete the temp script.

- [ ] **Step 8: Update GitHub Actions to deploy to Cloudflare Pages**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [claude/james-campbell-tribute-site-Gwdbs, main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm run build

      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: da6ad62318a510735da0c69c5c5a9a30
          command: pages deploy dist --project-name=listenable-music
```

Requires adding `CLOUDFLARE_API_TOKEN` as a GitHub Actions secret.

- [ ] **Step 9: Commit**

```bash
git add wrangler.toml functions/ src/usePlayCounts.js .github/workflows/deploy.yml
git commit -m "feat: migrate to Cloudflare Pages with D1 and R2"
```

---

## Phase 2: Email Subscribe + Resend

### Task 3: Subscribe Form Component

**Files:**
- Create: `src/components/SubscribeForm.jsx`
- Modify: `src/App.jsx` (add SubscribeForm to Share section)
- Modify: `src/App.css` (subscribe form styles)

- [ ] **Step 1: Create SubscribeForm component**

```jsx
// src/components/SubscribeForm.jsx
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
```

- [ ] **Step 2: Add styles**

```css
/* Add to App.css */
.subscribe-form {
  margin-top: 1.5rem;
}

.subscribe-row {
  display: flex;
  gap: 0;
  max-width: 420px;
}

.subscribe-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--medium-gray);
  border: 1px solid var(--light-gray);
  border-right: none;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  outline: none;
}

.subscribe-input:focus {
  border-color: var(--accent);
}

.subscribe-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.subscribe-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent);
  border: 1px solid var(--accent);
  color: var(--black);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
  white-space: nowrap;
}

.subscribe-btn:hover {
  opacity: 0.85;
}

.subscribe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.subscribe-msg {
  margin-top: 0.5rem;
  font-size: 0.75rem;
}

.subscribe-success {
  color: var(--accent);
}

.subscribe-error {
  color: #ff4444;
}
```

- [ ] **Step 3: Add SubscribeForm to the Share section in App.jsx**

Place it below the share buttons paragraph, above the link buttons.

- [ ] **Step 4: Commit**

```bash
git add src/components/SubscribeForm.jsx src/App.jsx src/App.css
git commit -m "feat: add email subscribe form component"
```

---

### Task 4: Subscribe API Endpoint

**Files:**
- Create: `functions/api/subscribe.js`

- [ ] **Step 1: Write the subscribe endpoint**

```js
// functions/api/subscribe.js
export async function onRequestPost(context) {
  const { email } = await context.request.json();

  if (!email || !/^.+@.+\..+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  const db = context.env.DB;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await db.prepare(
    'SELECT id, unsubscribed_at FROM subscribers WHERE email = ?'
  ).bind(normalizedEmail).first();

  let subscriberId;

  if (existing && !existing.unsubscribed_at) {
    return Response.json({ message: 'You are already subscribed.' });
  }

  if (existing && existing.unsubscribed_at) {
    // Re-subscribe
    await db.prepare(
      "UPDATE subscribers SET unsubscribed_at = NULL, subscribed_at = datetime('now') WHERE id = ?"
    ).bind(existing.id).run();
    subscriberId = existing.id;
  } else {
    const result = await db.prepare(
      'INSERT INTO subscribers (email) VALUES (?)'
    ).bind(normalizedEmail).run();
    subscriberId = result.meta.last_row_id;
  }

  // Generate unsubscribe token
  const unsubToken = crypto.randomUUID();
  await db.prepare(
    'INSERT INTO unsubscribe_tokens (token, subscriber_id) VALUES (?, ?)'
  ).bind(unsubToken, subscriberId).run();

  const unsubUrl = `${context.env.SITE_URL}/api/unsubscribe?token=${unsubToken}`;

  // Send welcome email via Resend
  const resendKey = context.env.RESEND_API_KEY;
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Listenable Music <hello@listenablemusic.ca>',
        to: normalizedEmail,
        subject: 'Welcome to Listenable Music',
        html: `<p>Thank you for subscribing to Listenable Music, a tribute to James Campbell (AIA).</p>
               <p>We will notify you when new content, photos, or music is shared.</p>
               <p style="color: #999; font-size: 12px;">
                 <a href="${unsubUrl}">Unsubscribe</a>
               </p>`,
      }),
    });
  }

  return Response.json({ message: 'Subscribed. Thank you.' });
}
```

Also create the unsubscribe endpoint:

```js
// functions/api/unsubscribe.js
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Invalid unsubscribe link.', { status: 400 });
  }

  const db = context.env.DB;
  const record = await db.prepare(
    'SELECT subscriber_id FROM unsubscribe_tokens WHERE token = ?'
  ).bind(token).first();

  if (!record) {
    return new Response('Invalid or expired unsubscribe link.', { status: 400 });
  }

  await db.prepare(
    "UPDATE subscribers SET unsubscribed_at = datetime('now') WHERE id = ?"
  ).bind(record.subscriber_id).run();

  return new Response(
    '<html><body style="background:#0a0a0a;color:#e0e0e0;font-family:monospace;padding:2rem;text-align:center"><h2>Unsubscribed</h2><p>You have been removed from the mailing list.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add functions/api/subscribe.js
git commit -m "feat: add subscribe API endpoint with Resend welcome email"
```

---

## Phase 3: Admin Dashboard

### Task 5: Add Client-Side Routing

**Files:**
- Modify: `package.json` (add react-router-dom)
- Modify: `src/App.jsx` (add Router)
- Create: `src/pages/Home.jsx` (extract current page content)

- [ ] **Step 1: Install react-router-dom**

```bash
pnpm add react-router-dom
```

- [ ] **Step 2: Extract current App.jsx content into Home.jsx**

Move everything inside `<div className="app">` (header through footer) into a new `Home` component. App.jsx becomes the router shell.

```jsx
// src/pages/Home.jsx
// Contains: header, hero, sequencer, main sections, footer
// Receives player and counts as props (or via context)
```

- [ ] **Step 3: Update App.jsx with router**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/App.jsx src/pages/Home.jsx
git commit -m "feat: add react-router, extract Home page component"
```

---

### Task 6: Admin Auth (Magic Link)

**Files:**
- Create: `functions/api/auth/login.js`
- Create: `functions/api/auth/verify.js`
- Create: `functions/api/admin/_middleware.js`
- Create: `src/admin/AdminLogin.jsx`

- [ ] **Step 1: Write magic link login endpoint**

```js
// functions/api/auth/login.js
export async function onRequestPost(context) {
  const { email } = await context.request.json();
  const adminEmail = context.env.ADMIN_EMAIL;

  if (email?.toLowerCase() !== adminEmail?.toLowerCase()) {
    // Don't reveal whether the email is valid
    return Response.json({ message: 'If that email is registered, a login link has been sent.' });
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  const db = context.env.DB;
  await db.prepare(
    'INSERT INTO admin_sessions (token, email, expires_at) VALUES (?, ?, ?)'
  ).bind(token, email.toLowerCase(), expires).run();

  const loginUrl = `${context.env.SITE_URL}/admin?token=${token}`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Listenable Music <admin@listenablemusic.ca>',
      to: email,
      subject: 'Admin Login - Listenable Music',
      html: `<p>Click to log in:</p>
             <p><a href="${loginUrl}">${loginUrl}</a></p>
             <p style="color:#999;font-size:12px;">This link expires in 15 minutes.</p>`,
    }),
  });

  return Response.json({ message: 'If that email is registered, a login link has been sent.' });
}
```

- [ ] **Step 2: Write token verification endpoint**

```js
// functions/api/auth/verify.js
export async function onRequestPost(context) {
  const { token } = await context.request.json();
  const db = context.env.DB;

  const session = await db.prepare(
    'SELECT * FROM admin_sessions WHERE token = ? AND used = 0 AND expires_at > datetime(\'now\')'
  ).bind(token).first();

  if (!session) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Mark token as used
  await db.prepare('UPDATE admin_sessions SET used = 1 WHERE token = ?').bind(token).run();

  // Create a long-lived session token (7 days)
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.prepare(
    "INSERT INTO admin_sessions (token, email, type, expires_at) VALUES (?, ?, 'session', ?)"
  ).bind(sessionToken, session.email, expires).run();

  return Response.json({ token: sessionToken, email: session.email });
}
```

- [ ] **Step 3: Write admin auth middleware**

```js
// functions/api/admin/_middleware.js
export async function onRequest(context) {
  const auth = context.request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = auth.slice(7);
  const db = context.env.DB;

  // Only accept 'session' type tokens (not one-time magic link tokens)
  const session = await db.prepare(
    "SELECT email FROM admin_sessions WHERE token = ? AND type = 'session' AND expires_at > datetime('now')"
  ).bind(token).first();

  if (!session || session.email !== context.env.ADMIN_EMAIL?.toLowerCase()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  context.data.adminEmail = session.email;
  return context.next();
}
```

- [ ] **Step 4: Write AdminLogin component**

```jsx
// src/admin/AdminLogin.jsx
import { useState } from 'react'

export default function AdminLogin({ onAuth }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (res.ok) setSent(true)
    else setError(data.error)
  }

  if (sent) {
    return (
      <div className="admin-login">
        <p>Check your email for a login link.</p>
      </div>
    )
  }

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin email"
          required
        />
        <button type="submit">Send Login Link</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add functions/api/auth/ functions/api/admin/_middleware.js src/admin/AdminLogin.jsx
git commit -m "feat: add magic link auth for admin dashboard"
```

---

### Task 7: Admin Dashboard Shell

**Files:**
- Create: `src/pages/Admin.jsx`
- Create: `src/admin/AdminLayout.jsx`
- Create: `src/admin/admin.css`

- [ ] **Step 1: Write Admin page (handles auth state + token from URL)**

```jsx
// src/pages/Admin.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin from '../admin/AdminLogin'
import AdminLayout from '../admin/AdminLayout'

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('admin_token')
    return stored ? JSON.parse(stored) : null
  })
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    setVerifying(true)
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          const authData = { token: data.token, email: data.email }
          localStorage.setItem('admin_token', JSON.stringify(authData))
          setAuth(authData)
          setSearchParams({}) // clear token from URL
        }
      })
      .finally(() => setVerifying(false))
  }, [searchParams, setSearchParams])

  if (verifying) return <div className="admin-loading">Verifying...</div>
  if (!auth) return <AdminLogin onAuth={setAuth} />

  return <AdminLayout auth={auth} onLogout={() => {
    localStorage.removeItem('admin_token')
    setAuth(null)
  }} />
}
```

- [ ] **Step 2: Write AdminLayout with tab navigation**

Tabs: Subscribers, Email, Submissions, Analytics. Each tab renders the corresponding component. Styled consistently with the site's dark theme and accent color.

- [ ] **Step 3: Add admin CSS**

Dark theme consistent with main site. Terminal aesthetic. Monospace font. Green accent for interactive elements. Table styles for subscriber/submission lists.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Admin.jsx src/admin/AdminLayout.jsx src/admin/admin.css
git commit -m "feat: add admin dashboard shell with auth and tab navigation"
```

---

### Task 8: Admin Subscriber Management

**Files:**
- Create: `src/admin/SubscriberList.jsx`
- Create: `functions/api/admin/subscribers.js`

- [ ] **Step 1: Write subscribers API endpoint**

```js
// functions/api/admin/subscribers.js
export async function onRequestGet(context) {
  const db = context.env.DB;
  const { results } = await db.prepare(
    'SELECT id, email, name, subscribed_at, unsubscribed_at, source FROM subscribers ORDER BY subscribed_at DESC'
  ).all();
  return Response.json({ subscribers: results });
}
```

- [ ] **Step 2: Write SubscriberList component**

Table showing email, subscribed date, source, status. Total count at top. Export CSV button.

- [ ] **Step 3: Commit**

---

### Task 9: Admin Email Composer

**Files:**
- Create: `src/admin/EmailComposer.jsx`
- Create: `functions/api/admin/send-email.js`

- [ ] **Step 1: Write send-email API endpoint**

```js
// functions/api/admin/send-email.js
export async function onRequestPost(context) {
  const { subject, body } = await context.request.json();

  if (!subject || !body) {
    return Response.json({ error: 'Subject and body required' }, { status: 400 });
  }

  const db = context.env.DB;
  const resendKey = context.env.RESEND_API_KEY;

  // Fetch all active subscribers
  const { results: subscribers } = await db.prepare(
    'SELECT id, email FROM subscribers WHERE unsubscribed_at IS NULL'
  ).all();

  if (!subscribers.length) {
    return Response.json({ error: 'No active subscribers' }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;

  // Resend batch API accepts up to 100 recipients per call
  for (let i = 0; i < subscribers.length; i += 100) {
    const batch = subscribers.slice(i, i + 100);

    // Send individually so each gets their own unsubscribe link
    for (const sub of batch) {
      // Get or create unsubscribe token
      let unsub = await db.prepare(
        'SELECT token FROM unsubscribe_tokens WHERE subscriber_id = ?'
      ).bind(sub.id).first();

      if (!unsub) {
        const token = crypto.randomUUID();
        await db.prepare(
          'INSERT INTO unsubscribe_tokens (token, subscriber_id) VALUES (?, ?)'
        ).bind(token, sub.id).run();
        unsub = { token };
      }

      const unsubUrl = `${context.env.SITE_URL}/api/unsubscribe?token=${unsub.token}`;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Listenable Music <hello@listenablemusic.ca>',
            to: sub.email,
            subject,
            html: `${body.replace(/\n/g, '<br>')}<hr style="border:none;border-top:1px solid #333;margin:2rem 0"><p style="color:#999;font-size:12px"><a href="${unsubUrl}" style="color:#999">Unsubscribe</a></p>`,
          }),
        });
        if (res.ok) sent++;
        else failed++;
      } catch {
        failed++;
      }
    }
  }

  // Log the send
  await db.prepare(
    'INSERT INTO sent_emails (subject, body_preview, recipient_count, sent_by) VALUES (?, ?, ?, ?)'
  ).bind(subject, body.slice(0, 200), sent, context.data.adminEmail).run();

  return Response.json({ sent, failed, total: subscribers.length });
}
```

- [ ] **Step 2: Write EmailComposer component**

Subject field, body textarea (plain text, converted to simple HTML), preview, recipient count, send button with confirmation.

- [ ] **Step 3: Commit**

---

### Task 10: Admin Analytics

**Files:**
- Create: `src/admin/Analytics.jsx`
- Create: `functions/api/admin/analytics.js`

- [ ] **Step 1: Write analytics API endpoint**

Returns: total subscribers, total plays, top tracks, recent events, plays over time (daily counts).

- [ ] **Step 2: Write Analytics component**

Stat cards (total subscribers, total plays, total submissions). Top tracks list. Simple time-series display of daily plays.

- [ ] **Step 3: Commit**

---

## Phase 4: Community Submissions

### Task 11: Submission Upload Form

**Files:**
- Create: `src/components/SubmissionForm.jsx`
- Create: `functions/api/submissions/upload.js`
- Modify: `src/App.jsx` (add new section)

- [ ] **Step 1: Write upload API endpoint**

```js
// functions/api/submissions/upload.js
export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const file = formData.get('file');
  const name = formData.get('name');
  const email = formData.get('email');
  const caption = formData.get('caption');
  const type = formData.get('type'); // 'photo' or 'music'

  if (!file || !name || !email || !type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate file type
  const allowedPhoto = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedMusic = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
  const allowed = type === 'photo' ? allowedPhoto : allowedMusic;

  if (!allowed.includes(file.type)) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 });
  }

  // Max 50MB
  if (file.size > 50 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 50MB)' }, { status: 400 });
  }

  // Upload to R2
  const key = `submissions/${type}/${Date.now()}-${file.name}`;
  await context.env.UPLOADS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  // Record in D1
  const db = context.env.DB;
  await db.prepare(
    `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(type, name, email, caption || null, key, file.name, file.size).run();

  return Response.json({ message: 'Thank you! Your submission will be reviewed.' });
}
```

- [ ] **Step 2: Write SubmissionForm component**

Two tabs: "Share a Photo" / "Share Music". Fields: name, email, file picker, optional caption. Progress indicator during upload. Success/error messages.

- [ ] **Step 3: Add "Community" section to the main page**

Between Legacy and Connect sections. Shows approved submissions (photos in a grid, music with embed players) plus the upload form. Requires a public API endpoint:

```js
// functions/api/submissions/approved.js
export async function onRequestGet(context) {
  const db = context.env.DB;
  const { results } = await db.prepare(
    "SELECT id, type, name, caption, file_key, file_name, submitted_at FROM submissions WHERE status = 'approved' ORDER BY submitted_at DESC"
  ).all();

  // Generate signed R2 URLs for each file (or serve through a proxy endpoint)
  const items = results.map(r => ({
    ...r,
    url: `/api/submissions/file/${r.file_key}`,
  }));

  return Response.json({ submissions: items });
}
```

- [ ] **Step 4: Commit**

---

### Task 12: Admin Submission Review

**Files:**
- Create: `src/admin/SubmissionReview.jsx`
- Create: `functions/api/admin/submissions.js`

- [ ] **Step 1: Write submissions API endpoint**

GET returns all submissions (filterable by status). PATCH updates status (approve/reject).

```js
// functions/api/admin/submissions.js
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const status = url.searchParams.get('status') || 'pending';
  const db = context.env.DB;
  const { results } = await db.prepare(
    'SELECT * FROM submissions WHERE status = ? ORDER BY submitted_at DESC'
  ).bind(status).all();
  return Response.json({ submissions: results });
}

export async function onRequestPatch(context) {
  const { id, status } = await context.request.json();
  if (!['approved', 'rejected'].includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }
  const db = context.env.DB;
  await db.prepare(
    'UPDATE submissions SET status = ?, reviewed_at = datetime(\'now\') WHERE id = ?'
  ).bind(status, id).run();
  return Response.json({ success: true });
}
```

- [ ] **Step 2: Write SubmissionReview component**

List of pending submissions with preview (image thumbnail or audio player). Approve/Reject buttons. Filter tabs: Pending / Approved / Rejected.

- [ ] **Step 3: Commit**

---

## Phase 5: Bandcamp Integration

### Task 13: Bandcamp Collection Scraper

**Files:**
- Create: `functions/api/bandcamp/collection.js`

- [ ] **Step 1: Write Bandcamp collection endpoint**

The endpoint uses Bandcamp's internal fan collection API (more stable than HTML scraping).
Falls back to a curated JSON file if the API is unavailable.

```js
// functions/api/bandcamp/collection.js
export async function onRequestGet(context) {
  const db = context.env.DB;

  // Check cache (refresh every 24 hours)
  const cached = await db.prepare(
    "SELECT data FROM bandcamp_cache WHERE key = 'collection' AND fetched_at > datetime('now', '-24 hours')"
  ).first();

  if (cached) {
    return Response.json(JSON.parse(cached.data));
  }

  try {
    // Use Bandcamp's internal fan collection API
    // First, fetch the fan page to get the fan_id
    const pageRes = await fetch('https://bandcamp.com/jamesambient', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    });
    const html = await pageRes.text();

    // Extract fan_id from the page data
    const fanIdMatch = html.match(/"fan_id"\s*:\s*(\d+)/);
    if (!fanIdMatch) throw new Error('Could not find fan_id');

    const fanId = fanIdMatch[1];

    // Use the internal collection API
    const apiRes = await fetch('https://bandcamp.com/api/fancollection/1/collection_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        fan_id: parseInt(fanId),
        older_than_token: `${Date.now()}::a::`,
        count: 50,
      }),
    });

    if (!apiRes.ok) throw new Error(`API returned ${apiRes.status}`);

    const apiData = await apiRes.json();
    const items = (apiData.items || []).map(item => ({
      title: item.album_title || item.item_title,
      artist: item.band_name,
      url: item.item_url,
      artUrl: item.item_art ? `https://f4.bcbits.com/img/a${item.item_art}_16.jpg` : null,
      albumId: item.album_id,
      trackId: item.tralbum_id,
      type: item.tralbum_type === 'a' ? 'a' : 't',
    }));

    const data = { items, fetchedAt: new Date().toISOString() };

    // Cache result
    await db.prepare(
      "INSERT OR REPLACE INTO bandcamp_cache (key, data, fetched_at) VALUES ('collection', ?, datetime('now'))"
    ).bind(JSON.stringify(data)).run();

    return Response.json(data);
  } catch (err) {
    console.error('Bandcamp fetch failed:', err);

    // Fallback: return stale cache if available
    const stale = await db.prepare(
      "SELECT data FROM bandcamp_cache WHERE key = 'collection'"
    ).first();

    if (stale) {
      const data = JSON.parse(stale.data);
      data.stale = true;
      return Response.json(data);
    }

    // Final fallback: return link to Bandcamp profile
    return Response.json({
      items: [],
      fallbackUrl: 'https://bandcamp.com/jamesambient',
      error: 'Could not fetch collection',
    });
  }
}
```

- [ ] **Step 2: Commit**

---

### Task 14: Bandcamp Player Component

**Files:**
- Create: `src/components/BandcampPlayer.jsx`
- Modify: `src/pages/Home.jsx` (add Bandcamp section)
- Modify: `src/App.css` (Bandcamp section styles)

- [ ] **Step 1: Write BandcampPlayer component**

```jsx
// src/components/BandcampPlayer.jsx
import { useState, useEffect } from 'react'

export default function BandcampPlayer() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEmbed, setActiveEmbed] = useState(null)

  useEffect(() => {
    fetch('/api/bandcamp/collection')
      .then(r => r.json())
      .then(data => {
        setItems(data.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="bc-loading">Loading collection...</div>
  if (!items.length) return null

  return (
    <div className="bc-player">
      <div className="bc-grid">
        {items.map((item, i) => (
          <button
            key={i}
            className={`bc-item ${activeEmbed === i ? 'active' : ''}`}
            onClick={() => setActiveEmbed(activeEmbed === i ? null : i)}
          >
            {item.artUrl && (
              <img src={item.artUrl} alt={item.title} className="bc-art" loading="lazy" />
            )}
            <div className="bc-info">
              <span className="bc-title">{item.title}</span>
              <span className="bc-artist">{item.artist}</span>
            </div>
          </button>
        ))}
      </div>

      {activeEmbed !== null && items[activeEmbed] && (
        <div className="bc-embed">
          <iframe
            src={`https://bandcamp.com/EmbeddedPlayer/${
              items[activeEmbed].type === 'a' ? 'album' : 'track'
            }=${items[activeEmbed].albumId || items[activeEmbed].trackId}/size=large/bgcol=0a0a0a/linkcol=00ff88/tracklist=true/transparent=true/`}
            seamless
            title={items[activeEmbed].title}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add "James's Collection" section to Home page**

New section between Music and Legacy. Shows the Bandcamp grid. Intro text about James's favourite music and influences.

- [ ] **Step 3: Style the Bandcamp section**

Album art grid (responsive, 3-4 columns desktop, 2 columns mobile). Embed player area below grid. Dark theme matching site.

- [ ] **Step 4: Commit**

```bash
git add src/components/BandcampPlayer.jsx src/pages/Home.jsx src/App.css functions/api/bandcamp/
git commit -m "feat: add Bandcamp collection player with cached scraper"
```

---

## Phase 6: Domain Transfer (Ops Task)

This is a manual/CLI process, not code:

- [ ] **Step 1: Unlock domain at Namecheap**

Via Namecheap dashboard or API: disable domain lock, get auth/EPP code.

- [ ] **Step 2: Initiate transfer in Cloudflare**

Cloudflare dashboard > Domain Registration > Transfer. Enter domain and auth code. Cloudflare will handle DNS automatically.

- [ ] **Step 3: Approve transfer**

Namecheap will send confirmation email. Approve the transfer. Takes 1-5 days.

- [ ] **Step 4: Configure DNS for Cloudflare Pages**

Once transfer completes, add CNAME record pointing listenablemusic.ca to the Cloudflare Pages project. Add Resend DNS records (SPF, DKIM) for email sending.

- [ ] **Step 5: Update GitHub Actions**

Remove GitHub Pages deployment. Add Cloudflare Pages deployment (or use Cloudflare's Git integration for auto-deploy).

---

## Execution Order

Phases can be partially parallelized:

1. **Phase 1** (infrastructure) must come first
2. **Phase 6** (domain transfer) can start immediately in parallel
3. **Phases 2-5** depend on Phase 1 but are independent of each other
4. **Phase 3** (admin) depends on Phase 2 (subscribe) for subscriber data to manage

Recommended sequence: **1 + 6 (parallel) -> 2 -> 3 -> 4 -> 5**

---

## Environment Variables / Secrets

| Variable | Where | Value |
|----------|-------|-------|
| `ADMIN_EMAIL` | wrangler.toml vars | `philip@foxpress.design` |
| `SITE_URL` | wrangler.toml vars | `https://listenablemusic.ca` |
| `RESEND_API_KEY` | wrangler secret | (from Resend dashboard) |
| D1 database_id | wrangler.toml | (from `wrangler d1 create`) |
