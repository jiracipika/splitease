'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Expense { id: string; description: string; amount: number; paidBy: string; splitAmong: string[]; date: string; category: string; }
interface Member { id: string; name: string; avatar: string; balance: number; }

const MEMBERS: Member[] = [
  { id: 'm1', name: 'You', avatar: '🧑', balance: -45 },
  { id: 'm2', name: 'Alex', avatar: '👨', balance: 120 },
  { id: 'm3', name: 'Sam', avatar: '👩', balance: -75 },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', description: 'Hotel booking', amount: 450, paidBy: 'm2', splitAmong: ['m1', 'm2', 'm3'], date: 'Mar 28', category: '🏨' },
  { id: 'e2', description: 'Groceries', amount: 85, paidBy: 'm1', splitAmong: ['m1', 'm2', 'm3'], date: 'Mar 28', category: '🛒' },
  { id: 'e3', description: 'Gas', amount: 62, paidBy: 'm3', splitAmong: ['m1', 'm3'], date: 'Mar 27', category: '⛽' },
  { id: 'e4', description: 'Dinner', amount: 120, paidBy: 'm2', splitAmong: ['m1', 'm2', 'm3'], date: 'Mar 27', category: '🍽️' },
  { id: 'e5', description: 'Surfboard rental', amount: 90, paidBy: 'm1', splitAmong: ['m1', 'm2'], date: 'Mar 26', category: '🏄' },
  { id: 'e6', description: 'Ice cream', amount: 24, paidBy: 'm3', splitAmong: ['m1', 'm2', 'm3'], date: 'Mar 26', category: '🍦' },
];

const CATEGORIES = ['🏨', '🍽️', '🛒', '⛽', '🏄', '🎬', '🚕', '🍺', '☕', '🎁'];

export default function Expenses() {
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('m1');
  const [category, setCategory] = useState('🍽️');
  const [filter, setFilter] = useState('all');

  const addExpense = () => {
    if (!desc || !amount) return;
    const newExp: Expense = {
      id: `e${Date.now()}`, description: desc, amount: parseFloat(amount),
      paidBy, splitAmong: MEMBERS.map(m => m.id), date: 'Today', category,
    };
    setExpenses([newExp, ...expenses]);
    setShowAdd(false); setDesc(''); setAmount('');
  };

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.paidBy === filter);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const yourShare = expenses.reduce((s, e) => {
    if (e.splitAmong.includes('m1')) return s + e.amount / e.splitAmong.length;
    return s;
  }, 0);
  const youPaid = expenses.filter(e => e.paidBy === 'm1').reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 16, display: 'inline-block' }}>← Back</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>Expenses</h1>
            <p style={{ fontSize: 15, color: 'var(--ios-label3)' }}>Beach Trip</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>+ Add</button>
        </div>

        {showAdd && (
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {CATEGORIES.slice(0, 7).map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{ fontSize: 24, padding: 8, borderRadius: 10, border: category === c ? '2px solid var(--ios-blue)' : 'none', cursor: 'pointer', background: 'transparent' }}>{c}</button>
              ))}
            </div>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)', marginBottom: 8, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ($)" style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)', outline: 'none' }} />
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)' }}>
                {MEMBERS.map(m => <option key={m.id} value={m.id}>Paid by {m.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addExpense} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-blue)', color: '#fff' }}>Add Expense</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid var(--ios-separator)', cursor: 'pointer', background: 'var(--ios-bg2)', color: 'var(--ios-label)' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>Total</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>${total.toFixed(0)}</div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>Your Share</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>${yourShare.toFixed(0)}</div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>You Paid</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>${youPaid.toFixed(0)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
          <button onClick={() => setFilter('all')} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: filter === 'all' ? 'var(--ios-label)' : 'var(--ios-bg2)', color: filter === 'all'? '#fff' : 'var(--ios-label2)', whiteSpace: 'nowrap' }}>All</button>
          {MEMBERS.map(m => (
            <button key={m.id} onClick={() => setFilter(m.id)} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: filter === m.id ? 'var(--ios-label)' : 'var(--ios-bg2)', color: filter === m.id ? '#fff' : 'var(--ios-label2)', whiteSpace: 'nowrap' }}>{m.avatar} {m.name}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(e => {
            const payer = MEMBERS.find(m => m.id === e.paidBy);
            return (
              <div key={e.id} style={{ padding: 14, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 28 }}>{e.category}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ios-label)' }}>{e.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--ios-label3)' }}>{payer?.name} paid &middot; {e.date} &middot; Split {e.splitAmong.length} ways</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ios-red)' }}>${e.amount}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
