'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) setUser(data.user);
    }).catch(() => {});

    fetch('/api/cart').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.cartItems) setCartCount(data.cartItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">✨ Surprizo</Link>

          <ul className="navbar-links">
            <li><Link href="/" className="navbar-link">Home</Link></li>
            <li><Link href="/boxes" className="navbar-link">Mystery Boxes</Link></li>
            {user && <li><Link href="/orders" className="navbar-link">My Orders</Link></li>}
            {user && <li><Link href="/profile" className="navbar-link">Profile</Link></li>}
          </ul>

          <div className="navbar-actions">
            {user && (
              <Link href="/cart" className="navbar-cart">
                🛒
                {cartCount > 0 && <span className="navbar-cart-count">{cartCount}</span>}
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            ) : (
              <Link href="/auth/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          </div>
        </div>
      </nav>

      {mobileOpen && <div className="mobile-nav-overlay show" onClick={() => setMobileOpen(false)} />}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <Link href="/" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/boxes" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Mystery Boxes</Link>
        {user && <Link href="/orders" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>My Orders</Link>}
        {user && <Link href="/profile" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Profile</Link>}
        {user && <Link href="/cart" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>🛒 Cart {cartCount > 0 && `(${cartCount})`}</Link>}
        {user ? (
          <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn btn-ghost btn-block" style={{ marginTop: 'auto' }}>Logout</button>
        ) : (
          <Link href="/auth/login" className="btn btn-primary btn-block" onClick={() => setMobileOpen(false)}>Sign In</Link>
        )}
      </div>
    </>
  );
}
