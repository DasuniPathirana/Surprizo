'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string; email: string; name: string; phone: string | null; address: string | null; role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.status === 401) { window.location.href = '/auth/login'; return null; }
      return r.json();
    }).then(data => {
      if (data?.user) {
        setUser(data.user);
        setForm({ name: data.user.name, phone: data.user.phone || '', address: data.user.address || '' });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!user) return null;

  return (
    <div className="container profile-page">
      <h1 className="heading-lg" style={{ marginBottom: 'var(--space-2xl)' }}>
        👤 My <span className="text-gradient">Profile</span>
      </h1>

      <div className="profile-grid">
        <div className="card profile-card">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <h2 className="heading-sm" style={{ marginBottom: 'var(--space-xs)' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>{user.email}</p>

          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="+94 7X XXX XXXX" value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" placeholder="Your delivery address" value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} />
            </div>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
            <h3 className="heading-sm" style={{ marginBottom: 'var(--space-md)' }}>🎯 Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <Link href="/orders" className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>📦 My Orders</Link>
              <Link href="/questionnaire" className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>🎯 Update Preferences</Link>
              <Link href="/boxes" className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>🎁 Browse Boxes</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
