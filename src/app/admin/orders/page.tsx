'use client';
import { useState, useEffect } from 'react';

interface Order {
  id: string; totalPrice: number; status: string; paymentStatus: string;
  deliveryName: string; deliveryPhone: string; deliveryAddress: string;
  revealedItems: string | null; revealed: boolean; createdAt: string;
  box: { name: string; category: string };
  user: { name: string; email: string };
}

const STATUSES = ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
const STATUS_CLASSES: Record<string, string> = {
  PROCESSING: 'status-processing', PACKED: 'status-packed',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<Order | null>(null);

  const loadOrders = () => {
    const params = filter !== 'ALL' ? `?status=${filter}` : '';
    fetch(`/api/orders${params}`).then(r => r.json()).then(data => {
      setOrders(data.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="heading-lg">🛒 Order Management</h1>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 'var(--space-xl)' }}>
        {['ALL', ...STATUSES].map(s => (
          <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Box</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id.slice(0, 8)}...</td>
                <td><div style={{ fontWeight: 500 }}>{order.user.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user.email}</div></td>
                <td>{order.box.name}</td>
                <td style={{ color: 'var(--accent-gold-light)', fontWeight: 600 }}>LKR {order.totalPrice.toLocaleString()}</td>
                <td><span className={`badge ${order.paymentStatus === 'COMPLETED' ? 'badge-green' : order.paymentStatus === 'FAILED' ? 'badge-red' : 'badge-gold'}`}>{order.paymentStatus}</span></td>
                <td>
                  <select className="form-select" value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                    style={{ padding: '0.375rem', fontSize: '0.8rem', minWidth: 120 }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td><button onClick={() => setSelected(order)} className="btn btn-ghost btn-sm">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="heading-sm">Order Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', fontSize: '0.9rem' }}>
              <div><strong>Order ID:</strong> {selected.id}</div>
              <div><strong>Customer:</strong> {selected.user.name} ({selected.user.email})</div>
              <div><strong>Box:</strong> {selected.box.name}</div>
              <div><strong>Amount:</strong> LKR {selected.totalPrice.toLocaleString()}</div>
              <div><strong>Status:</strong> <span className={`badge status-badge ${STATUS_CLASSES[selected.status]}`}>{selected.status}</span></div>
              <div><strong>Delivery:</strong><br />{selected.deliveryName}<br />{selected.deliveryPhone}<br />{selected.deliveryAddress}</div>
              {selected.revealed && selected.revealedItems && (
                <div>
                  <strong>Revealed Items:</strong>
                  <div style={{ marginTop: 'var(--space-sm)' }}>
                    {(JSON.parse(selected.revealedItems) as { name: string; value: number; tier: string }[]).map((item, i) => (
                      <div key={i} style={{ padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: 4 }}>
                        {item.name} — LKR {item.value.toLocaleString()} ({item.tier})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
