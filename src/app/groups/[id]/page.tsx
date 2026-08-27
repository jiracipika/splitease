'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CATEGORIES,
  calcNetBalances,
  ensureSeeded,
  fmt,
  fmtDate,
  getGroup,
  getGroupExpenses,
  getMembers,
  simplifyDebts,
} from '@/lib/store';

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const groupId = params?.id ?? '';
  const [data, setData] = useState<{
    name: string; emoji: string; memberCount: number;
    expenses: ReturnType<typeof getGroupExpenses>;
    balances: Record<string, number>;
    members: { id: string; name: string }[];
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    ensureSeeded();
    const group = getGroup(groupId);
    if (!group) {
      setNotFound(true);
      return;
    }
    const members = getMembers().filter(m => group.memberIds.includes(m.id));
    const expenses = getGroupExpenses(groupId).sort((a, b) => b.date.localeCompare(a.date));
    const settlements = (JSON.parse(localStorage.getItem('se_settlements') || '[]') as { fromId: string; toId: string; amount: number; groupId: string }[])
      .filter(s => s.groupId === groupId);

    const balances = calcNetBalances(group.memberIds, expenses, settlements as never);
    setData({
      name: group.name,
      emoji: group.emoji,
      memberCount: group.memberIds.length,
      expenses,
      balances,
      members,
    });
  }, [groupId]);

  if (notFound) {
    return (
      <div style={{ background: 'var(--ios-bg)', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Group not found</h1>
          <Link href="/groups" style={{ color: 'var(--ios-blue)', fontSize: 15 }}>← Back to groups</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }} />;
  }

  const debts = simplifyDebts(data.balances);
  const memberName = (id: string) => data.members.find(m => m.id === id)?.name ?? 'Unknown';

  const totalSpent = data.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/groups" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 16, display: 'inline-block' }}>← All groups</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <span aria-hidden="true" style={{ fontSize: 36 }}>{data.emoji}</span>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--ios-label)' }}>{data.name}</h1>
        </div>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 20 }}>
          {data.memberCount} member{data.memberCount !== 1 ? 's' : ''} · {fmt(totalSpent)} tracked
        </p>

        {/* Balances */}
        <section aria-label="Member balances" style={{ padding: 18, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Balances</h2>
          {data.members.map(m => {
            const bal = data.balances[m.id] ?? 0;
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
                <span style={{ fontSize: 14, color: 'var(--ios-label)' }}>{m.name}</span>
                <span style={{
                  fontSize: 14, fontWeight: 600,
                  color: Math.abs(bal) < 0.005 ? 'var(--ios-green)' : bal > 0 ? 'var(--ios-green)' : 'var(--ios-red)',
                }}>
                  {Math.abs(bal) < 0.005 ? 'settled' : bal > 0 ? `gets ${fmt(bal)}` : `owes ${fmt(-bal)}`}
                </span>
              </div>
            );
          })}
        </section>

        {/* Simplified debts */}
        {debts.length > 0 && (
          <section aria-label="Suggested settlements" style={{ padding: 18, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Who should pay whom</h2>
            {debts.map(d => (
              <div key={`${d.fromId}-${d.toId}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 14 }}>
                <span style={{ color: 'var(--ios-label2)' }}>
                  <strong>{memberName(d.fromId)}</strong> → <strong>{memberName(d.toId)}</strong>
                </span>
                <span style={{ fontWeight: 600, color: 'var(--ios-label)' }}>{fmt(d.amount)}</span>
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--ios-label3)', marginTop: 10 }}>
              Minimum number of transfers to square the group. Send via Interac e-Transfer and mark it settled on the Settle page.
            </p>
          </section>
        )}

        {/* Expense list */}
        <section aria-label="Expenses">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Expenses ({data.expenses.length})</h2>
            <Link href="/expenses" style={{ fontSize: 13, color: 'var(--ios-blue)' }}>View all →</Link>
          </div>
          {data.expenses.map(e => (
            <div key={e.id} style={{ padding: 14, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span aria-hidden="true" style={{ fontSize: 24 }}>{CATEGORIES[e.category].emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ios-label)' }}>{e.description}</div>
                <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>
                  {memberName(e.paidById)} paid · {fmtDate(e.date)} · split {e.splits.length} way{e.splits.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ios-label)' }}>{fmt(e.amount)}</div>
            </div>
          ))}
          {data.expenses.length === 0 && (
            <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 14, color: 'var(--ios-label3)' }}>
              No expenses yet — add one from the Expenses page.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
