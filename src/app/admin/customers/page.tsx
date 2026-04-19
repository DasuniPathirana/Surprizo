'use client';
import { useState, useEffect } from 'react';

interface Customer {
  id: string; email: string; name: string; phone: string | null; createdAt: string;
  _count: { orders: number };
  questionnaire: { interests: string; budget: string; preferredCategories: string } | null;
}

export default function AdminCustomers() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      setUsers(data.users || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="heading-lg">👥 Customers</h1>
        <span className="badge badge-purple">{users.length} users</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th><th>Preferences</th></tr></thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td>{user._count.orders}</td>
                <td style={{ fontSize: '0.8rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {user.questionnaire ? (
                    <button onClick={() => setSelected(user)} className="btn btn-ghost btn-sm">View</button>
                  ) : <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected?.questionnaire && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="heading-sm">{selected.name}&apos;s Preferences</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div><strong>Budget:</strong> <span className="badge badge-gold">{selected.questionnaire.budget}</span></div>
              <div><strong>Interests:</strong><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {(JSON.parse(selected.questionnaire.interests) as string[]).map(i => <span key={i} className="badge badge-purple">{i}</span>)}
              </div></div>
              <div><strong>Preferred Categories:</strong><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {(JSON.parse(selected.questionnaire.preferredCategories) as string[]).map(c => <span key={c} className="badge badge-cyan">{c}</span>)}
              </div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
