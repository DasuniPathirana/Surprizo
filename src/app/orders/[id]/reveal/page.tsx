'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface RevealedItem {
  name: string;
  value: number;
  description: string | null;
  tier: string;
  image: string | null;
}

const TIER_ICONS: Record<string, string> = {
  PREMIUM: '👑',
  STANDARD: '📦',
};

export default function RevealPage() {
  const params = useParams();
  const [phase, setPhase] = useState<'ready' | 'revealing' | 'revealed'>('ready');
  const [items, setItems] = useState<RevealedItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReveal = async () => {
    setLoading(true);
    setPhase('revealing');

    try {
      const res = await fetch(`/api/orders/${params.id}/reveal`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/auth/login'; return; }

      const data = await res.json();
      setItems(data.items || []);
      setTotalValue(data.totalValue || 0);
      setIsPremium(data.isPremium || false);

      // Wait for box animation to complete
      setTimeout(() => {
        setPhase('revealed');
      }, 1300);
    } catch {
      setPhase('ready');
    }
    setLoading(false);
  };

  return (
    <div className="reveal-container">
      {phase === 'ready' && (
        <>
          <h1 className="heading-xl" style={{ marginBottom: 'var(--space-md)' }}>
            Ready to <span className="text-gradient">Reveal?</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, marginBottom: 'var(--space-xl)' }}>
            Tap the box below to discover what surprises await you inside your mystery box!
          </p>
          <div className="reveal-box" onClick={handleReveal}>
            <div className="reveal-box-inner">
              🎁
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {loading ? '✨ Opening your box...' : '👆 Tap the box to reveal your items!'}
          </p>
        </>
      )}

      {phase === 'revealing' && (
        <>
          <h1 className="heading-xl" style={{ marginBottom: 'var(--space-md)' }}>
            <span className="text-gradient">Opening...</span>
          </h1>
          <div className="reveal-box revealing">
            <div className="reveal-box-inner">
              🎁
            </div>
          </div>
          <p style={{ color: 'var(--accent-gold-light)', fontSize: '1.1rem', fontWeight: 600 }}>
            ✨ Your surprises are being revealed...
          </p>
        </>
      )}

      {phase === 'revealed' && (
        <>
          <h1 className="heading-xl" style={{ marginBottom: 'var(--space-sm)' }}>
            {isPremium ? '🏆' : '🎉'}{' '}
            <span className="text-gradient">{isPremium ? 'PREMIUM Win!' : 'Congratulations!'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
            {isPremium ? 'You hit the jackpot! Premium items revealed!' : 'Here are the amazing items from your mystery box!'}
          </p>

          <div className="reveal-items">
            {items.map((item, index) => (
              <div key={index} className="card reveal-item">
                <div className="reveal-item-icon">
                  {TIER_ICONS[item.tier] || '📦'}
                </div>
                <div className="reveal-item-name">{item.name}</div>
                {item.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>{item.description}</p>
                )}
                <div className="reveal-item-value">LKR {item.value.toLocaleString()}</div>
                <span className={`badge reveal-item-tier ${item.tier === 'PREMIUM' ? 'badge-gold' : 'badge-purple'}`}>
                  {item.tier}
                </span>
              </div>
            ))}
          </div>

          <div className="reveal-total">
            <h3 className="heading-sm" style={{ marginBottom: 'var(--space-sm)' }}>
              Total Value: <span className="text-gradient-gold">LKR {totalValue.toLocaleString()}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>
              ✅ You received {isPremium ? 'premium' : 'great'} value from your mystery box!
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-2xl)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/boxes" className="btn btn-gold btn-lg">🎁 Buy Another Box</Link>
            <Link href="/orders" className="btn btn-secondary btn-lg">📦 My Orders</Link>
            <Link href={`/orders/${params.id}`} className="btn btn-ghost btn-lg">📋 Order Details</Link>
          </div>
        </>
      )}
    </div>
  );
}
