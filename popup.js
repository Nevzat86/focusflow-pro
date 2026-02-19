// ============================
// FocusFlow Pro - Popup Logic
// ============================

class FocusFlowApp {
  constructor() {
    this.state = {
      mode: 'focus',        // focus | short | long
      isRunning: false,
      timeLeft: 25 * 60,    // seconds
      totalTime: 25 * 60,
      currentSession: 1,
      completedSessions: 0,
      settings: {
        focusMinutes: 25,
        shortMinutes: 5,
        longMinutes: 15,
        soundEnabled: true,
        notifEnabled: true,
        autoBreak: false
      },
      blockedSites: ['facebook.com', 'twitter.com', 'youtube.com', 'reddit.com', 'tiktok.com'],
      stats: {
        todaySessions: 0,
        todayMinutes: 0,
        streak: 0,
        lastActiveDate: null
      }
    };

    this.tickInterval = null;
    this.circumference = 2 * Math.PI * 90; // r=90

    this.init();
  }

  async init() {
    await this.loadState();
    this.bindElements();
    this.bindEvents();
    this.render();
    this.syncWithBackground();
  }

  bindElements() {
    this.els = {
      timerDisplay: document.getElementById('timerDisplay'),
      timerLabel: document.getElementById('timerLabel'),
      timerProgress: document.getElementById('timerProgress'),
      startBtn: document.getElementById('startBtn'),
      resetBtn: document.getElementById('resetBtn'),
      sessionDots: document.getElementById('sessionDots'),
      todaySessions: document.getElementById('todaySessions'),
      todayMinutes: document.getElementById('todayMinutes'),
      streak: document.getElementById('streak'),
      siteList: document.getElementById('siteList'),
      siteInput: document.getElementById('siteInput'),
      addSiteBtn: document.getElementById('addSiteBtn'),
      mainView: document.getElementById('mainView'),
      settingsView: document.getElementById('settingsView'),
      openSettings: document.getElementById('openSettings'),
      closeSettings: document.getElementById('closeSettings'),
      setFocus: document.getElementById('setFocus'),
      setShort: document.getElementById('setShort'),
      setLong: document.getElementById('setLong'),
      toggleSound: document.getElementById('toggleSound'),
      toggleNotif: document.getElementById('toggleNotif'),
      toggleAutoBreak: document.getElementById('toggleAutoBreak'),
      modeTabs: document.querySelectorAll('.mode-tab'),
      premiumBanner: document.getElementById('premiumBanner')
    };
  }

  bindEvents() {
    // Start/Stop
    this.els.startBtn.addEventListener('click', () => this.toggleTimer());

    // Reset
    this.els.resetBtn.addEventListener('click', () => this.resetTimer());

    // Mode tabs
    this.els.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (this.state.isRunning) return;
        const mode = tab.dataset.mode;
        this.switchMode(mode);
      });
    });

    // Blocked sites
    this.els.addSiteBtn.addEventListener('click', () => this.addSite());
    this.els.siteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSite();
    });

    // Settings
    this.els.openSettings.addEventListener('click', () => this.showSettings());
    this.els.closeSettings.addEventListener('click', () => this.hideSettings());

    // Setting inputs
    this.els.setFocus.addEventListener('change', (e) => {
      this.state.settings.focusMinutes = parseInt(e.target.value) || 25;
      if (this.state.mode === 'focus' && !this.state.isRunning) {
        this.state.timeLeft = this.state.settings.focusMinutes * 60;
        this.state.totalTime = this.state.timeLeft;
      }
      this.saveState();
      this.render();
    });

    this.els.setShort.addEventListener('change', (e) => {
      this.state.settings.shortMinutes = parseInt(e.target.value) || 5;
      if (this.state.mode === 'short' && !this.state.isRunning) {
        this.state.timeLeft = this.state.settings.shortMinutes * 60;
        this.state.totalTime = this.state.timeLeft;
      }
      this.saveState();
      this.render();
    });

    this.els.setLong.addEventListener('change', (e) => {
      this.state.settings.longMinutes = parseInt(e.target.value) || 15;
      if (this.state.mode === 'long' && !this.state.isRunning) {
        this.state.timeLeft = this.state.settings.longMinutes * 60;
        this.state.totalTime = this.state.timeLeft;
      }
      this.saveState();
      this.render();
    });

    this.els.toggleSound.addEventListener('change', (e) => {
      this.state.settings.soundEnabled = e.target.checked;
      this.saveState();
    });

    this.els.toggleNotif.addEventListener('change', (e) => {
      this.state.settings.notifEnabled = e.target.checked;
      this.saveState();
    });

    this.els.toggleAutoBreak.addEventListener('change', (e) => {
      this.state.settings.autoBreak = e.target.checked;
      this.saveState();
    });

    // Premium banner
    this.els.premiumBanner.addEventListener('click', () => {
      // In production, this would open a payment flow
      alert('🚀 FocusFlow Pro — Coming soon!\n\nPro features include:\n• Unlimited site blocking\n• Detailed analytics & charts\n• Custom themes\n• White noise & ambient sounds\n• Export stats to CSV\n\nPrice: $3/month');
    });
  }

  // Timer Logic
  toggleTimer() {
    if (this.state.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.state.isRunning = true;

    // Notify background to start blocking
    this.sendToBackground({ action: 'startFocus', sites: this.state.blockedSites });

    this.tickInterval = setInterval(() => {
      this.state.timeLeft--;

      if (this.state.timeLeft <= 0) {
        this.completeSession();
        return;
      }

      this.render();
      this.saveState();
    }, 1000);

    this.render();
    this.saveState();
  }

  pauseTimer() {
    this.state.isRunning = false;
    clearInterval(this.tickInterval);

    this.sendToBackground({ action: 'stopFocus' });

    this.render();
    this.saveState();
  }

  resetTimer() {
    this.state.isRunning = false;
    clearInterval(this.tickInterval);

    const minutes = this.getMinutesForMode(this.state.mode);
    this.state.timeLeft = minutes * 60;
    this.state.totalTime = this.state.timeLeft;

    this.sendToBackground({ action: 'stopFocus' });

    this.render();
    this.saveState();
  }

  completeSession() {
    clearInterval(this.tickInterval);
    this.state.isRunning = false;

    this.sendToBackground({ action: 'stopFocus' });

    if (this.state.mode === 'focus') {
      this.state.completedSessions++;
      this.state.stats.todaySessions++;
      this.state.stats.todayMinutes += this.state.settings.focusMinutes;
      this.updateStreak();

      // Play completion sound
      if (this.state.settings.soundEnabled) {
        this.playSound();
      }

      // Show notification
      if (this.state.settings.notifEnabled) {
        this.sendToBackground({
          action: 'notify',
          title: '🎉 Focus session complete!',
          message: `Great job! You've completed ${this.state.stats.todaySessions} sessions today.`
        });
      }

      // Update session dots
      this.updateSessionDots();

      // Auto-start break
      if (this.state.settings.autoBreak) {
        const breakMode = this.state.completedSessions % 4 === 0 ? 'long' : 'short';
        this.switchMode(breakMode);
        setTimeout(() => this.startTimer(), 1500);
      }
    } else {
      // Break complete
      if (this.state.settings.soundEnabled) {
        this.playSound();
      }
      if (this.state.settings.notifEnabled) {
        this.sendToBackground({
          action: 'notify',
          title: '⏰ Break over!',
          message: 'Time to get back to work!'
        });
      }
      this.switchMode('focus');
    }

    this.render();
    this.saveState();
  }

  switchMode(mode) {
    this.state.mode = mode;
    const minutes = this.getMinutesForMode(mode);
    this.state.timeLeft = minutes * 60;
    this.state.totalTime = this.state.timeLeft;

    // Update tabs
    this.els.modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // Update ring color
    const progress = this.els.timerProgress;
    if (mode === 'focus') {
      progress.classList.remove('break-mode');
    } else {
      progress.classList.add('break-mode');
    }

    this.render();
    this.saveState();
  }

  getMinutesForMode(mode) {
    switch (mode) {
      case 'focus': return this.state.settings.focusMinutes;
      case 'short': return this.state.settings.shortMinutes;
      case 'long': return this.state.settings.longMinutes;
      default: return 25;
    }
  }

  // Rendering
  render() {
    // Timer display
    const mins = Math.floor(this.state.timeLeft / 60);
    const secs = this.state.timeLeft % 60;
    this.els.timerDisplay.textContent =
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Timer label
    const labels = { focus: 'Focus Time', short: 'Short Break', long: 'Long Break' };
    this.els.timerLabel.textContent = labels[this.state.mode];

    // Progress ring
    const progress = this.state.timeLeft / this.state.totalTime;
    const offset = this.circumference * progress;
    this.els.timerProgress.style.strokeDasharray = this.circumference;
    this.els.timerProgress.style.strokeDashoffset = this.circumference - offset;

    // Start button
    if (this.state.isRunning) {
      this.els.startBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
        Pause
      `;
      this.els.startBtn.classList.add('running');
    } else {
      this.els.startBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21"/>
        </svg>
        Start
      `;
      this.els.startBtn.classList.remove('running');
    }

    // Stats
    this.els.todaySessions.textContent = this.state.stats.todaySessions;
    this.els.todayMinutes.textContent = this.state.stats.todayMinutes;
    this.els.streak.textContent = this.state.stats.streak;

    // Blocked sites
    this.renderBlockedSites();

    // Session dots
    this.updateSessionDots();

    // Settings values
    this.els.setFocus.value = this.state.settings.focusMinutes;
    this.els.setShort.value = this.state.settings.shortMinutes;
    this.els.setLong.value = this.state.settings.longMinutes;
    this.els.toggleSound.checked = this.state.settings.soundEnabled;
    this.els.toggleNotif.checked = this.state.settings.notifEnabled;
    this.els.toggleAutoBreak.checked = this.state.settings.autoBreak;
  }

  renderBlockedSites() {
    this.els.siteList.innerHTML = this.state.blockedSites.map((site, i) => `
      <div class="site-tag">
        ${site}
        <span class="remove" data-index="${i}">&times;</span>
      </div>
    `).join('');

    // Bind remove buttons
    this.els.siteList.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this.state.blockedSites.splice(idx, 1);
        this.saveState();
        this.render();
      });
    });
  }

  updateSessionDots() {
    const dots = this.els.sessionDots.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove('completed', 'current');
      if (i < this.state.completedSessions % 4) {
        dots[i].classList.add('completed');
      }
      if (i === this.state.completedSessions % 4 && this.state.mode === 'focus') {
        dots[i].classList.add('current');
      }
    }
  }

  // Site Blocking
  addSite() {
    let site = this.els.siteInput.value.trim().toLowerCase();
    if (!site) return;

    // Clean up URL
    site = site.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

    if (site && !this.state.blockedSites.includes(site)) {
      // Free tier limit: 5 sites
      if (this.state.blockedSites.length >= 5) {
        alert('⚡ Free plan allows 5 blocked sites.\nUpgrade to Pro for unlimited blocking!');
        return;
      }
      this.state.blockedSites.push(site);
      this.els.siteInput.value = '';
      this.saveState();
      this.render();
    }
  }

  // Settings
  showSettings() {
    this.els.mainView.style.display = 'none';
    this.els.settingsView.classList.add('visible');
  }

  hideSettings() {
    this.els.settingsView.classList.remove('visible');
    this.els.mainView.style.display = 'block';
    this.render();
  }

  // Sound
  playSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
      });
    } catch (e) {
      // Audio not available
    }
  }

  // Streak Logic
  updateStreak() {
    const today = new Date().toDateString();
    if (this.state.stats.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (this.state.stats.lastActiveDate === yesterday) {
        this.state.stats.streak++;
      } else if (this.state.stats.lastActiveDate !== today) {
        this.state.stats.streak = 1;
      }
      this.state.stats.lastActiveDate = today;
    }
  }

  // Check if day changed and reset daily stats
  checkDayReset() {
    const today = new Date().toDateString();
    if (this.state.stats.lastActiveDate && this.state.stats.lastActiveDate !== today) {
      this.state.stats.todaySessions = 0;
      this.state.stats.todayMinutes = 0;
    }
  }

  // Storage
  async loadState() {
    try {
      const data = await chrome.storage.local.get('focusflow');
      if (data.focusflow) {
        const saved = JSON.parse(data.focusflow);
        this.state = { ...this.state, ...saved };
        this.checkDayReset();
      }
    } catch (e) {
      // Extension storage not available (dev mode)
      const saved = localStorage.getItem('focusflow');
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved) };
        this.checkDayReset();
      }
    }
  }

  async saveState() {
    const data = JSON.stringify(this.state);
    try {
      await chrome.storage.local.set({ focusflow: data });
    } catch (e) {
      localStorage.setItem('focusflow', data);
    }
  }

  // Background Communication
  sendToBackground(message) {
    try {
      chrome.runtime.sendMessage(message);
    } catch (e) {
      // Not in extension context
      console.log('Background message:', message);
    }
  }

  async syncWithBackground() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getState' });
      if (response && response.isRunning) {
        this.state.isRunning = response.isRunning;
        this.state.timeLeft = response.timeLeft;
        this.state.mode = response.mode;
        this.state.totalTime = this.getMinutesForMode(response.mode) * 60;
        this.startTimer();
      }
    } catch (e) {
      // Not in extension context
    }
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new FocusFlowApp();
});
