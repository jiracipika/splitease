'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  addSettlement,
  calcNetBalances,
  ensureSeeded,
  fmt,
  getExpenses,
  getGroups,
  getMembers,
  getSettlements,
  simplifyDebts,
  type DebtSummary,
} from '@/lib/store';

interface Suggestion extends DebtSummary {
  key: string;
}

export default function SettleUpPage() {
  const [groups, setGroups] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [activeId, setActiveId] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [members, setMembers] = useState<{ id: string; name: string; color: string }[]>([]);
  const [history, setHistory] = useState<ReturnType<typeof getSettlements>>([]);
  const [confirming, setConfirming] = useState<Suggestion | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureSeeded();
    const gs = getGroups();
    setGroups(gs);
    if (gs[0]) load(gs[0].id);
    setHydrated(true);
  }, []);

  const load = (groupId: string) => {
    setActiveId(groupId);
    const group = getGroups().find(g => g.id === groupId);
    if (!group) return;
    const groupExpenses = getExpenses().filter(e => e.groupId === groupId);
    const groupSettlements = getSettlements().filter(s => s.groupId === groupId);
    setMembers(getMembers().filter(m => group.memberIds.includes(m.id)));
    setBalances(calcNetBalances(group.memberIds, groupExpenses, groupSettlements));
    // Simplified debts, recomputed live so a fresh settlement clears the pair.
    setSuggestions(
      simplifyDebts(calcNetBalances(group.memberIds, groupExpenses, groupSettlements)).map(d => ({
        ...d,
        key: `${d.fromId}->${d.toId}`,
      })),
    );
    setHistory(groupSettlements.sort((a, b) => b.date.localeCompare(a.date)));
  };

  const record = () => {
    if (!confirming) return;
    try {
      addSettlement({
        fromId: confirming.fromId,
        toId: confirming.toId,
        amount: confirming.amount,
        groupId: activeId,
        date: new Date().toISOString().slice(0, 10),
        note: 'Marked settled from Settle Up',
      });
      setConfirming(null);
      setNotice('Settlement recorded.');
      load(activeId);
      window.setTimeout(() => setNotice(null), 2500);
    } catch {
      setNotice('Could not record that settlement.');
    }
  };

  const memberName = (id: string) => members.find(m => m.id === id)?.name ?? 'Unknown';

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 16, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--ios-label)', marginBottom: 4 }}>Settle Up</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 20 }}>
          The fewest transfers needed to square each group.
        </p>

        {/* Group switcher */}
        {groups.length > 0 && (
          <div role="tablist" aria-label="Choose group" style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto' }}>
            {groups.map(g => (
              <button
                key={g.id}
                role="tab"
                aria-selected={activeId === g.id}
                onClick={() => load(g.id)}
                style={{
                  padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activeId === g.id ? 'var(--ios-label)' : 'var(--ios-bg2)',
                  color: activeId === g.id ? '#fff' : 'var(--ios-label2)',
                }}
              >
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
        )}

        {notice && (
          <p role="status" style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--ios-fill2)', fontSize: 13, color: 'var(--ios-green)', marginBottom: 14 }}>
            {notice}
          </p>
        )}

        {suggestions.length > 0 ? (
          <section aria-label="Suggested settlements" style={{ marginBottom: 20 }}>
            {suggestions.map(s => (
              <div key={s.key} style={{ padding: 16, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ios-label)' }}>
                    {memberName(s.fromId)} → {memberName(s.toId)}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{fmt(s.amount)}</div>
                </div>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Settling up ${fmt(s.amount)}`)}&body=${encodeURIComponent(`Hi! I owe you ${fmt(s.amount)}. Sending via Interac e-Transfer now.`)}`}
                  style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'var(--ios-blue)', color: '#fff' }}
                >
                  e-Transfer
                </a>
                <button
                  onClick={() => setConfirming(s)}
                  style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid var(--ios-separator)', cursor: 'pointer', background: 'var(--ios-bg2)', color: 'var(--ios-green)' }}
                >
                  ✓ Mark paid
                </button>
              </div>
            ))}
          </section>
        ) : (
          hydrated && groups.length > 0 && (
            <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 15, color: 'var(--ios-green)', fontWeight: 600 }}>
              🎉 Everyone is square in this group.
            </p>
          )
        )}

        {/* Confirm dialog */}
        {confirming && (
          <div role="dialog" aria-modal="true" aria-label="Confirm settlement" style={{
            position: 'fixed', inset: 0, zIndex: 40, display: 'grid', placeItems: 'center',
            background: 'rgba(0,0,0,0.42)', padding: 24,
          }} onClick={() => setConfirming(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 360, padding: 22, borderRadius: 18, background: 'var(--ios-bg2)', boxShadow: '0 12px 48px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Record settlement?</h2>
              <p style={{ fontSize: 14, color: 'var(--ios-label2)', marginBottom: 18 }}>
                <strong>{memberName(confirming.fromId)}</strong> paid{' '}
                <strong>{fmt(confirming.amount)}</strong> to{' '}
                <strong>{memberName(confirming.toId)}</strong>.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={record} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff', fontSize: 14, fontWeight: 600 }}>Yes, recorded</button>
                <button onClick={() => setConfirming(null)} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--ios-separator)', cursor: 'pointer', background: 'var(--ios-bg2)', color: 'var(--ios-label)', fontSize: 14, fontWeight: 600 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Balances detail */}
        <section aria-label="Current balances" style={{ padding: 18, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Current balances</h2>
          {members.map(m => {
            const bal = balances[m.id] ?? 0;
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                <span style={{ color: 'var(--ios-label)' }}>{m.name}</span>
                <span style={{ fontWeight: 600, color: Math.abs(bal) < 0.005 ? 'var(--ios-label3)' : bal > 0 ? 'var(--ios-green)' : 'var(--ios-red)' }}>
                  {Math.abs(bal) < 0.005 ? 'settled' : bal > 0 ? `gets ${fmt(bal)}` : `owes ${fmt(-bal)}`}
                </span>
              </div>
            );
          })}
        </section>

        {/* Settlement history */}
        {history.length > 0 && (
          <section aria-label="Past settlements">
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Past settlements</h2>
            {history.map(s => (
              <div key={s.id} style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--ios-bg2)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--ios-label2)' }}>
                  {memberName(s.fromId)} → {memberName(s.toId)}
                  {s.note ? ` · ${s.note}` : ''}
                </span>
                <span style={{ fontWeight: 600 }}>{fmt(s.amount)}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
