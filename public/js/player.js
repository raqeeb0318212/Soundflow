/**
 * ==============================================================================
 * SoundFlow - Music Player Engine (player.js)
 * ==============================================================================
 * This module controls all audio and video playback using the official
 * YouTube IFrame Player API.
 * 
 * Strict Legal Compliance:
 * - Uses the official YouTube embedded player
 * - Does NOT download, convert, scrape, or extract raw media streams
 * - Tracks state (PLAYING, PAUSED, BUFFERING, ENDED) via official API callbacks
 * - Updates SoundFlow's custom UI controls and synchronization bar
 * ==============================================================================
 */

// Global Player State Object
const SoundFlowPlayer = {
  ytPlayer: null,             // YouTube IFrame Player instance
  audioEl: null,              // HTML5 Audio element instance (for static host / Netlify preview audio)
  activeEngine: 'youtube',    // 'youtube' | 'audio'
  isApiReady: false,          // True when window.onYouTubeIframeAPIReady has fired
  currentTrack: null,         // Active track object
  queue: [],                  // Current playlist/track queue
  currentIndex: -1,           // Index in queue
  isPlaying: false,           // Playback boolean
  isMuted: false,             // Mute state
  volume: 80,                 // Volume percentage (0-100)
  isShuffle: false,           // Shuffle mode
  repeatMode: 'off',          // 'off' | 'all' | 'one'
  progressInterval: null,     // Interval ID for updating seek bar
  duration: 0,                // Track duration in seconds
  currentTime: 0,             // Elapsed time in seconds
  isScrubbing: false          // True while actively dragging seek bar (Spotify scrubbing)
};

/**
 * 1. Initialize YouTube IFrame Player API
 * YouTube's script automatically invokes `window.onYouTubeIframeAPIReady`
 */
function initYouTubeIFrameApi() {
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
    return;
  }

  // Load the YouTube IFrame API script asynchronously if not already present
  if (!document.getElementById('youtube-iframe-api-script')) {
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

/**
 * Callback fired automatically by YouTube API when its core library finishes loading
 */
window.onYouTubeIframeAPIReady = function() {
  console.log('[SoundFlow Player] YouTube IFrame API Ready.');
  SoundFlowPlayer.isApiReady = true;

  const playerContainer = document.getElementById('youtube-player-element');
  if (!playerContainer) {
    console.warn('[SoundFlow Player] #youtube-player-element container not found in DOM.');
    return;
  }

  // Create official YouTube IFrame instance
  try {
    SoundFlowPlayer.ytPlayer = new YT.Player('youtube-player-element', {
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1, // Official YouTube controls enabled inside embed
        rel: 0,
        playsinline: 1,
        modestbranding: 1,
        origin: window.location.origin
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  } catch (err) {
    console.error('[SoundFlow Player] Failed to initialize YT.Player:', err);
  }
};

/**
 * Event: Player is ready for commands
 */
function onPlayerReady(event) {
  console.log('[SoundFlow Player] Official Player is ready.');
  SoundFlowPlayer.ytPlayer.setVolume(SoundFlowPlayer.volume);

  // Restore last played track or default to first curated track
  const lastPlayed = getStorageItem(STORAGE_KEYS.LAST_PLAYED, null) || CURATED_MUSIC_CATALOG[0];
  if (lastPlayed) {
    setTrackMetadataInUI(lastPlayed);
    SoundFlowPlayer.currentTrack = lastPlayed;
  }
}

/**
 * Event: Player state transitions (Playing, Paused, Ended, etc.)
 */
function onPlayerStateChange(event) {
  // YT.PlayerState: -1 (UNSTARTED), 0 (ENDED), 1 (PLAYING), 2 (PAUSED), 3 (BUFFERING), 5 (CUED)
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      SoundFlowPlayer.isPlaying = true;
      updatePlayButtonUI(true);
      startProgressTimer();
      SoundFlowPlayer.duration = SoundFlowPlayer.ytPlayer.getDuration() || 0;
      break;

    case YT.PlayerState.PAUSED:
      SoundFlowPlayer.isPlaying = false;
      updatePlayButtonUI(false);
      stopProgressTimer();
      break;

    case YT.PlayerState.ENDED:
      SoundFlowPlayer.isPlaying = false;
      updatePlayButtonUI(false);
      stopProgressTimer();
      handleTrackEnd();
      break;

    case YT.PlayerState.BUFFERING:
      // Show loading indicator in button if desired
      break;
  }
}

/**
 * Event: Player encounters an error (e.g. video unavailable / embed restricted)
 */
function onPlayerError(event) {
  console.warn('[SoundFlow Player] YouTube Playback Error code:', event.data);
  let message = 'Playback error occurred.';
  if (event.data === 150 || event.data === 101) {
    message = 'Video owner restricts external embedding. Click "Open on YouTube" to watch.';
  } else if (event.data === 100) {
    message = 'Video not found or removed.';
  }
  
  if (typeof showToast === 'function') {
    showToast(message, 'error');
  }

  // Auto skip to next after a delay if queue is active
  setTimeout(() => {
    if (SoundFlowPlayer.queue.length > 1) {
      playNextTrack();
    }
  }, 2000);
}

/* ==============================================================================
   PLAYBACK CONTROL METHODS
   ============================================================================== */

/**
 * Play a specific track object
 * @param {Object} track - Track metadata object
 * @param {Array<Object>} newQueue - Optional new queue list
 */
function playTrack(track, newQueue = null) {
  if (!track || (!track.id && !track.videoId && !track.previewUrl)) {
    console.error('[SoundFlow Player] Invalid track supplied to playTrack:', track);
    return;
  }

  // Handle tracks that need video ID resolution (e.g. from iTunes search)
  if (track.needsResolve || !track.videoId || (track.id && track.id.startsWith('itunes_'))) {
    if (typeof showToast === 'function') {
      showToast(`Loading "${track.title}"...`, 'info', 1500);
    }
    if (typeof resolveTrackVideoId === 'function') {
      resolveTrackVideoId(track).then(resolvedId => {
        if (resolvedId) {
          track.videoId = resolvedId;
          track.needsResolve = false;
          playTrack(track, newQueue);
        } else if (track.previewUrl) {
          // Play official high-quality direct audio on Netlify / static hosts
          playAudioDirect(track, newQueue);
        } else {
          if (typeof showToast === 'function') {
            showToast('Unable to find playable stream for this track', 'error');
          }
        }
      });
      return;
    }
  }

  // Stop HTML5 audio if active
  if (SoundFlowPlayer.audioEl) {
    try {
      SoundFlowPlayer.audioEl.pause();
      SoundFlowPlayer.audioEl.currentTime = 0;
    } catch (e) {}
  }
  SoundFlowPlayer.activeEngine = 'youtube';

  const videoId = track.videoId || track.id;
  SoundFlowPlayer.currentTrack = track;
  SoundFlowPlayer.currentTime = 0;
  if (track.duration) {
    SoundFlowPlayer.duration = parseDurationToSeconds(track.duration);
  }
  updateProgressUI();
  setStorageItem(STORAGE_KEYS.LAST_PLAYED, track);

  // Update queue if provided
  if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
    SoundFlowPlayer.queue = [...newQueue];
    SoundFlowPlayer.currentIndex = SoundFlowPlayer.queue.findIndex(t => (t.videoId || t.id) === videoId);
  } else if (SoundFlowPlayer.queue.length === 0) {
    SoundFlowPlayer.queue = [track];
    SoundFlowPlayer.currentIndex = 0;
  }

  // Update UI immediately with track details
  setTrackMetadataInUI(track);

  // Save to recently played history in storage
  if (typeof saveRecentlyPlayed === 'function') {
    saveRecentlyPlayed(track);
  }

  // Show official player drawer if video visualizer is open
  const ytDrawer = document.getElementById('youtube-player-drawer');
  if (ytDrawer && !ytDrawer.classList.contains('hidden-drawer')) {
    ytDrawer.classList.remove('hidden-drawer');
  }

  // Issue command to YouTube IFrame instance
  if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.loadVideoById === 'function') {
    SoundFlowPlayer.ytPlayer.loadVideoById({
      videoId: videoId,
      startSeconds: 0
    });
    SoundFlowPlayer.isPlaying = true;
    updatePlayButtonUI(true);
  } else {
    // If API not ready yet, wait and retry once
    setTimeout(() => {
      if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.loadVideoById === 'function') {
        SoundFlowPlayer.ytPlayer.loadVideoById({ videoId: videoId, startSeconds: 0 });
        SoundFlowPlayer.isPlaying = true;
        updatePlayButtonUI(true);
      }
    }, 800);
  }

  // Fire global custom event for active track
  window.dispatchEvent(new CustomEvent('soundflow:trackChanged', { detail: { track } }));
}

/**
 * Direct Audio Engine for static hosts (e.g. Netlify, GitHub Pages)
 * Plays iTunes / direct audio streams using standard HTML5 Audio
 */
function playAudioDirect(track, newQueue = null) {
  if (!track || !track.previewUrl) return;

  // Stop YouTube video if currently playing
  if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.pauseVideo === 'function') {
    try {
      SoundFlowPlayer.ytPlayer.pauseVideo();
    } catch (e) {}
  }

  SoundFlowPlayer.activeEngine = 'audio';
  SoundFlowPlayer.currentTrack = track;
  SoundFlowPlayer.currentTime = 0;
  SoundFlowPlayer.duration = parseDurationToSeconds(track.duration || 30);

  // Update queue
  if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
    SoundFlowPlayer.queue = [...newQueue];
    SoundFlowPlayer.currentIndex = SoundFlowPlayer.queue.findIndex(t => (t.id === track.id || t.title === track.title));
  } else if (SoundFlowPlayer.queue.length === 0) {
    SoundFlowPlayer.queue = [track];
    SoundFlowPlayer.currentIndex = 0;
  }

  setTrackMetadataInUI(track);
  setStorageItem(STORAGE_KEYS.LAST_PLAYED, track);
  if (typeof saveRecentlyPlayed === 'function') {
    saveRecentlyPlayed(track);
  }

  if (!SoundFlowPlayer.audioEl) {
    SoundFlowPlayer.audioEl = new Audio();
  }

  const audio = SoundFlowPlayer.audioEl;
  audio.src = track.previewUrl;
  audio.volume = (SoundFlowPlayer.volume || 80) / 100;
  audio.muted = SoundFlowPlayer.isMuted;

  audio.onloadedmetadata = () => {
    if (audio.duration && !isNaN(audio.duration)) {
      SoundFlowPlayer.duration = audio.duration;
    }
    updateProgressUI();
  };

  audio.ontimeupdate = () => {
    if (!SoundFlowPlayer.isScrubbing) {
      SoundFlowPlayer.currentTime = audio.currentTime || 0;
      updateProgressUI();
    }
  };

  audio.onended = () => {
    handleTrackEnd();
  };

  audio.onerror = (err) => {
    console.warn('[SoundFlow] HTML5 Audio playback error:', err);
    SoundFlowPlayer.isPlaying = false;
    updatePlayButtonUI(false);
  };

  audio.play().then(() => {
    SoundFlowPlayer.isPlaying = true;
    updatePlayButtonUI(true);
    startProgressTimer();
  }).catch(err => {
    console.warn('[SoundFlow] Autoplay prevented or audio load error:', err);
    SoundFlowPlayer.isPlaying = false;
    updatePlayButtonUI(false);
  });

  window.dispatchEvent(new CustomEvent('soundflow:trackChanged', { detail: { track } }));
}

/**
 * Toggle Play / Pause state
 */
function togglePlayPause() {
  if (SoundFlowPlayer.activeEngine === 'audio' && SoundFlowPlayer.audioEl) {
    if (SoundFlowPlayer.isPlaying) {
      SoundFlowPlayer.audioEl.pause();
      SoundFlowPlayer.isPlaying = false;
      updatePlayButtonUI(false);
    } else {
      SoundFlowPlayer.audioEl.play().catch(e => console.warn(e));
      SoundFlowPlayer.isPlaying = true;
      updatePlayButtonUI(true);
      startProgressTimer();
    }
    return;
  }

  if (!SoundFlowPlayer.ytPlayer) return;

  if (SoundFlowPlayer.isPlaying) {
    SoundFlowPlayer.ytPlayer.pauseVideo();
  } else {
    // If no video loaded yet, load current or fallback
    if (!SoundFlowPlayer.currentTrack) {
      playTrack(CURATED_MUSIC_CATALOG[0]);
    } else {
      SoundFlowPlayer.ytPlayer.playVideo();
    }
  }
}

/**
 * Skip to next track in queue
 */
function playNextTrack() {
  if (SoundFlowPlayer.queue.length === 0) return;

  if (SoundFlowPlayer.isShuffle) {
    const nextIdx = Math.floor(Math.random() * SoundFlowPlayer.queue.length);
    SoundFlowPlayer.currentIndex = nextIdx;
  } else {
    SoundFlowPlayer.currentIndex++;
    if (SoundFlowPlayer.currentIndex >= SoundFlowPlayer.queue.length) {
      if (SoundFlowPlayer.repeatMode === 'all') {
        SoundFlowPlayer.currentIndex = 0;
      } else {
        SoundFlowPlayer.currentIndex = SoundFlowPlayer.queue.length - 1;
        return; // Stopped at end
      }
    }
  }

  const nextTrack = SoundFlowPlayer.queue[SoundFlowPlayer.currentIndex];
  if (nextTrack) {
    playTrack(nextTrack);
  }
}

/**
 * Return to previous track in queue
 */
function playPrevTrack() {
  if (SoundFlowPlayer.queue.length === 0) return;

  // If track has been playing > 3s, restart track
  if (SoundFlowPlayer.currentTime > 3) {
    seekTo(0);
    return;
  }

  SoundFlowPlayer.currentIndex--;
  if (SoundFlowPlayer.currentIndex < 0) {
    SoundFlowPlayer.currentIndex = SoundFlowPlayer.repeatMode === 'all' ? SoundFlowPlayer.queue.length - 1 : 0;
  }

  const prevTrack = SoundFlowPlayer.queue[SoundFlowPlayer.currentIndex];
  if (prevTrack) {
    playTrack(prevTrack);
  }
}

/**
 * Action triggered on track completion
 */
function handleTrackEnd() {
  if (SoundFlowPlayer.repeatMode === 'one') {
    seekTo(0);
    if (SoundFlowPlayer.ytPlayer) SoundFlowPlayer.ytPlayer.playVideo();
  } else {
    playNextTrack();
  }
}

/**
 * Parse string or number duration to seconds
 * e.g. "3:45" -> 225, "1:02:30" -> 3750, 210 -> 210
 */
function parseDurationToSeconds(dur) {
  if (typeof dur === 'number' && !isNaN(dur)) return dur;
  if (!dur || typeof dur !== 'string') return 210;
  const parts = dur.trim().split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 210;
}

/**
 * Seek to a specific second in the track
 * @param {number} seconds
 */
function seekTo(seconds) {
  seconds = Math.max(0, Number(seconds) || 0);
  if (SoundFlowPlayer.duration && seconds > SoundFlowPlayer.duration) {
    seconds = Math.max(0, SoundFlowPlayer.duration - 0.5);
  }
  SoundFlowPlayer.currentTime = seconds;

  if (SoundFlowPlayer.activeEngine === 'audio' && SoundFlowPlayer.audioEl) {
    try {
      SoundFlowPlayer.audioEl.currentTime = seconds;
    } catch (e) {}
    updateProgressUI();
    return;
  }

  if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.seekTo === 'function') {
    try {
      SoundFlowPlayer.ytPlayer.seekTo(seconds, true);
      // Ensure playback state is respected
      if (SoundFlowPlayer.isPlaying && typeof SoundFlowPlayer.ytPlayer.playVideo === 'function') {
        const state = SoundFlowPlayer.ytPlayer.getPlayerState ? SoundFlowPlayer.ytPlayer.getPlayerState() : -1;
        if (state === 2 || state === -1 || state === 5) {
          SoundFlowPlayer.ytPlayer.playVideo();
        }
      }
    } catch (e) {
      console.warn('[SoundFlow] seekTo error:', e);
    }
  }
  updateProgressUI();
}

/**
 * Seek forward in time by seconds (Spotify fast forward scrub)
 * @param {number} seconds
 */
function seekForward(seconds = 10) {
  const dur = SoundFlowPlayer.duration || (SoundFlowPlayer.ytPlayer && SoundFlowPlayer.ytPlayer.getDuration ? SoundFlowPlayer.ytPlayer.getDuration() : 300) || 300;
  const target = Math.min(dur - 0.5, (SoundFlowPlayer.currentTime || 0) + seconds);
  seekTo(target);
  if (typeof showToast === 'function') {
    showToast(`+${seconds}s Forward`, 'info', 900);
  }
}

/**
 * Seek backward in time by seconds (Spotify rewind scrub)
 * @param {number} seconds
 */
function seekBackward(seconds = 10) {
  const target = Math.max(0, (SoundFlowPlayer.currentTime || 0) - seconds);
  seekTo(target);
  if (typeof showToast === 'function') {
    showToast(`-${seconds}s Rewind`, 'info', 900);
  }
}

window.seekTo = seekTo;
window.seekForward = seekForward;
window.seekBackward = seekBackward;
window.parseDurationToSeconds = parseDurationToSeconds;

/**
 * Set Volume (0 to 100)
 * @param {number} level
 */
function setVolume(level) {
  level = Math.max(0, Math.min(100, level));
  SoundFlowPlayer.volume = level;
  if (SoundFlowPlayer.audioEl) {
    SoundFlowPlayer.audioEl.volume = level / 100;
  }
  if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.setVolume === 'function') {
    SoundFlowPlayer.ytPlayer.setVolume(level);
    if (level === 0) {
      SoundFlowPlayer.isMuted = true;
    } else {
      SoundFlowPlayer.isMuted = false;
      if (SoundFlowPlayer.ytPlayer.isMuted()) {
        SoundFlowPlayer.ytPlayer.unMute();
      }
    }
  }
  updateVolumeUI();
}

/**
 * Toggle Mute
 */
function toggleMute() {
  if (SoundFlowPlayer.isMuted) {
    SoundFlowPlayer.isMuted = false;
    if (SoundFlowPlayer.audioEl) SoundFlowPlayer.audioEl.muted = false;
    if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.unMute === 'function') {
      SoundFlowPlayer.ytPlayer.unMute();
      SoundFlowPlayer.ytPlayer.setVolume(SoundFlowPlayer.volume || 80);
    }
  } else {
    SoundFlowPlayer.isMuted = true;
    if (SoundFlowPlayer.audioEl) SoundFlowPlayer.audioEl.muted = true;
    if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.mute === 'function') {
      SoundFlowPlayer.ytPlayer.mute();
    }
  }
  updateVolumeUI();
}

/**
 * Toggle Shuffle Mode
 */
function toggleShuffle() {
  SoundFlowPlayer.isShuffle = !SoundFlowPlayer.isShuffle;
  const btn = document.getElementById('player-shuffle-btn');
  if (btn) {
    btn.classList.toggle('active', SoundFlowPlayer.isShuffle);
  }
  if (typeof showToast === 'function') {
    showToast(SoundFlowPlayer.isShuffle ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
  }
}

/**
 * Toggle Repeat Mode (off -> all -> one -> off)
 */
function toggleRepeat() {
  const btn = document.getElementById('player-repeat-btn');
  if (SoundFlowPlayer.repeatMode === 'off') {
    SoundFlowPlayer.repeatMode = 'all';
    if (btn) btn.classList.add('active');
    if (typeof showToast === 'function') showToast('Repeat All enabled', 'info');
  } else if (SoundFlowPlayer.repeatMode === 'all') {
    SoundFlowPlayer.repeatMode = 'one';
    if (btn) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fa-solid fa-repeat"></i><span style="font-size:8px;position:absolute;bottom:0;right:0;">1</span>';
    }
    if (typeof showToast === 'function') showToast('Repeat One enabled', 'info');
  } else {
    SoundFlowPlayer.repeatMode = 'off';
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
    }
    if (typeof showToast === 'function') showToast('Repeat disabled', 'info');
  }
}

/* ==============================================================================
   UI SYNCHRONIZATION HELPERS
   ============================================================================== */

/**
 * Update Track Title, Artist, Thumbnail, and External links in UI
 */
function setTrackMetadataInUI(track) {
  const titleEls = document.querySelectorAll('.player-track-title, .expanded-title');
  const artistEls = document.querySelectorAll('.player-track-artist, .expanded-artist');
  const thumbEls = document.querySelectorAll('.player-thumb, .expanded-artwork-container img');
  const ytSourceBtns = document.querySelectorAll('.yt-source-btn');
  const spotifySourceBtns = document.querySelectorAll('.spotify-source-btn');
  const favBtns = document.querySelectorAll('.player-btn-fav, .expanded-fav-btn');

  const title = track.title || 'Unknown Title';
  const artist = track.artist || track.channelTitle || 'Unknown Artist';
  const videoId = track.videoId || track.id;
  let thumb = track.thumbnail;
  if (!thumb || thumb.includes('unsplash.com')) {
    if (videoId && !videoId.startsWith('itunes_') && videoId.length === 11) {
      thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    } else {
      thumb = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';
    }
  }

  titleEls.forEach(el => el.textContent = title);
  artistEls.forEach(el => el.textContent = artist);
  thumbEls.forEach(el => {
    el.src = thumb;
    el.onerror = function() {
      if (videoId && !this.src.includes('ytimg.com')) {
        this.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      }
    };
  });

  // Update external source buttons
  ytSourceBtns.forEach(btn => {
    btn.href = getYouTubeWatchUrl(videoId);
  });
  spotifySourceBtns.forEach(btn => {
    btn.href = getSpotifySearchUrl(title, artist);
  });

  // Check and update favorite button state in player
  if (typeof isFavorite === 'function') {
    const favorited = isFavorite(videoId);
    favBtns.forEach(btn => {
      btn.classList.toggle('active', favorited);
      btn.innerHTML = favorited 
        ? '<i class="fa-solid fa-heart"></i>' 
        : '<i class="fa-regular fa-heart"></i>';
    });
  }
}

/**
 * Update Play/Pause Icon state across desktop and mobile player
 */
function updatePlayButtonUI(isPlaying) {
  const playBtns = document.querySelectorAll('.btn-play-pause, .expanded-play-btn');
  playBtns.forEach(btn => {
    if (isPlaying) {
      btn.classList.add('playing');
      btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      btn.setAttribute('aria-label', 'Pause');
    } else {
      btn.classList.remove('playing');
      btn.innerHTML = '<i class="fa-solid fa-play"></i>';
      btn.setAttribute('aria-label', 'Play');
    }
  });
}

/**
 * Start periodic progress tracker (runs every 250ms during playback)
 */
function startProgressTimer() {
  stopProgressTimer();
  SoundFlowPlayer.progressInterval = setInterval(() => {
    if (SoundFlowPlayer.isScrubbing) return;

    if (SoundFlowPlayer.activeEngine === 'audio' && SoundFlowPlayer.audioEl) {
      SoundFlowPlayer.currentTime = SoundFlowPlayer.audioEl.currentTime || 0;
      if (SoundFlowPlayer.audioEl.duration && !isNaN(SoundFlowPlayer.audioEl.duration)) {
        SoundFlowPlayer.duration = SoundFlowPlayer.audioEl.duration;
      }
      updateProgressUI();
    } else if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.getCurrentTime === 'function') {
      SoundFlowPlayer.currentTime = SoundFlowPlayer.ytPlayer.getCurrentTime() || 0;
      const dur = SoundFlowPlayer.ytPlayer.getDuration();
      if (dur && dur > 0) {
        SoundFlowPlayer.duration = dur;
      }
      updateProgressUI();
    }
  }, 250);
}

/**
 * Stop periodic progress tracker
 */
function stopProgressTimer() {
  if (SoundFlowPlayer.progressInterval) {
    clearInterval(SoundFlowPlayer.progressInterval);
    SoundFlowPlayer.progressInterval = null;
  }
}

/**
 * Update Seek Progress Bar and Time labels in UI
 */
function updateProgressUI() {
  if (SoundFlowPlayer.isScrubbing) return;

  const currentEls = document.querySelectorAll('.time-stamp.current');
  const totalEls = document.querySelectorAll('.time-stamp.total');
  const fills = document.querySelectorAll('.progress-bar-fill, .mobile-progress-fill');

  const curr = formatTime(SoundFlowPlayer.currentTime);
  const total = formatTime(SoundFlowPlayer.duration);
  const percent = SoundFlowPlayer.duration > 0 
    ? Math.min(100, Math.max(0, (SoundFlowPlayer.currentTime / SoundFlowPlayer.duration) * 100)) 
    : 0;

  currentEls.forEach(el => el.textContent = curr);
  totalEls.forEach(el => el.textContent = total);
  fills.forEach(el => el.style.width = `${percent}%`);
}

/**
 * Update Volume UI slider and icon
 */
function updateVolumeUI() {
  const fills = document.querySelectorAll('.volume-slider-fill');
  const volumeBtns = document.querySelectorAll('.volume-btn');

  const vol = SoundFlowPlayer.isMuted ? 0 : SoundFlowPlayer.volume;
  fills.forEach(el => el.style.width = `${vol}%`);

  volumeBtns.forEach(btn => {
    if (vol === 0) {
      btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    } else if (vol < 40) {
      btn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
    } else {
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
  });
}

/**
 * Format raw seconds into MM:SS
 */
function formatTime(seconds) {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Setup Spotify-style Seek Bar Scrubbing & Tooltips (Mouse + Touch)
 * Allows scrubbing song backward and forward in time
 */
function setupProgressBarSeeking() {
  const wrappers = document.querySelectorAll('.progress-bar-wrapper, .mobile-progress-line');
  wrappers.forEach(wrapper => {
    if (wrapper.dataset.seekBound === 'true') return;
    wrapper.dataset.seekBound = 'true';

    // Inject thumb dot inside fill if missing
    const fill = wrapper.querySelector('.progress-bar-fill, .mobile-progress-fill');
    if (fill && !fill.querySelector('.progress-bar-thumb')) {
      const thumb = document.createElement('div');
      thumb.className = 'progress-bar-thumb';
      fill.appendChild(thumb);
    }

    // Inject hover tooltip if missing on full seek bar
    let tooltip = wrapper.querySelector('.seek-tooltip');
    if (!tooltip && wrapper.classList.contains('progress-bar-wrapper')) {
      tooltip = document.createElement('div');
      tooltip.className = 'seek-tooltip';
      tooltip.textContent = '0:00';
      wrapper.appendChild(tooltip);
    }

    function getActiveDuration() {
      if (SoundFlowPlayer.duration && SoundFlowPlayer.duration > 0) return SoundFlowPlayer.duration;
      if (SoundFlowPlayer.ytPlayer && typeof SoundFlowPlayer.ytPlayer.getDuration === 'function') {
        const d = SoundFlowPlayer.ytPlayer.getDuration();
        if (d && d > 0) return d;
      }
      if (SoundFlowPlayer.currentTrack && SoundFlowPlayer.currentTrack.duration) {
        return parseDurationToSeconds(SoundFlowPlayer.currentTrack.duration);
      }
      return 210;
    }

    function getSeekData(e) {
      const rect = wrapper.getBoundingClientRect();
      const clientX = e.clientX !== undefined 
        ? e.clientX 
        : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1)));
      const duration = getActiveDuration();
      const seconds = ratio * duration;
      return { ratio, seconds, duration };
    }

    // Hover tooltip (Desktop)
    if (tooltip) {
      wrapper.addEventListener('mousemove', (e) => {
        if (SoundFlowPlayer.isScrubbing) return;
        const { ratio, seconds } = getSeekData(e);
        tooltip.textContent = formatTime(seconds);
        tooltip.style.left = `${ratio * 100}%`;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      });

      wrapper.addEventListener('mouseleave', () => {
        if (!SoundFlowPlayer.isScrubbing) {
          tooltip.style.opacity = '0';
          tooltip.style.visibility = 'hidden';
        }
      });
    }

    let isLocalDragging = false;
    let localTargetSeconds = 0;

    function onDragMove(e) {
      if (!isLocalDragging) return;
      if (e.cancelable) e.preventDefault();

      const { ratio, seconds } = getSeekData(e);
      localTargetSeconds = seconds;
      const percent = ratio * 100;

      // Update seek fills across desktop, mobile bar, and expanded sheet in real-time
      document.querySelectorAll('.progress-bar-fill, .mobile-progress-fill').forEach(f => {
        f.style.width = `${percent}%`;
      });

      // Update current time label in real-time
      const formatted = formatTime(seconds);
      document.querySelectorAll('.time-stamp.current').forEach(t => {
        t.textContent = formatted;
      });

      if (tooltip) {
        tooltip.textContent = formatted;
        tooltip.style.left = `${percent}%`;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      }
    }

    function onDragEnd() {
      if (!isLocalDragging) return;
      isLocalDragging = false;
      SoundFlowPlayer.isScrubbing = false;
      wrapper.classList.remove('is-scrubbing');

      if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      }

      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
      window.removeEventListener('pointercancel', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);

      // Seek to target position immediately
      seekTo(localTargetSeconds);
    }

    function onDragStart(e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (!SoundFlowPlayer.currentTrack && (!SoundFlowPlayer.queue || SoundFlowPlayer.queue.length === 0)) {
        return;
      }

      isLocalDragging = true;
      SoundFlowPlayer.isScrubbing = true;
      wrapper.classList.add('is-scrubbing');

      const { ratio, seconds } = getSeekData(e);
      localTargetSeconds = seconds;
      const percent = ratio * 100;

      document.querySelectorAll('.progress-bar-fill, .mobile-progress-fill').forEach(f => {
        f.style.width = `${percent}%`;
      });
      const formatted = formatTime(seconds);
      document.querySelectorAll('.time-stamp.current').forEach(t => {
        t.textContent = formatted;
      });

      if (tooltip) {
        tooltip.textContent = formatted;
        tooltip.style.left = `${percent}%`;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      }

      window.addEventListener('pointermove', onDragMove, { passive: false });
      window.addEventListener('pointerup', onDragEnd);
      window.addEventListener('pointercancel', onDragEnd);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('touchend', onDragEnd);
    }

    wrapper.addEventListener('pointerdown', onDragStart);
    wrapper.addEventListener('touchstart', onDragStart, { passive: false });
  });
}

/**
 * Setup Spotify-style Volume Slider Scrubbing
 */
function setupVolumeSeeking() {
  const wrappers = document.querySelectorAll('.volume-slider-wrapper');
  wrappers.forEach(wrapper => {
    if (wrapper.dataset.volBound === 'true') return;
    wrapper.dataset.volBound = 'true';

    const fill = wrapper.querySelector('.volume-slider-fill');
    if (fill && !fill.querySelector('.volume-slider-thumb')) {
      const thumb = document.createElement('div');
      thumb.className = 'volume-slider-thumb';
      fill.appendChild(thumb);
    }

    let isDraggingVol = false;

    function updateVol(e) {
      const rect = wrapper.getBoundingClientRect();
      const clientX = e.clientX !== undefined 
        ? e.clientX 
        : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1)));
      const targetVol = Math.round(ratio * 100);
      setVolume(targetVol);
    }

    function onVolMove(e) {
      if (!isDraggingVol) return;
      if (e.cancelable) e.preventDefault();
      updateVol(e);
    }

    function onVolUp() {
      if (!isDraggingVol) return;
      isDraggingVol = false;
      wrapper.classList.remove('is-scrubbing');
      window.removeEventListener('pointermove', onVolMove);
      window.removeEventListener('pointerup', onVolUp);
      window.removeEventListener('touchmove', onVolMove);
      window.removeEventListener('touchend', onVolUp);
    }

    function onVolDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      isDraggingVol = true;
      wrapper.classList.add('is-scrubbing');
      updateVol(e);

      window.addEventListener('pointermove', onVolMove, { passive: false });
      window.addEventListener('pointerup', onVolUp);
      window.addEventListener('touchmove', onVolMove, { passive: false });
      window.addEventListener('touchend', onVolUp);
    }

    wrapper.addEventListener('pointerdown', onVolDown);
    wrapper.addEventListener('touchstart', onVolDown, { passive: false });
  });
}

/* ==============================================================================
   DOM EVENT LISTENERS BINDING
   ============================================================================== */
function setupPlayerEventListeners() {
  // Play / Pause Buttons
  document.querySelectorAll('.btn-play-pause, .expanded-play-btn').forEach(btn => {
    btn.addEventListener('click', togglePlayPause);
  });

  // Next & Prev Buttons
  document.querySelectorAll('.btn-next, .expanded-next-btn').forEach(btn => {
    btn.addEventListener('click', playNextTrack);
  });
  document.querySelectorAll('.btn-prev, .expanded-prev-btn').forEach(btn => {
    btn.addEventListener('click', playPrevTrack);
  });

  // Shuffle & Repeat Buttons
  const shuffleBtn = document.getElementById('player-shuffle-btn');
  if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);

  const repeatBtn = document.getElementById('player-repeat-btn');
  if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);

  // Auto-inject Rewind 10s and Fast Forward 10s buttons into controls if not already in markup
  document.querySelectorAll('.playback-controls').forEach(container => {
    if (!container.querySelector('.btn-seek-back')) {
      const playPauseBtn = container.querySelector('.btn-play-pause');
      const seekBack = document.createElement('button');
      seekBack.className = 'control-btn btn-seek-back';
      seekBack.id = 'player-seek-back-btn';
      seekBack.title = 'Rewind 10s (Left Arrow)';
      seekBack.setAttribute('aria-label', 'Rewind 10 seconds');
      seekBack.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span class="seek-badge">10</span>';
      seekBack.addEventListener('click', (e) => {
        e.stopPropagation();
        seekBackward(10);
      });

      if (playPauseBtn) {
        container.insertBefore(seekBack, playPauseBtn);
      } else {
        container.appendChild(seekBack);
      }
    }

    if (!container.querySelector('.btn-seek-fwd')) {
      const playPauseBtn = container.querySelector('.btn-play-pause');
      const nextBtn = container.querySelector('.btn-next');
      const seekFwd = document.createElement('button');
      seekFwd.className = 'control-btn btn-seek-fwd';
      seekFwd.id = 'player-seek-fwd-btn';
      seekFwd.title = 'Fast Forward 10s (Right Arrow)';
      seekFwd.setAttribute('aria-label', 'Fast Forward 10 seconds');
      seekFwd.innerHTML = '<i class="fa-solid fa-rotate-right"></i><span class="seek-badge">10</span>';
      seekFwd.addEventListener('click', (e) => {
        e.stopPropagation();
        seekForward(10);
      });

      if (nextBtn) {
        container.insertBefore(seekFwd, nextBtn);
      } else if (playPauseBtn && playPauseBtn.nextSibling) {
        container.insertBefore(seekFwd, playPauseBtn.nextSibling);
      } else {
        container.appendChild(seekFwd);
      }
    }
  });

  // Mobile Expanded Controls auto-inject Rewind & Fast Forward 10s buttons
  document.querySelectorAll('.expanded-controls').forEach(container => {
    if (!container.querySelector('.btn-seek-back')) {
      const playPauseBtn = container.querySelector('.expanded-play-btn');
      const seekBack = document.createElement('button');
      seekBack.className = 'control-btn btn-seek-back';
      seekBack.title = 'Rewind 10s';
      seekBack.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span class="seek-badge">10</span>';
      seekBack.addEventListener('click', (e) => {
        e.stopPropagation();
        seekBackward(10);
      });
      if (playPauseBtn) {
        container.insertBefore(seekBack, playPauseBtn);
      }
    }

    if (!container.querySelector('.btn-seek-fwd')) {
      const playPauseBtn = container.querySelector('.expanded-play-btn');
      const nextBtn = container.querySelector('.expanded-next-btn');
      const seekFwd = document.createElement('button');
      seekFwd.className = 'control-btn btn-seek-fwd';
      seekFwd.title = 'Fast Forward 10s';
      seekFwd.innerHTML = '<i class="fa-solid fa-rotate-right"></i><span class="seek-badge">10</span>';
      seekFwd.addEventListener('click', (e) => {
        e.stopPropagation();
        seekForward(10);
      });
      if (nextBtn) {
        container.insertBefore(seekFwd, nextBtn);
      } else if (playPauseBtn && playPauseBtn.nextSibling) {
        container.insertBefore(seekFwd, playPauseBtn.nextSibling);
      }
    }
  });

  // Rewind & Fast Forward button event listeners (for any existing or dynamically created buttons)
  document.querySelectorAll('.btn-seek-back, [data-action="seek-backward"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const secs = parseInt(btn.dataset.seconds || '10', 10);
      seekBackward(secs);
    });
  });

  document.querySelectorAll('.btn-seek-fwd, [data-action="seek-forward"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const secs = parseInt(btn.dataset.seconds || '10', 10);
      seekForward(secs);
    });
  });

  // Setup Progress Bar Drag/Scrub & Volume Drag/Scrub
  setupProgressBarSeeking();
  setupVolumeSeeking();

  // Volume Mute Button
  document.querySelectorAll('.volume-btn').forEach(btn => {
    btn.addEventListener('click', toggleMute);
  });

  // Video Visualizer Drawer Toggle
  const toggleVideoBtn = document.getElementById('toggle-video-btn');
  const ytDrawer = document.getElementById('youtube-player-drawer');
  const ytDrawerClose = document.getElementById('youtube-drawer-close');

  if (toggleVideoBtn && ytDrawer) {
    toggleVideoBtn.addEventListener('click', () => {
      ytDrawer.classList.toggle('hidden-drawer');
      toggleVideoBtn.classList.toggle('active', !ytDrawer.classList.contains('hidden-drawer'));
    });
  }

  if (ytDrawerClose && ytDrawer) {
    ytDrawerClose.addEventListener('click', () => {
      ytDrawer.classList.add('hidden-drawer');
      if (toggleVideoBtn) toggleVideoBtn.classList.remove('active');
    });
  }

  // Favorite toggle in Player
  document.querySelectorAll('.player-btn-fav, .expanded-fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!SoundFlowPlayer.currentTrack) return;
      if (typeof toggleFavorite === 'function') {
        const isFav = toggleFavorite(SoundFlowPlayer.currentTrack);
        setTrackMetadataInUI(SoundFlowPlayer.currentTrack);
        if (typeof showToast === 'function') {
          showToast(isFav ? 'Added to Liked Songs' : 'Removed from Liked Songs', 'success');
        }
      }
    });
  });

  // Add to Playlist Button in Player
  document.querySelectorAll('.player-btn-add, .expanded-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!SoundFlowPlayer.currentTrack) return;
      if (typeof openAddToPlaylistModal === 'function') {
        openAddToPlaylistModal(SoundFlowPlayer.currentTrack);
      }
    });
  });

  // Mobile Mini Player Expand to Full Screen Sheet
  const miniPlayerInfo = document.querySelector('.player-left');
  const expandedPlayer = document.getElementById('mobile-expanded-player');
  const collapseExpandedBtn = document.getElementById('collapse-expanded-player');

  if (miniPlayerInfo && expandedPlayer) {
    miniPlayerInfo.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        if (e.target.closest('button')) return;
        expandedPlayer.classList.add('open');
      }
    });
  }

  if (collapseExpandedBtn && expandedPlayer) {
    collapseExpandedBtn.addEventListener('click', () => {
      expandedPlayer.classList.remove('open');
    });
  }

  // Spotify-style Keyboard Shortcuts
  if (!window._soundflowKeyboardBound) {
    window._soundflowKeyboardBound = true;
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekForward(e.shiftKey ? 15 : 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekBackward(e.shiftKey ? 15 : 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume((SoundFlowPlayer.volume || 80) + 5);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume((SoundFlowPlayer.volume || 80) - 5);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    });
  }
}

// Auto-run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initYouTubeIFrameApi();
  setupPlayerEventListeners();
});
