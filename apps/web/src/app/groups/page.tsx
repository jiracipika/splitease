'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Member { id: string; name: string; avatar: string; balance: number; }
interface Group { id: string; name: string; emoji: string; members: Member[]; totalSpent: number; updatedAt: string; }

const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Beach Trip', emoji: '🏖️', totalSpent: 1450, updatedAt: '2h ago', members: [
    { id: 'm1', name: 'You', avatar: '🧑', balance: -45 },
    { id: 'm2', name: 'Alex', avatar: '👨', balance: 120 },
    { id: 'm3', name: 'Sam', avatar: '👩', balance: -75 },
  ]},
  { id: 'g2', name: 'Apartment', emoji: '🏠', totalSpent: 4200, updatedAt: '1d ago', members: [
    { id: 'm1', name: 'You', avatar: '🧑', balance: -210 },
    { id: 'm4', name: 'Jordan', avatar: '🧔', balance: 210 },
  ]},
  { id: 'g3', name: 'Friday Dinner', emoji: '🍕', totalSpent: 320, updatedAt: '3d ago', members: [
    { id: 'm1', name: 'You', avatar: '🧑', balance: 40 },
    { id: 'm2', name: 'Alex', avatar: '👨', balance: -40 },
  ]},
  { id: 'g4', name: 'Ski Trip', emoji: '⛷️', totalSpent: 2800, updatedAt: '1w ago', members: [
    { id: 'm1', name: 'You', avatar: '🧑', balance: -180 },
    { id: 'm5', name: 'Casey', avatar: '👱‍♀️', balance: 90 },
    { id: 'm6', name: 'Riley', avatar: '🧑‍🎤', balance: 90 },
  ]},
];

export default function Groups() {
  const [groups] = useState(MOCK_GROUPS);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>My Groups</h1>
            <p style={{ fontSize: 15, color: 'var(--ios-label3)' }}>{groups.length} groups</p>
          </div>
          <button onClick={() => setShowNew(true)} style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>+ New Group</button>
        </div>

        {showNew && (
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 20, display: 'flex', gap: 8 }}>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)' }} />
            <button onClick={() => { setShowNew(false); setNewName(''); }} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>Create</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groups.map(g => (
            <Link key={g.id} href={`/groups/${g.id}`} style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 32 }}>{g.emoji}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ios-label)' }}>{g.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--ios-label3)' }}>{g.members.length} members &middot; ${g.totalSpent} total &middot; {g.updatedAt}</div>
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  {g.members.slice(0, 3).map(m => (
                    <div key={m.id} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ios-bg)', border: '2px solid var(--ios-bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginLeft: -6 }}>{m.avatar}</div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
