'use client';
import {Suspense,useEffect,useRef,useState,Fragment} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {ArrowUp,Copy,Sparkles,Check,ClipboardCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card,CardContent} from '@/components/ui/card';
import {useCRM} from '@/components/crm-provider';
import {Field,Pill} from '@/components/crm-ui';
import {chatsFor,saveChat,chatSuggestions,prepareReply,applyChatProposal} from '@/lib/assistant-chat';
import {uid,ChatMessage,ChatProposal} from '@/lib/model';

type Props={onContact:(id:string)=>void;onDeal:(id:string)=>void};
export function AssistantChatView(props:Props){return <Suspense fallback={<p className="quiet-note">Loading conversation…</p>}><ChatRoute {...props}/></Suspense>;}
function ChatRoute(props:Props){const params=useSearchParams();const id=params.get('chat');return <ChatView key={id||'new'} id={id} {...props}/>;}
function LinkedText({text,onContact,onDeal}:Props&{text:string}){
 const{data}=useCRM();
 const records=[...data.contacts.map(c=>({name:c.name,id:c.id,type:'contact'})),...data.deals.map(d=>({name:d.name,id:d.id,type:'deal'}))].sort((a,b)=>b.name.length-a.name.length);
 const escaped=records.map(r=>r.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
 if(!escaped.length)return text;
 const pattern=new RegExp(`(?<![\\p{L}\\p{N}_])(?:${escaped.join('|')})(?![\\p{L}\\p{N}_])`,'giu');
 const parts=[];let end=0;
 for(const match of text.matchAll(pattern)){const start=match.index!;parts.push(text.slice(end,start));const record=records.find(r=>r.name.toLowerCase()===match[0].toLowerCase())!;parts.push(<Button key={start} variant="link" className="chat-record-link" onClick={()=>record.type==='contact'?onContact(record.id):onDeal(record.id)}>{match[0]}</Button>);end=start+match[0].length;}
 parts.push(text.slice(end));return <>{parts.map((part,i)=><Fragment key={i}>{part}</Fragment>)}</>;
}
function ChatView({id,...recordActions}:Props&{id:string|null}){
 const{data,setData,storageError}=useCRM();const router=useRouter();
 const chat=chatsFor(data).find(c=>c.id===id);
 const[draft,setDraft]=useState('');const[copied,setCopied]=useState('');const[notice,setNotice]=useState('');const end=useRef<HTMLDivElement>(null);
 const activeChatId=chat?.id;const messageCount=chat?.messages.length;
 useEffect(()=>{if(activeChatId)end.current?.scrollIntoView({block:'end'});},[activeChatId,messageCount]);
 function send(question=draft){const text=question.trim();if(!text)return;const chatId=chat?.id??uid();const userId=uid(),responseId=uid();setData(s=>{const current=chatsFor(s).find(c=>c.id===chatId);return saveChat(s,{id:chatId,title:current?.title??text.slice(0,64),messages:[...(current?.messages??[]),{id:userId,role:'user',text},prepareReply(text,s,responseId)]});});setDraft('');if(!chat)router.push(`/chat/?chat=${encodeURIComponent(chatId)}`);}
 async function copy(message:ChatMessage){try{await navigator.clipboard.writeText(message.text);setCopied(message.id);}catch{setNotice('Select the response text to copy it.');}}
 return <div className="chat-workspace"><div className="chat-column">
  {chat?<div className="chat-messages"><p className="quiet-note">{chat.title} · Demo conversation</p>{chat.messages.map(message=><div className={`chat-message ${message.role}`} key={message.id}>{message.role==='assistant'&&<div className="chat-byline"><Sparkles size={16}/>BrokerOS assistant</div>}<div className="chat-text"><LinkedText text={message.text} {...recordActions}/></div>{message.proposal&&<ProposalCard chatId={chat.id} message={message} {...recordActions}/ >}{message.role==='assistant'&&<Button variant="ghost" size="sm" className="copy-response" onClick={()=>copy(message)} aria-label="Copy response"><Copy size={14}/>{copied===message.id?'Copied':'Copy'}</Button>}</div>)}<div ref={end} className="chat-end"/></div>:<div className="chat-welcome"><Sparkles size={28}/><h2>What can I help you with?</h2><p>Close your next deal. Build your owner relationships.</p><div className="chat-suggestions">{chatSuggestions.map(text=><Button key={text} variant="outline" onClick={()=>send(text)}>{text}</Button>)}</div>{id&&<p>This conversation is unavailable. Start a new one below.</p>}</div>}
  <div className="chat-composer"><form onSubmit={e=>{e.preventDefault();send();}}><Textarea aria-label="Message AI assistant" placeholder="Ask about your workspace…" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send();}}}/><div><span>Walid’s workspace</span><Button type="submit" size="icon" aria-label="Send message" disabled={!draft.trim()}><ArrowUp/></Button></div></form><p>Demo assistant · Reviewed actions update this browser only</p>{(storageError||notice)&&<p role="status">{storageError?'Browser storage is unavailable. Keep this page open to retain your conversation.':notice}</p>}</div>
 </div></div>;
}
function ProposalCard({chatId,message,...recordActions}:Props&{chatId:string;message:ChatMessage}){
 const{data,setData}=useCRM();const[draft,setDraft]=useState<ChatProposal>(message.proposal!);const[error,setError]=useState('');
 function submit(){const recordId=uid(),at=new Date().toISOString();const result=applyChatProposal(data,chatId,message.id,draft,recordId,at);if(result.error){setError(result.error);return;}setData(current=>applyChatProposal(current,chatId,message.id,draft,recordId,at).data);}
 function dismiss(){setData(s=>{const chat=chatsFor(s).find(c=>c.id===chatId);if(!chat)return s;return saveChat(s,{...chat,messages:chat.messages.map(m=>m.id===message.id&&!m.receipt?{...m,dismissed:true}:m)});});}
 if(message.receipt)return <Card className="chat-receipt"><CardContent><div className="chat-byline"><Check size={16}/>Saved to your workspace<Pill>Demo</Pill></div><p><LinkedText text={message.receipt.text} {...recordActions}/></p><Button asChild variant="outline" size="sm"><Link href={message.receipt.href}>{draft.kind==='task'?'View tasks':draft.kind==='draft'?'Open review queue':'Open campaigns'}</Link></Button><small>Saved in this browser · No external messages sent</small></CardContent></Card>;
 if(message.dismissed)return <div className="chat-dismissed">Proposal dismissed. No records were changed.</div>;
 const title=draft.kind==='task'?'Add a closing reminder':draft.kind==='draft'?'Prepare an owner follow-up':'Prepare a launch campaign';
 return <Card className="chat-proposal"><div className="chat-proposal-heading"><ClipboardCheck size={16}/><h3>{title}</h3></div><CardContent><form onSubmit={e=>{e.preventDefault();submit();}}><div className="proposal-notice"><Pill tone="listing">Review required</Pill><span>{draft.kind==='task'?'Local reminder':'Draft only · Nothing sent'}</span></div><Field label={draft.kind==='task'?'Reminder title':draft.kind==='draft'?'Draft title':'Campaign title / subject'}><Input aria-label="Proposal title" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></Field>{draft.kind==='task'?<><p className="quiet-note">{draft.body}</p><div className="form-grid"><Field label="Date (Dubai)"><Input aria-label="Reminder date" type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></Field><Field label="Time (Dubai)"><Input aria-label="Reminder time" type="time" value={draft.time} onChange={e=>setDraft({...draft,time:e.target.value})}/></Field></div></>:<Field label="Editable message"><Textarea aria-label="Proposed message" value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})}/></Field>}{error&&<p role="alert" className="overdue">{error}</p>}<div className="proposal-actions"><Button type="submit" size="sm">{draft.kind==='task'?'Add reminder':draft.kind==='draft'?'Save to review queue':'Save campaign draft'}</Button><Button type="button" variant="ghost" size="sm" onClick={dismiss}>Dismiss</Button></div></form></CardContent></Card>;
}
