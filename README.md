# Emoji Health Log Calendar

An Electron desktop app that turns a monthly calendar into a daily health
log: pick an emoji for each day — 😴 slept badly, 🌡️ sick, 😊 good day,
📝 wrote a note — and attach short journal entries. Built to spot patterns
in how days actually went, one glanceable month at a time.

## Features

- Month calendar view; click any day to log it
- Emoji per day from a default set (😴 🌡️ 😊 📝) or your own custom emojis
- Per-day journal entries alongside the emoji
- Data saves locally to `~/.my-calendar-data.json` — no accounts, no cloud
- Native Mac-style window (hidden inset title bar)

## Run it

```
npm install
npm start
```

Requires Node.js. `npm run build-mac` packages it as a Mac app
(electron-builder).

## How it's put together

Plain Electron, no framework: `main.js` (window + file storage over IPC),
`preload.js` (the contextIsolation bridge), `renderer.js` (all calendar UI
logic), `index.html` / `styles.css`. Deliberately simple — a good first
look at how an Electron app is wired.

## History

Started Sep 2025 as a personal tool for tracking health/day-quality.
One of my earliest Electron projects.
