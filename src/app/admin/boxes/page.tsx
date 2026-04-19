'use client';
import { useState, useEffect } from 'react';

interface Box {
  id: string; name: string; category: string; price: number;
  description: string; possibleItems: string; guaranteedValue: number;
  premiumChance: number; featured: boolean; active: boolean;
}

const CATEGORIES = ['TECH', 'BEAUTY', 'SNACKS', 'GAMING', 'RANDOM'];

export default function AdminBoxes() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Box | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'TECH', price: '', description: '',
    possibleItems: '', guaranteedValue: '', premiumChance: '20',
    featured: false, active: true,
  });

  const loadBoxes = () => {
    fetch('/api/boxes').then(r => r.json()).then(data => {
      setBoxes(data.boxes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadBoxes(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'TECH', price: '', description: '', possibleItems: '', guaranteedValue: '', premiumChance: '20', featured: false, active: true });
    setShowModal(true);
  };

  const openEdit = (box: Box) => {
    setEditing(box);
    setForm({
      name: box.name, category: box.category, price: String(box.price),
      description: box.description, possibleItems: box.possibleItems,
      guaranteedValue: String(box.guaranteedValue), premiumChance: String(box.premiumChance),
      featured: box.featured, active: box.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editing ? `/api/boxes/${editing.id}` : '/api/boxes';
    const method = editing ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setShowModal(false);
    loadBoxes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this box?')) return;
    await fetch(`/api/boxes/${id}`, { method: 'DELETE' });
    loadBoxes();
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="heading-lg">📦 Box Management</h1>
        <button onClick={openCreate} className="btn btn-primary">+ Create Box</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price (LKR)</th>
              <th>Guaranteed</th>
              <th>Premium %</th>
              <th>Featured</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {boxes.map(box => (
              <tr key={box.id}>
                <td style={{ fontWeight: 500 }}>{box.name}</td>
                <td><span className="badge badge-purple">{box.category}</span></td>
                <td style={{ color: 'var(--accent-gold-light)' }}>{box.price.toLocaleString()}</td>
                <td>{box.guaranteedValue.toLocaleString()}</td>
                <td>{box.premiumChance}%</td>
                <td>{box.featured ? '⭐' : '—'}</td>
                <td>{box.active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span>}</td>
                <td className="admin-table-actions">
                  <button onClick={() => openEdit(box)} className="btn btn-ghost btn-sm">Edit</button>
                  <button onClick={() => handleDelete(box.id)} className="btn btn-danger btn-sm">Delete</button>
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
              <h2 className="heading-sm">{editing ? 'Edit Box' : 'Create Box'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Price (LKR)</label>
                  <input className="form-input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Guaranteed Value</label>
                  <input className="form-input" type="number" value={form.guaranteedValue} onChange={e => setForm(p => ({ ...p, guaranteedValue: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Possible Items (JSON array)</label>
                <textarea className="form-textarea" value={form.possibleItems} onChange={e => setForm(p => ({ ...p, possibleItems: e.target.value }))} placeholder='["Item 1", "Item 2"]' />
              </div>
              <div className="form-group">
                <label className="form-label">Premium Chance (%)</label>
                <input className="form-input" type="number" min="0" max="100" value={form.premiumChance} onChange={e => setForm(p => ({ ...p, premiumChance: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} /> Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} /> Active
                </label>
              </div>
              <button onClick={handleSave} className="btn btn-primary btn-block">{editing ? 'Save Changes' : 'Create Box'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
