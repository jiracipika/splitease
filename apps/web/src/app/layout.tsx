import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SplitEase',
  description: 'Beautiful, stress-free bill splitting for roommates, trips, and dinners. Canadian-focused with Interac e-Transfer settlement links.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
