# Project: FocusFlow Pro

## What this is
Chrome Extension (MV3) — Pomodoro timer med nettside-blokkering, streak-sporing og produktivitetsstatistikk. v1.3.0 sendt til Chrome Web Store.

## Stack
- JavaScript (vanilla, ingen frameworks)
- Chrome MV3 APIs: storage, alarms, notifications, declarativeNetRequest
- No build step — plain JS

## Architecture
- `manifest.json` — MV3 manifest, permissions, service worker
- `background.js` — Service worker: timer-logikk, blokkering, badge, notifications
- `popup.html` + `popup.js` — Popup UI (timer, innstillinger, statistikk)
- `blocked.html` + `blocked.js` — Side som vises nar en blokkert side besokes
- `rules.json` — declarativeNetRequest regler for site blocking
- `icons/` — Extension-ikoner (16, 48, 128px)

## Conventions
- No inline scripts i HTML (MV3 CSP-krav)
- Use chrome.storage.local for all state (service worker har ingen localStorage)
- Use chrome.alarms for timers (ikke setInterval)
- System fonts kun (ingen eksterne fonter)
- addEventListener i stedet for onclick="" i HTML

## Do NOT touch
- `icons/` — ferdige ikoner

## Key behaviors
- Timer bruker chrome.alarms med endTime-beregning
- Blokkering via declarativeNetRequest (dynamiske regler)
- Badge viser fokus-status med farge
- Notifications via chrome.notifications API

## Skills to apply
See `../_skills/chrome-extension-mv3.md`
See `../_skills/marketplace-submission.md` (Chrome Web Store section)
