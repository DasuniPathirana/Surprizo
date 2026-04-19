'use client';
import { useState, useEffect } from 'react';

interface Item {
  id: string; name: string; value: number; description: string | null;
  stock: number; category: string; tier: string;
  boxItems: { box: { id: string; name: string } }[];
}

const CATEGORIES = ['TECH', 'BEAUTY', 'SNACKS', 'GAMING', 'RANDOM'];
const TIERS = ['STANDARD', 'PREMIUM'];

export default function AdminItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ name: '', value: '', description: '', stock: '', category: 'TECH', tier: 'STANDARD' });

  const loadItems = () => {
    fetch('/api/items').then(r => r.json()).then(data => {
      setItems(data.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', value: '', description: '', stock: '', category: 'TECH', tier: 'STANDARD' });
    setShowModal(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setForm({ name: item.name, value: String(item.value), description: item.description || '', stock: String(item.stock), category: item.category, tier: item.tier });
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editing ? `/api/items/${editing.id}` : '/api/items';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowModal(false);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    loadItems();
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="heading-lg">🏷️ Inventory Management</h1>
        <button onClick={openCreate} className="btn btn-primary">+ Add Item</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Tier</th><th>Value (LKR)</th><th>Stock</th><th>Assigned To</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td><span className="badge badge-purple">{item.category}</span></td>
                <td><span className={`badge ${item.tier === 'PREMIUM' ? 'badge-gold' : 'badge-cyan'}`}>{item.tier}</span></td>
                <td style={{ color: 'var(--accent-gold-light)' }}>{item.value.toLocaleString()}</td>
                <td>{item.stock <= 5 ? <span style={{ color: 'var(--accent-red)' }}>{item.stock}</span> : item.stock}</td>
                <td style={{ fontSize: '0.8rem' }}>{item.boxItems.map(bi => bi.box.name).join(', ') || '—'}</td>
                <td className="admin-table-actions">
                  <button onClick={() => openEdit(item)} className="btn btn-ghost btn-sm">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="heading-sm">{editing ? 'Edit Item' : 'Add Item'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="auth-form">
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Tier</label><select className="form-select" value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group"><label className="form-label">Value (LKR)</label><input className="form-input" type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Stock</label><input className="form-input" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <button onClick={handleSave} className="btn btn-primary btn-block">{editing ? 'Save Changes' : 'Add Item'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
