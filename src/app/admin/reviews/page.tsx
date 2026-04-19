'use client';
import { useState, useEffect } from 'react';

interface Review {
  id: string; rating: number; comment: string; approved: boolean; createdAt: string;
  user: { name: string; email: string };
  box: { name: string };
  order: { id: string; totalPrice: number };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = () => {
    fetch('/api/admin/reviews').then(r => r.json()).then(data => {
      setReviews(data.reviews || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadReviews(); }, []);

  const toggleApproval = async (id: string, approved: boolean) => {
    await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !approved }),
    });
    loadReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    loadReviews();
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="heading-lg">⭐ Review Moderation</h1>
        <span className="badge badge-purple">{reviews.length} reviews</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Customer</th><th>Box</th><th>Rating</th><th>Comment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td><div style={{ fontWeight: 500 }}>{review.user.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{review.user.email}</div></td>
                <td>{review.box.name}</td>
                <td>
                  <div className="stars">
                    {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= review.rating ? 'filled' : ''}`}>★</span>)}
                  </div>
                </td>
                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.comment}</td>
                <td>{review.approved ? <span className="badge badge-green">Approved</span> : <span className="badge badge-gold">Pending</span>}</td>
                <td style={{ fontSize: '0.8rem' }}>{new Date(review.createdAt).toLocaleDateString()}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleApproval(review.id, review.approved)} className="btn btn-ghost btn-sm">
                    {review.approved ? 'Hide' : 'Approve'}
                  </button>
                  <button onClick={() => deleteReview(review.id)} className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No reviews yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
