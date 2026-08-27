'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CATEGORIES,
  addExpense,
  ensureSeeded,
  fmt,
  fmtDate,
  getGroups,
  getGroupExpenses,
  getMembers,
  type Category,
  type Expense,
  type Group,
} from '@/lib/store';

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export default function Expenses() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [filter, setFilter] = useState<'all' | string>('all');
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureSeeded();
    const gs = getGroups();
    setGroups(gs);
    const first = gs[0];
    if (first) selectGroup(first.id);
    setHydrated(true);
  }, []);

  const selectGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    setExpenses(getGroupExpenses(groupId).sort((a, b) => b.date.localeCompare(a.date)));
    const group = getGroups().find(g => g.id === groupId);
    setMembers(getMembers().filter(m => group?.memberIds.includes(m.id)));
    // sensible default payer: first member
    const ms = getMembers().filter(m => group?.memberIds.includes(m.id));
    setPaidBy(ms[0]?.id ?? '');
  };

  const submit = () => {
    setError(null);
    const value = parseFloat(amount);
    if (!desc.trim()) return setError('Please enter a description.');
    if (!Number.isFinite(value) || value <= 0) return setError('Please enter an amount greater than zero.');
    if (!paidBy) return setError('Pick who paid.');
    try {
      const splitAmount = Math.round((value / members.length) * 100) / 100;
      // Fix rounding drift on the last member so splits sum exactly.
      const splits = members.map((m, i) => ({
        memberId: m.id,
        amount:
          i === members.length - 1
            ? Math.round((value - splitAmount * (members.length - 1)) * 100) / 100
            : splitAmount,
      }));
      addExpense({
        groupId: activeGroupId,
        description: desc.trim(),
        amount: value,
        paidById: paidBy,
        splits,
        category,
        date: new Date().toISOString().slice(0, 10),
      });
      setExpenses(getGroupExpenses(activeGroupId).sort((a, b) => b.date.localeCompare(a.date)));
      setShowAdd(false);
      setDesc('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the expense.');
    }
  };

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.paidById === filter);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const memberName = (id: string) => members.find(m => m.id === id)?.name ?? 'Unknown';

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 16, display: 'inline-block' }}>← Back</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>Expenses</h1>
            {hydrated && groups.length === 0 && (
              <p style={{ fontSize: 15, color: 'var(--ios-label3)' }}>
                Create a group first — expenses belong to groups.
              </p>
            )}
          </div>
          {groups.length > 0 && (
            <button onClick={() => setShowAdd(v => !v)} aria-expanded={showAdd} style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>+ Add</button>
          )}
        </div>

        {/* Group switcher */}
        {groups.length > 0 && (
          <div role="tablist" aria-label="Choose group" style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto' }}>
            {groups.map(g => (
              <button
                key={g.id}
                role="tab"
                aria-selected={activeGroupId === g.id}
                onClick={() => selectGroup(g.id)}
                style={{
                  padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activeGroupId === g.id ? 'var(--ios-label)' : 'var(--ios-bg2)',
                  color: activeGroupId === g.id ? '#fff' : 'var(--ios-label2)',
                }}
              >
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
        )}

        {showAdd && (
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {CATEGORY_KEYS.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  aria-label={CATEGORIES[c].label}
                  title={CATEGORIES[c].label}
                  style={{
                    fontSize: 22, padding: 8, borderRadius: 10,
                    border: category === c ? '2px solid var(--ios-blue)' : '2px solid transparent',
                    cursor: 'pointer', background: 'transparent',
                  }}
                >
                  {CATEGORIES[c].emoji}
                </button>
              ))}
            </div>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" aria-label="Description" style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)', marginBottom: 8, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ($)" aria-label="Amount in dollars" style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)', outline: 'none' }} />
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)} aria-label="Who paid" style={{ padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)' }}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            {error && <p role="alert" style={{ fontSize: 13, color: 'var(--ios-red)', marginBottom: 10 }}>{error}</p>}
            <p style={{ fontSize: 12, color: 'var(--ios-label3)', marginBottom: 10 }}>
              Splits evenly across all {members.length} member{members.length !== 1 ? 's' : ''}.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submit} disabled={!desc.trim() || !amount} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: desc.trim() && amount ? 'pointer' : 'default', background: desc.trim() && amount ? 'var(--ios-blue)' : 'var(--ios-fill2)', color: desc.trim() && amount ? '#fff' : 'var(--ios-label3)' }}>Add Expense</button>
              <button onClick={() => { setShowAdd(false); setError(null); }} style={{ padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid var(--ios-separator)', cursor: 'pointer', background: 'var(--ios-bg2)', color: 'var(--ios-label)' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>{activeGroup ? `${activeGroup.name} total` : 'Total'}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(total)}</div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>Your Share</div>
            <div data-testid="your-share" style={{ fontSize: 20, fontWeight: 700 }}>
              {fmt(expenses.reduce((s, e) => {
                const mine = e.splits.find(sp => sp.memberId === paidBy);
                return s + (mine?.amount ?? 0);
              }, 0))}
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>{paidBy ? `${memberName(paidBy)} Paid` : 'Paid'}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {fmt(expenses.filter(e => e.paidById === paidBy).reduce((s, e) => s + e.amount, 0))}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
          <button onClick={() => setFilter('all')} aria-pressed={filter === 'all'} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: filter === 'all' ? 'var(--ios-label)' : 'var(--ios-bg2)', color: filter === 'all' ? '#fff' : 'var(--ios-label2)', whiteSpace: 'nowrap' }}>All</button>
          {members.map(m => (
            <button key={m.id} onClick={() => setFilter(m.id)} aria-pressed={filter === m.id} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: filter === m.id ? 'var(--ios-label)' : 'var(--ios-bg2)', color: filter === m.id ? '#fff' : 'var(--ios-label2)', whiteSpace: 'nowrap' }}>{m.name}</button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(e => (
            <div key={e.id} style={{ padding: 14, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span aria-hidden="true" style={{ fontSize: 26 }}>{CATEGORIES[e.category].emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ios-label)' }}>{e.description}</div>
                <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>
                  {memberName(e.paidById)} paid · {fmtDate(e.date)} · split {e.splits.length} way{e.splits.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ios-label)' }}>{fmt(e.amount)}</div>
            </div>
          ))}
          {filtered.length === 0 && hydrated && (
            <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 14, color: 'var(--ios-label3)' }}>
              {expenses.length === 0 ? 'No expenses yet.' : 'No expenses match this filter.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
