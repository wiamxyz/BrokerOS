import { Workspace } from '@/components/workspace';
export function generateStaticParams() { return ['contacts','owners','deals','tasks','campaigns','chat','assistant','insights','settings'].map(view=>({view})); }
export default async function Page({params}: {params: Promise<{view:string}>}) { const {view}=await params; return <Workspace view={view}/>; }
