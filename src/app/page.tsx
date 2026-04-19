'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Box {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  possibleItems: string;
  guaranteedValue: number;
  premiumChance: number;
  image: string | null;
  featured: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  TECH: '💻',
  BEAUTY: '💄',
  SNACKS: '🍿',
  GAMING: '🎮',
  RANDOM: '🎲',
};

const CATEGORY_LABELS: Record<string, string> = {
  TECH: 'Tech Box',
  BEAUTY: 'Beauty Box',
  SNACKS: 'Snacks Box',
  GAMING: 'Gaming Box',
  RANDOM: 'Random Mystery',
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Box[]>([]);
  const [popular, setPopular] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/boxes?featured=true').then(r => r.json()),
      fetch('/api/boxes').then(r => r.json()),
    ]).then(([featuredData, allData]) => {
      setFeatured(featuredData.boxes || []);
      setPopular((allData.boxes || []).slice(0, 6));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">🎉 New boxes added weekly!</div>
            <h1 className="heading-xl hero-title">
              Unbox the <span className="text-gradient">Unexpected</span>
            </h1>
            <p className="hero-description">
              Mystery boxes packed with amazing surprises. Every box guarantees value above what you pay. 
              Choose from Tech, Beauty, Gaming, Snacks & more — your next adventure awaits inside.
            </p>
            <div className="hero-cta">
              <Link href="/boxes" className="btn btn-primary btn-xl">Explore Boxes</Link>
              <Link href="/#how-it-works" className="btn btn-ghost btn-xl">How It Works</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-box-3d">
              <div className="mystery-box-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="heading-lg">Browse by <span className="text-gradient">Category</span></h2>
            <p>Find the perfect mystery box for your interests</p>
          </div>
          <div className="category-grid">
            {Object.entries(CATEGORY_ICONS).map(([key, icon]) => (
              <Link key={key} href={`/boxes?category=${key}`}>
                <div className="card category-card">
                  <span className="category-icon">{icon}</span>
                  <div className="category-name">{CATEGORY_LABELS[key]}</div>
                  <div className="category-count">Starting from LKR 1,000</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Boxes */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="heading-lg">⭐ <span className="text-gradient">Featured</span> Boxes</h2>
            <p>Our most popular and highest-value mystery boxes</p>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <div className="boxes-grid">
              {featured.map(box => (
                <Link key={box.id} href={`/boxes/${box.id}`}>
                  <div className="card box-card">
                    <div className="box-card-image">
                      {CATEGORY_ICONS[box.category] || '📦'}
                      <div className="box-card-featured">
                        <span className="badge badge-gold">⭐ Featured</span>
                      </div>
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
          )}
        </div>
      </section>

      {/* Popular Picks */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="heading-lg">🔥 Popular <span className="text-gradient">Picks</span></h2>
            <p>What other customers are loving right now</p>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <div className="boxes-grid">
              {popular.map(box => (
                <Link key={box.id} href={`/boxes/${box.id}`}>
                  <div className="card box-card">
                    <div className="box-card-image">
                      {CATEGORY_ICONS[box.category] || '📦'}
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
                        <span className="btn btn-secondary btn-sm">Details</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="heading-lg">How It <span className="text-gradient">Works</span></h2>
            <p>Getting your mystery box is easy!</p>
          </div>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-step-number">1</div>
              <h4>Choose Your Box</h4>
              <p>Browse our categories and pick the mystery box that excites you most</p>
            </div>
            <div className="how-step">
              <div className="how-step-number">2</div>
              <h4>Checkout Securely</h4>
              <p>Pay securely with PayHere. Your payment is 100% protected</p>
            </div>
            <div className="how-step">
              <div className="how-step-number">3</div>
              <h4>Reveal Your Items</h4>
              <p>Open your box with our exciting reveal experience and discover what&apos;s inside</p>
            </div>
            <div className="how-step">
              <div className="how-step-number">4</div>
              <h4>Get Delivered</h4>
              <p>Your surprise items get packed and delivered right to your doorstep</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-grid">
            <div className="card-glass trust-badge">
              <span className="trust-badge-icon">💎</span>
              <div>
                <h4>Guaranteed Value</h4>
                <p>Every box is worth more than what you pay</p>
              </div>
            </div>
            <div className="card-glass trust-badge">
              <span className="trust-badge-icon">🔒</span>
              <div>
                <h4>Secure Payment</h4>
                <p>PayHere certified secure transactions</p>
              </div>
            </div>
            <div className="card-glass trust-badge">
              <span className="trust-badge-icon">🚚</span>
              <div>
                <h4>Fast Delivery</h4>
                <p>Island-wide delivery within 3-5 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="heading-lg" style={{ marginBottom: 'var(--space-md)' }}>
            Ready to be <span className="text-gradient">Surprised?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', maxWidth: 500, margin: '0 auto var(--space-xl)' }}>
            Join thousands of happy customers who love the thrill of unboxing. Your next surprise is just a click away!
          </p>
          <Link href="/boxes" className="btn btn-gold btn-xl">Start Shopping 🎁</Link>
        </div>
      </section>
    </>
  );
}
