# 🎯 Internship Mission 2026

> Personal preparation tracker for AI/ML Engineer, Data Scientist, Backend Developer, and Software Engineer internships.

**Built by Soorya Bhat** · June 24, 2026 → Offer

---

## 🚀 Deploy in 2 Minutes

### Option 1 — GitHub Pages (recommended)

```bash
# 1. Create a new repo on GitHub named "internship-mission-2026"
# 2. Push this folder
git init
git add .
git commit -m "🎯 Initial commit — Mission 2026"
git remote add origin https://github.com/YOUR_USERNAME/internship-mission-2026.git
git push -u origin main

# 3. Go to Settings → Pages → Source: main branch → / (root) → Save
# 4. Live at: https://YOUR_USERNAME.github.io/internship-mission-2026
```

### Option 2 — Netlify Drop

1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop this entire folder
3. Live instantly with a `*.netlify.app` URL

### Option 3 — Vercel

```bash
npm i -g vercel
vercel
```

---

## 📁 Project Structure

```
internship-mission-2026/
├── index.html          # Single page app entry
├── css/
│   └── style.css       # All styles (dark theme)
├── js/
│   ├── data.js         # Static data definitions
│   ├── store.js        # localStorage persistence layer
│   └── app.js          # Main controller & renderers
└── README.md
```

**No build step. No npm install. No framework.** Pure HTML + CSS + JS.

---

## ✨ Features

### Dashboard
- Mission Control HUD (day counter, streak, DSA total, apps sent, today's score)
- Daily Scorecard — tap to mark 6 activities done (builds streak)
- Live stat cards + weekly bar chart

### Phase 1 — Foundation (June 24 – July 4)
- AI/ML Prime Course (7 topics) with progress bar
- CS Fundamentals (5 subjects)
- DSA progress bar toward 10–20 problem target
- Daily communication checkboxes

### Phase 2 — Internship Prep (July 5+)
- DSA tracker with +/− counters per topic + bar chart distribution
- Interview prep, project explanation readiness, aptitude, networking

### Applications
- Log company, role, date, status
- Update status through pipeline: Applied → OA → HR → Tech → Final → Selected 🎉
- Filter by status, live stats

### AI Finance Project Page
- 8 development phase cards (click to toggle complete)
- Milestone tracker with dates and done state
- Freeform research notes with save button

---

## 💾 Data Storage

All data is stored in **localStorage** (browser). No server, no database, no auth needed.

To back up your data:
```javascript
// Open browser console and run:
JSON.stringify(Object.fromEntries(
  Object.keys(localStorage)
    .filter(k => k.startsWith('im26_'))
    .map(k => [k, JSON.parse(localStorage.getItem(k))])
))
// Copy the output and save it somewhere safe
```

To restore:
```javascript
const backup = { /* paste your backup object here */ };
Object.entries(backup).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
location.reload();
```

---

## 🎨 Tech Stack

- HTML5 + CSS3 (custom properties, CSS Grid, Flexbox)
- Vanilla JavaScript (ES6 modules pattern, no framework)
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) + [Inter](https://fonts.google.com/specimen/Inter) — Google Fonts
- [Tabler Icons](https://tabler.io/icons) — icon webfont
- `localStorage` — zero-dependency persistence

---

*Go get that internship, Soorya. 🚀*
