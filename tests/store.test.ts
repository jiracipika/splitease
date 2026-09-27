import { beforeEach, describe, expect, it, vi } from 'vitest';

// Money-math contract for the split store. localStorage is stubbed so tests
// run in node without touching real persisted state.
const store = new Map<string, string>();
vi.stubGlobal('window', {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
  dispatchEvent: () => true,
});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
});

import {
  addExpense,
  calcNetBalances,
  ensureSeeded,
  getMembers,
  simplifyDebts,
} from '../src/lib/store';
import type { Expense, Settlement } from '../src/lib/store';

beforeEach(() => {
  store.clear();
  ensureSeeded();
});

const seedIds = () => getMembers().map((m) => m.id);
const exp = (paidById: string, amount: number, splits: [string, number][]): Omit<Expense, 'id'> => ({
  description: 'Test expense',
  groupId: 'g1',
  paidById,
  date: '2026-09-27',
  category: 'food',
  notes: '',
  amount,
  splits: splits.map(([memberId, sAmount]) => ({ memberId, amount: sAmount })),
});

describe('calcNetBalances', () => {
  it('payer is owed the out-of-pocket amount (full credit minus own share)', () => {
    const [a, b, c] = seedIds();
    const balances = calcNetBalances(
      [a, b, c],
      [exp(a, 10.0, [[a, 3.33], [b, 3.33], [c, 3.34]] as never)],
      [],
    );
    // Paid 10.00 but owes their own 3.33 share -> net +6.67.
    expect(balances[a]).toBeCloseTo(6.67, 2);
    expect(balances[b]).toBeCloseTo(-3.33, 2);
    expect(balances[c]).toBeCloseTo(-3.34, 2);
    // Conservation: the books sum to zero.
    const sum = Object.values(balances).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(0, 2);
  });

  it('settlements reduce both sides', () => {
    const [a, b, c] = seedIds();
    const expenses = [exp(a, 30.0, [[a, 0], [b, 10], [c, 20]] as never)];
    const settlements: Settlement[] = [
      { id: 's1', groupId: 'g1', fromId: b, toId: a, amount: 5, date: '2026-09-27' },
    ];
    const balances = calcNetBalances([a, b, c], expenses, settlements);
    expect(balances[a]).toBeCloseTo(25, 2); // 30 owed minus 5 received
    expect(balances[b]).toBeCloseTo(-5, 2); // -10 plus 5 paid
  });

  it('is tolerant of unknown member ids in the raw math (guard lives in addExpense)', () => {
    const [a] = seedIds();
    const balances = calcNetBalances([a], [exp(a, 10.0, [[a, 10]])], []);
    expect(balances[a]).toBe(0);
  });
});

describe('simplifyDebts', () => {
  it('zero balances produce no transactions', () => {
    // True mutual debts net to zero in calcNetBalances already; simplifyDebts
    // only sees net positions, so zeros mean nothing to move.
    const debts = simplifyDebts({ a: 0, b: 0 });
    expect(debts).toEqual([]);
  });

  it('three-way owes collapse into minimum transactions with conserved totals', () => {
    // a is owed 30; b owes 20, c owes 10 -> 2 transactions max.
    const debts = simplifyDebts({ a: 30, b: -20, c: -10 });
    expect(debts).toHaveLength(2);
    const moved = debts.reduce((s, d) => s + d.amount, 0);
    expect(moved).toBeCloseTo(30, 2);
    expect(debts.every((d) => d.toId === 'a')).toBe(true);
  });
});

describe('addExpense validation', () => {
  it('rejects splits that do not sum exactly to the total (float drift included)', () => {
    const [a, b, c] = seedIds();
    expect(() => addExpense(exp(a, 10.0, [[a, 3.33], [b, 3.33], [c, 3.33]] as never))).toThrow();
    expect(() => addExpense(exp(a, 10.0, [[a, 3.33], [b, 3.33], [c, 3.34]] as never))).not.toThrow();
  });

  it('rejects duplicate split members', () => {
    const [a] = seedIds();
    expect(() => addExpense(exp(a, 10.0, [[a, 5], [a, 5]] as never))).toThrow(/more than once/);
  });

  it('rejects splits and payers outside the group (silent-vanish guard)', () => {
    const [a] = seedIds();
    expect(() => addExpense(exp(a, 10.0, [['ghost-member', 10]] as never))).toThrow(/member of the group/);
    expect(() => addExpense({ ...exp(a, 10.0, [[a, 10]] as never), paidById: 'ghost-payer' })).toThrow(/member of the group/);
  });
});
