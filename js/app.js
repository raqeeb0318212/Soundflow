/**
 * ==============================================================================
 * SoundFlow - Main Application Controller (app.js)
 * ==============================================================================
 * Handles global navigation, modals (Auth, Settings, About), toast messages,
 * header search redirects, and cross-component event coordination.
 * ==============================================================================
 */

/**
 * Toast Notification System
 * @param {string} message - Text to display
 * @param {'info'|'success'|'error'} type - Style category
 * @param {number} duration - Milliseconds before fade out
 */
function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger CSS transition
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Global Navigation & Active States
 */
function initNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.sidebar .nav-link, .mobile-bottom-nav .mobile-nav-item');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Match root index or specific filename
    const isHome = (currentPath === '/' || currentPath.endsWith('index.html')) && (href === 'index.html' || href === './' || href === '/');
    const isMatch = isHome || (currentPath.includes(href) && href !== 'index.html');

    if (isMatch) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update Favorites badge count in sidebar
  updateSidebarCounts();
}

/**
 * Update dynamic counts in sidebar (Favorites and Playlists)
 */
function updateSidebarCounts() {
  const favBadge = document.getElementById('sidebar-fav-count');
  const plBadge = document.getElementById('sidebar-pl-count');

  if (favBadge && typeof getFavorites === 'function') {
    favBadge.textContent = getFavorites().length;
  }
  if (plBadge && typeof getPlaylists === 'function') {
    plBadge.textContent = getPlaylists().length;
  }
}

/**
 * Header Quick Search Bar Handler
 */
function initHeaderSearch() {
  const headerSearchInput = document.getElementById('header-search-input');
  const headerSearchClear = document.getElementById('header-search-clear');
  const suggestionsDropdown = document.getElementById('header-search-suggestions');

  if (!headerSearchInput) return;

  // On Mobile: tuck away player & bottom nav when searching so user can see clearly what they are typing
  headerSearchInput.addEventListener('focus', () => {
    document.body.classList.add('is-searching');
    document.body.classList.add('keyboard-open');
  });

  headerSearchInput.addEventListener('blur', () => {
    setTimeout(() => {
      document.body.classList.remove('is-searching');
      document.body.classList.remove('keyboard-open');
    }, 300);
  });

  headerSearchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (headerSearchClear) {
      headerSearchClear.style.display = val.length > 0 ? 'block' : 'none';
    }

    if (val.length > 0 && suggestionsDropdown) {
      // 1. Filter songs from curated library
      const matchedSongs = (typeof CURATED_MUSIC_CATALOG !== 'undefined' ? CURATED_MUSIC_CATALOG : []).filter(item => 
        item.title.toLowerCase().includes(val.toLowerCase()) || 
        item.artist.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 4);

      // 2. Filter artists
      const matchedArtists = (typeof POPULAR_ARTISTS !== 'undefined' ? POPULAR_ARTISTS : []).filter(item =>
        item.name.toLowerCase().includes(val.toLowerCase()) ||
        item.genre.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 2);

      if (matchedSongs.length > 0 || matchedArtists.length > 0) {
        let listHtml = '';
        
        if (matchedSongs.length > 0) {
          listHtml += `<div class="suggestions-group-title"><i class="fa-solid fa-music"></i> Songs</div>`;
          matchedSongs.forEach(m => {
            const thumb = m.thumbnail || (m.videoId ? `https://i.ytimg.com/vi/${m.videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80');
            listHtml += `
              <div class="suggestion-item" data-id="${m.videoId}">
                <img src="${thumb}" class="suggestion-thumb" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'" />
                <div class="suggestion-info">
                  <div class="suggestion-title">${m.title}</div>
                  <div class="suggestion-subtitle">${m.artist}</div>
                </div>
                <button class="table-btn header-dl-btn" data-id="${m.videoId}" title="Download MP3 Audio" style="margin-right: 6px;">
                  <i class="fa-solid fa-cloud-arrow-down"></i>
                </button>
                <div class="suggestion-play-icon"><i class="fa-solid fa-play"></i></div>
              </div>
            `;
          });
        }

        if (matchedArtists.length > 0) {
          listHtml += `<div class="suggestions-group-title"><i class="fa-solid fa-user"></i> Artists</div>`;
          matchedArtists.forEach(a => {
            listHtml += `
              <div class="suggestion-item artist-suggest-link" data-artist-id="${a.id}">
                <img src="${a.image}" class="suggestion-thumb" style="border-radius: 50%;" />
                <div class="suggestion-info">
                  <div class="suggestion-title">${a.name}</div>
                  <div class="suggestion-subtitle">${a.genre} &bull; ${a.monthlyListeners} Listeners</div>
                </div>
                <div class="suggestion-play-icon"><i class="fa-solid fa-arrow-right"></i></div>
              </div>
            `;
          });
        }

        listHtml += `
          <div class="suggestions-footer-action" id="header-search-view-all">
            <span>Search all for "<strong>${val}</strong>"</span>
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
        `;

        suggestionsDropdown.innerHTML = listHtml;

        suggestionsDropdown.querySelectorAll('.suggestion-item:not(.artist-suggest-link)').forEach(el => {
          el.addEventListener('click', (ev) => {
            if (ev.target.closest('.header-dl-btn')) return;
            const vid = el.getAttribute('data-id');
            const track = CURATED_MUSIC_CATALOG.find(t => t.videoId === vid);
            if (track && typeof playTrack === 'function') {
              playTrack(track);
            }
            suggestionsDropdown.classList.remove('active');
          });
        });

        suggestionsDropdown.querySelectorAll('.header-dl-btn').forEach(btn => {
          btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const vid = btn.getAttribute('data-id');
            const track = CURATED_MUSIC_CATALOG.find(t => t.videoId === vid);
            if (track && typeof startTrackDownload === 'function') {
              startTrackDownload(track);
            }
          });
        });

        suggestionsDropdown.querySelectorAll('.artist-suggest-link').forEach(el => {
          el.addEventListener('click', () => {
            const aId = el.getAttribute('data-artist-id');
            window.location.href = `artist.html?id=${encodeURIComponent(aId)}`;
          });
        });

        const viewAll = suggestionsDropdown.querySelector('#header-search-view-all');
        if (viewAll) {
          viewAll.addEventListener('click', () => {
            window.location.href = `search.html?q=${encodeURIComponent(val)}`;
          });
        }

        suggestionsDropdown.classList.add('active');
      } else {
        suggestionsDropdown.classList.remove('active');
      }
    } else if (suggestionsDropdown) {
      suggestionsDropdown.classList.remove('active');
    }
  });

  // Enter triggers redirect to search page with query parameter
  headerSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = headerSearchInput.value.trim();
      if (q) {
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    }
  });

  if (headerSearchClear) {
    headerSearchClear.addEventListener('click', () => {
      headerSearchInput.value = '';
      headerSearchClear.style.display = 'none';
      if (suggestionsDropdown) suggestionsDropdown.classList.remove('active');
    });
  }

  // Close suggestions if clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container') && suggestionsDropdown) {
      suggestionsDropdown.classList.remove('active');
    }
  });
}

/**
 * Mobile Sidebar Drawer Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (toggleBtn && sidebar && backdrop) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }
}

/**
 * Settings Modal Setup
 */
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const openBtns = document.querySelectorAll('.open-settings-btn, #api-status-badge');
  const closeBtn = document.getElementById('close-settings-modal');
  const saveBtn = document.getElementById('save-settings-btn');
  const apiKeyInput = document.getElementById('settings-yt-api-key');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = typeof getSettings === 'function' ? getSettings() : {};
      if (apiKeyInput) apiKeyInput.value = current.youtubeApiKey || '';
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const keyVal = apiKeyInput ? apiKeyInput.value.trim() : '';
      if (typeof saveSettings === 'function') {
        saveSettings({ youtubeApiKey: keyVal });
        showToast('Settings saved successfully!', 'success');
        modal.classList.remove('active');

        // Update API status badge in header
        const badge = document.getElementById('api-status-badge');
        if (badge) {
          if (keyVal) {
            badge.innerHTML = '<span class="status-dot"></span><span>API Key Connected</span>';
          } else {
            badge.innerHTML = '<i class="fa-solid fa-bolt"></i><span>Curated Library Mode</span>';
          }
        }
      }
    });
  }
}

/**
 * About & Legal Notice Modal Setup
 */
function initAboutModal() {
  const modal = document.getElementById('about-modal');
  const openBtns = document.querySelectorAll('.open-about-btn');
  const closeBtn = document.getElementById('close-about-modal');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('active'));
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
}

/**
 * Authentication Modal (Login / Sign Up / User Profile)
 */
function initAuthModal() {
  const modal = document.getElementById('auth-modal');
  const profileBtn = document.getElementById('user-profile-btn');
  const closeBtn = document.getElementById('close-auth-modal');
  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabRegister = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-form');
  const userProfileCard = document.getElementById('user-profile-card');
  const logoutBtn = document.getElementById('auth-logout-btn');

  if (!modal) return;

  // Open modal on avatar/profile button click
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      if (currentUser) {
        // Show profile details
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (userProfileCard) {
          userProfileCard.style.display = 'block';
          const pName = document.getElementById('profile-card-name');
          const pEmail = document.getElementById('profile-card-email');
          const pAvatar = document.getElementById('profile-card-avatar');
          if (pName) pName.textContent = currentUser.name;
          if (pEmail) pEmail.textContent = currentUser.email;
          if (pAvatar) pAvatar.src = currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80';
        }
      } else {
        // Show login form
        if (userProfileCard) userProfileCard.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
      }
      modal.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  // Switch between Login and Register tabs
  if (authTabLogin && authTabRegister) {
    authTabLogin.addEventListener('click', () => {
      authTabLogin.classList.add('active');
      authTabRegister.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
    });

    authTabRegister.addEventListener('click', () => {
      authTabRegister.classList.add('active');
      authTabLogin.classList.remove('active');
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value;
      const pass = document.getElementById('login-password')?.value;
      if (typeof loginUser === 'function') {
        const result = await loginUser(email, pass);
        if (result.success) {
          showToast(result.message, 'success');
          updateUserUI(result.user);
          modal.classList.remove('active');
        } else {
          showToast(result.message, 'error');
        }
      }
    });
  }

  // Register Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name')?.value;
      const email = document.getElementById('reg-email')?.value;
      const pass = document.getElementById('reg-password')?.value;
      if (typeof registerUser === 'function') {
        const result = await registerUser(name, email, pass);
        if (result.success) {
          showToast(result.message, 'success');
          updateUserUI(result.user);
          modal.classList.remove('active');
        } else {
          showToast(result.message, 'error');
        }
      }
    });
  }

  // Logout Button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof logoutUser === 'function') {
        logoutUser();
        updateUserUI(null);
        modal.classList.remove('active');
        showToast('Signed out successfully', 'info');
      }
    });
  }

  // Update UI on initial load
  const initialUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  updateUserUI(initialUser);
}

/**
 * Update top header user avatar and name
 */
function updateUserUI(user) {
  const avatarEl = document.getElementById('header-user-avatar');
  const nameEl = document.getElementById('header-user-name');

  if (!user) {
    if (avatarEl) avatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';
    if (nameEl) nameEl.textContent = 'Sign In';
  } else {
    if (avatarEl) {
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
      } else {
        avatarEl.textContent = user.initials || 'U';
      }
    }
    if (nameEl) nameEl.textContent = user.name;
  }
}

/**
 * Recently Played Drawer
 */
function initRecentlyPlayedDrawer() {
  const drawer = document.getElementById('recently-played-modal');
  const openBtns = document.querySelectorAll('.open-history-btn');
  const closeBtn = document.getElementById('close-history-modal');
  const listContainer = document.getElementById('history-tracks-list');
  const clearBtn = document.getElementById('clear-history-action');

  if (!drawer) return;

  function renderHistory() {
    if (!listContainer || typeof getRecentlyPlayed !== 'function') return;
    const history = getRecentlyPlayed(25);
    listContainer.innerHTML = '';

    if (history.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding: 40px 0; color: var(--text-muted);">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 2.5rem; margin-bottom: 12px; display: block;"></i>
          No recently played tracks. Start listening to music!
        </div>
      `;
      return;
    }

    history.forEach((track) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.style.justifyContent = 'space-between';

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
          <img src="${track.thumbnail}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; flex-shrink: 0;" />
          <div style="min-width: 0;">
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">${track.artist}</div>
          </div>
        </div>
        <button class="btn-primary" style="padding: 6px 14px; font-size: 0.8rem; flex-shrink: 0;">
          <i class="fa-solid fa-play"></i> Play
        </button>
      `;

      item.querySelector('button').addEventListener('click', () => {
        if (typeof playTrack === 'function') {
          playTrack(track, history);
          drawer.classList.remove('active');
        }
      });

      listContainer.appendChild(item);
    });
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      renderHistory();
      drawer.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('active'));
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (typeof clearRecentlyPlayed === 'function') {
        clearRecentlyPlayed();
        renderHistory();
        showToast('Playback history cleared', 'info');
      }
    });
  }
}

// Bootstrap all listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderSearch();
  initMobileMenu();
  initSettingsModal();
  initAboutModal();
  initAuthModal();
  initRecentlyPlayedDrawer();
  initDownloadsIntegration();

  // Listen for storage events to keep sidebar counts synchronized
  window.addEventListener('soundflow:favoritesUpdated', updateSidebarCounts);
  window.addEventListener('soundflow:playlistsUpdated', updateSidebarCounts);
});

/**
 * Downloads UI and Mobile Viewport Integration
 */
function initDownloadsIntegration() {
  // 1. Hook up all Open Downloads buttons (sidebar, mobile nav, header)
  document.querySelectorAll('.open-downloads-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof openDownloadsPanel === 'function') {
        openDownloadsPanel();
      }
    });
  });

  // 2. Hook up player download button
  const playerDlBtn = document.getElementById('player-download-btn');
  if (playerDlBtn) {
    playerDlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = typeof getCurrentTrack === 'function' ? getCurrentTrack() : null;
      if (current && typeof startTrackDownload === 'function') {
        startTrackDownload(current);
      } else if (typeof showToast === 'function') {
        showToast('Play a track first to download it', 'info');
      }
    });
  }

  // 3. Auto-detect software keyboard on mobile using visualViewport
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
      if (isKeyboard) {
        document.body.classList.add('keyboard-open');
      } else {
        const active = document.activeElement;
        const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!isTyping) {
          document.body.classList.remove('keyboard-open');
          document.body.classList.remove('is-searching');
        }
      }
    });
  }
}

/**
 * Global Music Card Renderer Utility
 * Accessible application-wide for Home, Trending, Genres, and Search grids
 */
if (typeof window.renderMusicCards !== 'function') {
  window.renderMusicCards = function(tracks, container, append = false) {
    if (!container) return;
    if (!append) container.innerHTML = '';

    (tracks || []).forEach(track => {
      const card = document.createElement('div');
      card.className = 'music-card';
      card.setAttribute('data-id', track.id || track.videoId);

      const videoId = track.videoId || track.id;
      const isFav = typeof isFavorite === 'function' ? isFavorite(videoId) : false;
      const title = track.title || 'Unknown Title';
      const artist = track.artist || track.channelTitle || 'Unknown Artist';
      
      let thumb = track.thumbnail;
      if (!thumb || thumb.includes('unsplash.com')) {
        if (videoId && !videoId.startsWith('itunes_') && videoId.length === 11) {
          thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        } else {
          thumb = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';
        }
      }

      const isApple = track.source === 'itunes';
      const badgeHtml = isApple
        ? `<span class="source-badge spotify"><i class="fa-solid fa-music"></i> iTunes</span>`
        : `<span class="source-badge youtube"><i class="fa-brands fa-youtube"></i> YouTube</span>`;

      card.innerHTML = `
        <div class="card-artwork-wrapper">
          <img src="${thumb}" alt="${title}" loading="lazy" onerror="if(this.src!=='https://i.ytimg.com/vi/${videoId}/hqdefault.jpg'&&'${videoId}'.length===11){this.src='https://i.ytimg.com/vi/${videoId}/hqdefault.jpg';}" />
          ${badgeHtml}
          <div class="card-actions-overlay">
            <button class="card-fav-btn ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" aria-label="Favorite">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <button class="card-play-btn" title="Play Now" aria-label="Play">
              <i class="fa-solid fa-play"></i>
            </button>
            <button class="card-download-btn card-dl-btn" title="Download MP3 Audio" aria-label="Download Audio">
              <i class="fa-solid fa-cloud-arrow-down"></i>
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

      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-fav-btn') || e.target.closest('.add-to-playlist-btn') || e.target.closest('.card-dl-btn')) {
          return;
        }
        if (typeof playTrack === 'function') {
          playTrack(track, tracks);
        }
      });

      const dlBtn = card.querySelector('.card-dl-btn');
      if (dlBtn) {
        dlBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof startTrackDownload === 'function') {
            startTrackDownload(track);
          }
        });
      }

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
  };
}

if (typeof window.renderSkeletonCards !== 'function') {
  window.renderSkeletonCards = function(container, count = 6) {
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
  };
}
