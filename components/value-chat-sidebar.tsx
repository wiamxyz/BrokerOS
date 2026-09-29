'use client';
import {useEffect,useRef,useSyncExternalStore} from 'react';
import {ArrowLeftIcon,ArrowUpIcon,PanelLeftCloseIcon,PanelLeftIcon,PlusIcon,SquarePenIcon} from '@/components/icons';
import {Button} from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import dynamic from 'next/dynamic';
import type {InlineComposerHandle} from '@/components/inline-value-composer';
const InlineValueComposer=dynamic(()=>import('@/components/inline-value-composer').then(module=>module.InlineValueComposer),{ssr:false});
import {ValueChatResizeHandle} from '@/components/value-chat-resize-handle';
import {useChatSidebarWidth} from '@/lib/use-chat-sidebar-width';
import {useValueConversation} from '@/components/value-tags-provider';
import {ConversationMessages} from '@/components/assistant-chat';
import {useCRM} from '@/components/crm-provider';

const compactQuery='(max-width: 1023px)';
function subscribe(listener:()=>void){const media=matchMedia(compactQuery);media.addEventListener('change',listener);return()=>media.removeEventListener('change',listener);}
export function ValueChatTrigger(){const {open,openChat,closeChat,tags}=useValueConversation();return <Button id="value-chat-trigger" variant="ghost" size="icon-sm" aria-label={open?'Collapse AI sidebar':'Expand AI sidebar'} aria-expanded={open} aria-controls={open?'value-chat':undefined} title={open?'Collapse AI sidebar':'Expand AI sidebar'} onClick={event=>open?closeChat():openChat(event.currentTarget)}>{open?<PanelLeftCloseIcon className="rotate-180"/>:<PanelLeftIcon className="rotate-180"/>}{tags.length>0&&<span className="sr-only">{tags.length} tagged values</span>}</Button>;}

export function ValueChatSidebar({leftWidth,onContact,onDeal}:{leftWidth:number;onContact:(id:string)=>void;onDeal:(id:string)=>void}){
 const conversation=useValueConversation();const {open,closeChat,restoreFocus,chat,chats,draft,parts,caret,insertion,composerKey,view,showHistory,resumeChat,setComposer,setCaret,newChat,selectChat,sendMessage,tags}=conversation;
 const {storageError}=useCRM();const compact=useSyncExternalStore(subscribe,()=>matchMedia(compactQuery).matches,()=>false);const size=useChatSidebarWidth(leftWidth);
 const composer=useRef<InlineComposerHandle>(null);const newButton=useRef<HTMLButtonElement>(null);const history=view==='history';
 useEffect(()=>{if(open)(history?newButton.current:composer.current)?.focus({preventScroll:true});},[open,history]);
 // Track the visual viewport so the native mobile keyboard cannot cover the composer.
 useEffect(()=>{if(!open||!compact)return;const viewport=window.visualViewport;const update=()=>{const panel=document.getElementById('value-chat');if(panel){panel.style.height=`${viewport?.height??innerHeight}px`;panel.style.top=`${viewport?.offsetTop??0}px`;}};update();viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);return()=>{viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);};},[open,compact]);
 function focusComposer(){requestAnimationFrame(()=>composer.current?.focus({preventScroll:true}));}
 function record(action:()=>void){closeChat();requestAnimationFrame(action);}
 return <>
  {open&&!compact&&<div className="value-chat-spacer" aria-hidden style={{width:size.width}}/>}
  <Sheet key={compact?'mobile':'desktop'} open={open} onOpenChange={next=>{if(!next)closeChat();}} modal={compact}>
   <SheetContent id="value-chat" className={`value-chat-panel ${history?'value-chat-history':''}`} style={compact?undefined:{width:size.width}} showCloseButton={false} onOpenAutoFocus={event=>{event.preventDefault();(history?newButton.current:composer.current)?.focus({preventScroll:true});}} onCloseAutoFocus={event=>{event.preventDefault();restoreFocus();}} onInteractOutside={event=>{if(!compact)event.preventDefault();}}>
    {!compact&&<ValueChatResizeHandle {...size}/>}
    <SheetHeader className="value-chat-header">
     {!history&&<Button variant="ghost" size="icon-sm" aria-label="All conversations" title="All conversations" onClick={showHistory}><ArrowLeftIcon/></Button>}
     <SheetTitle>AI chat</SheetTitle><SheetDescription className="sr-only">Ask about tagged CRM values. Conversations and drafts stay in this browser.</SheetDescription>
     {!history&&<Button variant="ghost" size="icon-sm" aria-label="New chat" title="New chat" onClick={()=>{newChat();focusComposer();}}><SquarePenIcon/></Button>}
     <Button variant="ghost" size="icon-sm" aria-label="Close AI chat" title="Collapse AI sidebar" onClick={closeChat}><PanelLeftCloseIcon className="rotate-180"/></Button>
    </SheetHeader>
    {history?<nav className="value-history-list" aria-label="Conversation history">
     <Button ref={newButton} variant="ghost" className="nav-link" onClick={()=>{newChat();focusComposer();}}><SquarePenIcon/>New chat</Button>
     <p className="value-history-label">Previous conversations</p>
     {!chat&&(draft.trim()||tags.length>0)&&<Button variant="ghost" className="nav-link" onClick={()=>{resumeChat();focusComposer();}}>Continue current draft</Button>}
     {chats.map(item=><Button key={item.id} variant="ghost" className={`nav-link ${item.id===chat?.id?'active':''}`} aria-current={item.id===chat?.id?'true':undefined} title={item.title} onClick={()=>{selectChat(item.id);focusComposer();}}><span>{item.title}</span></Button>)}
     {!chats.length&&!draft.trim()&&!tags.length&&<p className="quiet-note">Your conversations will appear here.</p>}
    </nav>:<>
     <div className="value-chat-body">{chat?<ConversationMessages chatId={chat.id} onContact={id=>record(()=>onContact(id))} onDeal={id=>record(()=>onDeal(id))}/>:<div className="value-chat-welcome"><h2>What would you like to know?</h2><p>Tag a name, property, or value in your workspace, then ask a question.</p></div>}</div>
     <form className="value-chat-composer" aria-label="Chat composer" onSubmit={event=>{event.preventDefault();if(draft.trim()){sendMessage();focusComposer();}}}>
      <div data-slot="tagged-chat-composer"><InlineValueComposer key={composerKey} ref={composer} parts={parts} caret={caret} insertion={insertion} onChange={setComposer} onCaret={setCaret}/><div className="composer-actions"><Button type="button" variant="ghost" size="sm" onClick={()=>compact?closeChat():restoreFocus({preventScroll:false})}><PlusIcon/>Tag more</Button><Button type="submit" size="icon-sm" aria-label="Send message" disabled={!draft.trim()}><ArrowUpIcon/></Button></div></div>
      <p>Demo replies · Nothing is sent to AI</p>
     </form>
    </>}
    {storageError&&<p role="status" className="value-storage-note">Browser storage is unavailable. Keep this page open to retain your draft.</p>}
   </SheetContent>
  </Sheet>
 </>;
}
