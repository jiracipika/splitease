import AsyncStorage from '@react-native-async-storage/async-storage';

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
  groupId: string;
  fromId: string;
  toId: string;
  amount: number;
  date: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  seeded: 'splitease_seeded',
  members: 'splitease_members',
  groups: 'splitease_groups',
  expenses: 'splitease_expenses',
  settlements: 'splitease_settlements',
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_MEMBERS: Member[] = [
  { id: 'm1', name: 'You', initials: 'Y', color: '#007AFF' },
  { id: 'm2', name: 'Alex', initials: 'A', color: '#34C759' },
  { id: 'm3', name: 'Sam', initials: 'S', color: '#FF9500' },
];

const SEED_GROUPS: Group[] = [
  { id: 'g1', name: 'Apartment', emoji: '🏠', memberIds: ['m1', 'm2', 'm3'], createdAt: new Date().toISOString() },
  { id: 'g2', name: 'Trip', emoji: '✈️', memberIds: ['m1', 'm2'], createdAt: new Date().toISOString() },
];

const SEED_EXPENSES: Expense[] = [
  { id: 'e1', groupId: 'g1', description: 'Groceries', amount: 45.30, paidById: 'm1', splits: [{ memberId: 'm1', amount: 15.10 }, { memberId: 'm2', amount: 15.10 }, { memberId: 'm3', amount: 15.10 }], category: 'groceries', date: new Date().toISOString() },
  { id: 'e2', groupId: 'g1', description: 'Electricity', amount: 80.00, paidById: 'm2', splits: [{ memberId: 'm1', amount: 26.67 }, { memberId: 'm2', amount: 26.67 }, { memberId: 'm3', amount: 26.67 }], category: 'utilities', date: new Date().toISOString() },
  { id: 'e3', groupId: 'g2', description: 'Gas', amount: 30.00, paidById: 'm1', splits: [{ memberId: 'm1', amount: 15.00 }, { memberId: 'm2', amount: 15.00 }], category: 'transport', date: new Date().toISOString() },
];

const SEED_SETTLEMENTS: Settlement[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

async function save<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save', key, e);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function ensureSeeded(): Promise<void> {
  const seeded = await AsyncStorage.getItem(KEYS.seeded);
  if (seeded) return;
  await save(KEYS.members, SEED_MEMBERS);
  await save(KEYS.groups, SEED_GROUPS);
  await save(KEYS.expenses, SEED_EXPENSES);
  await save(KEYS.settlements, SEED_SETTLEMENTS);
  await AsyncStorage.setItem(KEYS.seeded, '1');
}

export async function getMembers(): Promise<Member[]> {
  return load<Member[]>(KEYS.members, SEED_MEMBERS);
}

export async function getMember(id: string): Promise<Member | undefined> {
  const members = await getMembers();
  return members.find(m => m.id === id);
}

export async function getGroups(): Promise<Group[]> {
  return load<Group[]>(KEYS.groups, SEED_GROUPS);
}

export async function getGroup(id: string): Promise<Group | undefined> {
  const groups = await getGroups();
  return groups.find(g => g.id === id);
}

export async function getExpenses(): Promise<Expense[]> {
  return load<Expense[]>(KEYS.expenses, SEED_EXPENSES);
}

export async function getExpensesByGroup(groupId: string): Promise<Expense[]> {
  const expenses = await getExpenses();
  return expenses.filter(e => e.groupId === groupId);
}

export async function getSettlements(): Promise<Settlement[]> {
  return load<Settlement[]>(KEYS.settlements, SEED_SETTLEMENTS);
}

// ─── Debt Calculation ─────────────────────────────────────────────────────────

export interface DebtSummary {
  fromId: string;
  toId: string;
  amount: number;
}

export async function getDebts(groupId?: string): Promise<DebtSummary[]> {
  const expenses = groupId ? await getExpensesByGroup(groupId) : await getExpenses();
  const balances = new Map<string, number>();

  for (const exp of expenses) {
    // Payer gets credited
    balances.set(exp.paidById, (balances.get(exp.paidById) || 0) + exp.amount);
    // Each split member gets debited
    for (const split of exp.splits) {
      balances.set(split.memberId, (balances.get(split.memberId) || 0) - split.amount);
    }
  }

  const creditors = [...balances.entries()].filter(([, v]) => v > 0.01).sort((a, b) => b[1] - a[1]);
  const debtors = [...balances.entries()].filter(([, v]) => v < -0.01).sort((a, b) => a[1] - b[1]);

  const debts: DebtSummary[] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const [credId, credAmt] = creditors[ci];
    const [debtId, debtAmt] = debtors[di];
    const settle = Math.min(credAmt, -debtAmt);
    debts.push({ fromId: debtId, toId: credId, amount: settle });
    creditors[ci] = [credId, credAmt - settle];
    debtors[di] = [debtId, debtAmt + settle];
    if (creditors[ci][1] < 0.01) ci++;
    if (debtors[di][1] > -0.01) di++;
  }

  return debts;
}

// ─── Category Metadata ────────────────────────────────────────────────────────

export const CATEGORIES: Record<Category, { label: string; emoji: string }> = {
  food: { label: 'Food', emoji: '🍔' },
  transport: { label: 'Transport', emoji: '🚗' },
  lodging: { label: 'Lodging', emoji: '🏨' },
  entertainment: { label: 'Entertainment', emoji: '🎮' },
  groceries: { label: 'Groceries', emoji: '🛒' },
  utilities: { label: 'Utilities', emoji: '💡' },
  health: { label: 'Health', emoji: '⚕️' },
  travel: { label: 'Travel', emoji: '✈️' },
  other: { label: 'Other', emoji: '📦' },
};
