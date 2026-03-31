'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  memberIds: string[];
  createdAt: string;
}

export type Category = 'food' | 'transport' | 'lodging' | 'entertainment' | 'groceries' | 'utilities' | 'health' | 'travel' | 'other';

export interface Split {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidById: string;
  splits: Split[];
  category: Category;
  date: string;
  notes?: string;
}

export interface Settlement {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  groupId: string;
  date: string;
  note?: string;
}

export interface DebtSummary {
  fromId: string;
  toId: string;
  amount: number;
}

// ─── Category Metadata ────────────────────────────────────────────────────────

export const CATEGORIES: Record<Category, { label: string; emoji: string; color: string }> = {
  food:          { label: 'Food & Drink', emoji: '🍕', color: '#FF9500' },
  transport:     { label: 'Transport',    emoji: '🚗', color: '#007AFF' },
  lodging:       { label: 'Lodging',      emoji: '🏨', color: '#AF52DE' },
  entertainment: { label: 'Entertainment',emoji: '🎬', color: '#FF2D55' },
  groceries:     { label: 'Groceries',    emoji: '🛒', color: '#34C759' },
  utilities:     { label: 'Utilities',    emoji: '⚡', color: '#FFCC00' },
  health:        { label: 'Health',       emoji: '💊', color: '#FF3B30' },
  travel:        { label: 'Travel',       emoji: '✈️', color: '#5AC8FA' },
  other:         { label: 'Other',        emoji: '📦', color: '#8E8E93' },
};

// ─── Mock Seed Data ───────────────────────────────────────────────────────────

const SEED_MEMBERS: Member[] = [
  { id: 'm1', name: 'Alex Kim',     initials: 'AK', color: '#007AFF' },
  { id: 'm2', name: 'Jamie Lee',    initials: 'JL', color: '#34C759' },
  { id: 'm3', name: 'Taylor Reese', initials: 'TR', color: '#FF9500' },
  { id: 'm4', name: 'Sam Patel',    initials: 'SP', color: '#FF2D55' },
  { id: 'm5', name: 'Riley Chen',   initials: 'RC', color: '#AF52DE' },
  { id: 'm6', name: 'Morgan Davis', initials: 'MD', color: '#5AC8FA' },
];

const SEED_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Weekend Getaway',
    emoji: '🏔️',
    memberIds: ['m1', 'm2', 'm3', 'm4'],
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'g2',
    name: 'Apartment',
    emoji: '🏠',
    memberIds: ['m1', 'm5', 'm6'],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'g3',
    name: 'Friday Dinner Club',
    emoji: '🍽️',
    memberIds: ['m1', 'm2', 'm3', 'm5'],
    createdAt: '2026-02-01T10:00:00Z',
  },
];

const SEED_EXPENSES: Expense[] = [
  // Weekend Getaway
  {
    id: 'e1', groupId: 'g1', description: 'Airbnb Cabin',
    amount: 480, paidById: 'm1',
    splits: [
      { memberId: 'm1', amount: 120 }, { memberId: 'm2', amount: 120 },
      { memberId: 'm3', amount: 120 }, { memberId: 'm4', amount: 120 },
    ],
    category: 'lodging', date: '2026-03-01',
  },
  {
    id: 'e2', groupId: 'g1', description: 'Gas & Tolls',
    amount: 92, paidById: 'm2',
    splits: [
      { memberId: 'm1', amount: 23 }, { memberId: 'm2', amount: 23 },
      { memberId: 'm3', amount: 23 }, { memberId: 'm4', amount: 23 },
    ],
    category: 'transport', date: '2026-03-01',
  },
  {
    id: 'e3', groupId: 'g1', description: 'Groceries & Snacks',
    amount: 130, paidById: 'm3',
    splits: [
      { memberId: 'm1', amount: 32.5 }, { memberId: 'm2', amount: 32.5 },
      { memberId: 'm3', amount: 32.5 }, { memberId: 'm4', amount: 32.5 },
    ],
    category: 'groceries', date: '2026-03-02',
  },
  {
    id: 'e4', groupId: 'g1', description: 'Ski Lift Passes',
    amount: 320, paidById: 'm4',
    splits: [
      { memberId: 'm1', amount: 80 }, { memberId: 'm2', amount: 80 },
      { memberId: 'm3', amount: 80 }, { memberId: 'm4', amount: 80 },
    ],
    category: 'entertainment', date: '2026-03-02',
  },
  {
    id: 'e5', groupId: 'g1', description: 'Saturday Night Dinner',
    amount: 218, paidById: 'm1',
    splits: [
      { memberId: 'm1', amount: 54.5 }, { memberId: 'm2', amount: 54.5 },
      { memberId: 'm3', amount: 54.5 }, { memberId: 'm4', amount: 54.5 },
    ],
    category: 'food', date: '2026-03-02',
  },
  // Apartment
  {
    id: 'e6', groupId: 'g2', description: 'March Rent',
    amount: 3600, paidById: 'm1',
    splits: [
      { memberId: 'm1', amount: 1200 }, { memberId: 'm5', amount: 1200 }, { memberId: 'm6', amount: 1200 },
    ],
    category: 'utilities', date: '2026-03-01',
  },
  {
    id: 'e7', groupId: 'g2', description: 'Hydro Bill',
    amount: 135, paidById: 'm5',
    splits: [
      { memberId: 'm1', amount: 45 }, { memberId: 'm5', amount: 45 }, { memberId: 'm6', amount: 45 },
    ],
    category: 'utilities', date: '2026-03-05',
  },
  {
    id: 'e8', groupId: 'g2', description: 'Internet',
    amount: 90, paidById: 'm6',
    splits: [
      { memberId: 'm1', amount: 30 }, { memberId: 'm5', amount: 30 }, { memberId: 'm6', amount: 30 },
    ],
    category: 'utilities', date: '2026-03-05',
  },
  {
    id: 'e9', groupId: 'g2', description: 'Costco Run',
    amount: 246, paidById: 'm1',
    splits: [
      { memberId: 'm1', amount: 82 }, { memberId: 'm5', amount: 82 }, { memberId: 'm6', amount: 82 },
    ],
    category: 'groceries', date: '2026-03-10',
  },
  {
    id: 'e10', groupId: 'g2', description: 'New Coffee Machine',
    amount: 189, paidById: 'm5',
    splits: [
      { memberId: 'm1', amount: 63 }, { memberId: 'm5', amount: 63 }, { memberId: 'm6', amount: 63 },
    ],
    category: 'other', date: '2026-03-12',
  },
  // Friday Dinner Club
  {
    id: 'e11', groupId: 'g3', description: 'Sushi Night at Nobu',
    amount: 312, paidById: 'm2',
    splits: [
      { memberId: 'm1', amount: 78 }, { memberId: 'm2', amount: 78 },
      { memberId: 'm3', amount: 78 }, { memberId: 'm5', amount: 78 },
    ],
    category: 'food', date: '2026-03-07',
  },
  {
    id: 'e12', groupId: 'g3', description: 'Cocktails at Bar',
    amount: 156, paidById: 'm1',
    splits: [
      { memberId: 'm1', amount: 39 }, { memberId: 'm2', amount: 39 },
      { memberId: 'm3', amount: 39 }, { memberId: 'm5', amount: 39 },
    ],
    category: 'food', date: '2026-03-07',
  },
  {
    id: 'e13', groupId: 'g3', description: 'Italian at Terroni',
    amount: 284, paidById: 'm3',
    splits: [
      { memberId: 'm1', amount: 71 }, { memberId: 'm2', amount: 71 },
      { memberId: 'm3', amount: 71 }, { memberId: 'm5', amount: 71 },
    ],
    category: 'food', date: '2026-03-14',
  },
  {
    id: 'e14', groupId: 'g3', description: 'Dessert & Coffee',
    amount: 68, paidById: 'm5',
    splits: [
      { memberId: 'm1', amount: 17 }, { memberId: 'm2', amount: 17 },
      { memberId: 'm3', amount: 17 }, { memberId: 'm5', amount: 17 },
    ],
    category: 'food', date: '2026-03-14',
  },
  {
    id: 'e15', groupId: 'g3', description: 'Uber Shared Ride',
    amount: 44, paidById: 'm2',
    splits: [
      { memberId: 'm1', amount: 11 }, { memberId: 'm2', amount: 11 },
      { memberId: 'm3', amount: 11 }, { memberId: 'm5', amount: 11 },
    ],
    category: 'transport', date: '2026-03-14',
  },
];

const SEED_SETTLEMENTS: Settlement[] = [
  {
    id: 's1', fromId: 'm4', toId: 'm1', amount: 80, groupId: 'g1',
    date: '2026-03-05', note: 'Ski lift passes',
  },
  {
    id: 's2', fromId: 'm2', toId: 'm1', amount: 120, groupId: 'g1',
    date: '2026-03-06', note: 'Airbnb share',
  },
];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  members:     'se_members',
  groups:      'se_groups',
  expenses:    'se_expenses',
  settlements: 'se_settlements',
  seeded:      'se_seeded',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export function ensureSeeded() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.seeded)) return;
  save(KEYS.members, SEED_MEMBERS);
  save(KEYS.groups, SEED_GROUPS);
  save(KEYS.expenses, SEED_EXPENSES);
  save(KEYS.settlements, SEED_SETTLEMENTS);
  localStorage.setItem(KEYS.seeded, '1');
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function getMembers(): Member[] {
  return load<Member[]>(KEYS.members, SEED_MEMBERS);
}

export function getMember(id: string): Member | undefined {
  return getMembers().find(m => m.id === id);
}

export function addMember(name: string): Member {
  const members = getMembers();
  const colors = ['#007AFF','#34C759','#FF9500','#FF2D55','#AF52DE','#5AC8FA','#FF3B30','#FFCC00'];
  const color = colors[members.length % colors.length];
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  const member: Member = { id: uid(), name: name.trim(), initials, color };
  save(KEYS.members, [...members, member]);
  return member;
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export function getGroups(): Group[] {
  return load<Group[]>(KEYS.groups, SEED_GROUPS);
}

export function getGroup(id: string): Group | undefined {
  return getGroups().find(g => g.id === id);
}

export function createGroup(name: string, emoji: string, memberIds: string[]): Group {
  const group: Group = {
    id: uid(),
    name, emoji, memberIds,
    createdAt: new Date().toISOString(),
  };
  save(KEYS.groups, [...getGroups(), group]);
  return group;
}

export function addMemberToGroup(groupId: string, memberId: string) {
  const groups = getGroups();
  save(KEYS.groups, groups.map(g =>
    g.id === groupId ? { ...g, memberIds: [...new Set([...g.memberIds, memberId])] } : g
  ));
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function getExpenses(): Expense[] {
  return load<Expense[]>(KEYS.expenses, SEED_EXPENSES);
}

export function getGroupExpenses(groupId: string): Expense[] {
  return getExpenses().filter(e => e.groupId === groupId);
}

export function addExpense(data: Omit<Expense, 'id'>): Expense {
  const expense: Expense = { ...data, id: uid() };
  save(KEYS.expenses, [...getExpenses(), expense]);
  return expense;
}

// ─── Settlements ──────────────────────────────────────────────────────────────

export function getSettlements(): Settlement[] {
  return load<Settlement[]>(KEYS.settlements, SEED_SETTLEMENTS);
}

export function addSettlement(data: Omit<Settlement, 'id'>): Settlement {
  const s: Settlement = { ...data, id: uid() };
  save(KEYS.settlements, [...getSettlements(), s]);
  return s;
}

// ─── Balance Calculation ──────────────────────────────────────────────────────

/** Returns net balance per member (positive = owed money, negative = owes money) */
export function calcNetBalances(memberIds: string[], expenses: Expense[], settlements: Settlement[]): Record<string, number> {
  const bal: Record<string, number> = {};
  for (const id of memberIds) bal[id] = 0;

  for (const exp of expenses) {
    // Payer is owed the full amount
    if (bal[exp.paidById] !== undefined) bal[exp.paidById] += exp.amount;
    // Each split member owes their share
    for (const split of exp.splits) {
      if (bal[split.memberId] !== undefined) bal[split.memberId] -= split.amount;
    }
  }

  // Apply settlements
  for (const s of settlements) {
    if (bal[s.fromId] !== undefined) bal[s.fromId] -= s.amount; // debtor paid
    if (bal[s.toId]   !== undefined) bal[s.toId]   += s.amount; // creditor received
  }

  return bal;
}

/** Simplify debts to minimum transactions */
export function simplifyDebts(balances: Record<string, number>): DebtSummary[] {
  const creditors: { id: string; amount: number }[] = [];
  const debtors:   { id: string; amount: number }[] = [];

  for (const [id, bal] of Object.entries(balances)) {
    if (bal > 0.01)  creditors.push({ id, amount:  bal });
    if (bal < -0.01) debtors.push({   id, amount: -bal });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const result: DebtSummary[] = [];
  let ci = 0, di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = Math.min(c.amount, d.amount);
    result.push({ fromId: d.id, toId: c.id, amount: +amount.toFixed(2) });
    c.amount -= amount;
    d.amount -= amount;
    if (c.amount < 0.01) ci++;
    if (d.amount < 0.01) di++;
  }

  return result;
}

/** Group-level balance for a specific member */
export function getMemberGroupBalance(memberId: string, groupId: string): number {
  const group = getGroup(groupId);
  if (!group) return 0;
  const expenses = getGroupExpenses(groupId);
  const settlements = getSettlements().filter(s => s.groupId === groupId);
  const balances = calcNetBalances(group.memberIds, expenses, settlements);
  return balances[memberId] ?? 0;
}

/** Overall balance across all groups for a member */
export function getMemberTotalBalance(memberId: string): number {
  const groups = getGroups().filter(g => g.memberIds.includes(memberId));
  return groups.reduce((sum, g) => sum + getMemberGroupBalance(memberId, g.id), 0);
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function fmt(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}
