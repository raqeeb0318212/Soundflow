/**
 * ==============================================================================
 * SoundFlow - Audio Downloads Engine (js/downloads.js)
 * ==============================================================================
 * Features:
 * 1. Downloads high-quality MP3 audio files directly to mobile / PC device Downloads folder.
 * 2. Dedicated Downloads Side-Panel showing real-time active download progress (0% -> 100%).
 * 3. Offline downloaded library with instant playback inside SoundFlow player.
 * 4. Full mobile and desktop responsiveness.
 * ==============================================================================
 */

const SoundFlowDownloads = {
  activeDownloads: new Map(), // id -> { track, percent, loadedMB, totalMB, abortController }
  completedDownloads: [],      // Array of tracks saved offline
  isPanelOpen: false
};

const STORAGE_KEY_DOWNLOADS = 'soundflow_downloaded_tracks_v1';

/**
 * Initialize Downloads Manager on page load
 */
function initDownloadsManager() {
  // Load saved completed downloads
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DOWNLOADS);
    if (saved) {
      SoundFlowDownloads.completedDownloads = JSON.parse(saved);
    }
  } catch (e) {
    SoundFlowDownloads.completedDownloads = [];
  }

  // Create Downloads Panel in DOM if not already present
  createDownloadsPanelDOM();

  // Update badge counter
  updateDownloadsBadge();

  // Bind global clicks for download buttons
  bindDownloadButtons();

  // Listen for storage events across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_DOWNLOADS) {
      try {
        SoundFlowDownloads.completedDownloads = JSON.parse(e.newValue || '[]');
        renderDownloadsList();
        updateDownloadsBadge();
      } catch (err) {}
    }
  });
}

/**
 * Creates the Downloads Drawer / Panel in the document body
 */
function createDownloadsPanelDOM() {
  if (document.getElementById('downloads-panel')) return;

  const panelHtml = `
    <!-- Downloads Backdrop -->
    <div class="downloads-backdrop" id="downloads-backdrop"></div>

    <!-- Downloads Side Panel Drawer -->
    <aside class="downloads-panel" id="downloads-panel" aria-label="Downloads Manager">
      <div class="downloads-panel-header">
        <div class="downloads-panel-title">
          <i class="fa-solid fa-cloud-arrow-down" style="color: var(--accent-primary);"></i>
          <h3>Music Downloads</h3>
          <span class="downloads-count-badge" id="panel-downloads-count">0</span>
        </div>
        <button class="close-panel-btn" id="close-downloads-panel-btn" aria-label="Close Downloads Panel">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Active Downloads Section -->
      <div class="downloads-section" id="active-downloads-section" style="display: none;">
        <h4 class="downloads-section-title">
          <i class="fa-solid fa-spinner fa-spin" style="color: var(--accent-primary);"></i> In Progress
        </h4>
        <div class="active-downloads-list" id="active-downloads-list"></div>
      </div>

      <!-- Completed Downloads Section -->
      <div class="downloads-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 class="downloads-section-title" style="margin-bottom: 0;">
            <i class="fa-solid fa-circle-check" style="color: var(--accent-primary);"></i> Saved on Device
          </h4>
          <button class="clear-all-downloads-btn" id="clear-all-downloads-btn" title="Clear All Downloads">
            <i class="fa-solid fa-trash-can"></i> Clear
          </button>
        </div>
        
        <div class="completed-downloads-list" id="completed-downloads-list"></div>
      </div>

      <!-- Empty State -->
      <div class="downloads-empty-state" id="downloads-empty-state">
        <div class="empty-icon"><i class="fa-solid fa-cloud-arrow-down"></i></div>
        <h4>No Downloads Yet</h4>
        <p>Tap the download button <i class="fa-solid fa-arrow-down"></i> on any song to save it for offline listening on your device.</p>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML('beforeend', panelHtml);

  // Event Listeners for Panel
  const panel = document.getElementById('downloads-panel');
  const backdrop = document.getElementById('downloads-backdrop');
  const closeBtn = document.getElementById('close-downloads-panel-btn');
  const clearBtn = document.getElementById('clear-all-downloads-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDownloadsPanel);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeDownloadsPanel);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (SoundFlowDownloads.completedDownloads.length === 0) return;
      if (confirm('Clear all downloaded songs from SoundFlow library? (Files already in device Downloads remain untouched)')) {
        SoundFlowDownloads.completedDownloads = [];
        saveCompletedDownloads();
        renderDownloadsList();
        updateDownloadsBadge();
        if (typeof showToast === 'function') {
          showToast('Downloads library cleared', 'info');
        }
      }
    });
  }

  // Initial render of saved downloads
  renderDownloadsList();
}

/**
 * Open Downloads Side Panel
 */
function openDownloadsPanel() {
  const panel = document.getElementById('downloads-panel');
  const backdrop = document.getElementById('downloads-backdrop');
  if (panel && backdrop) {
    panel.classList.add('open');
    backdrop.classList.add('open');
    SoundFlowDownloads.isPanelOpen = true;
    renderDownloadsList();
  }
}

/**
 * Close Downloads Side Panel
 */
function closeDownloadsPanel() {
  const panel = document.getElementById('downloads-panel');
  const backdrop = document.getElementById('downloads-backdrop');
  if (panel && backdrop) {
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    SoundFlowDownloads.isPanelOpen = false;
  }
}

/**
 * Toggle Downloads Side Panel
 */
function toggleDownloadsPanel() {
  if (SoundFlowDownloads.isPanelOpen) {
    closeDownloadsPanel();
  } else {
    openDownloadsPanel();
  }
}

/**
 * Start Track Download as Audio (MP3)
 * @param {Object} track
 */
async function startTrackDownload(track) {
  if (!track) return;
  const trackId = track.id || track.videoId || `track_${Date.now()}`;
  const title = track.title || 'Unknown Title';
  const artist = track.artist || track.channelTitle || 'Artist';
  const thumb = track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80';

  // Check if currently downloading
  if (SoundFlowDownloads.activeDownloads.has(trackId)) {
    if (typeof showToast === 'function') {
      showToast(`"${title}" is already downloading!`, 'info');
    }
    openDownloadsPanel();
    return;
  }

  // Notify user and open panel to show active progress
  if (typeof showToast === 'function') {
    showToast(`Starting download: "${title}"...`, 'info', 2500);
  }

  // Add to active downloads
  const downloadTask = {
    id: trackId,
    track: {
      ...track,
      id: trackId,
      title,
      artist,
      thumbnail: thumb
    },
    percent: 5,
    loadedMB: '0.1',
    totalMB: '4.5',
    status: 'Connecting...'
  };

  SoundFlowDownloads.activeDownloads.set(trackId, downloadTask);
  updateActiveDownloadsUI();
  openDownloadsPanel();

  try {
    // Construct download API url
    let response = null;
    try {
      const downloadUrl = `/api/download?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&id=${encodeURIComponent(track.videoId || trackId)}&url=${encodeURIComponent(track.previewUrl || '')}`;
      const serverRes = await fetch(downloadUrl);
      if (serverRes.ok) {
        response = serverRes;
      }
    } catch (serverErr) {
      console.warn('[SoundFlow Downloads] Backend download endpoint unreachable:', serverErr);
    }

    // Static host fallback (e.g. Netlify) using direct stream
    if (!response && track.previewUrl) {
      try {
        const directRes = await fetch(track.previewUrl);
        if (directRes.ok) {
          response = directRes;
        }
      } catch (directErr) {
        console.warn('[SoundFlow Downloads] Direct preview stream fetch error:', directErr);
      }
    }

    if (!response) {
      throw new Error('Direct audio stream is unavailable for this track without backend server');
    }

    const contentLength = +(response.headers.get('Content-Length') || 4000000);
    const totalMB = (contentLength / (1024 * 1024)).toFixed(1);
    downloadTask.totalMB = totalMB;
    downloadTask.status = 'Downloading...';

    const reader = response.body.getReader();
    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      const percent = Math.min(98, Math.round((receivedLength / contentLength) * 100));
      const loadedMB = (receivedLength / (1024 * 1024)).toFixed(1);

      downloadTask.percent = percent;
      downloadTask.loadedMB = loadedMB;
      updateActiveDownloadsUI();
    }

    // Complete download
    downloadTask.percent = 100;
    downloadTask.status = 'Saving to device...';
    updateActiveDownloadsUI();

    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(blob);
    const safeFilename = `${artist} - ${title}.mp3`.replace(/[/\\?%*:|"<>]/g, '_');

    // Trigger device download prompt
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 1000);

    // Save into completed list
    const completedItem = {
      id: trackId,
      videoId: track.videoId || trackId,
      title,
      artist,
      thumbnail: thumb,
      duration: track.duration || '3:30',
      fileSize: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
      downloadedAt: new Date().toLocaleDateString(),
      blobUrl, // for direct playback in this session
      source: 'offline-download'
    };

    // Remove old duplicate if exists
    SoundFlowDownloads.completedDownloads = SoundFlowDownloads.completedDownloads.filter(i => i.id !== trackId);
    SoundFlowDownloads.completedDownloads.unshift(completedItem);
    saveCompletedDownloads();

    // Remove from active
    setTimeout(() => {
      SoundFlowDownloads.activeDownloads.delete(trackId);
      updateActiveDownloadsUI();
      renderDownloadsList();
      updateDownloadsBadge();

      if (typeof showToast === 'function') {
        showToast(`✓ "${title}" saved to device Downloads!`, 'success', 3500);
      }
    }, 600);

  } catch (error) {
    console.error('[Download Failed]', error);
    SoundFlowDownloads.activeDownloads.delete(trackId);
    updateActiveDownloadsUI();

    if (typeof showToast === 'function') {
      showToast(`Download failed for "${title}". Trying direct link...`, 'error');
    }

    // Fallback: direct window trigger
    const fallbackUrl = `/api/download?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&id=${encodeURIComponent(track.videoId || trackId)}`;
    window.open(fallbackUrl, '_blank');
  }
}

/**
 * Save Completed Downloads into LocalStorage
 */
function saveCompletedDownloads() {
  try {
    // Only store serializable info
    const toSave = SoundFlowDownloads.completedDownloads.map(item => ({
      id: item.id,
      videoId: item.videoId,
      title: item.title,
      artist: item.artist,
      thumbnail: item.thumbnail,
      duration: item.duration,
      fileSize: item.fileSize,
      downloadedAt: item.downloadedAt,
      source: item.source
    }));
    localStorage.setItem(STORAGE_KEY_DOWNLOADS, JSON.stringify(toSave));
  } catch (e) {
    console.warn('[SoundFlow] Failed to save downloads state:', e);
  }
}

/**
 * Update the Active Downloads Section in the Panel
 */
function updateActiveDownloadsUI() {
  const section = document.getElementById('active-downloads-section');
  const list = document.getElementById('active-downloads-list');
  if (!section || !list) return;

  const count = SoundFlowDownloads.activeDownloads.size;
  if (count === 0) {
    section.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  let html = '';

  SoundFlowDownloads.activeDownloads.forEach((task) => {
    html += `
      <div class="active-download-card" id="task-${task.id}">
        <div class="active-download-top">
          <img src="${task.track.thumbnail}" class="active-download-thumb" alt="${task.track.title}" />
          <div class="active-download-info">
            <div class="active-download-title">${task.track.title}</div>
            <div class="active-download-artist">${task.track.artist}</div>
          </div>
          <div class="active-download-percent">${task.percent}%</div>
        </div>

        <div class="download-progress-track">
          <div class="download-progress-bar" style="width: ${task.percent}%;"></div>
        </div>

        <div class="active-download-meta">
          <span>${task.status}</span>
          <span>${task.loadedMB} / ${task.totalMB} MB</span>
        </div>
      </div>
    `;
  });

  list.innerHTML = html;
}

/**
 * Render the Completed Downloads List in the Panel
 */
function renderDownloadsList() {
  const list = document.getElementById('completed-downloads-list');
  const empty = document.getElementById('downloads-empty-state');
  const countEl = document.getElementById('panel-downloads-count');
  if (!list || !empty) return;

  const items = SoundFlowDownloads.completedDownloads;
  if (countEl) countEl.textContent = items.length;

  if (items.length === 0 && SoundFlowDownloads.activeDownloads.size === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';

  list.innerHTML = items.map(item => `
    <div class="downloaded-track-row" data-id="${item.id}">
      <img src="${item.thumbnail}" class="downloaded-thumb" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80'" />
      
      <div class="downloaded-track-info">
        <div class="downloaded-track-title">${item.title}</div>
        <div class="downloaded-track-sub">
          <span>${item.artist}</span>
          <span class="bullet">•</span>
          <span class="file-size-badge"><i class="fa-solid fa-file-audio"></i> ${item.fileSize || 'MP3'}</span>
        </div>
      </div>

      <div class="downloaded-actions">
        <button class="downloaded-action-btn play-offline-btn" title="Play Song" data-id="${item.id}">
          <i class="fa-solid fa-play"></i>
        </button>
        <button class="downloaded-action-btn redownload-btn" title="Save to Device Again" data-id="${item.id}">
          <i class="fa-solid fa-arrow-down"></i>
        </button>
        <button class="downloaded-action-btn delete-download-btn" title="Delete from List" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Attach Row Listeners
  list.querySelectorAll('.play-offline-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = SoundFlowDownloads.completedDownloads.find(t => t.id === id);
      if (item && typeof playTrack === 'function') {
        playTrack(item);
        if (typeof showToast === 'function') {
          showToast(`Playing "${item.title}"`, 'info');
        }
      }
    });
  });

  list.querySelectorAll('.redownload-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = SoundFlowDownloads.completedDownloads.find(t => t.id === id);
      if (item) {
        startTrackDownload(item);
      }
    });
  });

  list.querySelectorAll('.delete-download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      SoundFlowDownloads.completedDownloads = SoundFlowDownloads.completedDownloads.filter(t => t.id !== id);
      saveCompletedDownloads();
      renderDownloadsList();
      updateDownloadsBadge();
      if (typeof showToast === 'function') {
        showToast('Removed from downloads list', 'info');
      }
    });
  });
}

/**
 * Update Badges on Sidebar and Mobile Nav
 */
function updateDownloadsBadge() {
  const count = SoundFlowDownloads.completedDownloads.length + SoundFlowDownloads.activeDownloads.size;
  const badges = document.querySelectorAll('.downloads-badge, #downloads-badge, #mobile-downloads-badge, #panel-downloads-count');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

/**
 * Bind Download buttons on all pages
 */
function bindDownloadButtons() {
  // Sidebar and header download open buttons
  document.querySelectorAll('.open-downloads-btn, #nav-downloads-btn, #mobile-downloads-tab').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openDownloadsPanel();
    });
  });

  // Player download button
  const playerDownloadBtn = document.getElementById('player-download-btn');
  if (playerDownloadBtn) {
    playerDownloadBtn.addEventListener('click', () => {
      if (typeof SoundFlowPlayer !== 'undefined' && SoundFlowPlayer.currentTrack) {
        startTrackDownload(SoundFlowPlayer.currentTrack);
      } else {
        if (typeof showToast === 'function') {
          showToast('No track is currently playing', 'warning');
        }
      }
    });
  }

  // Expanded sheet download button
  const expandedDownloadBtn = document.getElementById('expanded-download-btn');
  if (expandedDownloadBtn) {
    expandedDownloadBtn.addEventListener('click', () => {
      if (typeof SoundFlowPlayer !== 'undefined' && SoundFlowPlayer.currentTrack) {
        startTrackDownload(SoundFlowPlayer.currentTrack);
      }
    });
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initDownloadsManager();
});
