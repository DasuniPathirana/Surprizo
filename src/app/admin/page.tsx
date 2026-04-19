'use client';
import { useState, useEffect } from 'react';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  popularBoxes: { boxId: string; _count: { id: number }; box?: { name: string; category: string } }[];
  recentOrders: { id: string; totalPrice: number; status: string; createdAt: string;
    box: { name: string; category: string }; user: { name: string; email: string } }[];
}

const STATUS_CLASSES: Record<string, string> = {
  PROCESSING: 'status-processing', PACKED: 'status-packed',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(data => {
      setStats(data.stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!stats) return <div className="empty-state"><h3>Failed to load stats</h3></div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="heading-lg">📊 Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon stat-icon-purple">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-green">💰</div>
          <div className="stat-info">
            <div className="stat-value">LKR {stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-gold">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-pink">🏆</div>
          <div className="stat-info">
            <div className="stat-value">{stats.popularBoxes.length}</div>
            <div className="stat-label">Popular Boxes</div>
          </div>
        </div>
      </div>

      {/* Popular Boxes */}
      {stats.popularBoxes.length > 0 && (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>🏆 Top Selling Boxes</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Box Name</th>
                  <th>Category</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {stats.popularBoxes.map((pb, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{pb.box?.name || 'Unknown'}</td>
                    <td><span className="badge badge-purple">{pb.box?.category || '-'}</span></td>
                    <td>{pb._count.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <h2 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>📋 Recent Orders</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Box</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id.slice(0, 8)}...</td>
                  <td>{order.user.name}</td>
                  <td>{order.box.name}</td>
                  <td style={{ color: 'var(--accent-gold-light)', fontWeight: 600 }}>LKR {order.totalPrice.toLocaleString()}</td>
                  <td><span className={`badge status-badge ${STATUS_CLASSES[order.status]}`}>{order.status}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
