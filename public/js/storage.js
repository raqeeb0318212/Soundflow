/**
 * ==============================================================================
 * SoundFlow - Storage Manager (storage.js)
 * ==============================================================================
 * This module handles all browser-side local persistence using the HTML5
 * Web Storage API (`localStorage`).
 *
 * It manages:
 * 1. Favorite Tracks
 * 2. Custom User Playlists
 * 3. Recently Played History
 * 4. User Preferences & API Key Configuration
 *
 * Designed to be clean, self-contained, and easy for Computer Science students
 * to understand and modify without needing a server or SQL database.
 * ==============================================================================
 */

// Storage Keys used in localStorage
const STORAGE_KEYS = {
  FAVORITES: 'soundflow_favorites',
  PLAYLISTS: 'soundflow_playlists',
  RECENTLY_PLAYED: 'soundflow_recently_played',
  SETTINGS: 'soundflow_settings',
  ACTIVE_QUEUE: 'soundflow_active_queue',
  LAST_PLAYED: 'soundflow_last_played'
};

/**
 * Safe Helper to read parsed JSON from localStorage with a default fallback
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Fallback value if key does not exist or JSON fails
 * @returns {*} Parsed value or fallback
 */
function getStorageItem(key, defaultValue) {
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) return defaultValue;
    return JSON.parse(rawData);
  } catch (error) {
    console.warn(`[Storage] Failed to parse key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safe Helper to write JSON stringified data to localStorage
 * @param {string} key - The localStorage key
 * @param {*} value - The JavaScript object/array to save
 */
function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[Storage] Quota exceeded or error saving "${key}":`, error);
  }
}

/* ==============================================================================
   SECTION 1: FAVORITES MANAGEMENT
   ============================================================================== */

/**
 * Get all saved favorite songs
 * @returns {Array<Object>} List of favorite song objects
 */
function getFavorites() {
  return getStorageItem(STORAGE_KEYS.FAVORITES, []);
}

/**
 * Check if a track is currently in favorites
 * @param {string} trackId - The unique videoId or track ID
 * @returns {boolean} True if saved
 */
function isFavorite(trackId) {
  if (!trackId) return false;
  const favorites = getFavorites();
  return favorites.some(item => item.id === trackId || item.videoId === trackId);
}

/**
 * Add a song to favorites
 * @param {Object} track - Track metadata (id, title, artist, thumbnail, source)
 * @returns {boolean} True if added, false if already exists
 */
function saveFavorite(track) {
  if (!track || (!track.id && !track.videoId)) return false;
  
  const trackId = track.id || track.videoId;
  const favorites = getFavorites();
  
  // Prevent duplicate additions
  const exists = favorites.some(item => (item.id || item.videoId) === trackId);
  if (exists) return false;
  
  const normalizedTrack = {
    id: trackId,
    videoId: track.videoId || trackId,
    title: track.title || 'Unknown Title',
    artist: track.artist || track.channelTitle || 'Unknown Artist',
    thumbnail: track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    source: track.source || 'youtube',
    sourceUrl: track.sourceUrl || `https://www.youtube.com/watch?v=${trackId}`,
    duration: track.duration || '3:30',
    addedAt: new Date().toISOString()
  };
  
  favorites.unshift(normalizedTrack);
  setStorageItem(STORAGE_KEYS.FAVORITES, favorites);
  
  // Dispatch custom storage event for live UI reactivity across tabs or components
  window.dispatchEvent(new CustomEvent('soundflow:favoritesUpdated', { detail: { track: normalizedTrack, action: 'add' } }));
  return true;
}

/**
 * Remove a song from favorites
 * @param {string} trackId - Unique videoId or track ID to remove
 * @returns {boolean} True if removed
 */
function removeFavorite(trackId) {
  if (!trackId) return false;
  const favorites = getFavorites();
  const initialLength = favorites.length;
  
  const updated = favorites.filter(item => (item.id || item.videoId) !== trackId);
  if (updated.length !== initialLength) {
    setStorageItem(STORAGE_KEYS.FAVORITES, updated);
    window.dispatchEvent(new CustomEvent('soundflow:favoritesUpdated', { detail: { trackId, action: 'remove' } }));
    return true;
  }
  return false;
}

/**
 * Toggle favorite status for a given track
 * @param {Object} track - The track object
 * @returns {boolean} True if now favorited, false if removed
 */
function toggleFavorite(track) {
  const trackId = track.id || track.videoId;
  if (isFavorite(trackId)) {
    removeFavorite(trackId);
    return false;
  } else {
    saveFavorite(track);
    return true;
  }
}

/* ==============================================================================
   SECTION 2: PLAYLISTS MANAGEMENT
   ============================================================================== */

/**
 * Seed initial default playlists if none exist
 */
function initDefaultPlaylists() {
  const existing = getStorageItem(STORAGE_KEYS.PLAYLISTS, null);
  if (!existing) {
    const defaultPlaylists = [
      {
        id: 'playlist-chill-vibes',
        name: 'Chill & Study Vibes',
        description: 'Mellow lofi beats and relaxing acoustic rhythms.',
        createdAt: new Date().toISOString(),
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
        tracks: [
          {
            id: 'jfKfPfyJRdk',
            videoId: 'jfKfPfyJRdk',
            title: 'lofi hip hop radio 📚 - beats to relax/study to',
            artist: 'Lofi Girl',
            thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
            duration: 'Live'
          },
          {
            id: '5yx6BWlEVcY',
            videoId: '5yx6BWlEVcY',
            title: 'Chillhop Radio - jazzy & lofi hip hop beats',
            artist: 'Chillhop Music',
            thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
            duration: 'Live'
          }
        ]
      },
      {
        id: 'playlist-workout-energy',
        name: 'Workout Energy & Focus',
        description: 'High BPM electronic and hip hop motivating tracks.',
        createdAt: new Date().toISOString(),
        cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
        tracks: []
      }
    ];
    setStorageItem(STORAGE_KEYS.PLAYLISTS, defaultPlaylists);
  }
}

/**
 * Get all playlists
 * @returns {Array<Object>} List of user playlists
 */
function getPlaylists() {
  initDefaultPlaylists();
  return getStorageItem(STORAGE_KEYS.PLAYLISTS, []);
}

/**
 * Get a specific playlist by its ID
 * @param {string} playlistId
 * @returns {Object|null}
 */
function getPlaylist(playlistId) {
  const playlists = getPlaylists();
  return playlists.find(p => p.id === playlistId) || null;
}

/**
 * Create a new user playlist
 * @param {string} name - Title of playlist
 * @param {string} description - Optional description
 * @param {string} cover - Optional image URL
 * @returns {Object} Newly created playlist
 */
function createPlaylist(name, description = '', cover = '') {
  if (!name || !name.trim()) {
    name = 'My Playlist #' + (getPlaylists().length + 1);
  }
  
  const newPlaylist = {
    id: 'pl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    name: name.trim(),
    description: description.trim() || 'Custom playlist created on SoundFlow',
    cover: cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    createdAt: new Date().toISOString(),
    tracks: []
  };
  
  const playlists = getPlaylists();
  playlists.unshift(newPlaylist);
  setStorageItem(STORAGE_KEYS.PLAYLISTS, playlists);
  
  window.dispatchEvent(new CustomEvent('soundflow:playlistsUpdated', { detail: { playlist: newPlaylist, action: 'create' } }));
  return newPlaylist;
}

/**
 * Rename an existing playlist
 * @param {string} playlistId - Target playlist ID
 * @param {string} newName - New title
 * @returns {boolean} True if updated
 */
function renamePlaylist(playlistId, newName) {
  if (!playlistId || !newName || !newName.trim()) return false;
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return false;
  
  playlist.name = newName.trim();
  setStorageItem(STORAGE_KEYS.PLAYLISTS, playlists);
  window.dispatchEvent(new CustomEvent('soundflow:playlistsUpdated', { detail: { playlist, action: 'update' } }));
  return true;
}

/**
 * Delete a playlist
 * @param {string} playlistId
 * @returns {boolean} True if deleted
 */
function deletePlaylist(playlistId) {
  if (!playlistId) return false;
  const playlists = getPlaylists();
  const filtered = playlists.filter(p => p.id !== playlistId);
  if (filtered.length !== playlists.length) {
    setStorageItem(STORAGE_KEYS.PLAYLISTS, filtered);
    window.dispatchEvent(new CustomEvent('soundflow:playlistsUpdated', { detail: { playlistId, action: 'delete' } }));
    return true;
  }
  return false;
}

/**
 * Add a track to a playlist
 * @param {string} playlistId
 * @param {Object} track
 * @returns {boolean} True if added
 */
function addToPlaylist(playlistId, track) {
  if (!playlistId || !track) return false;
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return false;
  
  const trackId = track.id || track.videoId;
  // Check duplicate inside playlist
  if (playlist.tracks.some(t => (t.id || t.videoId) === trackId)) {
    return false; // Already in playlist
  }
  
  const cleanTrack = {
    id: trackId,
    videoId: track.videoId || trackId,
    title: track.title || 'Unknown Title',
    artist: track.artist || track.channelTitle || 'Unknown Artist',
    thumbnail: track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    duration: track.duration || '3:30',
    source: track.source || 'youtube',
    addedAt: new Date().toISOString()
  };
  
  playlist.tracks.push(cleanTrack);
  // Auto-update playlist cover from first track thumbnail if using generic cover
  if (playlist.tracks.length === 1 && cleanTrack.thumbnail) {
    playlist.cover = cleanTrack.thumbnail;
  }
  
  setStorageItem(STORAGE_KEYS.PLAYLISTS, playlists);
  window.dispatchEvent(new CustomEvent('soundflow:playlistsUpdated', { detail: { playlist, action: 'trackAdded' } }));
  return true;
}

/**
 * Remove a track from a playlist
 * @param {string} playlistId
 * @param {string} trackId
 * @returns {boolean} True if removed
 */
function removeFromPlaylist(playlistId, trackId) {
  if (!playlistId || !trackId) return false;
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return false;
  
  const initialCount = playlist.tracks.length;
  playlist.tracks = playlist.tracks.filter(t => (t.id || t.videoId) !== trackId);
  
  if (playlist.tracks.length !== initialCount) {
    setStorageItem(STORAGE_KEYS.PLAYLISTS, playlists);
    window.dispatchEvent(new CustomEvent('soundflow:playlistsUpdated', { detail: { playlist, action: 'trackRemoved' } }));
    return true;
  }
  return false;
}

/* ==============================================================================
   SECTION 3: RECENTLY PLAYED HISTORY
   ============================================================================== */

/**
 * Get recently played track list
 * @param {number} limit - Maximum tracks to retrieve (default: 20)
 * @returns {Array<Object>} List of recently played tracks
 */
function getRecentlyPlayed(limit = 20) {
  const history = getStorageItem(STORAGE_KEYS.RECENTLY_PLAYED, []);
  return history.slice(0, limit);
}

/**
 * Save a played track to listening history
 * @param {Object} track - Track metadata
 */
function saveRecentlyPlayed(track) {
  if (!track || (!track.id && !track.videoId)) return;
  
  const trackId = track.id || track.videoId;
  let history = getStorageItem(STORAGE_KEYS.RECENTLY_PLAYED, []);
  
  // Remove if already in history so it bubbles to top
  history = history.filter(item => (item.id || item.videoId) !== trackId);
  
  const record = {
    id: trackId,
    videoId: track.videoId || trackId,
    title: track.title || 'Unknown Title',
    artist: track.artist || track.channelTitle || 'Unknown Artist',
    thumbnail: track.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    duration: track.duration || '3:30',
    source: track.source || 'youtube',
    playedAt: new Date().toISOString()
  };
  
  history.unshift(record);
  
  // Cap at 50 max stored entries to conserve localStorage space
  if (history.length > 50) {
    history = history.slice(0, 50);
  }
  
  setStorageItem(STORAGE_KEYS.RECENTLY_PLAYED, history);
  window.dispatchEvent(new CustomEvent('soundflow:historyUpdated', { detail: { track: record } }));
}

/**
 * Clear the entire playback history
 */
function clearRecentlyPlayed() {
  setStorageItem(STORAGE_KEYS.RECENTLY_PLAYED, []);
  window.dispatchEvent(new CustomEvent('soundflow:historyUpdated', { detail: { action: 'clear' } }));
}

/* ==============================================================================
   SECTION 4: SETTINGS & CONFIGURATION PERSISTENCE
   ============================================================================== */

/**
 * Get user configuration settings (including API keys if configured)
 * @returns {Object} Settings object
 */
function getSettings() {
  const defaults = {
    youtubeApiKey: '',
    spotifyClientId: '',
    enableAutoplay: true,
    audioQuality: 'high',
    defaultVolume: 80,
    theme: 'dark'
  };
  return Object.assign({}, defaults, getStorageItem(STORAGE_KEYS.SETTINGS, {}));
}

/**
 * Update user settings
 * @param {Object} newSettings
 */
function saveSettings(newSettings) {
  const current = getSettings();
  const updated = Object.assign({}, current, newSettings);
  setStorageItem(STORAGE_KEYS.SETTINGS, updated);
  window.dispatchEvent(new CustomEvent('soundflow:settingsUpdated', { detail: updated }));
  return updated;
}

// Automatically initialize default playlists on first load
initDefaultPlaylists();
