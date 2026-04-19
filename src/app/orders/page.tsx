'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string; totalPrice: number; status: string; revealed: boolean;
  createdAt: string; paymentStatus: string;
  box: { name: string; category: string; image: string | null };
}

const CATEGORY_ICONS: Record<string, string> = {
  TECH: '💻', BEAUTY: '💄', SNACKS: '🍿', GAMING: '🎮', RANDOM: '🎲',
};

const STATUS_CLASSES: Record<string, string> = {
  PROCESSING: 'status-processing',
  PACKED: 'status-packed',
  SHIPPED: 'status-shipped',
  DELIVERED: 'status-delivered',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => {
      if (r.status === 401) { window.location.href = '/auth/login'; return null; }
      return r.json();
    }).then(data => {
      if (data) setOrders(data.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) var(--space-lg)' }}>
      <h1 className="heading-lg" style={{ marginBottom: 'var(--space-2xl)' }}>
        📦 My <span className="text-gradient">Orders</span>
      </h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Purchase a mystery box to see it here!</p>
          <Link href="/boxes" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Browse Boxes</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <Link key={order.id} href={order.revealed ? `/orders/${order.id}` : `/orders/${order.id}/reveal`}>
              <div className="card order-card">
                <div className="order-icon">
                  {CATEGORY_ICONS[order.box.category] || '📦'}
                </div>
                <div className="order-info">
                  <div style={{ fontWeight: 600 }}>{order.box.name}</div>
                  <div className="order-meta">
                    <span>LKR {order.totalPrice.toLocaleString()}</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="order-status">
                  <span className={`badge status-badge ${STATUS_CLASSES[order.status]}`}>{order.status}</span>
                  {!order.revealed && (
                    <div style={{ marginTop: 8 }}>
                      <span className="badge badge-gold">🎁 Tap to Reveal</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
