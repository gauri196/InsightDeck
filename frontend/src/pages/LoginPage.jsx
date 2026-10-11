import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigateToSignup, onLoginSuccess }) {
  const { login, configStatus } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-brand-badge">INSIGHTDECK</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to access your audit decks and Excel analytics</p>

        {!configStatus?.isConfigured && (
          <div className="auth-error-banner" role="alert" style={{ background: '#fff3cd', borderColor: '#ffeeba', color: '#856404' }}>
            <span>
              ⚙️ <strong>Configuration Notice:</strong> Missing environment variables in <code>frontend/.env</code>:{' '}
              {configStatus?.missingKeys?.join(', ')}. Please update your .env file and restart Vite.
            </span>
          </div>
        )}

        {error && (
          <div className="auth-error-banner" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-header">
              <label className="auth-label">Password</label>
            </div>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          Don't have an account?{' '}
          <button type="button" className="auth-link-btn" onClick={onNavigateToSignup}>
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
