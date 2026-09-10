/**
 * ==============================================================================
 * SoundFlow - Search Engine (search.js)
 * ==============================================================================
 * Handles the search view, debounced input triggers, real-time query dispatching,
 * category filtering, pagination, loading states, list vs grid view toggling,
 * top artist match banners, and mobile-optimized track rendering.
 * ==============================================================================
 */

// Search Module State
const SoundFlowSearch = {
  currentQuery: '',
  currentFilter: 'all',     // 'all' | 'songs' | 'artists' | 'genres'
  viewMode: 'list',         // 'list' | 'grid'
  nextPageToken: null,
  isLoading: false,
  debounceTimer: null,
  recentSearches: [],
  currentResults: []
};

/**
 * Get high-quality thumbnail without black letterbox bars
 */
function getOptimalThumbnail(track) {
  if (!track) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';
  const vid = track.videoId || track.id;
  let thumb = track.thumbnail;

  if (thumb && !thumb.includes('unsplash.com')) {
    // YouTube hqdefault has black bars for 16:9; mqdefault is clean 16:9 without bars!
    if (thumb.includes('hqdefault.jpg')) {
      return thumb.replace('hqdefault.jpg', 'mqdefault.jpg');
    }
    // iTunes 100x100 replace with 600x600 crystal clear square
    if (thumb.includes('100x100bb')) {
      return thumb.replace('100x100bb', '600x600bb');
    }
    return thumb;
  }

  if (vid && !String(vid).startsWith('itunes_') && String(vid).length === 11) {
    return `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`;
  }

  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';
}
window.getOptimalThumbnail = getOptimalThumbnail;

/**
 * Initialize Search page bindings
 */
function initSearchPage() {
  const searchInput = document.getElementById('main-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  const filterChips = document.querySelectorAll('.filter-chips-bar .chip');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const viewListBtn = document.getElementById('view-mode-list');
  const viewGridBtn = document.getElementById('view-mode-grid');

  // Load recent searches from localStorage
  SoundFlowSearch.recentSearches = getStorageItem('soundflow_recent_searches', [
    'Atif Aslam', 'Coke Studio Pasoori', 'Arijit Singh', 'The Weeknd', 'Queen', 'Lofi Hip Hop'
  ]);

  // Load saved view mode or default to 'list'
  const savedViewMode = getStorageItem('soundflow_search_view_mode', 'list');
  SoundFlowSearch.viewMode = savedViewMode || 'list';
  updateViewModeUI(SoundFlowSearch.viewMode);

  // Bind View Mode Toggle buttons
  if (viewListBtn) {
    viewListBtn.addEventListener('click', () => {
      updateViewModeUI('list');
    });
  }
  if (viewGridBtn) {
    viewGridBtn.addEventListener('click', () => {
      updateViewModeUI('grid');
    });
  }

  // Check URL query parameters (e.g. search.html?q=lofi)
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');
  const initialGenre = urlParams.get('genre');

  if (initialGenre) {
    if (searchInput) searchInput.value = initialGenre;
    SoundFlowSearch.currentFilter = 'genres';
    updateFilterChipUI('genres');
    executeSearch(initialGenre);
  } else if (initialQuery) {
    if (searchInput) searchInput.value = initialQuery;
    executeSearch(initialQuery);
  } else {
    // Show popular recommendations or recent searches if query is empty
    renderRecentSearches();
    loadSearchRecommendations();
  }

  // Debounced input handler & live suggestions list
  if (searchInput) {
    // Focus handling to tuck player/keyboard overlap on mobile
    searchInput.addEventListener('focus', () => {
      document.body.classList.add('is-searching');
      document.body.classList.add('keyboard-open');
      renderLiveSearchSuggestions(searchInput.value);
    });

    searchInput.addEventListener('blur', () => {
      // Delay removal slightly so click on dropdown item works
      setTimeout(() => {
        document.body.classList.remove('is-searching');
        document.body.classList.remove('keyboard-open');
        hideLiveSearchSuggestions();
      }, 300);
    });

    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = val.length > 0 ? 'block' : 'none';
      }

      // 1. Show instant related suggestions dropdown
      renderLiveSearchSuggestions(val);

      // 2. Debounced search (350ms delay)
      clearTimeout(SoundFlowSearch.debounceTimer);
      SoundFlowSearch.debounceTimer = setTimeout(() => {
        executeSearch(val);
      }, 350);
    });

    // Enter key triggers immediate search without waiting for debounce
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(SoundFlowSearch.debounceTimer);
        hideLiveSearchSuggestions();
        executeSearch(searchInput.value);
      } else if (e.key === 'Escape') {
        hideLiveSearchSuggestions();
      }
    });
  }

  // Clear button handler
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      hideLiveSearchSuggestions();
      searchInput.focus();
      renderRecentSearches();
      loadSearchRecommendations();
    });
  }

  // Filter Chips handler
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter') || 'all';
      SoundFlowSearch.currentFilter = filter;
      updateFilterChipUI(filter);
      
      const query = searchInput ? searchInput.value : SoundFlowSearch.currentQuery;

      // If user clicked 'songs', switch to list view automatically
      if (filter === 'songs') {
        updateViewModeUI('list');
      }

      if (query.trim()) {
        executeSearch(query);
      } else {
        loadSearchRecommendations();
      }
    });
  });

  // Load More Button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      if (SoundFlowSearch.nextPageToken && !SoundFlowSearch.isLoading) {
        executeSearch(SoundFlowSearch.currentQuery, SoundFlowSearch.nextPageToken, true);
      }
    });
  }
}

/**
 * Toggle between List View and Grid View
 */
function updateViewModeUI(mode) {
  SoundFlowSearch.viewMode = mode;
  setStorageItem('soundflow_search_view_mode', mode);

  const listBtn = document.getElementById('view-mode-list');
  const gridBtn = document.getElementById('view-mode-grid');
  const tracksList = document.getElementById('search-tracks-list');
  const resultsGrid = document.getElementById('search-results-grid');

  if (listBtn && gridBtn) {
    listBtn.classList.toggle('active', mode === 'list');
    gridBtn.classList.toggle('active', mode === 'grid');
  }

  const tracksHeader = document.getElementById('search-tracks-header');

  if (tracksList && resultsGrid) {
    if (mode === 'list') {
      tracksList.style.display = 'flex';
      resultsGrid.style.display = 'none';
      if (tracksHeader && SoundFlowSearch.currentResults.length > 0) {
        tracksHeader.style.display = 'grid';
      }
    } else {
      tracksList.style.display = 'none';
      resultsGrid.style.display = 'grid';
      if (tracksHeader) {
        tracksHeader.style.display = 'none';
      }
    }
  }
}

/**
 * Execute music search across YouTube API or curated database
 * @param {string} query 
 * @param {string} pageToken 
 * @param {boolean} isLoadMore 
 */
async function executeSearch(query, pageToken = '', isLoadMore = false) {
  const cleanQuery = (query || '').trim();
  const tracksList = document.getElementById('search-tracks-list');
  const resultsGrid = document.getElementById('search-results-grid');
  const resultsHeader = document.getElementById('search-results-header');
  const resultsCount = document.getElementById('search-results-count');
  const emptyState = document.getElementById('search-empty-state');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const apiNotice = document.getElementById('search-api-notice');
  const topArtistContainer = document.getElementById('search-top-artist-container');
  const loadingBanner = document.getElementById('search-loading-banner');
  const loadingQuery = document.getElementById('search-loader-query');
  const searchIcon = document.getElementById('main-search-icon');
  const searchSpinner = document.getElementById('main-search-spinner');
  const tracksHeader = document.getElementById('search-tracks-header');

  // Immediately close live suggestions dropdown so results are fully unobstructed
  hideLiveSearchSuggestions();

  if (!cleanQuery) {
    if (loadingBanner) loadingBanner.style.display = 'none';
    if (searchIcon) searchIcon.style.display = 'block';
    if (searchSpinner) searchSpinner.style.display = 'none';
    if (tracksHeader) tracksHeader.style.display = 'none';
    renderRecentSearches();
    loadSearchRecommendations();
    return;
  }

  SoundFlowSearch.currentQuery = cleanQuery;
  saveRecentSearch(cleanQuery);

  if (!isLoadMore) {
    // Show animated search banner & input spinner
    if (loadingBanner) {
      if (loadingQuery) loadingQuery.textContent = `"${cleanQuery}"`;
      loadingBanner.style.display = 'flex';
    }
    if (searchIcon) searchIcon.style.display = 'none';
    if (searchSpinner) searchSpinner.style.display = 'block';
    if (tracksHeader) tracksHeader.style.display = 'none';

    renderSkeletonList(tracksList, 8);
    renderSkeletonCards(resultsGrid, 8);
    if (emptyState) emptyState.style.display = 'none';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    if (resultsHeader) resultsHeader.textContent = `Search results for "${cleanQuery}"`;
    if (resultsCount) resultsCount.style.display = 'none';
  }

  SoundFlowSearch.isLoading = true;

  try {
    // Check for Top Artist match if in 'all' or 'artists' filter
    if (!isLoadMore && topArtistContainer) {
      renderTopArtistMatch(cleanQuery, topArtistContainer);
    }

    const data = await searchYouTubeMusic(cleanQuery, pageToken);
    SoundFlowSearch.isLoading = false;
    SoundFlowSearch.nextPageToken = data.nextPageToken || null;

    // Hide loading banner & input spinner
    if (loadingBanner) loadingBanner.style.display = 'none';
    if (searchIcon) searchIcon.style.display = 'block';
    if (searchSpinner) searchSpinner.style.display = 'none';

    // Show API status notice
    if (apiNotice) {
      if (data.isLiveApi) {
        apiNotice.innerHTML = '<span class="status-dot"></span> Live Search Engine Active';
        apiNotice.className = 'api-status-pill';
      } else {
        apiNotice.innerHTML = `<i class="fa-solid fa-bolt"></i> Curated Mode (Add API Key for live global search)`;
        apiNotice.className = 'api-status-pill';
      }
      apiNotice.style.display = 'inline-flex';
    }

    let items = data.items || [];

    // Apply active category filter if needed
    if (SoundFlowSearch.currentFilter === 'artists') {
      // Find matching artists
      const matchingArtists = (typeof POPULAR_ARTISTS !== 'undefined' ? POPULAR_ARTISTS : []).filter(a => 
        a.name.toLowerCase().includes(cleanQuery.toLowerCase()) || 
        (a.genre || '').toLowerCase().includes(cleanQuery.toLowerCase())
      );
      if (matchingArtists.length > 0) {
        renderArtistCards(matchingArtists, resultsGrid);
        if (tracksList) tracksList.style.display = 'none';
        if (resultsGrid) resultsGrid.style.display = 'grid';
        if (tracksHeader) tracksHeader.style.display = 'none';
        if (resultsHeader) resultsHeader.textContent = `Artists matching "${cleanQuery}"`;
        return;
      }
      items = items.filter(t => t.artist.toLowerCase().includes(cleanQuery.toLowerCase()));
    } else if (SoundFlowSearch.currentFilter === 'genres') {
      items = items.filter(t => (t.genre || '').toLowerCase().includes(cleanQuery.toLowerCase()));
    }

    if (items.length === 0 && !isLoadMore) {
      if (tracksList) tracksList.innerHTML = '';
      if (resultsGrid) resultsGrid.innerHTML = '';
      if (tracksHeader) tracksHeader.style.display = 'none';
      if (emptyState) {
        emptyState.style.display = 'block';
        const emptyTitle = emptyState.querySelector('.empty-state-title');
        const emptyText = emptyState.querySelector('.empty-state-text');
        if (emptyTitle) emptyTitle.textContent = `No results found for "${cleanQuery}"`;
        if (emptyText) emptyText.textContent = 'Check your spelling or try searching for another artist, song, or genre.';
      }
      return;
    }

    if (!isLoadMore) {
      SoundFlowSearch.currentResults = items;
      if (tracksList) tracksList.innerHTML = '';
      if (resultsGrid) resultsGrid.innerHTML = '';
    } else {
      SoundFlowSearch.currentResults = SoundFlowSearch.currentResults.concat(items);
    }

    // Render into BOTH list and grid views
    renderSearchTracksList(items, tracksList, isLoadMore);
    renderMusicCards(items, resultsGrid, isLoadMore);

    // Update view mode display & tracks header
    updateViewModeUI(SoundFlowSearch.viewMode);

    // Update count
    if (resultsCount) {
      resultsCount.textContent = `${SoundFlowSearch.currentResults.length} tracks found`;
      resultsCount.style.display = 'inline-block';
    }

    // Show or hide Load More button
    if (loadMoreBtn) {
      loadMoreBtn.style.display = data.nextPageToken ? 'inline-flex' : 'none';
    }

  } catch (error) {
    SoundFlowSearch.isLoading = false;
    console.error('[Search] Error during search query:', error);
    if (loadingBanner) loadingBanner.style.display = 'none';
    if (searchIcon) searchIcon.style.display = 'block';
    if (searchSpinner) searchSpinner.style.display = 'none';
    if (tracksHeader) tracksHeader.style.display = 'none';
    if (tracksList && !isLoadMore) tracksList.innerHTML = '';
    if (resultsGrid && !isLoadMore) resultsGrid.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
      const emptyTitle = emptyState.querySelector('.empty-state-title');
      const emptyText = emptyState.querySelector('.empty-state-text');
      if (emptyTitle) emptyTitle.textContent = 'Unable to complete search';
      if (emptyText) emptyText.textContent = error.message || 'Please check your internet connection or verify your search query.';
    }
  }
}

/**
 * Render Search Track List (Spotify style row layout)
 * @param {Array<Object>} tracks
 * @param {HTMLElement} container
 * @param {boolean} append
 */
function renderSearchTracksList(tracks, container, append = false) {
  if (!container) return;
  if (!append) container.innerHTML = '';

  const startIndex = append ? container.children.length : 0;
  const currentPlayingId = (typeof SoundFlowPlayer !== 'undefined' && SoundFlowPlayer.currentTrack) 
    ? (SoundFlowPlayer.currentTrack.videoId || SoundFlowPlayer.currentTrack.id) 
    : null;

  tracks.forEach((track, index) => {
    const row = document.createElement('div');
    const videoId = track.videoId || track.id;
    const isCurrent = currentPlayingId && (currentPlayingId === videoId || currentPlayingId === track.id);

    row.className = `search-track-row ${isCurrent ? 'is-current-playing' : ''}`;
    row.setAttribute('data-id', videoId);

    const isFav = typeof isFavorite === 'function' ? isFavorite(videoId) : false;
    const rawTitle = track.title || 'Unknown Title';
    const rawArtist = track.artist || track.channelTitle || 'Unknown Artist';
    const title = typeof cleanHtmlEntities === 'function' ? cleanHtmlEntities(rawTitle) : rawTitle;
    const artist = typeof cleanHtmlEntities === 'function' ? cleanHtmlEntities(rawArtist) : rawArtist;
    const thumb = getOptimalThumbnail(track);
    const duration = track.duration || '3:30';
    const isApple = track.source === 'itunes';
    const badgeHtml = isApple
      ? `<span class="source-badge spotify" style="position:static; padding:2px 7px; font-size:0.68rem; border-radius:9999px;"><i class="fa-solid fa-music"></i> iTunes</span>`
      : `<span class="source-badge youtube" style="position:static; padding:2px 7px; font-size:0.68rem; border-radius:9999px;"><i class="fa-brands fa-youtube"></i> YouTube</span>`;

    row.innerHTML = `
      <div class="search-track-index">
        <span class="row-index-num" style="${isCurrent ? 'display:none;' : ''}">${startIndex + index + 1}</span>
        <i class="fa-solid fa-play row-hover-play" style="${isCurrent ? 'display:none;' : ''}"></i>
        <div class="row-playing-bars" style="${isCurrent ? 'display:flex;' : 'display:none;'}">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="search-track-thumb-wrap">
        <img src="${thumb}" class="search-track-thumb" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80';" />
        <div class="thumb-play-overlay"><i class="fa-solid fa-play"></i></div>
      </div>
      <div class="search-track-info">
        <div class="search-track-title" title="${title}">${title}</div>
        <div class="search-track-mobile-sub">
          <span class="search-track-artist">${artist}</span>
          <span>•</span>
          <span>${duration}</span>
          ${badgeHtml}
        </div>
      </div>
      <div class="search-track-artist-cell">
        <span class="search-track-artist" title="${artist}">${artist}</span>
        ${badgeHtml}
      </div>
      <div class="search-track-duration">${duration}</div>
      <div class="search-track-actions">
        <button class="search-row-action-btn search-row-play-btn" title="Play Track" aria-label="Play Track">
          <i class="fa-solid fa-play"></i>
        </button>
        <button class="search-row-action-btn search-row-dl-btn" title="Download MP3 Audio" aria-label="Download Audio">
          <i class="fa-solid fa-cloud-arrow-down"></i>
        </button>
        <button class="search-row-action-btn search-row-fav-btn ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" aria-label="Favorite">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <button class="search-row-action-btn search-row-add-btn" title="Add to Playlist" aria-label="Add to Playlist">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    `;

    // Click anywhere on row to play (unless clicking action buttons)
    row.addEventListener('click', (e) => {
      if (e.target.closest('.search-row-dl-btn') || e.target.closest('.search-row-fav-btn') || e.target.closest('.search-row-add-btn')) return;
      if (typeof playTrack === 'function') {
        playTrack(track, SoundFlowSearch.currentResults.length > 0 ? SoundFlowSearch.currentResults : tracks);
      }
    });

    // Dedicated Play button
    const playBtn = row.querySelector('.search-row-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof playTrack === 'function') {
          playTrack(track, SoundFlowSearch.currentResults.length > 0 ? SoundFlowSearch.currentResults : tracks);
        }
      });
    }

    // Download button
    const dlBtn = row.querySelector('.search-row-dl-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof startTrackDownload === 'function') {
          startTrackDownload(track);
        }
      });
    }

    // Favorite button
    const favBtn = row.querySelector('.search-row-fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof toggleFavorite === 'function') {
          const favorited = toggleFavorite(track);
          favBtn.classList.toggle('active', favorited);
          favBtn.innerHTML = favorited 
            ? '<i class="fa-solid fa-heart"></i>' 
            : '<i class="fa-regular fa-heart"></i>';
          if (typeof showToast === 'function') {
            showToast(favorited ? 'Added to Favorites' : 'Removed from Favorites', 'success');
          }
        }
      });
    }

    // Add to playlist button
    const addBtn = row.querySelector('.search-row-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof openAddToPlaylistModal === 'function') {
          openAddToPlaylistModal(track);
        }
      });
    }

    container.appendChild(row);
  });
}
window.renderSearchTracksList = renderSearchTracksList;

/**
 * Render Music Cards into target container (Grid View)
 * @param {Array<Object>} tracks
 * @param {HTMLElement} container
 * @param {boolean} append
 */
function renderMusicCards(tracks, container, append = false) {
  if (!container) return;
  if (!append) container.innerHTML = '';

  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'music-card';
    const videoId = track.videoId || track.id;
    card.setAttribute('data-id', videoId);

    const isFav = typeof isFavorite === 'function' ? isFavorite(videoId) : false;
    const title = track.title || 'Unknown Title';
    const artist = track.artist || track.channelTitle || 'Unknown Artist';
    const thumb = getOptimalThumbnail(track);

    const isApple = track.source === 'itunes';
    const badgeHtml = isApple
      ? `<span class="source-badge spotify"><i class="fa-solid fa-music"></i> iTunes</span>`
      : `<span class="source-badge youtube"><i class="fa-brands fa-youtube"></i> YouTube</span>`;

    card.innerHTML = `
      <div class="card-artwork-wrapper">
        <img src="${thumb}" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';" />
        ${badgeHtml}
        <div class="card-actions-overlay">
          <button class="card-download-btn card-dl-btn" title="Download MP3 Audio" aria-label="Download Audio">
            <i class="fa-solid fa-cloud-arrow-down"></i>
          </button>
          <button class="card-fav-btn ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" aria-label="Favorite">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
          <button class="card-play-btn" title="Play Now" aria-label="Play">
            <i class="fa-solid fa-play"></i>
          </button>
          <button class="card-more-btn add-to-playlist-btn" title="Add to Playlist" aria-label="Add to Playlist">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
      <div class="card-info">
        <h4 class="card-title" title="${title}">${title}</h4>
        <p class="card-subtitle" title="${artist}">${artist}</p>
      </div>
    `;

    // Click to play entire card
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav-btn') || e.target.closest('.add-to-playlist-btn') || e.target.closest('.card-dl-btn')) {
        return;
      }
      if (typeof playTrack === 'function') {
        playTrack(track, SoundFlowSearch.currentResults.length > 0 ? SoundFlowSearch.currentResults : tracks);
      }
    });

    // Download button click
    const dlBtn = card.querySelector('.card-dl-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof startTrackDownload === 'function') {
          startTrackDownload(track);
        }
      });
    }

    // Favorite button click
    const favBtn = card.querySelector('.card-fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof toggleFavorite === 'function') {
          const favorited = toggleFavorite(track);
          favBtn.classList.toggle('active', favorited);
          favBtn.innerHTML = favorited 
            ? '<i class="fa-solid fa-heart"></i>' 
            : '<i class="fa-regular fa-heart"></i>';
          if (typeof showToast === 'function') {
            showToast(favorited ? 'Added to Favorites' : 'Removed from Favorites', 'success');
          }
        }
      });
    }

    // Add to playlist button click
    const addBtn = card.querySelector('.add-to-playlist-btn');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof openAddToPlaylistModal === 'function') {
          openAddToPlaylistModal(track);
        }
      });
    }

    container.appendChild(card);
  });
}
window.renderMusicCards = renderMusicCards;

/**
 * Render Top Artist Match Banner if query matches popular artists
 */
function renderTopArtistMatch(query, container) {
  if (!container) return;
  const val = (query || '').trim().toLowerCase();
  if (val.length < 2) {
    container.style.display = 'none';
    return;
  }

  const artists = typeof POPULAR_ARTISTS !== 'undefined' ? POPULAR_ARTISTS : [];
  const match = artists.find(a => 
    a.name.toLowerCase() === val || 
    a.name.toLowerCase().includes(val) || 
    val.includes(a.name.toLowerCase())
  );

  if (!match) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div class="top-artist-banner">
      <div class="top-artist-left">
        <img src="${match.image}" class="top-artist-avatar" alt="${match.name}">
        <div class="top-artist-info">
          <div class="top-artist-badge-tag"><i class="fa-solid fa-circle-check"></i> Verified Artist</div>
          <div class="top-artist-name">${match.name}</div>
          <div class="top-artist-meta">${match.genre} &bull; ${match.monthlyListeners} Monthly Listeners</div>
        </div>
      </div>
      <div class="top-artist-actions">
        <button class="btn-primary top-artist-play-btn" id="banner-play-artist-btn" style="padding: 10px 20px; font-size: 0.88rem;">
          <i class="fa-solid fa-play"></i> Play Artist
        </button>
        <a href="artist.html?id=${encodeURIComponent(match.id)}" class="btn-secondary" style="padding: 10px 18px; font-size: 0.88rem;">
          View Profile
        </a>
      </div>
    </div>
  `;

  // Attach click to play artist
  const playBtn = container.querySelector('#banner-play-artist-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      // Find tracks by this artist in catalog
      const catalog = typeof CURATED_MUSIC_CATALOG !== 'undefined' ? CURATED_MUSIC_CATALOG : [];
      const artistTracks = catalog.filter(t => t.artist.toLowerCase().includes(match.name.toLowerCase()));
      if (artistTracks.length > 0 && typeof playTrack === 'function') {
        playTrack(artistTracks[0], artistTracks);
      } else if (typeof playTrack === 'function' && SoundFlowSearch.currentResults.length > 0) {
        playTrack(SoundFlowSearch.currentResults[0], SoundFlowSearch.currentResults);
      }
    });
  }
}

/**
 * Render Artist Cards Grid for Artists Filter
 */
function renderArtistCards(artists, container) {
  if (!container) return;
  container.innerHTML = '';

  artists.forEach(artist => {
    const card = document.createElement('div');
    card.className = 'music-card artist-card';
    card.innerHTML = `
      <div class="card-artwork-wrapper" style="border-radius: 50%;">
        <img src="${artist.image}" alt="${artist.name}" style="border-radius: 50%;" />
        <div class="card-actions-overlay">
          <button class="card-play-btn" title="View Artist Profile"><i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
      <div class="card-info" style="text-align: center;">
        <h4 class="card-title">${artist.name}</h4>
        <p class="card-subtitle">${artist.genre} &bull; ${artist.monthlyListeners}</p>
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `artist.html?id=${encodeURIComponent(artist.id)}`;
    });

    container.appendChild(card);
  });
}

/**
 * Render Skeleton Track Rows for List View
 */
function renderSkeletonList(container, count = 8) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'search-track-row skeleton-track-row';
    row.innerHTML = `
      <div class="search-track-index"><div class="skeleton" style="height: 14px; width: 14px; margin: 0 auto; border-radius: 3px;"></div></div>
      <div class="search-track-thumb-wrap skeleton" style="border-radius: 8px;"></div>
      <div class="search-track-info">
        <div class="skeleton" style="height: 15px; width: 75%; margin-bottom: 6px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 11px; width: 45%; border-radius: 4px;"></div>
      </div>
      <div class="search-track-artist-cell">
        <div class="skeleton" style="height: 13px; width: 65%; border-radius: 4px;"></div>
      </div>
      <div class="search-track-duration">
        <div class="skeleton" style="height: 13px; width: 34px; margin: 0 auto; border-radius: 4px;"></div>
      </div>
      <div class="search-track-actions">
        <div class="skeleton" style="height: 36px; width: 36px; border-radius: 50%;"></div>
        <div class="skeleton" style="height: 36px; width: 36px; border-radius: 50%;"></div>
        <div class="skeleton" style="height: 36px; width: 36px; border-radius: 50%;"></div>
      </div>
    `;
    container.appendChild(row);
  }
}

/**
 * Render loading skeleton placeholders for Grid View
 */
function renderSkeletonCards(container, count = 6) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';
    skel.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    `;
    container.appendChild(skel);
  }
}
window.renderSkeletonCards = renderSkeletonCards;

/**
 * Render recent searches chips
 */
function renderRecentSearches() {
  const container = document.getElementById('recent-searches-container');
  if (!container) return;

  if (SoundFlowSearch.recentSearches.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div class="section-header" style="margin-bottom: 12px;">
      <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-secondary);">Recent Searches</h3>
      <button id="clear-recent-searches-btn" style="font-size: 0.8rem; color: var(--text-muted); cursor: pointer; background:none; border:none;">Clear All</button>
    </div>
    <div class="filter-chips-bar" style="margin-bottom: 24px; justify-content: flex-start;">
      ${SoundFlowSearch.recentSearches.map(term => `
        <button class="chip recent-chip" data-query="${term}">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 0.75rem; margin-right: 6px;"></i> ${term}
        </button>
      `).join('')}
    </div>
  `;

  // Attach click to recent chips
  container.querySelectorAll('.recent-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const term = chip.getAttribute('data-query');
      const searchInput = document.getElementById('main-search-input');
      if (searchInput) searchInput.value = term;
      executeSearch(term);
    });
  });

  // Clear recent searches button
  const clearRecentBtn = document.getElementById('clear-recent-searches-btn');
  if (clearRecentBtn) {
    clearRecentBtn.addEventListener('click', () => {
      SoundFlowSearch.recentSearches = [];
      setStorageItem('soundflow_recent_searches', []);
      renderRecentSearches();
    });
  }
}

/**
 * Save new search query to recent searches list
 */
function saveRecentSearch(query) {
  if (!query) return;
  let list = SoundFlowSearch.recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
  list.unshift(query);
  if (list.length > 8) list = list.slice(0, 8);
  SoundFlowSearch.recentSearches = list;
  setStorageItem('soundflow_recent_searches', list);
}

/**
 * Load default search recommendations
 */
function loadSearchRecommendations() {
  const tracksList = document.getElementById('search-tracks-list');
  const resultsGrid = document.getElementById('search-results-grid');
  const resultsHeader = document.getElementById('search-results-header');
  const resultsCount = document.getElementById('search-results-count');
  const topArtistContainer = document.getElementById('search-top-artist-container');

  if (topArtistContainer) topArtistContainer.style.display = 'none';
  if (resultsHeader) resultsHeader.textContent = 'Recommended For You';
  if (resultsCount) resultsCount.style.display = 'none';

  const defaultItems = (typeof CURATED_MUSIC_CATALOG !== 'undefined' ? CURATED_MUSIC_CATALOG : []).slice(0, 10);
  SoundFlowSearch.currentResults = defaultItems;

  if (tracksList) {
    renderSearchTracksList(defaultItems, tracksList);
  }
  if (resultsGrid) {
    renderMusicCards(defaultItems, resultsGrid);
  }

  updateViewModeUI(SoundFlowSearch.viewMode);
}

/**
 * Render real-time related search suggestions list under main search input
 * @param {string} query
 */
function renderLiveSearchSuggestions(query) {
  const container = document.getElementById('main-search-suggestions');
  if (!container) return;

  const val = (query || '').trim().toLowerCase();
  if (val.length < 1) {
    hideLiveSearchSuggestions();
    return;
  }

  // 1. Match songs from Curated catalog
  const matchingSongs = (typeof CURATED_MUSIC_CATALOG !== 'undefined' ? CURATED_MUSIC_CATALOG : []).filter(item => 
    item.title.toLowerCase().includes(val) || 
    item.artist.toLowerCase().includes(val)
  ).slice(0, 5);

  // 2. Match artists from Popular Artists
  const matchingArtists = (typeof POPULAR_ARTISTS !== 'undefined' ? POPULAR_ARTISTS : []).filter(art => 
    art.name.toLowerCase().includes(val) || 
    (art.genre || '').toLowerCase().includes(val)
  ).slice(0, 3);

  if (matchingSongs.length === 0 && matchingArtists.length === 0) {
    hideLiveSearchSuggestions();
    return;
  }

  let html = '';

  if (matchingSongs.length > 0) {
    html += `<div class="suggestions-group-title"><i class="fa-solid fa-music"></i> Related Songs</div>`;
    matchingSongs.forEach(song => {
      const thumb = getOptimalThumbnail(song);
      html += `
        <div class="suggestion-item" data-id="${song.videoId || song.id}">
          <img src="${thumb}" class="suggestion-thumb" alt="${song.title}" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'" />
          <div class="suggestion-info">
            <div class="suggestion-title">${song.title}</div>
            <div class="suggestion-subtitle">${song.artist}</div>
          </div>
          <button class="table-btn suggestion-dl-btn" data-id="${song.videoId || song.id}" title="Download MP3 Audio" style="margin-right: 4px;">
            <i class="fa-solid fa-cloud-arrow-down"></i>
          </button>
          <div class="suggestion-play-icon"><i class="fa-solid fa-play"></i></div>
        </div>
      `;
    });
  }

  if (matchingArtists.length > 0) {
    html += `<div class="suggestions-group-title"><i class="fa-solid fa-user"></i> Related Artists</div>`;
    matchingArtists.forEach(art => {
      html += `
        <div class="suggestion-item artist-suggest-item" data-artist-id="${art.id}">
          <img src="${art.image}" class="suggestion-thumb" style="border-radius: 50%;" alt="${art.name}" />
          <div class="suggestion-info">
            <div class="suggestion-title">${art.name}</div>
            <div class="suggestion-subtitle">${art.genre} &bull; ${art.monthlyListeners} Listeners</div>
          </div>
          <div class="suggestion-play-icon" style="color: var(--text-secondary);"><i class="fa-solid fa-arrow-right"></i></div>
        </div>
      `;
    });
  }

  // Footer item to search all
  html += `
    <div class="suggestions-footer-action" id="suggestions-view-all-btn">
      <span>Search all results for "<strong>${val}</strong>"</span>
      <i class="fa-solid fa-magnifying-glass"></i>
    </div>
  `;

  container.innerHTML = html;
  container.classList.add('active');

  // Bind clicks for songs
  container.querySelectorAll('.suggestion-item:not(.artist-suggest-item)').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.suggestion-dl-btn')) return;
      const vid = el.getAttribute('data-id');
      const track = matchingSongs.find(t => (t.videoId === vid || t.id === vid));
      if (track && typeof playTrack === 'function') {
        playTrack(track);
      }
      hideLiveSearchSuggestions();
    });
  });

  // Bind download buttons inside suggestions
  container.querySelectorAll('.suggestion-dl-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vid = btn.getAttribute('data-id');
      const track = matchingSongs.find(t => (t.videoId === vid || t.id === vid));
      if (track && typeof startTrackDownload === 'function') {
        startTrackDownload(track);
      }
    });
  });

  // Bind clicks for artists
  container.querySelectorAll('.artist-suggest-item').forEach(el => {
    el.addEventListener('click', () => {
      const artId = el.getAttribute('data-artist-id');
      window.location.href = `artist.html?id=${encodeURIComponent(artId)}`;
    });
  });

  // Bind view all
  const viewAllBtn = container.querySelector('#suggestions-view-all-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      hideLiveSearchSuggestions();
      executeSearch(val);
    });
  }
}

/**
 * Hide related search suggestions dropdown
 */
function hideLiveSearchSuggestions() {
  const container = document.getElementById('main-search-suggestions');
  if (container) {
    container.classList.remove('active');
  }
}

/**
 * Update UI state of filter chips
 */
function updateFilterChipUI(activeFilter) {
  document.querySelectorAll('.filter-chips-bar .chip').forEach(chip => {
    const f = chip.getAttribute('data-filter');
    chip.classList.toggle('active', f === activeFilter);
  });
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#main-search-input') && !e.target.closest('#main-search-suggestions')) {
    hideLiveSearchSuggestions();
  }
});

// Real-time synchronization when active playing track changes
window.addEventListener('soundflow:trackChanged', (e) => {
  const track = e.detail && e.detail.track;
  if (!track) return;
  const currentId = track.videoId || track.id;
  const rows = document.querySelectorAll('.search-track-row');
  rows.forEach(row => {
    const rowId = row.getAttribute('data-id');
    const isCurrent = (rowId === currentId);
    row.classList.toggle('is-current-playing', isCurrent);
    const indexNum = row.querySelector('.row-index-num');
    const hoverPlay = row.querySelector('.row-hover-play');
    const playingBars = row.querySelector('.row-playing-bars');
    if (indexNum && playingBars) {
      if (isCurrent) {
        indexNum.style.display = 'none';
        if (hoverPlay) hoverPlay.style.display = 'none';
        playingBars.style.display = 'flex';
      } else {
        indexNum.style.display = '';
        if (hoverPlay) hoverPlay.style.display = '';
        playingBars.style.display = 'none';
      }
    }
  });
});

// Auto-run if on search page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('main-search-input') || document.getElementById('search-tracks-list') || document.getElementById('search-results-grid')) {
    initSearchPage();
  }
});
