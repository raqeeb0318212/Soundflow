/**
 * ==============================================================================
 * SoundFlow - Authentication & User Database (auth.js)
 * ==============================================================================
 * This module provides authentication and user database management for SoundFlow.
 * 
 * Features:
 * - User Registration & Password Verification
 * - Session Management (Sign In / Sign Out)
 * - User Profile with Custom Avatars
 * - Per-User Database Isolation (each user has their own playlists & favorites)
 * - Cloud Database & Firebase Ready: Easy toggle to connect cloud Firestore & Auth.
 * 
 * CS Student Notes:
 * In a static frontend application without a custom Node.js server, we use
 * a client-side database stored securely in localStorage with JSON schemas.
 * For production, this module can be linked directly to Firebase Authentication
 * and Google Cloud Firestore.
 * ==============================================================================
 */

const AUTH_STORAGE_KEYS = {
  USERS_DB: 'soundflow_users_db',
  CURRENT_SESSION: 'soundflow_current_session'
};

/**
 * Initialize default users database with a demo account if empty
 */
function initUsersDatabase() {
  const users = getStorageItem(AUTH_STORAGE_KEYS.USERS_DB, null);
  if (!users) {
    const demoUser = {
      id: 'usr-demo-001',
      name: 'Alex Rivera',
      email: 'demo@soundflow.app',
      passwordHash: btoa('soundflow123'), // Base64 encoding for student-level demo safety
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
      initials: 'AR',
      bio: 'Music explorer & CS student. Lover of synthwave and indie rock.',
      createdAt: new Date().toISOString(),
      playlists: [],
      favorites: []
    };
    setStorageItem(AUTH_STORAGE_KEYS.USERS_DB, [demoUser]);
    
    // Automatically login demo user if not logged in
    if (!localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_SESSION)) {
      setStorageItem(AUTH_STORAGE_KEYS.CURRENT_SESSION, {
        userId: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        avatar: demoUser.avatar,
        initials: demoUser.initials,
        token: 'token-' + Date.now()
      });
    }
  }
}

/**
 * Get current active session
 * @returns {Object|null}
 */
function getCurrentUser() {
  initUsersDatabase();
  return getStorageItem(AUTH_STORAGE_KEYS.CURRENT_SESSION, null);
}

/**
 * Register a new user account
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {string} avatar 
 * @returns {Promise<{success: boolean, message: string, user?: Object}>}
 */
async function registerUser(name, email, password, avatar = '') {
  initUsersDatabase();
  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }
  
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }
  
  const cleanEmail = email.toLowerCase().trim();
  const users = getStorageItem(AUTH_STORAGE_KEYS.USERS_DB, []);
  
  if (users.some(u => u.email === cleanEmail)) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  
  const nameParts = name.trim().split(' ');
  const initials = nameParts.length > 1 
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
    
  const newUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    email: cleanEmail,
    passwordHash: btoa(password),
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    initials: initials,
    bio: 'SoundFlow music listener',
    createdAt: new Date().toISOString(),
    playlists: [],
    favorites: []
  };
  
  users.push(newUser);
  setStorageItem(AUTH_STORAGE_KEYS.USERS_DB, users);
  
  // Automatically create session
  const session = {
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    avatar: newUser.avatar,
    initials: newUser.initials,
    token: 'token-' + Date.now()
  };
  setStorageItem(AUTH_STORAGE_KEYS.CURRENT_SESSION, session);
  
  window.dispatchEvent(new CustomEvent('soundflow:authChanged', { detail: { user: session } }));
  return { success: true, message: 'Account created successfully!', user: session };
}

/**
 * Sign In with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, message: string, user?: Object}>}
 */
async function loginUser(email, password) {
  initUsersDatabase();
  if (!email || !password) {
    return { success: false, message: 'Please enter your email and password.' };
  }
  
  const cleanEmail = email.toLowerCase().trim();
  const users = getStorageItem(AUTH_STORAGE_KEYS.USERS_DB, []);
  const user = users.find(u => u.email === cleanEmail);
  
  if (!user) {
    return { success: false, message: 'Invalid email address or user not found.' };
  }
  
  if (user.passwordHash !== btoa(password)) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }
  
  const session = {
    userId: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    initials: user.initials,
    token: 'token-' + Date.now()
  };
  
  setStorageItem(AUTH_STORAGE_KEYS.CURRENT_SESSION, session);
  window.dispatchEvent(new CustomEvent('soundflow:authChanged', { detail: { user: session } }));
  return { success: true, message: 'Welcome back, ' + user.name + '!', user: session };
}

/**
 * Sign Out current user
 */
function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_SESSION);
  window.dispatchEvent(new CustomEvent('soundflow:authChanged', { detail: { user: null } }));
}

/**
 * Update user profile details
 * @param {Object} updates 
 * @returns {boolean}
 */
function updateUserProfile(updates) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const users = getStorageItem(AUTH_STORAGE_KEYS.USERS_DB, []);
  const userIndex = users.findIndex(u => u.id === currentUser.userId);
  if (userIndex === -1) return false;
  
  if (updates.name) users[userIndex].name = updates.name.trim();
  if (updates.avatar) users[userIndex].avatar = updates.avatar.trim();
  if (updates.bio) users[userIndex].bio = updates.bio.trim();
  
  setStorageItem(AUTH_STORAGE_KEYS.USERS_DB, users);
  
  currentUser.name = users[userIndex].name;
  currentUser.avatar = users[userIndex].avatar;
  setStorageItem(AUTH_STORAGE_KEYS.CURRENT_SESSION, currentUser);
  
  window.dispatchEvent(new CustomEvent('soundflow:authChanged', { detail: { user: currentUser } }));
  return true;
}

// Initial bootstrap
initUsersDatabase();
