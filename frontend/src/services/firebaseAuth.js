/**
 * Firebase Authentication Module for InsightDeck.
 * Uses official Firebase Modular SDK (v11+):
 * - initializeApp()
 * - getAuth()
 * - createUserWithEmailAndPassword()
 * - signInWithEmailAndPassword()
 * - onAuthStateChanged()
 * - signOut()
 * - updateProfile()
 *
 * Reads strictly from Vite environment variables:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

/**
 * Validates and retrieves Firebase configuration from Vite environment variables.
 * Never logs raw secrets or tokens.
 */
export function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
  const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';

  const missingKeys = [];
  if (!apiKey || apiKey === 'YOUR_API_KEY') missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!storageBucket) missingKeys.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missingKeys.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missingKeys.push('VITE_FIREBASE_APP_ID');

  const isConfigured = missingKeys.length === 0;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    missingKeys,
    isConfigured,
  };
}

const config = getFirebaseConfig();

let app = null;
let auth = null;

try {
  if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
  } else if (config.apiKey && config.projectId) {
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
    auth = getAuth(app);
  }
} catch (initErr) {
  console.error('[InsightDeck Firebase] Initialization error:', initErr.message);
}

// In-memory cached token to provide synchronous getIdToken() for api.js
let cachedIdToken = '';

/**
 * Formats Firebase errors into user-friendly and actionable messages.
 */
export function formatFirebaseError(error) {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';
  const msg = error.message || '';

  if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found')) {
    return 'Firebase Email/Password provider is not enabled. In Firebase Console → Authentication → Sign-in method, click "Email/Password" and enable it.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    msg.includes('INVALID_LOGIN_CREDENTIALS')
  ) {
    return 'Invalid email address or password. Please verify your credentials.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/user-disabled') {
    return 'This account has been disabled. Please contact support.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many unsuccessful attempts. Access temporarily restricted. Try again later.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Please check your internet connection.';
  }
  if (code === 'auth/api-key-not-valid') {
    return 'Firebase API key is invalid. Please check VITE_FIREBASE_API_KEY in frontend/.env.';
  }

  return (
    msg
      .replace(/^Firebase:\s*/i, '')
      .replace(/\(auth\/[^)]+\)\.?/i, '')
      .trim() || 'Authentication failed.'
  );
}

/**
 * Signs up a new user with real Firebase Authentication methods.
 */
export async function signUp(name, email, password) {
  if (!auth) {
    const missing = getFirebaseConfig().missingKeys;
    throw new Error(
      missing.length > 0
        ? `Firebase Authentication is not configured. Missing in frontend/.env: ${missing.join(', ')}`
        : 'Firebase Authentication is not initialized. Please check your Firebase settings in frontend/.env.'
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = userCredential.user;

    if (name && name.trim()) {
      try {
        await updateProfile(firebaseUser, { displayName: name.trim() });
      } catch (profileErr) {
        console.warn('Could not set displayName:', profileErr);
      }
    }

    try {
      cachedIdToken = await firebaseUser.getIdToken();
    } catch {
      // ignore
    }

    return firebaseUser;
  } catch (err) {
    throw new Error(formatFirebaseError(err));
  }
}

/**
 * Signs in an existing user with real Firebase Authentication methods.
 */
export async function signIn(email, password) {
  if (!auth) {
    const missing = getFirebaseConfig().missingKeys;
    throw new Error(
      missing.length > 0
        ? `Firebase Authentication is not configured. Missing in frontend/.env: ${missing.join(', ')}`
        : 'Firebase Authentication is not initialized. Please check your Firebase settings in frontend/.env.'
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = userCredential.user;

    try {
      cachedIdToken = await firebaseUser.getIdToken();
    } catch {
      // ignore
    }

    return firebaseUser;
  } catch (err) {
    throw new Error(formatFirebaseError(err));
  }
}

/**
 * Signs out the current user via Firebase Modular SDK.
 */
export async function signOut() {
  cachedIdToken = '';
  if (auth) {
    await fbSignOut(auth);
  }
}

/**
 * Subscribes to real Firebase auth state changes.
 */
export function onAuthStateChanged(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return fbOnAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        cachedIdToken = await firebaseUser.getIdToken();
      } catch {
        cachedIdToken = '';
      }
    } else {
      cachedIdToken = '';
    }
    callback(firebaseUser);
  });
}

/**
 * Gets the current cached Firebase ID token synchronously for API headers.
 */
export function getIdToken() {
  return cachedIdToken;
}

/**
 * Refreshes and returns the current Firebase ID token asynchronously.
 */
export async function getIdTokenAsync(forceRefresh = false) {
  if (auth && auth.currentUser) {
    try {
      cachedIdToken = await auth.currentUser.getIdToken(forceRefresh);
      return cachedIdToken;
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Returns current Firebase User or null.
 */
export function getCurrentUser() {
  return auth ? auth.currentUser : null;
}
