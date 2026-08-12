'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getGroups, getExpenses, getMembers, ensureSeeded, type Group, type Expense } from '@/lib/store';

export default function Landing() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    ensureSeeded();
    setGroups(getGroups());
    setExpenses(getExpenses());
    setMemberCount(getMembers().length);
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const FEATURES = [
    { label: 'My Groups', href: '/groups', icon: '👥', desc: `${groups.length} group${groups.length !== 1 ? 's' : ''}` },
    { label: 'Expenses', href: '/expenses', icon: '💳', desc: `${expenses.length} expense${expenses.length !== 1 ? 's' : ''}` },
    { label: 'Add Expense', href: '/expenses/new', icon: '➕', desc: 'Log a new expense' },
    { label: 'Settle Up', href: '/settle', icon: '✅', desc: 'Balance and settle debts' },
  ];

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(135deg, #34C759 0%, #007AFF 100%)',
        padding: '100px 24px 60px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <div style={{ fontSize: 56, marginBottom: 16, position: 'relative' }}>💰</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-1px', position: 'relative', marginBottom: 8 }}>
          Splitease
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.88)', position: 'relative', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.5 }}>
          Split expenses beautifully
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative' }}>
          <Link href="/groups" style={{
            height: 48, borderRadius: 14, padding: '0 28px',
            background: '#fff', color: '#333', fontSize: 16, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)', cursor: 'pointer',
          }}>
            Get Started
          </Link>
        </div>
        {groups.length > 0 && (
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 28, position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{groups.length}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Groups</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{expenses.length}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Expenses</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>${totalSpent.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Total Tracked</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 20, color: 'var(--ios-label)' }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href} style={{
              padding: 20, borderRadius: 16, background: 'var(--ios-bg2)',
              boxShadow: 'var(--ios-shadow)',
              textDecoration: 'none', transition: 'transform 0.2s ease',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: 'var(--ios-label3)', lineHeight: 1.4 }}>{f.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}