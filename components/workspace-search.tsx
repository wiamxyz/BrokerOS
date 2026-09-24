'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Search,X,MessageCircle,UserRound,Handshake} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {useCRM} from '@/components/crm-provider';
import {chatsFor} from '@/lib/assistant-chat';
import {recentWorkspaceItems,searchWorkspace,workspaceItems} from '@/lib/workspace-search';

export function WorkspaceSearch({onClose,onContact,onDeal}:{onClose:()=>void;onContact:(id:string)=>void;onDeal:(id:string)=>void}){
 const{data}=useCRM();
 const[query,setQuery]=useState('');
 const input=useRef<HTMLInputElement>(null);
 const panel=useRef<HTMLDivElement>(null);
 const attachPanel=useCallback((node:HTMLDivElement|null)=>{panel.current=node;if(node){node.style.setProperty('--search-viewport-height',`${window.visualViewport?.height??window.innerHeight}px`);node.style.setProperty('--search-viewport-top',`${window.visualViewport?.offsetTop??0}px`);}},[]);
 const items=workspaceItems(data,chatsFor(data));
 const recent=recentWorkspaceItems(data,items);
 const searching=Boolean(query.trim());
 const results=searching?searchWorkspace(items,query):recent.length?recent:items.filter(item=>item.kind==='chat').filter((item,index,chats)=>chats.findIndex(chat=>chat.title===item.title)===index).slice(0,3);
 const heading=searching?'Results':recent.length?'Last opened':'Suggested';

 useEffect(()=>{
  const viewport=window.visualViewport;
  let frame=0;
  const measure=()=>{
   panel.current?.style.setProperty('--search-viewport-height',`${viewport?.height??window.innerHeight}px`);
   panel.current?.style.setProperty('--search-viewport-top',`${viewport?.offsetTop??0}px`);
  };
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  measure();
  viewport?.addEventListener('resize',update);
  viewport?.addEventListener('scroll',update);
  window.addEventListener('resize',update);
  return()=>{cancelAnimationFrame(frame);viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
 },[]);

 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}>
  <DialogContent ref={attachPanel} className="workspace-search-dialog" showCloseButton={false} onOpenAutoFocus={event=>{event.preventDefault();input.current?.focus({preventScroll:true});}}>
   <DialogHeader className="workspace-search-heading"><DialogTitle>Search your workspace</DialogTitle><DialogDescription>Find contacts, deals and assistant conversations.</DialogDescription></DialogHeader>
   <div className="workspace-search-controls">
    <div className="workspace-search-field"><Search aria-hidden="true"/><Input ref={input} type="search" inputMode="search" enterKeyHint="search" aria-label="Search contacts, deals and chats" aria-controls="workspace-search-results" autoComplete="off" placeholder="Search" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing&&window.matchMedia('(max-width:760px)').matches)event.currentTarget.blur();}}/></div>
    <Button variant="outline" size="icon" className="workspace-search-close" aria-label="Close search" onClick={onClose}><X/></Button>
   </div>
   <section className="workspace-search-results" id="workspace-search-results" aria-labelledby="workspace-search-section-title">
    <h2 id="workspace-search-section-title">{heading}</h2>
    <p role="status" className="sr-only">{searching?`${results.length} matching results`:''}</p>
    <div className="workspace-search-list">
     {results.map(item=>{
      const Icon=item.kind==='chat'?MessageCircle:item.kind==='contact'?UserRound:Handshake;
      const content=<><span className="workspace-search-icon"><Icon aria-hidden="true"/></span><span className="workspace-search-copy"><span className="workspace-search-title">{item.title}</span><span className="workspace-search-preview">{item.preview.replace(/\s+/g,' ')}</span></span></>;
      return item.kind==='chat'?<Button asChild variant="ghost" className="workspace-search-row" key={`${item.kind}:${item.id}`}><Link href={`/chat/?chat=${encodeURIComponent(item.id)}`} aria-label={`Open chat: ${item.title}`} onClick={onClose}>{content}</Link></Button>:<Button variant="ghost" className="workspace-search-row" key={`${item.kind}:${item.id}`} aria-label={`Open ${item.kind}: ${item.title}`} onClick={()=>{onClose();if(item.kind==='contact')onContact(item.id);else onDeal(item.id);}}>{content}</Button>;
     })}
    </div>
    {results.length===0&&<div className="workspace-search-empty"><Search aria-hidden="true"/><h3>{searching?'No matches':'Nothing opened yet'}</h3><p>{searching?'Try a name, building, lead source or something from a conversation.':'Open a contact, deal or conversation to find it here next time.'}</p></div>}
   </section>
  </DialogContent>
 </Dialog>;
}
