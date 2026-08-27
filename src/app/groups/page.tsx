'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ensureSeeded,
  fmt,
  getExpenses,
  getGroups,
  getMemberGroupBalance,
  getMembers,
  type Group,
} from '@/lib/store';

interface GroupRow {
  group: Group;
  totalSpent: number;
  /** Sum of |member balance| — 0 means fully settled */
  outstanding: number;
}

export default function Groups() {
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('👥');

  useEffect(() => {
    ensureSeeded();
    const members = getMembers();
    setRows(
      getGroups().map((group) => {
        const groupExpenses = getExpenses().filter((e) => e.groupId === group.id);
        const totalSpent = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
        const outstanding = group.memberIds.reduce(
          (sum, id) => sum + Math.abs(getMemberGroupBalance(id, group.id)),
          0,
        );
        return { group, totalSpent, outstanding };
      }),
    );
    setHydrated(true);
  }, []);

  const create = () => {
    // Real creation lives on the full editor at /groups/new (member picking
    // needs more than one input); quick-create here seeds a solo group.
    const name = newName.trim();
    if (!name) return;
    try {
      const raw = localStorage.getItem('se_groups');
      const groups: Group[] = raw ? JSON.parse(raw) : [];
      groups.push({
        id: crypto.randomUUID(),
        name,
        emoji: newEmoji || '👥',
        memberIds: [],
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('se_groups', JSON.stringify(groups));
      window.location.reload();
    } catch {
      // Storage unavailable; stay on page.
    }
  };

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>My Groups</h1>
            <p style={{ fontSize: 15, color: 'var(--ios-label3)' }}>{rows.length} group{rows.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowNew(v => !v)} aria-expanded={showNew} style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>+ New Group</button>
        </div>

        {showNew && (
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={newEmoji} onChange={e => setNewEmoji(e.target.value)} aria-label="Group icon" style={{ padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 16, background: 'var(--ios-bg)', color: 'var(--ios-label)' }}>
              {['👥','🏔️','🏠','🏖️','⛷️','🍕','🍽️','✈️'].map(em => <option key={em} value={em}>{em}</option>)}
            </select>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && create()}
              placeholder="Group name..."
              aria-label="Group name"
              style={{ flex: 1, minWidth: 160, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)' }}
            />
            <button onClick={create} disabled={!newName.trim()} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: newName.trim() ? 'pointer' : 'default', background: newName.trim() ? 'var(--ios-green)' : 'var(--ios-fill2)', color: newName.trim() ? '#fff' : 'var(--ios-label3)' }}>Create</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(({ group, totalSpent, outstanding }) => (
            <Link key={group.id} href={`/groups/${group.id}`} style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div aria-hidden="true" style={{ fontSize: 32 }}>{group.emoji}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ios-label)' }}>{group.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--ios-label3)' }}>
                      {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''} · {fmt(totalSpent)} tracked
                    </div>
                    <div style={{ fontSize: 12, marginTop: 2, color: outstanding > 0.005 ? 'var(--ios-orange)' : 'var(--ios-green)', fontWeight: 500 }}>
                      {outstanding > 0.005 ? `${fmt(outstanding)} unsettled` : 'All settled up'}
                    </div>
                  </div>
                </div>
                <span aria-hidden="true" style={{ fontSize: 18, color: 'var(--ios-label4)' }}>›</span>
              </div>
            </Link>
          ))}
          {rows.length === 0 && hydrated && (
            <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 15, color: 'var(--ios-label3)' }}>
              No groups yet — create your first one above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
