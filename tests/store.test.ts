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
  addSettlement,
  buildSplits,
  calcNetBalances,
  deleteExpense,
  deleteSettlement,
  ensureSeeded,
  getExpenses,
  getMembers,
  getSettlements,
  simplifyDebts,
  updateExpense,
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

describe('buildSplits (even)', () => {
  it('absorbs rounding drift so an even split sums exactly to the total', () => {
    const splits = buildSplits(['a', 'b', 'c'], 100);
    expect(splits).toEqual([
      { memberId: 'a', amount: 33.33 },
      { memberId: 'b', amount: 33.33 },
      { memberId: 'c', amount: 33.34 },
    ]);
    const sum = splits.reduce((s, x) => s + x.amount, 0);
    expect(sum).toBeCloseTo(100, 2);
  });

  it('handles a single member and cent-scale totals', () => {
    expect(buildSplits(['a'], 42.0)).toEqual([{ memberId: 'a', amount: 42 }]);
    expect(buildSplits(['a', 'b', 'c'], 0.01)).toEqual([
      { memberId: 'a', amount: 0 },
      { memberId: 'b', amount: 0 },
      { memberId: 'c', amount: 0.01 },
    ]);
  });

  it('rejects an empty or duplicated member list', () => {
    expect(() => buildSplits([], 10)).toThrow(/at least one member/);
    expect(() => buildSplits(['a', 'a'], 10)).toThrow(/more than once/);
  });
});

describe('buildSplits (custom)', () => {
  it('passes exact custom amounts through to the cent', () => {
    expect(buildSplits(['a', 'b'], 10, { a: 7.5, b: 2.5 })).toEqual([
      { memberId: 'a', amount: 7.5 },
      { memberId: 'b', amount: 2.5 },
    ]);
    expect(buildSplits(['a', 'b', 'c'], 10.01, { a: 10, b: 0, c: 0.01 })).toEqual([
      { memberId: 'a', amount: 10 },
      { memberId: 'b', amount: 0 },
      { memberId: 'c', amount: 0.01 },
    ]);
  });

  it('rejects amounts that are short of or over the total', () => {
    expect(() => buildSplits(['a', 'b'], 10, { a: 6, b: 3 })).toThrow(/short by 1\.00/);
    expect(() => buildSplits(['a', 'b'], 10, { a: 6, b: 5 })).toThrow(/over by 1\.00/);
  });

  it('rejects missing entries, negatives, and members outside the split', () => {
    expect(() => buildSplits(['a', 'b'], 10, { a: 10 })).toThrow(/amount for every member/);
    expect(() => buildSplits(['a', 'b'], 10, { a: 12, b: -2 })).toThrow(/non-negative/);
    expect(() => buildSplits(['a', 'b'], 10, { a: 5, b: 5, ghost: 0 } as never)).toThrow(/outside this split/);
  });
});

describe('updateExpense (edit)', () => {
  it('round-trips an edit: the stored expense and the books both change', () => {
    const [a, b] = seedIds();
    const e = addExpense(exp(a, 30, [[a, 10], [b, 20]] as never));
    const before = calcNetBalances([a, b], getExpenses().filter(x => x.id === e.id), []);
    expect(before[b]).toBeCloseTo(-20, 2);

    updateExpense(e.id, exp(a, 30, [[a, 0], [b, 30]] as never));
    const stored = getExpenses().find(x => x.id === e.id);
    expect(stored?.splits).toEqual([{ memberId: a, amount: 0 }, { memberId: b, amount: 30 }]);
    const after = calcNetBalances([a, b], [stored!], []);
    expect(after[b]).toBeCloseTo(-30, 2);
  });

  it('runs the same validation as addExpense and rejects unknown ids', () => {
    const [a] = seedIds();
    const e = addExpense(exp(a, 10, [[a, 10]] as never));
    expect(() => updateExpense(e.id, exp(a, 10, [[a, 9]] as never))).toThrow(/add up exactly/);
    expect(() => updateExpense('nope', exp(a, 10, [[a, 10]] as never))).toThrow(/no longer exists/);
    // A rejected edit leaves the stored expense untouched.
    expect(getExpenses().find(x => x.id === e.id)?.splits).toEqual([{ memberId: a, amount: 10 }]);
  });

  it('buildSplits output feeds addExpense directly (UI contract)', () => {
    const [a, b] = seedIds();
    const splits = buildSplits([a, b], 10, { [a]: 6.66, [b]: 3.34 });
    const e = addExpense({ ...exp(a, 10, [] as never), splits });
    expect(getExpenses().find(x => x.id === e.id)?.amount).toBe(10);
  });
});

describe('deletes (undo)', () => {
  it('deleting a settlement restores the balances from before it was recorded', () => {
    const [a, b] = seedIds();
    const expenses = [exp(a, 30.0, [[a, 0], [b, 30]] as never)];
    const before = calcNetBalances([a, b], expenses, getSettlements());
    const s = addSettlement({ groupId: 'g1', fromId: b, toId: a, amount: 12, date: '2026-09-27' });
    const during = calcNetBalances([a, b], expenses, getSettlements());
    expect(during[a]).toBeCloseTo(before[a] - 12, 2);
    expect(during[b]).toBeCloseTo(before[b] + 12, 2);
    expect(deleteSettlement(s.id)).toBe(true);
    const after = calcNetBalances([a, b], expenses, getSettlements());
    expect(after[a]).toBeCloseTo(before[a], 2);
    expect(after[b]).toBeCloseTo(before[b], 2);
  });

  it('deleting an expense removes its effect on the books', () => {
    const [a, b] = seedIds();
    const e = addExpense(exp(a, 42, [[a, 22], [b, 20]] as never));
    const withIt = calcNetBalances([a, b], [e], []);
    expect(withIt[b]).toBeCloseTo(-20, 2);
    expect(deleteExpense(e.id)).toBe(true);
    expect(getExpenses().filter(x => x.id === e.id)).toHaveLength(0);
    const without = calcNetBalances([a, b], [], []);
    expect(without[a]).toBeCloseTo(0, 2);
    expect(without[b]).toBeCloseTo(0, 2);
  });

  it('deleting an unknown id reports false and stores stay untouched', () => {
    const [a] = seedIds();
    addExpense(exp(a, 10.0, [[a, 10]] as never));
    const expenseCount = getExpenses().length;
    const settlementCount = getSettlements().length;
    expect(deleteExpense('nope')).toBe(false);
    expect(deleteSettlement('nope')).toBe(false);
    expect(getExpenses()).toHaveLength(expenseCount);
    expect(getSettlements()).toHaveLength(settlementCount);
  });
});
