/**
 * ==============================================================================
 * SoundFlow - Playlist Manager (playlist.js)
 * ==============================================================================
 * Manages playlist creation, modifications, addition of tracks, deletion,
 * and playlist detail rendering.
 * ==============================================================================
 */

// Track currently pending addition to a playlist
let pendingTrackForPlaylist = null;

/**
 * Open the "Add Track to Playlist" modal
 * @param {Object} track
 */
function openAddToPlaylistModal(track) {
  pendingTrackForPlaylist = track;
  const modal = document.getElementById('add-to-playlist-modal');
  const listContainer = document.getElementById('modal-playlists-list');

  if (!modal || !listContainer) return;

  const playlists = getPlaylists();
  listContainer.innerHTML = '';

  if (playlists.length === 0) {
    listContainer.innerHTML = `
      <p style="color: var(--text-secondary); text-align: center; padding: 20px 0;">
        No playlists created yet. Create one below!
      </p>
    `;
  } else {
    playlists.forEach(pl => {
      const trackId = track.id || track.videoId;
      const alreadyIn = pl.tracks.some(t => (t.id || t.videoId) === trackId);

      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.style.justifyContent = 'space-between';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${pl.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&q=80'}" 
               style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;" />
          <div>
            <div style="font-weight: 700; color: var(--text-primary);">${pl.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${pl.tracks.length} tracks</div>
          </div>
        </div>
        <button class="btn-primary" style="padding: 6px 14px; font-size: 0.8rem;" ${alreadyIn ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          ${alreadyIn ? 'Added' : 'Add'}
        </button>
      `;

      item.querySelector('button').addEventListener('click', () => {
        if (!alreadyIn) {
          addToPlaylist(pl.id, track);
          closeAddToPlaylistModal();
          if (typeof showToast === 'function') {
            showToast(`Added to "${pl.name}"`, 'success');
          }
        }
      });

      listContainer.appendChild(item);
    });
  }

  modal.classList.add('active');
}

/**
 * Close the Add to Playlist modal
 */
function closeAddToPlaylistModal() {
  const modal = document.getElementById('add-to-playlist-modal');
  if (modal) modal.classList.remove('active');
  pendingTrackForPlaylist = null;
}

/**
 * Open the "Create New Playlist" modal
 */
function openCreatePlaylistModal() {
  const modal = document.getElementById('create-playlist-modal');
  const input = document.getElementById('new-playlist-name-input');
  const descInput = document.getElementById('new-playlist-desc-input');
  if (modal) {
    if (input) input.value = '';
    if (descInput) descInput.value = '';
    modal.classList.add('active');
    if (input) input.focus();
  }
}

/**
 * Close the Create New Playlist modal
 */
function closeCreatePlaylistModal() {
  const modal = document.getElementById('create-playlist-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Handle confirmation of new playlist creation from modal form
 */
function handleCreatePlaylistSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('new-playlist-name-input');
  const descInput = document.getElementById('new-playlist-desc-input');
  const name = input ? input.value.trim() : '';
  const desc = descInput ? descInput.value.trim() : '';

  if (!name) {
    if (typeof showToast === 'function') showToast('Please enter a playlist title', 'error');
    return;
  }

  const newPl = createPlaylist(name, desc);
  closeCreatePlaylistModal();

  // If there was a pending track, add it to this new playlist immediately
  if (pendingTrackForPlaylist) {
    addToPlaylist(newPl.id, pendingTrackForPlaylist);
    closeAddToPlaylistModal();
  }

  if (typeof showToast === 'function') {
    showToast(`Created playlist "${newPl.name}"`, 'success');
  }

  // Refresh playlists page if currently on playlist.html
  if (window.location.pathname.includes('playlist.html')) {
    renderPlaylistsPage();
  }
}

/**
 * Render the Playlists Page (playlist.html)
 */
function renderPlaylistsPage() {
  const container = document.getElementById('playlists-grid-container');
  const detailContainer = document.getElementById('playlist-detail-container');
  if (!container && !detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const activePlaylistId = urlParams.get('id');

  if (activePlaylistId && detailContainer) {
    // Render specific playlist details view
    renderPlaylistDetail(activePlaylistId);
  } else if (container) {
    // Render grid of all user playlists
    const playlists = getPlaylists();
    container.innerHTML = '';

    if (playlists.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon"><i class="fa-solid fa-list-music"></i></div>
          <h3 class="empty-state-title">No Playlists Yet</h3>
          <p class="empty-state-text">Create custom collections for workout, study, or road trips.</p>
          <button class="btn-primary" onclick="openCreatePlaylistModal()">
            <i class="fa-solid fa-plus"></i> Create First Playlist
          </button>
        </div>
      `;
      return;
    }

    playlists.forEach(pl => {
      const card = document.createElement('div');
      card.className = 'music-card playlist-item-card';
      const cover = pl.cover || (pl.tracks[0]?.thumbnail) || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80';

      card.innerHTML = `
        <div class="card-artwork-wrapper">
          <img src="${cover}" alt="${pl.name}" loading="lazy" />
          <div class="card-actions-overlay">
            <button class="card-play-btn pl-play-all-btn" title="Play All" aria-label="Play All">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
        </div>
        <div class="card-info">
          <h4 class="card-title">${pl.name}</h4>
          <p class="card-subtitle">${pl.tracks.length} tracks</p>
        </div>
      `;

      // Open detail view on card click
      card.addEventListener('click', (e) => {
        if (e.target.closest('.pl-play-all-btn')) {
          if (pl.tracks.length > 0 && typeof playTrack === 'function') {
            playTrack(pl.tracks[0], pl.tracks);
          } else if (typeof showToast === 'function') {
            showToast('This playlist has no songs yet. Search and add some!', 'info');
          }
          return;
        }
        window.location.href = `playlist.html?id=${pl.id}`;
      });

      container.appendChild(card);
    });
  }
}

/**
 * Render single playlist detail view
 * @param {string} playlistId
 */
function renderPlaylistDetail(playlistId) {
  const detailContainer = document.getElementById('playlist-detail-container');
  const listContainer = document.getElementById('playlist-tracks-body');
  if (!detailContainer) return;

  const playlist = getPlaylist(playlistId);
  if (!playlist) {
    detailContainer.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state-title">Playlist not found</h3>
        <p class="empty-state-text">This playlist may have been removed.</p>
        <a href="playlist.html" class="btn-primary">View All Playlists</a>
      </div>
    `;
    return;
  }

  // Update header info
  const titleEl = document.getElementById('pl-detail-title');
  const descEl = document.getElementById('pl-detail-desc');
  const countEl = document.getElementById('pl-detail-count');
  const coverEl = document.getElementById('pl-detail-cover');

  if (titleEl) titleEl.textContent = playlist.name;
  if (descEl) descEl.textContent = playlist.description || 'Custom SoundFlow Playlist';
  if (countEl) countEl.textContent = `${playlist.tracks.length} songs`;
  if (coverEl) coverEl.src = playlist.cover || playlist.tracks[0]?.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80';

  // Play All Button
  const playAllBtn = document.getElementById('pl-play-all-action');
  if (playAllBtn) {
    playAllBtn.onclick = () => {
      if (playlist.tracks.length > 0 && typeof playTrack === 'function') {
        playTrack(playlist.tracks[0], playlist.tracks);
      } else if (typeof showToast === 'function') {
        showToast('Playlist is empty', 'info');
      }
    };
  }

  // Delete Playlist Button
  const deleteBtn = document.getElementById('pl-delete-action');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
        deletePlaylist(playlist.id);
        if (typeof showToast === 'function') showToast('Playlist deleted', 'info');
        window.location.href = 'playlist.html';
      }
    };
  }

  // Render Tracks Table
  if (listContainer) {
    listContainer.innerHTML = '';
    if (playlist.tracks.length === 0) {
      listContainer.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 48px 0; color: var(--text-muted);">
            No tracks in this playlist yet. <a href="search.html" style="color: var(--accent-primary); text-decoration: underline;">Search for music</a> to add songs!
          </td>
        </tr>
      `;
      return;
    }

    playlist.tracks.forEach((track, index) => {
      const tr = document.createElement('tr');
      const isFav = typeof isFavorite === 'function' ? isFavorite(track.id || track.videoId) : false;

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
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="table-btn table-play-btn" title="Play Track"><i class="fa-solid fa-play"></i></button>
            <button class="table-btn table-fav-btn ${isFav ? 'active' : ''}" title="Favorite"><i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
            <button class="table-btn table-remove-btn" title="Remove from playlist"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;

      tr.querySelector('.table-play-btn').addEventListener('click', () => {
        if (typeof playTrack === 'function') {
          playTrack(track, playlist.tracks);
        }
      });

      tr.querySelector('.table-fav-btn').addEventListener('click', (e) => {
        if (typeof toggleFavorite === 'function') {
          const favorited = toggleFavorite(track);
          e.currentTarget.classList.toggle('active', favorited);
          e.currentTarget.innerHTML = favorited ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
          if (typeof showToast === 'function') showToast(favorited ? 'Added to favorites' : 'Removed from favorites', 'success');
        }
      });

      tr.querySelector('.table-remove-btn').addEventListener('click', () => {
        removeFromPlaylist(playlist.id, track.id || track.videoId);
        renderPlaylistDetail(playlist.id);
        if (typeof showToast === 'function') showToast('Track removed', 'info');
      });

      listContainer.appendChild(tr);
    });
  }
}

// Global modal bindings
document.addEventListener('DOMContentLoaded', () => {
  const createPlForm = document.getElementById('create-playlist-form');
  if (createPlForm) {
    createPlForm.addEventListener('submit', handleCreatePlaylistSubmit);
  }

  const closeCreatePlBtn = document.getElementById('close-create-playlist-modal');
  if (closeCreatePlBtn) closeCreatePlBtn.addEventListener('click', closeCreatePlaylistModal);

  const closeAddPlBtn = document.getElementById('close-add-playlist-modal');
  if (closeAddPlBtn) closeAddPlBtn.addEventListener('click', closeAddToPlaylistModal);

  // If on playlist.html, run initial render
  if (document.getElementById('playlists-grid-container') || document.getElementById('playlist-detail-container')) {
    renderPlaylistsPage();
  }
});
