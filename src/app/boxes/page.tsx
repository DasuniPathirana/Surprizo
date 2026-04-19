'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Box {
  id: string; name: string; category: string; price: number;
  description: string; guaranteedValue: number; premiumChance: number;
  featured: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  TECH: '💻', BEAUTY: '💄', SNACKS: '🍿', GAMING: '🎮', RANDOM: '🎲',
};

const CATEGORIES = ['ALL', 'TECH', 'BEAUTY', 'SNACKS', 'GAMING', 'RANDOM'];
const PRICE_RANGES = [
  { label: 'Budget (LKR 1,000)', min: 0, max: 1500 },
  { label: 'Mid-Range (LKR 2,500)', min: 1500, max: 3500 },
  { label: 'Premium (LKR 5,000+)', min: 3500, max: 999999 },
];

function BoxListingContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'ALL') params.set('category', category);
    fetch(`/api/boxes?${params}`).then(r => r.json()).then(data => {
      setBoxes(data.boxes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category]);

  const groupedByPrice = PRICE_RANGES.map(range => ({
    ...range,
    boxes: boxes.filter(b => b.price >= range.min && b.price < range.max),
  })).filter(g => g.boxes.length > 0);

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div className="page-header">
        <h1 className="heading-lg">Mystery <span className="text-gradient">Boxes</span></h1>
        <p>Find the perfect surprise for you or a loved one</p>
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-tab ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat === 'ALL' ? '🎁 All' : `${CATEGORY_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : boxes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No boxes found</h3>
          <p>Try selecting a different category</p>
        </div>
      ) : (
        groupedByPrice.map(group => (
          <div key={group.label} className="price-group">
            <div className="price-group-header">
              <h2 className="heading-md">{group.label}</h2>
              <div className="price-group-line" />
            </div>
            <div className="boxes-grid">
              {group.boxes.map(box => (
                <Link key={box.id} href={`/boxes/${box.id}`}>
                  <div className="card box-card">
                    <div className="box-card-image">
                      {CATEGORY_ICONS[box.category] || '📦'}
                      {box.featured && (
                        <div className="box-card-featured">
                          <span className="badge badge-gold">⭐ Featured</span>
                        </div>
                      )}
                    </div>
                    <div className="box-card-body">
                      <span className="badge badge-purple box-card-category">{box.category}</span>
                      <h3 className="box-card-name">{box.name}</h3>
                      <p className="box-card-desc">{box.description}</p>
                      <div className="box-card-footer">
                        <div>
                          <div className="box-card-price">LKR {box.price.toLocaleString()}</div>
                          <div className="box-card-value">✅ Value ≥ LKR {box.guaranteedValue.toLocaleString()}</div>
                        </div>
                        <span className="btn btn-primary btn-sm">View Box</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function BoxListingPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <BoxListingContent />
    </Suspense>
  );
}
