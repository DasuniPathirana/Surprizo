'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'TECH', icon: '💻', label: 'Technology' },
  { id: 'BEAUTY', icon: '💄', label: 'Beauty' },
  { id: 'SNACKS', icon: '🍿', label: 'Snacks' },
  { id: 'GAMING', icon: '🎮', label: 'Gaming' },
  { id: 'RANDOM', icon: '🎲', label: 'Random' },
];

const INTERESTS = [
  { id: 'gadgets', icon: '📱', label: 'Gadgets' },
  { id: 'skincare', icon: '🧴', label: 'Skincare' },
  { id: 'food', icon: '🍕', label: 'Food' },
  { id: 'gaming', icon: '🎯', label: 'Gaming' },
  { id: 'fashion', icon: '👗', label: 'Fashion' },
  { id: 'fitness', icon: '💪', label: 'Fitness' },
  { id: 'music', icon: '🎵', label: 'Music' },
  { id: 'reading', icon: '📚', label: 'Reading' },
];

const BUDGETS = [
  { id: 'low', label: 'Budget Friendly', desc: 'LKR 1,000 - 2,000', icon: '💰' },
  { id: 'medium', label: 'Mid Range', desc: 'LKR 2,000 - 4,000', icon: '💎' },
  { id: 'high', label: 'Premium', desc: 'LKR 4,000+', icon: '👑' },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [budget, setBudget] = useState('medium');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/questionnaire').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.questionnaire) {
        try {
          setInterests(JSON.parse(data.questionnaire.interests) || []);
          setCategories(JSON.parse(data.questionnaire.preferredCategories) || []);
          setBudget(data.questionnaire.budget || 'medium');
        } catch { /* ignore */ }
      }
    }).catch(() => {});
  }, []);

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, budget, preferredCategories: categories }),
      });
      router.push('/');
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="container" style={{ maxWidth: 600, padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="heading-lg">🎯 Personalize Your <span className="text-gradient">Experience</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Help us find the best boxes for you</p>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 'var(--space-md)' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: 60, height: 4, borderRadius: 2,
              background: s <= step ? 'var(--accent-purple)' : 'var(--border-color)',
            }} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <>
          <h2 className="heading-sm" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>What are your interests?</h2>
          <div className="questionnaire-options">
            {INTERESTS.map(interest => (
              <div key={interest.id}
                className={`questionnaire-option ${interests.includes(interest.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(interests, setInterests, interest.id)}>
                <div className="questionnaire-option-icon">{interest.icon}</div>
                <div className="questionnaire-option-label">{interest.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="btn btn-primary btn-block btn-lg" style={{ marginTop: 'var(--space-xl)' }}>
            Next →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="heading-sm" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>Which categories excite you?</h2>
          <div className="questionnaire-options">
            {CATEGORIES.map(cat => (
              <div key={cat.id}
                className={`questionnaire-option ${categories.includes(cat.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(categories, setCategories, cat.id)}>
                <div className="questionnaire-option-icon">{cat.icon}</div>
                <div className="questionnaire-option-label">{cat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost btn-block btn-lg">← Back</button>
            <button onClick={() => setStep(3)} className="btn btn-primary btn-block btn-lg">Next →</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="heading-sm" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>What&apos;s your budget?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {BUDGETS.map(b => (
              <div key={b.id}
                className={`questionnaire-option ${budget === b.id ? 'selected' : ''}`}
                onClick={() => setBudget(b.id)}
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '2rem' }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
            <button onClick={() => setStep(2)} className="btn btn-ghost btn-block btn-lg">← Back</button>
            <button onClick={handleSubmit} className="btn btn-gold btn-block btn-lg" disabled={saving}>
              {saving ? 'Saving...' : '✨ Complete Setup'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
