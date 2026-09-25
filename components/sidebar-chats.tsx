'use client';
import {Suspense} from 'react';
import Link from 'next/link';
import {usePathname,useSearchParams} from 'next/navigation';
import {SquarePen} from '@/components/icons';
import {useCRM} from '@/components/crm-provider';
import {chatsFor} from '@/lib/assistant-chat';

export function SidebarChats({newChat=false,onNavigate}:{newChat?:boolean;onNavigate:()=>void}){
 return <Suspense fallback={newChat?<Link className="nav-link" href="/chat/" onClick={onNavigate}><SquarePen/><span>New Chat</span></Link>:null}><ChatLinks newChat={newChat} onNavigate={onNavigate}/></Suspense>;
}
function ChatLinks({newChat,onNavigate}:{newChat:boolean;onNavigate:()=>void}){
 const{data}=useCRM();const pathname=usePathname();const params=useSearchParams();const active=pathname.replace(/\/$/,'')==='/chat'?params.get('chat'):undefined;
 if(newChat)return <Link href="/chat/" className={`nav-link sidebar-new-chat ${active===null?'active':''}`} aria-current={active===null?'page':undefined} onClick={onNavigate}><SquarePen/><span>New Chat</span></Link>;
 return <div className="recent-chats">{chatsFor(data).map(chat=><Link href={`/chat/?chat=${encodeURIComponent(chat.id)}`} key={chat.id} className={`nav-link sidebar-chat ${active===chat.id?'active':''}`} aria-current={active===chat.id?'page':undefined} onClick={onNavigate} title={chat.title}><span>{chat.title}</span></Link>)}</div>;
}
export function ChatHeaderTitle(){return <Suspense fallback="AI assistant"><CurrentChatTitle/></Suspense>;}
function CurrentChatTitle(){const{data}=useCRM();const id=useSearchParams().get('chat');return chatsFor(data).find(chat=>chat.id===id)?.title??'New Chat';}
