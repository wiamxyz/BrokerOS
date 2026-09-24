'use client';
import { createContext, useContext, useEffect, useState, startTransition, useCallback } from 'react';
import { CRMState, seedState, uid, Activity, Contact, Approval, RecentItem, today } from '@/lib/model';
import {rememberWorkspaceItem} from '@/lib/workspace-search';
import { Skeleton } from '@/components/ui/skeleton';
const KEY='brokeros-demo-v1';
type Context={data:CRMState;setData:(update:(prev:CRMState)=>CRMState)=>void;notify:(message:string)=>void;log:(text:string,contactId?:string,kind?:Activity['kind'])=>void;saveContact:(contact:Contact)=>void;approve:(approval:Approval)=>void;reset:()=>void;storageError:boolean;rememberOpened:(item:RecentItem)=>void};
const CrmContext=createContext<Context|null>(null);
export function CrmProvider({children}:{children:React.ReactNode}){
 const [data,setState]=useState<CRMState|null>(null);const [toast,setToast]=useState('');const [storageError,setStorageError]=useState(false);
 useEffect(()=>{let next=seedState();let failed=false;try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(parsed.version===1&&['contacts','deals','tasks','activities','approvals','campaigns'].every(k=>Array.isArray(parsed[k])))next=parsed;}}catch{failed=true;}startTransition(()=>{setState(next);setStorageError(failed);});},[]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),4500);return()=>clearTimeout(timer);},[toast]);
 const setData=useCallback((update:(prev:CRMState)=>CRMState)=>{setState(prev=>{if(!prev)return prev;const next=update(prev);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{queueMicrotask(()=>setStorageError(true));}return next;});},[]);
 const rememberOpened=useCallback((item:RecentItem)=>setData(s=>rememberWorkspaceItem(s,item)),[setData]);
 const notify=useCallback((message:string)=>setToast(message),[]);
 function log(text:string,contactId?:string,kind:Activity['kind']='system'){setData(s=>({...s,activities:[{id:uid(),text,contactId,kind,at:new Date().toISOString()},...s.activities]}));}
 function saveContact(contact:Contact){setData(s=>({...s,contacts:s.contacts.some(c=>c.id===contact.id)?s.contacts.map(c=>c.id===contact.id?contact:c):[contact,...s.contacts],activities:[{id:uid(),contactId:contact.id,text:`${s.contacts.some(c=>c.id===contact.id)?'Updated':'Created'} ${contact.name}’s contact record.`,kind:'system',at:new Date().toISOString()},...s.activities]}));notify('Contact saved');}
 function approve(a:Approval){setData(s=>({...s,approvals:s.approvals.map(x=>x.id===a.id?{...x,status:'Approved'}:x),contacts:s.contacts.map(c=>c.id===a.contactId&&a.kind==='handoff'?{...c,nurture:'Paused',priority:c.priority==='Closing'?'Closing':'Listing',nextAction:'Call to confirm a valuation appointment'}:c),tasks:a.kind==='handoff'&&!s.tasks.some(t=>t.contactId===a.contactId&&!t.done)?[...s.tasks,{id:uid(),contactId:a.contactId,title:'Call to confirm a valuation appointment',priority:'Listing',due:today(),time:'14:30',done:false}]:s.tasks,activities:[{id:uid(),contactId:a.contactId,text:a.kind==='handoff'?'Agent handoff accepted. Follow-up task is in the daily queue.':'Draft approved in demo. No message was sent.',kind:'assistant',at:new Date().toISOString()},...s.activities]}));notify(a.kind==='handoff'?'Handoff accepted · task ready':'Draft approved · no message sent');}
 function reset(){setData(()=>seedState());notify('Demo data restored');}
 if(!data)return <div className="loading-shell" aria-label="Loading workspace"><Skeleton className="h-10 w-44"/><Skeleton className="h-24 w-full"/><div className="grid grid-cols-2 gap-6"><Skeleton className="h-72"/><Skeleton className="h-72"/></div></div>;
 return <CrmContext.Provider value={{data,setData,notify,log,saveContact,approve,reset,storageError,rememberOpened}}>{children}{toast&&<div role="status" className="toast">✓ {toast}</div>}</CrmContext.Provider>;
}
export function useCRM(){const value=useContext(CrmContext);if(!value)throw new Error('CRM provider is required');return value;}
