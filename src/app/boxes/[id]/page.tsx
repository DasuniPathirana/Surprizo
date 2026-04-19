'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Box {
  id: string; name: string; category: string; price: number;
  description: string; possibleItems: string; guaranteedValue: number;
  premiumChance: number; featured: boolean;
  reviews: { id: string; rating: number; comment: string; user: { name: string }; createdAt: string }[];
}

const CATEGORY_ICONS: Record<string, string> = {
  TECH: '💻', BEAUTY: '💄', SNACKS: '🍿', GAMING: '🎮', RANDOM: '🎲',
};

export default function BoxDetailPage() {
  const params = useParams();
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/boxes/${params.id}`).then(r => r.json()).then(data => {
      setBox(data.box || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const addToCart = async () => {
    setAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxId: box?.id }),
      });
      if (res.status === 401) {
        window.location.href = '/auth/login';
        return;
      }
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch { /* ignore */ }
    setAdding(false);
  };

  if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!box) return <div className="empty-state" style={{ minHeight: '60vh' }}><h3>Box not found</h3></div>;

  const possibleItems = (() => { try { return JSON.parse(box.possibleItems); } catch { return []; } })() as string[];
  const avgRating = box.reviews.length > 0
    ? (box.reviews.reduce((s, r) => s + r.rating, 0) / box.reviews.length).toFixed(1)
    : null;

  return (
    <div className="container box-detail">
      <div className="box-detail-grid">
        <div className="box-detail-image">
          <span style={{ fontSize: '10rem', zIndex: 1 }}>{CATEGORY_ICONS[box.category] || '📦'}</span>
        </div>

        <div className="box-detail-info">
          <span className="badge badge-purple">{box.category}</span>
          {box.featured && <span className="badge badge-gold" style={{ marginLeft: 8 }}>⭐ FEATURED</span>}

          <h1 className="heading-lg" style={{ marginTop: 'var(--space-md)' }}>{box.name}</h1>

          <div className="box-detail-price">LKR {box.price.toLocaleString()}</div>

          <div className="box-detail-guarantee">
            ✅ Guaranteed value ≥ LKR {box.guaranteedValue.toLocaleString()}
          </div>

          <p className="box-detail-desc">{box.description}</p>

          {/* Probability */}
          <div className="probability-bar">
            <h4>Item Tier Probability</h4>
            <div className="probability-track">
              <div className="probability-premium" style={{ width: `${box.premiumChance}%` }} />
              <div className="probability-standard" style={{ width: `${100 - box.premiumChance}%` }} />
            </div>
            <div className="probability-labels">
              <span>🏆 Premium: {box.premiumChance}%</span>
              <span>📦 Standard: {100 - box.premiumChance}%</span>
            </div>
          </div>

          {/* Possible Items */}
          <div className="possible-items">
            <h4 className="heading-sm">Possible Items Inside</h4>
            <div className="possible-items-list">
              {possibleItems.map((item: string, i: number) => (
                <span key={i} className="possible-item-tag">{item}</span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button onClick={addToCart} className="btn btn-primary btn-lg" disabled={adding}>
              {added ? '✅ Added!' : adding ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <Link href={`/checkout?boxId=${box.id}`} className="btn btn-gold btn-lg">
              ⚡ Buy Now
            </Link>
          </div>

          {/* Rating Summary */}
          {avgRating && (
            <div style={{ marginTop: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`star ${s <= Math.round(parseFloat(avgRating)) ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>{avgRating} ({box.reviews.length} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {box.reviews.length > 0 && (
        <section style={{ marginTop: 'var(--space-3xl)' }}>
          <h2 className="heading-md" style={{ marginBottom: 'var(--space-xl)' }}>Customer Reviews</h2>
          {box.reviews.map(review => (
            <div key={review.id} className="card review-card">
              <div className="review-header">
                <div>
                  <span className="review-author">{review.user.name}</span>
                  <div className="stars" style={{ marginTop: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`star ${s <= review.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                </div>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
