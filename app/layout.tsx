import type { Metadata } from 'next';
import { CrmProvider } from '@/components/crm-provider';
import './globals.css';
export const metadata: Metadata = { title: 'BrokerOS — Your real estate workspace', description: 'A focused real estate CRM for daily priorities, owner relationships, deals and launch campaigns. Interactive demo.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><CrmProvider>{children}</CrmProvider></body></html>; }
