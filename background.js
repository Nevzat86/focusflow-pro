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
      timerState.mode = 'focus';
      timerState.blockedSites = message.sites || [];
      timerState.endTime = Date.now() + (message.timeLeft || 25 * 60) * 1000;
      enableBlocking(timerState.blockedSites);
      chrome.alarms.create('focusTimer', { periodInMinutes: 1 / 60 });
      updateBadge('●', '#ff6b35');
      sendResponse({ ok: true });
      break;

    case 'stopFocus':
      timerState.isRunning = false;
      timerState.blockedSites = [];
      timerState.endTime = null;
      disableBlocking();
      chrome.alarms.clear('focusTimer');
      updateBadge('', '#ff6b35');
      sendResponse({ ok: true });
      break;

    case 'getState':
      sendResponse(timerState);
      break;

    case 'notify':
      showNotification(message.title, message.message);
      sendResponse({ ok: true });
      break;

    case 'updateSites':
      // Update blocked sites while running
      if (timerState.isRunning) {
        timerState.blockedSites = message.sites || [];
        enableBlocking(timerState.blockedSites);
      }
      sendResponse({ ok: true });
      break;

    default:
      sendResponse({ ok: false });
  }

  return true; // Keep message channel open for async
});

// ============================
// Website Blocking (declarativeNetRequest)
// ============================

async function enableBlocking(sites) {
  if (!sites || sites.length === 0) {
    await disableBlocking();
    return;
  }

  // Remove any existing dynamic rules first
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(r => r.id);

  if (existingIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds
    });
  }

  // Create redirect rules for each blocked site (2 rules per site: exact + subdomains)
  const redirectUrl = chrome.runtime.getURL('blocked.html');
  const rules = sites.flatMap((site, index) => {
    const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
    return [
      {
        id: index * 2 + 1,
        priority: 1,
        action: { type: 'redirect', redirect: { url: redirectUrl } },
        condition: {
          urlFilter: `*://${cleanSite}/*`,
          resourceTypes: ['main_frame']
        }
      },
      {
        id: index * 2 + 2,
        priority: 1,
        action: { type: 'redirect', redirect: { url: redirectUrl } },
        condition: {
          urlFilter: `*://*.${cleanSite}/*`,
          resourceTypes: ['main_frame']
        }
      }
    ];
  });

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
  } catch (e) {
    // Silently fail — rules may exceed limits
  }
}

async function disableBlocking() {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(r => r.id);
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds
      });
    }
  } catch (e) {
    // Rules may not exist yet
  }
}

// ============================
// Notifications
// ============================

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title || 'FocusFlow Pro',
    message: message || '',
    priority: 2
  });
}

// ============================
// Badge management
// ============================

function updateBadge(text, color) {
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color || '#ff6b35' });
}

// ============================
// Alarm listener
// ============================

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer' && timerState.isRunning) {
    updateBadge('●', '#ff6b35');
  }
});

// ============================
// Install handler
// ============================

chrome.runtime.onInstalled.addListener((details) => {
  // Clear any leftover blocking rules on install/update
  disableBlocking();

  if (details.reason === 'install') {
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
      'Welcome to FocusFlow Pro!',
      'Click the extension icon to start your first focus session.'
    );
  }
});

// ============================
// Clean up on browser startup
// ============================

chrome.runtime.onStartup.addListener(() => {
  // Clear blocking rules and fully reset timer state on browser start
  disableBlocking();
  timerState.isRunning = false;
  timerState.timeLeft = 0;
  timerState.endTime = null;
  timerState.blockedSites = [];
  updateBadge('', '#ff6b35');
});
