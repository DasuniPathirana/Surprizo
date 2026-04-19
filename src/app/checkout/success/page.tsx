'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="reveal-container">
      <div style={{ fontSize: '5rem', marginBottom: 'var(--space-lg)' }}>🎉</div>
      <h1 className="heading-lg">Order <span className="text-gradient">Confirmed!</span></h1>
      <p style={{ color: 'var(--text-secondary)', margin: 'var(--space-md) 0 var(--space-xl)', maxWidth: 500 }}>
        Your mystery box is being prepared! Ready to see what&apos;s inside?
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {orderId && (
          <Link href={`/orders/${orderId}/reveal`} className="btn btn-gold btn-xl">
            ✨ Reveal My Box!
          </Link>
        )}
        <Link href="/orders" className="btn btn-secondary btn-xl">
          View All Orders
        </Link>
        <Link href="/boxes" className="btn btn-ghost btn-xl">
          Buy Another Box
        </Link>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-2xl)' }}>
        Order ID: {orderId || 'N/A'}
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
