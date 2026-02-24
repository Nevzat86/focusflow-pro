// ============================
// FocusFlow Pro - Blocked Page Logic
// ============================

const quotes = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { text: 'Concentrate all your thoughts upon the work at hand.', author: 'Alexander Graham Bell' },
  { text: 'The successful warrior is the average man, with laser-like focus.', author: 'Bruce Lee' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: "You don't have to be great to start, but you have to start to be great.", author: 'Zig Ziglar' },
];

// Show random quote
const q = quotes[Math.floor(Math.random() * quotes.length)];
document.getElementById('quote').innerHTML =
  `"${q.text}" <strong>— ${q.author}</strong>`;

// Show remaining time
function updateTimer() {
  try {
    chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
      if (chrome.runtime.lastError || !response) return;

      if (!response.isRunning) {
        document.getElementById('timer').textContent = 'Session ended';
        document.querySelector('.timer-label').textContent = 'you can close this tab';
        return;
      }

      if (response.endTime) {
        const remaining = Math.max(0, Math.floor((response.endTime - Date.now()) / 1000));
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.getElementById('timer').textContent =
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    });
  } catch (e) {
    // Not in extension context
  }
}

updateTimer();
setInterval(updateTimer, 1000);
