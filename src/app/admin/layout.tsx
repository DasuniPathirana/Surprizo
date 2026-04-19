'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/boxes', icon: '📦', label: 'Boxes' },
  { href: '/admin/items', icon: '🏷️', label: 'Inventory' },
  { href: '/admin/orders', icon: '🛒', label: 'Orders' },
  { href: '/admin/customers', icon: '👥', label: 'Customers' },
  { href: '/admin/reviews', icon: '⭐', label: 'Reviews' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user?.role === 'ADMIN') {
        setAuthorized(true);
      } else {
        window.location.href = '/admin/login';
      }
      setLoading(false);
    }).catch(() => {
      window.location.href = '/admin/login';
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!authorized) return null;

  return (
    <div className="admin-layout">
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 10000, display: 'none' }}>☰</button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">✨ Surprizo</div>
        <div className="admin-sidebar-subtitle">Admin Panel</div>

        <ul className="admin-nav">
          {NAV_ITEMS.map(item => (
            <li key={item.href}>
              <Link href={item.href}
                className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2xl)' }}>
          <Link href="/" className="admin-nav-link">
            <span>🏠</span>
            <span>Back to Store</span>
          </Link>
          <button onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/admin/login';
          }} className="admin-nav-link" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}
