'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Box { id: string; name: string; price: number; category: string; }

function CheckoutContent() {
  const searchParams = useSearchParams();
  const boxId = searchParams.get('boxId');

  const [box, setBox] = useState<Box | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (boxId) {
      fetch(`/api/boxes/${boxId}`).then(r => r.json()).then(data => {
        setBox(data.box || null);
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) {
        setForm(prev => ({
          ...prev,
          name: data.user.name || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
        }));
      }
    }).catch(() => {});
  }, [boxId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.address) {
      setError('All delivery details are required');
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boxId: box?.id,
          deliveryName: form.name,
          deliveryPhone: form.phone,
          deliveryAddress: form.address,
        }),
      });

      if (res.status === 401) {
        window.location.href = '/auth/login';
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      // For demo, go directly to success (in production would redirect to PayHere)
      window.location.href = `/checkout/success?order_id=${data.order.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed');
    }
    setSubmitting(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) var(--space-lg)' }}>
      <h1 className="heading-lg" style={{ marginBottom: 'var(--space-2xl)' }}>
        💳 <span className="text-gradient">Checkout</span>
      </h1>

      <div className="checkout-grid">
        <div>
          <div className="card" style={{ padding: 'var(--space-2xl)' }}>
            <h2 className="heading-sm" style={{ marginBottom: 'var(--space-xl)' }}>Delivery Details</h2>
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="form-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+94 7X XXX XXXX" value={form.phone} onChange={e => update('phone', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <textarea className="form-textarea" placeholder="Full delivery address" value={form.address} onChange={e => update('address', e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-gold btn-block btn-lg" disabled={submitting}>
                {submitting ? 'Processing...' : `Pay LKR ${box?.price.toLocaleString() || '0'} with PayHere`}
              </button>
            </form>
          </div>
        </div>

        <div className="card cart-summary">
          <h3 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>Order Summary</h3>
          {box && (
            <>
              <div className="cart-summary-row">
                <span>{box.name}</span>
                <span>LKR {box.price.toLocaleString()}</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span style={{ color: 'var(--accent-gold-light)' }}>LKR {box.price.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--accent-green)' }}>
                🔒 Your payment is secured by PayHere
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
