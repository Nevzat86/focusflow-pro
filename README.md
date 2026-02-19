# 🔥 FocusFlow Pro — Pomodoro & Focus Timer

A beautiful, premium Chrome Extension for staying focused and productive.

## Features

### Free Tier
- ⏱️ Pomodoro timer (25/5/15 min configurable)
- 🚫 Block up to 5 distracting sites during focus
- 📊 Daily session counter & minutes tracked
- 🔥 Day streak tracking
- 🔔 Sound alerts & notifications
- 🎨 Beautiful dark UI

### Pro Tier ($3/month) — Coming Soon
- 🚫 Unlimited site blocking
- 📈 Detailed weekly/monthly analytics
- 🎨 Custom themes
- 🎵 White noise & ambient sounds
- 📤 Export stats to CSV
- ⏰ Custom timer intervals

---

## Installation (for testing)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `focusflow-pro` folder
5. The extension icon will appear in your toolbar — click it!

## Publishing to Chrome Web Store

### Step 1: Create a Developer Account
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 registration fee
3. Verify your identity

### Step 2: Prepare Assets
You'll need these images for the store listing:
- **Store icon**: 128x128 px (already included ✅)
- **Screenshots**: 1280x800 px (take screenshots of the extension in action)
- **Promo tile (small)**: 440x280 px
- **Promo tile (large)**: 920x680 px (optional)

### Step 3: Create Your Listing
- **Title**: FocusFlow Pro — Pomodoro & Focus Timer
- **Short description** (132 chars max):
  > Stay focused with a beautiful Pomodoro timer, site blocking, and productivity stats. Free + Pro.
- **Detailed description**:
  > FocusFlow Pro is a sleek, powerful productivity tool that helps you stay focused using the proven Pomodoro Technique.
  >
  > 🔥 KEY FEATURES:
  > • Beautiful dark-mode timer with animated progress ring
  > • Configurable focus (25min), short break (5min), and long break (15min)
  > • Block distracting websites during focus sessions
  > • Track daily sessions, total focused minutes, and day streaks
  > • Pleasant sound alerts when sessions complete
  > • Desktop notifications to keep you on track
  > • Auto-start breaks for seamless workflow
  >
  > 💎 UPGRADE TO PRO ($3/mo):
  > • Unlimited website blocking
  > • Detailed analytics with weekly/monthly charts
  > • Custom themes
  > • White noise and ambient sounds
  > • CSV export for your stats
  >
  > Built for students, developers, designers, and anyone who wants to be more productive.
- **Category**: Productivity
- **Language**: English

### Step 4: Upload & Publish
1. Zip the `focusflow-pro` folder
2. Upload the ZIP file
3. Fill in all listing details
4. Submit for review (usually 1-3 business days)

### Step 5: Monetization
For the Pro tier, you have two options:
1. **Chrome Web Store Payments** (being deprecated)
2. **Your own payment system** (recommended):
   - Use [Stripe](https://stripe.com) or [Gumroad](https://gumroad.com)
   - Create a simple landing page
   - Verify license keys in the extension

---

## File Structure

```
focusflow-pro/
├── manifest.json      # Extension configuration
├── popup.html         # Main UI (timer, controls, stats)
├── popup.js           # App logic (timer, storage, rendering)
├── background.js      # Service worker (notifications, badge)
├── rules.json         # Site blocking rules
├── icons/
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extension management page
│   └── icon128.png    # Chrome Web Store icon
└── README.md          # This file
```

## Tips for Success on Chrome Web Store

1. **Get reviews early** — Ask friends/family to install and review
2. **SEO matters** — Use keywords like "pomodoro", "focus timer", "productivity", "distraction blocker"
3. **Update regularly** — Chrome rewards active extensions
4. **Respond to reviews** — Shows you care about users
5. **Create a landing page** — Increases trust and conversions

---

Built with ❤️ and 🔥
