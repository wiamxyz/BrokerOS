'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {LayoutDashboard,Users,Building2,Handshake,ListTodo,Megaphone,Sparkles,ChartNoAxesCombined,Search,Bell,Plus,PanelLeft,ChevronRight,Orbit,PanelLeftClose,SquarePen} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Sheet,SheetClose,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {useCRM} from '@/components/crm-provider';
import {DemoNote,PriorityPill,Empty} from '@/components/crm-ui';
import {ContactForm,DealForm,TaskForm} from '@/components/forms';
import {TodayView,ContactsView,OwnersView,DealsView,TasksView} from '@/components/main-views';
import {CampaignsView,AssistantView,InsightsView,SettingsView} from '@/components/growth-views';
import {ContactDetail,DealDetail} from '@/components/details';
import {AssistantChatView} from '@/components/assistant-chat';
import {MobileSidebarSwipe} from '@/components/mobile-sidebar-swipe';
import {ProfileMenu} from '@/components/profile-menu';
import {NavigationGroup} from '@/components/navigation-group';
import {WorkspaceSearch} from '@/components/workspace-search';
import {SearchRecordDetail} from '@/components/search-record-detail';
import {chatsFor} from '@/lib/assistant-chat';
import {orderedTasks,today,type RecentItem} from '@/lib/model';
const nav=[{id:'today',label:'Dashboard',icon:LayoutDashboard},{id:'contacts',label:'Contacts',icon:Users},{id:'owners',label:'Owner pipeline',icon:Building2},{id:'deals',label:'Deals',icon:Handshake},{id:'tasks',label:'Tasks & reminders',icon:ListTodo},{id:'campaigns',label:'Campaigns',icon:Megaphone},{id:'chat',label:'New Chat',icon:SquarePen},{id:'assistant',label:'Review queue',icon:Sparkles},{id:'insights',label:'Market insights',icon:ChartNoAxesCombined}];
export function Workspace({view}:{view:string}){
 const{data,storageError,rememberOpened}=useCRM();const[searchRecord,setSearchRecord]=useState<RecentItem|null>(null);const[mobile,setMobile]=useState(false);const[search,setSearch]=useState(false);const[notifications,setNotifications]=useState(false);const[form,setForm]=useState('');const[contactId,setContactId]=useState('');const[dealId,setDealId]=useState('');
 const[mobileGroups,setMobileGroups]=useState<Record<string,boolean>>({});
 const[collapsed,setCollapsed]=useState(false);const[actionTarget,setActionTarget]=useState<HTMLDivElement|null>(null);
 useEffect(()=>{const id=setTimeout(()=>{try{setCollapsed(localStorage.getItem('brokeros-sidebar-collapsed')==='true');const groups=JSON.parse(localStorage.getItem('brokeros-mobile-nav-groups')||'{}');if(groups&&typeof groups==='object'&&!Array.isArray(groups))setMobileGroups(Object.fromEntries(Object.entries(groups).filter(([,value])=>typeof value==='boolean')) as Record<string,boolean>);}catch{}},0);return()=>clearTimeout(id);},[]);
 function toggleSidebar(){const next=!collapsed;setCollapsed(next);try{localStorage.setItem('brokeros-sidebar-collapsed',String(next));}catch{}}
 function setMobileGroup(label:string,open:boolean){const next={...mobileGroups,[label]:open};setMobileGroups(next);try{localStorage.setItem('brokeros-mobile-nav-groups',JSON.stringify(next));}catch{}}
 const pending=data.approvals.filter(a=>a.status==='Pending').length;const due=orderedTasks(data.tasks.filter(t=>!t.done&&t.due<=today()),data.contacts);
 const title=view==='today'?'Dashboard':view==='chat'?'AI assistant':view==='settings'?'Workspace settings':nav.find(n=>n.id===view)?.label||'Overview';
 useEffect(()=>{const event=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setSearch(v=>!v);}};window.addEventListener('keydown',event);const params=new URLSearchParams(window.location.search);if(params.get('contact'))setTimeout(()=>setContactId(params.get('contact')||''),0);if(params.get('deal'))setTimeout(()=>setDealId(params.get('deal')||''),0);return()=>window.removeEventListener('keydown',event);},[]);
 const openContact=(id:string)=>{setSearchRecord(null);setDealId('');setContactId(id);};const openDeal=(id:string)=>{setSearchRecord(null);setContactId('');setDealId(id);};
 const openSearchRecord=(item:RecentItem)=>{rememberOpened({kind:item.kind,id:item.id});if(item.kind==='contact')openContact(item.id);else if(item.kind==='deal')openDeal(item.id);else{setContactId('');setDealId('');setSearchRecord(item);}};
 const navigation=(isMobile:boolean)=><>
  <div className="sidebar-brand">
   <Link href="/" className="brand" onClick={()=>setMobile(false)} aria-label="BrokerOS dashboard">{!isMobile&&<span className="brand-mark"><Orbit size={19}/></span>}<span>BrokerOS</span></Link>
   {isMobile?<Button variant="outline" size="icon" className="sidebar-search-circle" onClick={()=>{setMobile(false);setSearch(true);}} aria-label="Search workspace" title="Search workspace"><Search/></Button>:<Button variant="ghost" size="icon-sm" className="collapse-sidebar" aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} title={collapsed?'Expand sidebar':'Collapse sidebar'} onClick={toggleSidebar}>{collapsed?<PanelLeft/>:<PanelLeftClose/>}</Button>}
  </div>
  {!isMobile&&<Button variant="ghost" className="sidebar-search nav-link" onClick={()=>setSearch(true)} title="Search workspace" aria-label="Search workspace"><Search size={18}/><span>Search workspace</span><kbd>⌘ K</kbd></Button>}
  <nav className="sidebar-navigation" aria-label="Main navigation">
   {[{label:'Workspace',ids:['today','contacts','owners','deals','tasks']},{label:'Growth',ids:['campaigns','insights']},{label:'AI assistant',ids:['chat','assistant']}].map(group=>
    <NavigationGroup key={group.label} label={group.label} mobile={isMobile} open={mobileGroups[group.label]!==false} onOpenChange={open=>setMobileGroup(group.label,open)}>
     {group.ids.map(id=>{const n=nav.find(n=>n.id===id)!;return <Link key={n.id} href={n.id==='today'?'/':`/${n.id}/`} className={`nav-link ${view===n.id?'active':''}`} onClick={()=>setMobile(false)} aria-current={view===n.id?'page':undefined} aria-label={n.label} title={n.label}><n.icon size={18}/><span>{n.label}</span>{n.id==='assistant'&&pending>0&&<span className="nav-count">{pending}</span>}</Link>;})}
     {group.label==='AI assistant'&&<div className="recent-chats">
      {chatsFor(data).filter((chat,index,chats)=>chats.findIndex(c=>c.title===chat.title)===index).slice(0,5).map(chat=><Link href={`/chat/?chat=${encodeURIComponent(chat.id)}`} key={chat.id} className="nav-link" onClick={()=>setMobile(false)} title={chat.title}>{chat.title}</Link>)}
     </div>}
    </NavigationGroup>
   )}
  </nav>
  <div className="sidebar-bottom">
   {isMobile&&<Button asChild className="sidebar-chat-action"><Link href="/chat/" onClick={()=>setMobile(false)}><SquarePen/>Chat</Link></Button>}
   <ProfileMenu compact={isMobile} onNavigate={()=>setMobile(false)}/>
  </div>
 </>;
 const action=view==='deals'?'New deal':view==='tasks'||view==='today'?'Add task':view==='owners'?'Add owner':'Add contact';
 return <div className={`app-shell ${collapsed?'sidebar-collapsed':''}`}><MobileSidebarSwipe openMobile={mobile} setOpenMobile={setMobile}/><aside className="sidebar">{navigation(false)}</aside><Sheet open={mobile} onOpenChange={setMobile}><SheetContent side="left" className="mobile-nav" overlayClassName="mobile-nav-overlay" showCloseButton={false} onCloseAutoFocus={event=>{if(search)event.preventDefault();}}><SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle><SheetDescription>BrokerOS workspace pages</SheetDescription></SheetHeader><SheetClose asChild><Button variant="outline" size="icon" className="mobile-nav-close" aria-label="Close navigation"><PanelLeftClose/></Button></SheetClose>{navigation(true)}</SheetContent></Sheet><div className="main-shell"><header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon" aria-label="Open navigation" className="mobile-toggle" onClick={()=>setMobile(true)}><PanelLeft/></Button><h1>{title}</h1></div><div className="topbar-actions"><div ref={setActionTarget}/>{view==='chat'&&<Button variant="ghost" size="sm" className="new-chat-action" asChild><Link href="/chat/" aria-label="New Chat"><SquarePen/><span className="new-chat-label">New Chat</span></Link></Button>}<Button size="icon" variant="outline" className="notification-button" aria-label="Priority notifications" onClick={()=>setNotifications(true)}><Bell/>{due.length>0&&<span/>}</Button>{!['campaigns','chat','assistant','insights','settings'].includes(view)&&<Button onClick={()=>setForm(view==='deals'?'deal':view==='today'||view==='tasks'?'task':view==='owners'?'owner':'contact')}><Plus/><span className="action-label">{action}</span></Button>}</div></header><main className={`page-shell ${view==='chat'?'chat-page':''}`}>{storageError&&<p role="alert" className="storage-warning">Browser storage is unavailable. Changes will last only for this session.</p>}{view==='today'&&<TodayView onContact={openContact} onDeal={openDeal}/ >}{view==='contacts'&&<ContactsView onContact={openContact}/ >}{view==='owners'&&<OwnersView onContact={openContact}/ >}{view==='deals'&&<DealsView onDeal={openDeal}/ >}{view==='tasks'&&<TasksView onContact={openContact}/ >}{view==='campaigns'&&<CampaignsView onContact={openContact} actionTarget={actionTarget}/ >}{view==='chat'&&<AssistantChatView onContact={openContact} onDeal={openDeal}/ >}{view==='assistant'&&<AssistantView onContact={openContact}/ >}{view==='insights'&&<InsightsView/ >}{view==='settings'&&<SettingsView/ >}{view!=='chat'&&<DemoNote/>}</main></div>
 {search&&<WorkspaceSearch onClose={()=>setSearch(false)} onRecord={openSearchRecord}/>}

 <Sheet open={notifications} onOpenChange={setNotifications}><SheetContent className="detail-sheet"><SheetHeader><SheetTitle>Needs your attention</SheetTitle><SheetDescription>Closing first. Then listings. Then nurture.</SheetDescription></SheetHeader><div className="detail-body"><p className="text-sm text-muted-foreground">In-app reminders · Dubai time</p>{due.length===0?<Empty title="You’re all caught up" description="New reminders will appear here."/>:due.map(t=><div className="notification-item" key={t.id}><PriorityPill priority={data.contacts.find(c=>c.id===t.contactId)?.priority||t.priority}/><h3>{t.title}</h3><p>{t.due<today()?'Overdue':`Today · ${t.time}`}</p><Button variant="outline" size="sm" onClick={()=>{setNotifications(false);if(t.contactId)openContact(t.contactId);else setForm('task');}}>Review <ChevronRight/></Button></div>)}</div></SheetContent></Sheet>
 {form==='contact'||form==='owner'?<ContactForm owner={form==='owner'} onClose={()=>setForm('')} onSaved={openContact}/>:form==='deal'?<DealForm onClose={()=>setForm('')} onSaved={openDeal}/>:form==='task'?<TaskForm onClose={()=>setForm('')}/>:null}
 {searchRecord&&<SearchRecordDetail key={`${searchRecord.kind}:${searchRecord.id}`} item={searchRecord} onClose={()=>setSearchRecord(null)} onRecord={openSearchRecord}/>}
 {contactId&&<ContactDetail id={contactId} onClose={()=>setContactId('')} onDeal={openDeal}/>}{dealId&&<DealDetail id={dealId} onClose={()=>setDealId('')} onContact={openContact}/>}
 </div>;
}
