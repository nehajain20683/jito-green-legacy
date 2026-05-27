// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'JITO Green Legacy — A Family Tree Plantation Drive by Mumbai Zone',
  description:
    'Plant trees in honor of your family — Dadi, Maa, Beti, and Poti — and create a living legacy for generations to come.',
  keywords: ['JITO', 'tree plantation', 'Mumbai Zone', 'green legacy', 'family trees', 'CSR'],
  openGraph: {
    title: 'JITO Green Legacy',
    description: 'A Family Tree Plantation Drive by Mumbai Zone and all JITO Chapters',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#fafdf7]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
