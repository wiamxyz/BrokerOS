'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Search,X,MessageCircle,UserRound,Handshake,Building2,ListTodo,Megaphone,Sparkles,LayoutDashboard,Users,ChartNoAxesCombined,Settings} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {useCRM} from '@/components/crm-provider';
import {chatsFor} from '@/lib/assistant-chat';
import {attentionWorkspacePages,recentWorkspaceItems,searchWorkspace,workspaceItems,SEARCH_KIND_LABELS} from '@/lib/workspace-search';
import {BUILDINGS,today,type RecentItem} from '@/lib/model';

const kindIcons={page:LayoutDashboard,project:Building2,contact:UserRound,deal:Handshake,task:ListTodo,campaign:Megaphone,review:Sparkles,chat:MessageCircle};
const pageIcons:Record<string,typeof Search>={today:LayoutDashboard,contacts:Users,owners:Building2,deals:Handshake,tasks:ListTodo,campaigns:Megaphone,chat:MessageCircle,assistant:Sparkles,insights:ChartNoAxesCombined,settings:Settings};

export function WorkspaceSearch({onClose,onRecord}:{onClose:()=>void;onRecord:(item:RecentItem)=>void}){
 const{data,rememberOpened}=useCRM();
 const[query,setQuery]=useState('');
 const input=useRef<HTMLInputElement>(null);
 const panel=useRef<HTMLDivElement>(null);
 const attachPanel=useCallback((node:HTMLDivElement|null)=>{panel.current=node;if(node){node.style.setProperty('--search-viewport-height',`${window.visualViewport?.height??window.innerHeight}px`);node.style.setProperty('--search-viewport-top',`${window.visualViewport?.offsetTop??0}px`);}},[]);
 const items=workspaceItems(data,chatsFor(data),{today:today(),buildings:BUILDINGS});
 const recent=recentWorkspaceItems(data,items).filter(item=>item.kind!=='page').slice(0,5);
 const searching=Boolean(query.trim());
 const results=searchWorkspace(items,query);
 const attention=attentionWorkspacePages(items);
 const sections=searching?[{title:'Results',items:results}]:[
  {title:'Needs attention',items:attention},
  {title:'Workspace',items:items.filter(item=>item.kind==='page'&&!item.needsAttention)},
  {title:'Last opened',items:recent}
 ].filter(section=>section.items.length);

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
   <DialogHeader className="workspace-search-heading"><DialogTitle>Search your workspace</DialogTitle><DialogDescription>Find any page, client, project, deal, task or conversation.</DialogDescription></DialogHeader>
   <div className="workspace-search-controls">
    <div className="workspace-search-field"><Search aria-hidden="true"/><Input ref={input} type="search" inputMode="search" enterKeyHint="search" aria-label="Search entire workspace" aria-controls="workspace-search-results" autoComplete="off" placeholder="Search" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing&&window.matchMedia('(max-width:760px)').matches)event.currentTarget.blur();}}/></div>
    <Button variant="outline" size="icon" className="workspace-search-close" aria-label="Close search" onClick={onClose}><X/></Button>
   </div>
   <div className="workspace-search-results" id="workspace-search-results">
    <p role="status" className="sr-only">{searching?`${results.length} matching results`:''}</p>
    {sections.map(section=><section className="workspace-search-section" key={section.title} aria-label={section.title}>
    <h2>{section.title}</h2><div className="workspace-search-list">
     {section.items.map(item=>{
      const Icon=item.kind==='page'?(pageIcons[item.id]??LayoutDashboard):kindIcons[item.kind];
      const content=<><span className="workspace-search-icon"><Icon aria-hidden="true"/></span><span className="workspace-search-copy"><span className="workspace-search-title-line"><span className="workspace-search-title">{item.title}</span><span className="workspace-search-kind">{SEARCH_KIND_LABELS[item.kind]}</span></span><span className="workspace-search-preview">{item.preview.replace(/\s+/g,' ')}</span></span></>;
      const open=()=>{rememberOpened({kind:item.kind,id:item.id});onClose();if(!item.href)onRecord(item);};
      return item.href?<Button asChild variant="ghost" className="workspace-search-row" key={`${item.kind}:${item.id}`}><Link href={item.href} aria-label={`Open ${SEARCH_KIND_LABELS[item.kind].toLowerCase()}: ${item.title}`} onClick={open}>{content}</Link></Button>:<Button variant="ghost" className="workspace-search-row" key={`${item.kind}:${item.id}`} aria-label={`Open ${SEARCH_KIND_LABELS[item.kind].toLowerCase()}: ${item.title}`} onClick={open}>{content}</Button>;
     })}
    </div></section>)}
    {searching&&results.length===0&&<div className="workspace-search-empty"><Search aria-hidden="true"/><h3>No matches</h3><p>Try a page, client, project, task or campaign.</p></div>}
   </div>
  </DialogContent>
 </Dialog>;
}
