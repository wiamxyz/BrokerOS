'use client';
import {createContext,useContext,useMemo,useRef,useState,type ReactNode} from 'react';
import {useCRM} from '@/components/crm-provider';
import {chatsFor} from '@/lib/assistant-chat';
import {currentSession,switchConversation,submitConversation} from '@/lib/chat-session';
import {composerLength,composerTags,composerText,insertComposerTag,normalizeComposer,type ComposerPart} from '@/lib/inline-composer';
import {uid} from '@/lib/model';
import type {ValueTag} from '@/lib/value-tags';

function useConversationState(){
 const {data,setData}=useCRM();
 const session=useMemo(()=>currentSession(data),[data]);
 const [open,setOpen]=useState(false);const [view,setView]=useState<'chat'|'history'>('history');
 const [version,setVersion]=useState(0);const [insertion,setInsertion]=useState(0);
 const caret=useRef(session.caret);const trigger=useRef<HTMLElement|null>(null);
 const chats=chatsFor(data);const chat=chats.find(item=>item.id===session.id);
 const tags=useMemo(()=>composerTags(session.parts),[session.parts]);
 function restoreFocus(options:FocusOptions={preventScroll:true}){const origin=trigger.current;const fallback=document.getElementById('value-chat-trigger');(origin?.isConnected&&origin.getClientRects().length?origin:fallback)?.focus(options);}
 function changeConversation(id:string|null,showPanel=true){const draftId=uid();setData(current=>switchConversation(current,id,draftId));caret.current=id?composerLength(normalizeComposer(chats.find(item=>item.id===id)?.composerParts)):0;setVersion(v=>v+1);setView('chat');if(showPanel)setOpen(true);}
 return {
  enabled:true,open,tags,chat,chats,parts:session.parts,caret:session.caret,insertion,composerKey:String(version),draft:composerText(session.parts,false),view,
  addTag:(tag:ValueTag,origin?:HTMLElement)=>{if(origin)trigger.current=origin;setData(current=>{const previous=currentSession(current);const next=insertComposerTag(previous.parts,tag,caret.current);caret.current=next.caret;return {...current,composerSession:{...previous,...next}};});setInsertion(v=>v+1);setView('chat');setOpen(true);},
  setComposer:(parts:ComposerPart[],position:number)=>{caret.current=position;setData(current=>({...current,composerSession:{...currentSession(current),parts:normalizeComposer(parts),caret:position}}));},
  setCaret:(position:number)=>{caret.current=position;},
  openChat:(origin?:HTMLElement)=>{if(origin)trigger.current=origin;setView(tags.length?'chat':'history');setOpen(true);},
  closeChat:()=>setOpen(false),restoreFocus,
  showHistory:()=>setView('history'),resumeChat:()=>setView('chat'),
  newChat:(showPanel=true)=>changeConversation(null,showPanel),
  selectChat:(id:string,showPanel=true)=>changeConversation(id,showPanel),
  sendMessage:(override?:string)=>{const id=session.id??uid(),userId=uid(),replyId=uid();setData(current=>submitConversation(current,id,userId,replyId,override));setVersion(v=>v+1);return id;},
 };
}
const Context=createContext<ReturnType<typeof useConversationState>|null>(null);
export function ValueTagsProvider({children}:{children:ReactNode}){const value=useConversationState();return <Context.Provider value={value}>{children}</Context.Provider>;}
export function useValueTags(){const value=useContext(Context);if(!value)throw new Error('ValueTagsProvider is required');return value;}
export const useValueConversation=useValueTags;
