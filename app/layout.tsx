import type { Metadata } from 'next';
import { CrmProvider } from '@/components/crm-provider';
import './globals.css';
import {ValueTagsProvider} from '@/components/value-tags-provider';
import {NavigationHistoryProvider} from '@/components/navigation-history';
export const metadata: Metadata = { title: 'BrokerOS — Your real estate workspace', icons: { icon: '/favicon.svg' }, description: 'A focused real estate CRM for daily priorities, owner relationships, deals and launch campaigns. Interactive demo.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><NavigationHistoryProvider><CrmProvider><ValueTagsProvider>{children}</ValueTagsProvider></CrmProvider></NavigationHistoryProvider></body></html>; }
