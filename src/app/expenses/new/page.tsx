import { redirect } from 'next/navigation';

// Expense creation lives in the add-panel on /expenses; this route only
// existed as a "coming soon" stub. Send it where the real form is.
export default function NewExpensePage() {
  redirect('/expenses');
}
