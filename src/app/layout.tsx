import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'FORMA — Engineered from within', description: 'Explore the anatomy of electric mobility. A real-time, interactive engineering study by FORMA Electric.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
