/**
 * Firebase Authentication Service for InsightDeck.
 * Uses official Firebase Authentication REST API:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

const STORAGE_USER_KEY = 'insightdeck_auth_user';
const STORAGE_TOKEN_KEY = 'insightdeck_auth_token';

// Read Firebase config from environment variables
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const listeners = new Set();

function notifyListeners(user) {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error('Auth state listener error:', e);
    }
  });
}

function checkFirebaseConfig() {
  if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
    throw new Error(
      'Firebase Authentication is not configured. Please set VITE_FIREBASE_API_KEY in your frontend environment variables (.env).'
    );
  }
}

/**
 * Gets currently logged in user session from localStorage.
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Gets the current Firebase ID token.
 */
export function getIdToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY) || '';
}

/**
 * Signs up a new user with Name, Email, and Password via Firebase Authentication.
 */
export async function signUp(name, email, password) {
  checkFirebaseConfig();
  const cleanEmail = email.trim().toLowerCase();

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_CONFIG.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEmail,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || 'Signup failed';
    throw new Error(formatFirebaseError(msg));
  }

  // Update displayName if provided
  let displayName = name ? name.trim() : cleanEmail.split('@')[0];
  if (name && data.idToken) {
    try {
      const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_CONFIG.apiKey}`;
      await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: data.idToken,
          displayName,
          returnSecureToken: false,
        }),
      });
    } catch {
      // Non-critical: continue even if displayName update fails
    }
  }

  const user = {
    uid: data.localId,
    email: data.email,
    displayName,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  localStorage.setItem(STORAGE_TOKEN_KEY, data.idToken);
  notifyListeners(user);
  return user;
}

/**
 * Signs in an existing user with Email and Password via Firebase Authentication.
 */
export async function signIn(email, password) {
  checkFirebaseConfig();
  const cleanEmail = email.trim().toLowerCase();

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEmail,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || 'Login failed';
    throw new Error(formatFirebaseError(msg));
  }

  const user = {
    uid: data.localId,
    email: data.email,
    displayName: data.displayName || cleanEmail.split('@')[0],
  };

  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  localStorage.setItem(STORAGE_TOKEN_KEY, data.idToken);
  notifyListeners(user);
  return user;
}

/**
 * Signs out the current user and clears session tokens.
 */
export function signOut() {
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  notifyListeners(null);
}

/**
 * Subscribes to auth state changes.
 */
export function onAuthStateChanged(callback) {
  listeners.add(callback);
  callback(getCurrentUser());
  return () => listeners.delete(callback);
}

function formatFirebaseError(msg) {
  if (msg.includes('EMAIL_EXISTS')) return 'An account with this email address already exists.';
  if (
    msg.includes('INVALID_LOGIN_CREDENTIALS') ||
    msg.includes('EMAIL_NOT_FOUND') ||
    msg.includes('INVALID_PASSWORD')
  ) {
    return 'Invalid email or password. Please try again.';
  }
  if (msg.includes('USER_DISABLED')) return 'This user account has been disabled.';
  if (msg.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) return 'Too many attempts. Please try again later.';
  if (msg.includes('WEAK_PASSWORD')) return 'Password should be at least 6 characters.';
  return msg.replace(/_/g, ' ').toLowerCase();
}
