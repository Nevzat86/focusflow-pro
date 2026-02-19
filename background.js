// ============================
// FocusFlow Pro - Background Service Worker
// ============================

let timerState = {
  isRunning: false,
  timeLeft: 0,
  mode: 'focus',
  blockedSites: [],
  endTime: null
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startFocus':
      timerState.isRunning = true;
      timerState.blockedSites = message.sites || [];
      // Set alarm for timer end
      chrome.alarms.create('focusTimer', { periodInMinutes: 1/60 }); // tick every second via alarm
      sendResponse({ ok: true });
      break;

    case 'stopFocus':
      timerState.isRunning = false;
      timerState.blockedSites = [];
      chrome.alarms.clear('focusTimer');
      sendResponse({ ok: true });
      break;

    case 'getState':
      sendResponse(timerState);
      break;

    case 'notify':
      showNotification(message.title, message.message);
      sendResponse({ ok: true });
      break;

    default:
      sendResponse({ ok: false });
  }

  return true; // Keep message channel open for async
});

// Notifications
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title || 'FocusFlow Pro',
    message: message || '',
    priority: 2
  });
}

// Badge management
function updateBadge(text, color) {
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color || '#ff6b35' });
}

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer' && timerState.isRunning) {
    // Keep badge updated with remaining time indicator
    updateBadge('●', '#ff6b35');
  }
});

// Clear badge when focus stops
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'stopFocus') {
    updateBadge('', '#ff6b35');
  }
});

// Install handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default blocked sites
    const defaults = {
      focusflow: JSON.stringify({
        blockedSites: ['facebook.com', 'twitter.com', 'youtube.com', 'reddit.com', 'tiktok.com'],
        settings: {
          focusMinutes: 25,
          shortMinutes: 5,
          longMinutes: 15,
          soundEnabled: true,
          notifEnabled: true,
          autoBreak: false
        },
        stats: {
          todaySessions: 0,
          todayMinutes: 0,
          streak: 0,
          lastActiveDate: null
        }
      })
    };
    chrome.storage.local.set(defaults);

    showNotification(
      '🔥 Welcome to FocusFlow Pro!',
      'Click the extension icon to start your first focus session.'
    );
  }
});
