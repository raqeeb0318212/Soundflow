/**
 * ==============================================================================
 * SoundFlow - Favorites Manager (favorites.js)
 * ==============================================================================
 * Manages the Favorites view (favorites.html), listing saved tracks,
 * playing all favorites, removing items, and sorting/exporting.
 * ==============================================================================
 */

/**
 * Initialize Favorites Page
 */
function initFavoritesPage() {
  const container = document.getElementById('favorites-table-body');
  const emptyState = document.getElementById('favorites-empty-state');
  const countEl = document.getElementById('favorites-count-label');
  const playAllBtn = document.getElementById('favorites-play-all-btn');
  const clearAllBtn = document.getElementById('favorites-clear-all-btn');

  renderFavoritesList();

  // Play All Favorites
  if (playAllBtn) {
    playAllBtn.addEventListener('click', () => {
      const favs = getFavorites();
      if (favs.length > 0 && typeof playTrack === 'function') {
        playTrack(favs[0], favs);
        if (typeof showToast === 'function') showToast('Playing all favorites', 'info');
      } else if (typeof showToast === 'function') {
        showToast('You have not added any favorite songs yet.', 'info');
      }
    });
  }

  // Clear All Favorites
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      const favs = getFavorites();
      if (favs.length === 0) return;
      if (confirm('Are you sure you want to remove all songs from your favorites?')) {
        setStorageItem(STORAGE_KEYS.FAVORITES, []);
        renderFavoritesList();
        if (typeof showToast === 'function') showToast('Favorites cleared', 'info');
      }
    });
  }

  // Listen for storage changes from other components/pages
  window.addEventListener('soundflow:favoritesUpdated', () => {
    renderFavoritesList();
  });
}

/**
 * Render the table of favorited tracks
 */
function renderFavoritesList() {
  const tbody = document.getElementById('favorites-table-body');
  const emptyState = document.getElementById('favorites-empty-state');
  const tableContainer = document.getElementById('favorites-table-container');
  const countLabel = document.getElementById('favorites-count-label');

  if (!tbody) return;

  const favorites = getFavorites();

  if (countLabel) {
    countLabel.textContent = `${favorites.length} saved songs`;
  }

  if (favorites.length === 0) {
    if (tableContainer) tableContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (tableContainer) tableContainer.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = '';

  favorites.forEach((track, index) => {
    const tr = document.createElement('tr');
    const trackId = track.id || track.videoId;

    tr.innerHTML = `
      <td style="width: 40px; text-align: center; color: var(--text-muted); font-weight: 700;">${index + 1}</td>
      <td>
        <div class="track-row-title-cell">
          <img class="table-thumb" src="${track.thumbnail}" alt="${track.title}" />
          <div>
            <div class="table-track-name">${track.title}</div>
            <div class="table-track-artist">${track.artist}</div>
          </div>
        </div>
      </td>
      <td>${track.duration || '3:30'}</td>
      <td>
        <span class="source-badge youtube" style="position: static;">
          <i class="fa-brands fa-youtube"></i> YouTube
        </span>
      </td>
      <td style="text-align: right;">
        <div class="table-actions" style="justify-content: flex-end;">
          <button class="table-btn fav-row-play-btn" title="Play Song"><i class="fa-solid fa-play"></i></button>
          <button class="table-btn fav-row-add-pl-btn" title="Add to Playlist"><i class="fa-solid fa-plus"></i></button>
          <button class="table-btn fav-row-remove-btn" title="Remove from Favorites" style="color: #ef4444;"><i class="fa-solid fa-heart"></i></button>
        </div>
      </td>
    `;

    // Row Click to Play
    tr.querySelector('.fav-row-play-btn').addEventListener('click', () => {
      if (typeof playTrack === 'function') {
        playTrack(track, favorites);
      }
    });

    // Add to playlist
    tr.querySelector('.fav-row-add-pl-btn').addEventListener('click', () => {
      if (typeof openAddToPlaylistModal === 'function') {
        openAddToPlaylistModal(track);
      }
    });

    // Remove from favorites
    tr.querySelector('.fav-row-remove-btn').addEventListener('click', () => {
      removeFavorite(trackId);
      renderFavoritesList();
      if (typeof showToast === 'function') showToast('Removed from favorites', 'info');
    });

    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('favorites-table-body') || document.getElementById('favorites-empty-state')) {
    initFavoritesPage();
  }
});
