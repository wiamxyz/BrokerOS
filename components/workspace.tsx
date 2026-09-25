'use client';
import Link from 'next/link';
import {useEffect,useState,useRef,useId,type CSSProperties} from 'react';
import {LayoutDashboard,Users,Building2,Handshake,ListTodo,Megaphone,Sparkles,ChartNoAxesCombined,Search,Bell,Plus,PanelLeft,ChevronRight,PanelLeftClose,SquarePen,Settings} from "@/components/icons";

import {Button} from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
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
import {SidebarChats,ChatHeaderTitle} from '@/components/sidebar-chats';
import {HistoryControls} from '@/components/navigation-history';
import {SidebarResizeHandle} from '@/components/sidebar-resize-handle';
import {useSidebarWidth} from '@/lib/use-sidebar-width';
import {orderedTasks,today,type RecentItem} from '@/lib/model';
const nav=[{id:'today',label:'Dashboard',icon:LayoutDashboard},{id:'contacts',label:'Contacts',icon:Users},{id:'owners',label:'Owner pipeline',icon:Building2},{id:'deals',label:'Deals',icon:Handshake},{id:'tasks',label:'Tasks & reminders',icon:ListTodo},{id:'campaigns',label:'Campaigns',icon:Megaphone},{id:'chat',label:'New Chat',icon:SquarePen},{id:'assistant',label:'Review queue',icon:Sparkles},{id:'insights',label:'Market insights',icon:ChartNoAxesCombined}];
export function Workspace({view}:{view:string}){
 const{data,storageError,rememberOpened}=useCRM();const[searchRecord,setSearchRecord]=useState<RecentItem|null>(null);const[mobile,setMobile]=useState(false);const[search,setSearch]=useState(false);const[notifications,setNotifications]=useState(false);const[form,setForm]=useState('');const[contactId,setContactId]=useState('');const[dealId,setDealId]=useState('');
 const{width,maxWidth,setWidth,saveWidth}=useSidebarWidth();const[resizing,setResizing]=useState(false);const sidebarId=useId();
 const[mobileGroups,setMobileGroups]=useState<Record<string,boolean>>({});
 const[collapsed,setCollapsed]=useState(false);const expandButton=useRef<HTMLButtonElement>(null);const collapseButton=useRef<HTMLButtonElement>(null);const sidebarFocus=useRef(false);const mobileToggle=useRef<HTMLButtonElement>(null);const notificationOrigin=useRef<HTMLButtonElement|null>(null);const[actionTarget,setActionTarget]=useState<HTMLDivElement|null>(null);
 useEffect(()=>{const id=setTimeout(()=>{try{setCollapsed(localStorage.getItem('brokeros-sidebar-collapsed')==='true');const groups=JSON.parse(localStorage.getItem('brokeros-mobile-nav-groups')||'{}');if(groups&&typeof groups==='object'&&!Array.isArray(groups))setMobileGroups(Object.fromEntries(Object.entries(groups).filter(([,value])=>typeof value==='boolean')) as Record<string,boolean>);}catch{}},0);return()=>clearTimeout(id);},[]);
 useEffect(()=>{if(!sidebarFocus.current)return;sidebarFocus.current=false;const frame=requestAnimationFrame(()=>(collapsed?expandButton:collapseButton).current?.focus());return()=>cancelAnimationFrame(frame);},[collapsed]);
 function toggleSidebar(){const next=!collapsed;sidebarFocus.current=true;setCollapsed(next);try{localStorage.setItem('brokeros-sidebar-collapsed',String(next));}catch{}}
 function setMobileGroup(label:string,open:boolean){const next={...mobileGroups,[label]:open};setMobileGroups(next);try{localStorage.setItem('brokeros-mobile-nav-groups',JSON.stringify(next));}catch{}}
 const pending=data.approvals.filter(a=>a.status==='Pending').length;const due=orderedTasks(data.tasks.filter(t=>!t.done&&t.due<=today()),data.contacts);
 const title=view==='today'?'Dashboard':view==='chat'?'AI assistant':view==='settings'?'Workspace settings':nav.find(n=>n.id===view)?.label||'Overview';
 useEffect(()=>{const event=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setSearch(v=>!v);}};window.addEventListener('keydown',event);const params=new URLSearchParams(window.location.search);if(params.get('contact'))setTimeout(()=>setContactId(params.get('contact')||''),0);if(params.get('deal'))setTimeout(()=>setDealId(params.get('deal')||''),0);return()=>window.removeEventListener('keydown',event);},[]);
 const openContact=(id:string)=>{setSearchRecord(null);setDealId('');setContactId(id);};const openDeal=(id:string)=>{setSearchRecord(null);setContactId('');setDealId(id);};
 const openSearchRecord=(item:RecentItem)=>{rememberOpened({kind:item.kind,id:item.id});if(item.kind==='contact')openContact(item.id);else if(item.kind==='deal')openDeal(item.id);else{setContactId('');setDealId('');setSearchRecord(item);}};
 const notificationButton=(className:string)=><Button size="icon" variant="outline" className={`notification-button ${className}`} aria-label="Priority notifications" title="Notifications" aria-haspopup="dialog" aria-expanded={notifications} onClick={event=>{notificationOrigin.current=event.currentTarget;setMobile(false);setNotifications(true);}}><Bell/>{due.length>0&&<span aria-hidden="true"/>}</Button>;
 const navigation=(isMobile:boolean)=><>
  <div className="sidebar-pinned-header">
   <div className="sidebar-controls">
    <Button ref={isMobile?undefined:collapseButton} variant="ghost" size="icon-sm" aria-label={isMobile?'Close navigation':'Collapse sidebar'} title={isMobile?'Close navigation':'Collapse sidebar'} onClick={()=>isMobile?setMobile(false):toggleSidebar()}><PanelLeftClose/></Button>
    <HistoryControls onNavigate={()=>setMobile(false)}/>
   </div>
   <div className="sidebar-brand">
    <Link href="/" className="brand" onClick={()=>setMobile(false)} aria-label="BrokerOS dashboard">BrokerOS</Link>
    <div className="sidebar-brand-actions">
     <Button variant="ghost" size="icon-sm" className="sidebar-search-action" onClick={()=>{setMobile(false);setSearch(true);}} aria-label="Search workspace" title="Search workspace · ⌘ K"><Search/></Button>
     {notificationButton('sidebar-notifications')}
    </div>
   </div>
   <SidebarChats newChat onNavigate={()=>setMobile(false)}/>
  </div>
  <nav className="sidebar-navigation" aria-label="Main navigation">
   {[{label:'Workspace',ids:['today','contacts','owners','deals','tasks']},{label:'Growth',ids:['campaigns','insights']},{label:'AI assistant',ids:['assistant']}].map(group=>
    <NavigationGroup key={group.label} label={group.label} mobile={isMobile} open={mobileGroups[group.label]!==false} onOpenChange={open=>setMobileGroup(group.label,open)}>
     {group.ids.map(id=>{const n=nav.find(n=>n.id===id)!;return <Link key={n.id} href={n.id==='today'?'/':`/${n.id}/`} className={`nav-link ${view===n.id?'active':''}`} onClick={()=>setMobile(false)} aria-current={view===n.id?'page':undefined} aria-label={n.label} title={n.label}><n.icon/><span>{n.label}</span>{n.id==='assistant'&&pending>0&&<span className="nav-count">{pending}</span>}</Link>;})}
     {group.label==='AI assistant'&&<SidebarChats onNavigate={()=>setMobile(false)}/>}
    </NavigationGroup>
   )}
  </nav>
  <div className="sidebar-bottom"><ProfileMenu onNavigate={()=>setMobile(false)}/></div>
 </>;
 const action=view==='deals'?'New deal':view==='tasks'||view==='today'?'Add task':view==='owners'?'Add owner':'Add contact';
 return <div className={`app-shell ${collapsed?'sidebar-collapsed':''}`} data-resizing={resizing||undefined} style={{'--sidebar-width':`${width}px`} as CSSProperties}><MobileSidebarSwipe openMobile={mobile} setOpenMobile={setMobile}/><aside id={sidebarId} className="sidebar" inert={collapsed}>{navigation(false)}<SidebarResizeHandle disabled={collapsed} sidebarId={sidebarId} width={width} maxWidth={maxWidth} setWidth={setWidth} saveWidth={saveWidth} setResizing={setResizing}/></aside><Sheet open={mobile} onOpenChange={setMobile}><SheetContent side="left" className="mobile-nav" overlayClassName="mobile-nav-overlay" showCloseButton={false} onCloseAutoFocus={event=>{if(search||notifications)event.preventDefault();}}><SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle><SheetDescription>BrokerOS workspace pages</SheetDescription></SheetHeader>{navigation(true)}</SheetContent></Sheet><div className="main-shell"><header className="topbar">
  <div className="header-navigation">
   <Button ref={expandButton} variant="ghost" size="icon-sm" aria-label="Expand sidebar" title="Expand sidebar" className="desktop-expand" onClick={toggleSidebar}><PanelLeft/></Button>
   <Button ref={mobileToggle} variant="ghost" size="icon-sm" aria-label="Open navigation" title="Open navigation" className="mobile-toggle" onClick={()=>setMobile(true)}><PanelLeft/></Button>
   <HistoryControls className="header-history"/>
   <Button variant="ghost" size="icon-sm" asChild><Link href="/chat/" aria-label="New Chat" title="New Chat"><SquarePen/></Link></Button>
  </div>
  <div className="topbar-title">{(()=>{const Icon=view==='settings'?Settings:nav.find(n=>n.id===view)?.icon??Search;return <Icon className="page-title-icon"/>;})()}<h1>{view==='chat'?<ChatHeaderTitle/>:title}</h1></div>
  <div className="topbar-actions"><div ref={setActionTarget}/>{notificationButton('header-notifications')}{!['campaigns','chat','assistant','insights','settings'].includes(view)&&<Button onClick={()=>setForm(view==='deals'?'deal':view==='today'||view==='tasks'?'task':view==='owners'?'owner':'contact')}><Plus/><span className="action-label">{action}</span></Button>}</div>
 </header><main className={`page-shell ${view==='chat'?'chat-page':''}`}>{storageError&&<p role="alert" className="storage-warning">Browser storage is unavailable. Changes will last only for this session.</p>}{view==='today'&&<TodayView onContact={openContact} onDeal={openDeal}/ >}{view==='contacts'&&<ContactsView onContact={openContact}/ >}{view==='owners'&&<OwnersView onContact={openContact}/ >}{view==='deals'&&<DealsView onDeal={openDeal}/ >}{view==='tasks'&&<TasksView onContact={openContact}/ >}{view==='campaigns'&&<CampaignsView onContact={openContact} actionTarget={actionTarget}/ >}{view==='chat'&&<AssistantChatView onContact={openContact} onDeal={openDeal}/ >}{view==='assistant'&&<AssistantView onContact={openContact}/ >}{view==='insights'&&<InsightsView/ >}{view==='settings'&&<SettingsView/ >}{view!=='chat'&&<DemoNote/>}</main></div>
 {search&&<WorkspaceSearch onClose={()=>setSearch(false)} onRecord={openSearchRecord}/>}

 <Sheet open={notifications} onOpenChange={setNotifications}><SheetContent className="detail-sheet" onCloseAutoFocus={event=>{event.preventDefault();if(contactId||dealId||form)return;const origin=notificationOrigin.current;if(origin?.isConnected&&origin.getClientRects().length&&!origin.closest('[inert]'))origin.focus();else mobileToggle.current?.focus();}}><SheetHeader><SheetTitle>Needs your attention</SheetTitle><SheetDescription>Closing first. Then listings. Then nurture.</SheetDescription></SheetHeader><div className="detail-body"><p className="text-sm text-muted-foreground">In-app reminders · Dubai time</p>{due.length===0?<Empty title="You’re all caught up" description="New reminders will appear here."/>:due.map(t=><div className="notification-item" key={t.id}><PriorityPill priority={data.contacts.find(c=>c.id===t.contactId)?.priority||t.priority}/><h3>{t.title}</h3><p>{t.due<today()?'Overdue':`Today · ${t.time}`}</p><Button variant="outline" size="sm" onClick={()=>{setNotifications(false);if(t.contactId)openContact(t.contactId);else setForm('task');}}>Review <ChevronRight/></Button></div>)}</div></SheetContent></Sheet>
 {form==='contact'||form==='owner'?<ContactForm owner={form==='owner'} onClose={()=>setForm('')} onSaved={openContact}/>:form==='deal'?<DealForm onClose={()=>setForm('')} onSaved={openDeal}/>:form==='task'?<TaskForm onClose={()=>setForm('')}/>:null}
 {searchRecord&&<SearchRecordDetail key={`${searchRecord.kind}:${searchRecord.id}`} item={searchRecord} onClose={()=>setSearchRecord(null)} onRecord={openSearchRecord}/>}
 {contactId&&<ContactDetail id={contactId} onClose={()=>setContactId('')} onDeal={openDeal}/>}{dealId&&<DealDetail id={dealId} onClose={()=>setDealId('')} onContact={openContact}/>}
 </div>;
}
