'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: string; totalPrice: number; status: string; revealed: boolean;
  revealedItems: string | null; createdAt: string;
  deliveryName: string; deliveryPhone: string; deliveryAddress: string;
  box: { id: string; name: string; category: string; price: number; };
  review: { id: string; rating: number; comment: string } | null;
}

const STATUS_CLASSES: Record<string, string> = {
  PROCESSING: 'status-processing',
  PACKED: 'status-packed',
  SHIPPED: 'status-shipped',
  DELIVERED: 'status-delivered',
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`).then(r => r.json()).then(data => {
      setOrder(data.order || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const submitReview = async () => {
    if (!order || !reviewForm.comment) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boxId: order.box.id,
          orderId: order.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      if (res.ok) setReviewSubmitted(true);
    } catch { /* ignore */ }
    setSubmittingReview(false);
  };

  if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!order) return <div className="empty-state"><h3>Order not found</h3></div>;

  const revealedItems = order.revealedItems ? JSON.parse(order.revealedItems) : [];

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) var(--space-lg)', maxWidth: 800 }}>
      <h1 className="heading-lg" style={{ marginBottom: 'var(--space-2xl)' }}>
        📋 Order <span className="text-gradient">Details</span>
      </h1>

      <div className="card" style={{ padding: 'var(--space-2xl)', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div>
            <h2 className="heading-sm">{order.box.name}</h2>
            <span className="badge badge-purple">{order.box.category}</span>
          </div>
          <span className={`badge status-badge ${STATUS_CLASSES[order.status]}`}>{order.status}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', fontSize: '0.9rem' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Order ID:</span><br />{order.id.slice(0, 8)}...</div>
          <div><span style={{ color: 'var(--text-muted)' }}>Date:</span><br />{new Date(order.createdAt).toLocaleString()}</div>
          <div><span style={{ color: 'var(--text-muted)' }}>Amount:</span><br /><span style={{ color: 'var(--accent-gold-light)', fontWeight: 700 }}>LKR {order.totalPrice.toLocaleString()}</span></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Delivery:</span><br />{order.deliveryName}</div>
        </div>
      </div>

      {/* Revealed Items */}
      {order.revealed && revealedItems.length > 0 && (
        <div className="card" style={{ padding: 'var(--space-2xl)', marginBottom: 'var(--space-xl)' }}>
          <h3 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>🎁 Revealed Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {revealedItems.map((item: { name: string; value: number; tier: string }, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span className={`badge ${item.tier === 'PREMIUM' ? 'badge-gold' : 'badge-purple'}`} style={{ marginLeft: 8 }}>{item.tier}</span>
                </div>
                <span style={{ color: 'var(--accent-gold-light)', fontWeight: 600 }}>LKR {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!order.revealed && (
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎁</div>
          <h3 className="heading-sm" style={{ marginBottom: 'var(--space-md)' }}>Your box hasn&apos;t been revealed yet!</h3>
          <Link href={`/orders/${order.id}/reveal`} className="btn btn-gold btn-lg">✨ Reveal My Box</Link>
        </div>
      )}

      {/* Review Section */}
      {order.revealed && !order.review && !reviewSubmitted && (
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <h3 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>⭐ Leave a Review</h3>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div className="stars">
              {[1,2,3,4,5].map(s => (
                <button key={s} className={`star-input ${s <= reviewForm.rating ? 'filled' : ''}`}
                  style={{ color: s <= reviewForm.rating ? 'var(--accent-gold)' : 'var(--text-muted)' }}
                  onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}>★</button>
              ))}
            </div>
          </div>
          <textarea className="form-textarea" placeholder="Tell us about your experience..." value={reviewForm.comment}
            onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} style={{ marginBottom: 'var(--space-md)' }} />
          <button onClick={submitReview} className="btn btn-primary" disabled={submittingReview || !reviewForm.comment}>
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {(order.review || reviewSubmitted) && (
        <div className="card" style={{ padding: 'var(--space-xl)', background: 'rgba(16, 185, 129, 0.1)' }}>
          ✅ Thank you for your review!
        </div>
      )}
    </div>
  );
}
