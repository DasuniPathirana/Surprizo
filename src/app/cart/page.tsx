'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartItemType {
  id: string;
  quantity: number;
  box: { id: string; name: string; price: number; category: string; };
}

const CATEGORY_ICONS: Record<string, string> = {
  TECH: '💻', BEAUTY: '💄', SNACKS: '🍿', GAMING: '🎮', RANDOM: '🎲',
};

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = () => {
    fetch('/api/cart').then(r => r.ok ? r.json() : null).then(data => {
      setItems(data?.cartItems || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  const removeItem = async (id: string) => {
    await fetch(`/api/cart?id=${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const total = items.reduce((s, i) => s + i.box.price * i.quantity, 0);

  if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="container cart-page">
      <h1 className="heading-lg" style={{ marginBottom: 'var(--space-2xl)' }}>
        🛒 Your <span className="text-gradient">Cart</span>
      </h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some mystery boxes to get started!</p>
          <Link href="/boxes" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Browse Boxes</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-2xl)', alignItems: 'start' }}>
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="card cart-item">
                <div className="cart-item-image">
                  {CATEGORY_ICONS[item.box.category] || '📦'}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.box.name}</div>
                  <span className="badge badge-purple" style={{ marginBottom: 4 }}>{item.box.category}</span>
                  <div className="cart-item-price">LKR {item.box.price.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                  <button onClick={() => removeItem(item.id)} className="btn btn-ghost btn-sm">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card cart-summary">
            <h3 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>Order Summary</h3>
            {items.map(item => (
              <div key={item.id} className="cart-summary-row">
                <span>{item.box.name} × {item.quantity}</span>
                <span>LKR {(item.box.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="cart-summary-total">
              <span>Total</span>
              <span style={{ color: 'var(--accent-gold-light)' }}>LKR {total.toLocaleString()}</span>
            </div>
            <Link
              href={`/checkout?boxId=${items[0]?.box.id}`}
              className="btn btn-gold btn-block btn-lg"
              style={{ marginTop: 'var(--space-lg)' }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
