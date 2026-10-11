import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  onAuthStateChanged,
  getIdToken,
  getIdTokenAsync,
  getFirebaseConfig,
} from '../services/firebaseAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      setCurrentUser(firebaseUser);
      setLoading(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleLogin = async (email, password) => {
    const loggedInUser = await signIn(email, password);
    setCurrentUser(loggedInUser);
    return loggedInUser;
  };

  const handleSignup = async (name, email, password) => {
    const newUser = await signUp(name, email, password);
    setCurrentUser(newUser);
    return newUser;
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const configStatus = getFirebaseConfig();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser, // backwards compatibility
        loading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        isAuthenticated: !!currentUser,
        getIdToken,
        getIdTokenAsync,
        configStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
