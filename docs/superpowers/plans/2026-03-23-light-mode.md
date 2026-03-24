# Light Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a light/dark/auto theme toggle to the site, with a warm off-white light mode palette.

**Architecture:** CSS custom properties already power all colors. We add a `[data-theme="light"]` override block in `index.css`, a `useTheme` hook to manage state/localStorage/media-query-listener, and a toggle link in the header. Auto mode defers to `prefers-color-scheme`.

**Tech Stack:** React hooks, CSS custom properties, localStorage, `matchMedia` API

---

### Task 1: Create useTheme hook

**Files:**
- Create: `src/useTheme.js`

- [ ] **Step 1: Create the hook file**

```js
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'aia-theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const CYCLE = ['auto', 'light', 'dark']

export default function useTheme() {
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto'
    } catch {
      return 'auto'
    }
  })

  const [systemTheme, setSystemTheme] = useState(getSystemTheme)

  // Listen for OS theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => setSystemTheme(mq.matches ? 'light' : 'dark')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolved = preference === 'auto' ? systemTheme : preference

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
    document.documentElement.style.colorScheme = resolved
  }, [resolved])

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // ignore
    }
  }, [preference])

  const cycle = useCallback(() => {
    setPreference(prev => {
      const i = CYCLE.indexOf(prev)
      return CYCLE[(i + 1) % CYCLE.length]
    })
  }, [])

  return { preference, resolved, cycle }
}
```

- [ ] **Step 2: Verify file was created**

Run: `ls src/useTheme.js`

---

### Task 2: Add light mode CSS variables

**Files:**
- Modify: `src/index.css:1-24` (add light theme variable overrides after `:root`, plus new variables in `:root`)

- [ ] **Step 1: Add new variables to `:root` block**

Add to the existing `:root` block before line 14 (`--grid-color`):
```css
--accent-glow: rgba(0, 255, 136, 0.2);
--shadow-color: rgba(0, 0, 0, 0.6);
```

- [ ] **Step 2: Add light theme variables after the `:root` block**

After the existing `:root { ... }` block (line 24), add:

```css
[data-theme="light"] {
  --black: #f5f2eb;
  --dark-gray: #ede9e1;
  --medium-gray: #e2ddd4;
  --light-gray: #d4cfc6;
  --text-primary: #2a2520;
  --text-secondary: #6b6560;
  --accent: #00995c;
  --accent-dim: #007a48;
  --grid-color: rgba(0, 0, 0, 0.04);
  --accent-glow: rgba(0, 153, 92, 0.15);
  --shadow-color: rgba(0, 0, 0, 0.15);
}
```

Note: `color-scheme` is handled by the JS hook, not CSS, to avoid duplication.

- [ ] **Step 3: Verify the CSS is valid**

Run: `pnpm run build`

---

### Task 3: Fix hardcoded colors in CSS files

**Files:**
- Modify: `src/App.css:14` (header gradient uses hardcoded `#000000`)
- Modify: `src/App.css:106,374,675` (box-shadow uses hardcoded `rgba(0, 255, 136, ...)`)
- Modify: `src/App.css:296` (footer gradient uses `transparent` which is fine)
- Modify: `src/MusicPlayer.css:101` (dropdown shadow uses hardcoded `rgba(0, 0, 0, 0.6)`)

- [ ] **Step 1: Fix header gradient in App.css**

Change line 14 from:
```css
background: linear-gradient(180deg, var(--dark-gray) 0%, #000000 100%);
```
to:
```css
background: linear-gradient(180deg, var(--dark-gray) 0%, var(--black) 100%);
```

- [ ] **Step 2: Replace hardcoded accent glow in App.css**

Replace all three `rgba(0, 255, 136, ...)` occurrences in App.css with `var(--accent-glow)`.
(The 0.15 on line 675 is intentionally normalized to match the 0.2 value for simplicity.)

- [ ] **Step 3: Fix dropdown shadow in MusicPlayer.css**

Change MusicPlayer.css line 101 from:
```css
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
```
to:
```css
box-shadow: 0 4px 20px var(--shadow-color);
```

- [ ] **Step 4: Verify build**

Run: `pnpm run build`

---

### Task 4: Add theme toggle to header

**Files:**
- Modify: `src/pages/Home.jsx:1-35` (import hook, add toggle link)
- Modify: `src/App.css` (add toggle styling including mobile)

- [ ] **Step 1: Import and use the theme hook in Home.jsx**

Add to imports:
```js
import useTheme from '../useTheme'
```

Inside the `Home` component, add:
```js
const theme = useTheme()
```

- [ ] **Step 2: Add the toggle button in the header**

In the `header-content` div, after `<HeaderPlayer player={player} />`, add:

```jsx
<button className="theme-toggle" onClick={theme.cycle}>
  {theme.preference}
</button>
```

- [ ] **Step 3: Add toggle styles to App.css**

Add after the `.logo-version` rule (around line 47):

```css
.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  padding: 0.2rem 0;
  transition: color 0.2s ease;
  flex-shrink: 0;
  text-transform: lowercase;
}

.theme-toggle:hover {
  color: var(--accent);
}
```

- [ ] **Step 4: Add mobile layout for toggle**

In the `@media (max-width: 768px)` block in App.css, add the toggle next to the logo:

```css
.header-content .theme-toggle {
  margin-left: auto;
  order: -1;
}
```

And update the mobile `.header-content .logo` rule to not take full width when the toggle is present. Place the toggle after the logo-version span by adjusting the logo to use `display: flex` with the toggle sitting beside it on mobile.

Simpler approach: On mobile, place the toggle in the logo row by making the logo a flex container that doesn't take full width, and letting the toggle sit to its right:

```css
.header-content .theme-toggle {
  margin-left: auto;
}
```

This works because the logo already has `display: flex` on mobile with `width: 100%`, and `.logo-version` has `margin-left: auto`. Move the toggle outside the logo div but in the same flex row.

- [ ] **Step 5: Verify build and test in browser**

Run: `pnpm run build`

---

### Task 5: Handle admin page hardcoded colors

**Files:**
- Modify: `src/admin/admin.css` (fix `#166534` and `#4ade80` for light mode)

- [ ] **Step 1: Fix approve button contrast in light mode**

The `.btn-approve` uses `background-color: #166534` which has poor contrast against the light background. Add a light-mode override. The simplest approach: add these as CSS variables.

In `src/index.css` `:root`, add:
```css
--success-bg: #166534;
--success-color: #4ade80;
```

In `[data-theme="light"]`, add:
```css
--success-bg: #dcfce7;
--success-color: #166534;
```

Then in `admin.css`, replace the hardcoded values in `.btn-approve`:
```css
.btn-approve {
  background-color: var(--success-bg);
  border: 1px solid var(--success-color);
  color: var(--success-color);
  ...
}
```

- [ ] **Step 2: Verify admin page in light mode**

Run: `pnpm run dev` and check `/admin` in light mode.

---

### Task 6: Final build and commit

- [ ] **Step 1: Run final build**

Run: `pnpm run build`

- [ ] **Step 2: Test in browser**

Run `pnpm run dev` and verify:
- Default (auto) follows OS preference
- Clicking toggle cycles: auto -> light -> dark -> auto
- Light mode has warm off-white palette
- All text is readable in both modes
- Header, player, cards, forms all adapt
- Preference persists on reload
- Admin page buttons have proper contrast in light mode

- [ ] **Step 3: Commit**

```bash
git add src/useTheme.js src/index.css src/App.css src/MusicPlayer.css src/pages/Home.jsx src/admin/admin.css
git commit -m "Add light/dark/auto theme toggle with warm off-white light mode"
```
