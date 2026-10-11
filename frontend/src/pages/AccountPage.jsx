import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AccountPage({ onNavigateToDashboard }) {
  const { currentUser, user, logout } = useAuth();
  const activeUser = currentUser || user;

  const creationDate = activeUser?.metadata?.creationTime
    ? new Date(activeUser.metadata.creationTime).toLocaleString()
    : 'Active Session';

  return (
    <div className="account-page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div className="auth-brand-badge">USER PORTAL</div>
            <h1 className="auth-title" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>Account & Security</h1>
            <p className="auth-subtitle">Authenticated Firebase session profile</p>
          </div>
          <button
            type="button"
            className="auth-submit-btn"
            style={{ width: 'auto', padding: '0.6rem 1.2rem', margin: 0 }}
            onClick={onNavigateToDashboard}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'var(--surface-color, #ffffff)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #e8dfd8)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #7c726a)', fontWeight: 600 }}>
              Full Name / Display Name
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #2d241e)', marginTop: '0.35rem' }}>
              {activeUser?.displayName || 'Lead Auditor'}
            </div>
          </div>

          <div style={{ background: 'var(--surface-color, #ffffff)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #e8dfd8)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #7c726a)', fontWeight: 600 }}>
              Email Address
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #2d241e)', marginTop: '0.35rem', wordBreak: 'break-all' }}>
              {activeUser?.email || 'N/A'}
            </div>
          </div>

          <div style={{ background: 'var(--surface-color, #ffffff)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #e8dfd8)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #7c726a)', fontWeight: 600 }}>
              Firebase Authenticated UID
            </span>
            <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--text-primary, #2d241e)', marginTop: '0.35rem', wordBreak: 'break-all' }}>
              {activeUser?.uid || 'N/A'}
            </div>
          </div>

          <div style={{ background: 'var(--surface-color, #ffffff)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #e8dfd8)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #7c726a)', fontWeight: 600 }}>
              Account Created / Session
            </span>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary, #2d241e)', marginTop: '0.35rem' }}>
              {creationDate}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color, #e8dfd8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #7c726a)' }}>
              Session managed exclusively by Firebase Authentication.
            </span>
          </div>
          <button
            type="button"
            className="navbar-logout-btn"
            style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
