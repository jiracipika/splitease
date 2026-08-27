'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CATEGORIES,
  ensureSeeded,
  fmt,
  fmtDate,
  getExpenses,
  getGroups,
  getMembers,
  getSettlements,
  type Expense,
  type Settlement,
} from '@/lib/store';

interface ActivityRow {
  id: string;
  kind: 'expense' | 'settlement';
  date: string;
  groupLabel: string;
  title: string;
  detail: string;
  amount: number;
  emoji: string;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureSeeded();
    const groupLabel = new Map(getGroups().map(g => [g.id, `${g.emoji} ${g.name}`]));
    const memberName = new Map(getMembers().map(m => [m.id, m.name]));

    const expenseRows: ActivityRow[] = getExpenses()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e: Expense) => ({
        id: e.id,
        kind: 'expense' as const,
        date: e.date,
        groupLabel: groupLabel.get(e.groupId) ?? 'Unknown group',
        title: e.description,
        detail: `${memberName.get(e.paidById) ?? 'Someone'} paid · ${CATEGORIES[e.category].label}`,
        amount: e.amount,
        emoji: CATEGORIES[e.category].emoji,
      }));

    const settlementRows: ActivityRow[] = getSettlements().map((s: Settlement) => ({
      id: s.id,
      kind: 'settlement' as const,
      date: s.date,
      groupLabel: groupLabel.get(s.groupId) ?? 'Unknown group',
      title: 'Settlement',
      detail: `${memberName.get(s.fromId) ?? 'Someone'} → ${memberName.get(s.toId) ?? 'someone'}${s.note ? ` · ${s.note}` : ''}`,
      amount: s.amount,
      emoji: '🤝',
    }));

    const all = [...expenseRows, ...settlementRows].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    setRows(all);
    setHydrated(true);
  }, []);

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 16, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--ios-label)', marginBottom: 4 }}>History</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 20 }}>
          Every expense and settlement across your groups, newest first.
        </p>

        {rows.map(a => (
          <div
            key={`${a.kind}-${a.id}`}
            style={{
              padding: 14,
              borderRadius: 14,
              background: 'var(--ios-bg2)',
              boxShadow: 'var(--ios-shadow)',
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              marginBottom: 8,
              opacity: a.kind === 'settlement' ? 0.92 : 1,
            }}
          >
            <span aria-hidden="true" style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: a.kind === 'settlement' ? 'rgba(52,199,89,0.12)' : 'var(--ios-fill)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>
              {a.emoji}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ios-label)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>
                {a.detail} · {a.groupLabel} · {fmtDate(a.date)}
              </div>
            </div>
            <div style={{
              fontSize: a.kind === 'settlement' ? 15 : 16,
              fontWeight: 700,
              color: a.kind === 'settlement' ? 'var(--ios-green)' : 'var(--ios-label)',
              whiteSpace: 'nowrap',
            }}>
              {a.kind === 'settlement' ? '−' : ''}{fmt(a.amount)}
            </div>
          </div>
        ))}

        {rows.length === 0 && hydrated && (
          <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 14, color: 'var(--ios-label3)' }}>
            No activity yet — add an expense to get started.
          </p>
        )}
      </div>
    </div>
  );
}
