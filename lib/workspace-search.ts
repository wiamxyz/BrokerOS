import type {AssistantChat,CRMState,RecentItem} from './model';

export type WorkspaceSearchItem=RecentItem&{title:string;preview:string;searchText:string;href?:string;aliases?:string[];priority?:number;needsAttention?:boolean};
export type BuildingReference={name:string;area:string;listed:string;sale:string;rent:string;psf:string;transactions:number};
export type WorkspaceProject={id:string;title:string;area:string;developer:string;contactIds:string[];dealIds:string[];campaignIds:string[];insight?:BuildingReference};
export const SEARCH_KIND_LABELS:Record<RecentItem['kind'],string>={page:'Page',project:'Project',contact:'Client',deal:'Deal',task:'Task',campaign:'Campaign',review:'Review',chat:'Chat'};
const normalize=(value:string)=>value.trim().toLocaleLowerCase();
const plural=(count:number,singular:string,multiple=singular+'s')=>`${count} ${count===1?singular:multiple}`;
const localDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

export function workspaceProjects(data:CRMState,buildings:BuildingReference[]=[]):WorkspaceProject[]{
 const projects=new Map<string,WorkspaceProject>();
 function get(title:string){const name=title.trim();if(!name||/^(to be confirmed|n\/a|not set)$/i.test(name))return;const id=normalize(name);if(!projects.has(id))projects.set(id,{id,title:name,area:'',developer:'',contactIds:[],dealIds:[],campaignIds:[]});return projects.get(id)!;}
 for(const building of buildings){const project=get(building.name.split(' · ').at(-1)!);if(project){project.area=building.area;project.insight=building;}}
 for(const contact of data.contacts){const project=get(contact.building);if(project){project.contactIds.push(contact.id);project.area||=contact.area;project.developer||=contact.developer;}}
 for(const deal of data.deals){const project=get(deal.property.split(' · ')[0]);if(project)project.dealIds.push(deal.id);}
 for(const campaign of data.campaigns){const project=get(campaign.property.split(' · ')[0]);if(project){project.campaignIds.push(campaign.id);project.developer||=campaign.developer;}}
 return [...projects.values()];
}

export function workspaceItems(data:CRMState,chats:AssistantChat[],options:{today?:string;buildings?:BuildingReference[]}={}):WorkspaceSearchItem[]{
 const date=options.today??localDate();
 const contactMap=new Map(data.contacts.map(contact=>[contact.id,contact]));
 const closing=data.deals.filter(deal=>['Offer ready','Negotiating','Under contract'].includes(deal.stage));
 const openTasks=data.tasks.filter(task=>!task.done);
 const overdue=openTasks.filter(task=>task.due<date);
 const dueToday=openTasks.filter(task=>task.due===date);
 const closingTasks=openTasks.filter(task=>task.due<=date&&(contactMap.get(task.contactId)?.priority??task.priority)==='Closing');
 const activeOwners=data.contacts.filter(contact=>contact.role!=='Buyer'&&!contact.optOut&&!['Lost','Listing won'].includes(contact.ownerStage));
 const engagedOwners=activeOwners.filter(contact=>['Engaged','Valuation discussion','Listing opportunity'].includes(contact.ownerStage));
 const pending=data.approvals.filter(review=>review.status==='Pending');
 const handoffs=pending.filter(review=>review.kind==='handoff');
 const drafts=data.campaigns.filter(campaign=>campaign.status==='Draft');
 const interested=new Set(data.campaigns.flatMap(campaign=>campaign.recipients.filter(recipient=>recipient.status==='Interested').map(recipient=>recipient.contactId))).size;
 const page=(id:string,title:string,preview:string,aliases:string[],priority=0):WorkspaceSearchItem=>({kind:'page',id,title,preview,aliases,href:id==='today'?'/':`/${id}/`,searchText:[title,preview,...aliases].join(' '),priority,needsAttention:priority>0});
 const pages=[
  page('today','Dashboard','Daily priorities, closing buyers and agent follow-ups',['home','today','overview','daily priorities','crm']),
  page('contacts','Contacts',`${plural(data.contacts.length,'client')} · Buyers, owners and lead sources`,['clients','client','contact','people','buyers','customers','leads']),
  page('owners','Owner pipeline',engagedOwners.length?`${plural(engagedOwners.length,'owner')} ready for a personal follow-up`:`${plural(activeOwners.length,'active owner')} · Listing acquisition`,['owners','landlords','listings','valuation','seller','acquisition'],engagedOwners.length?80:0),
  page('deals','Deals',closing.length?`${plural(closing.length,'deal')} at offer, negotiation or contract stage`:'Transactions, offers and closing progress',['deal','offers','transactions','closings','sales'],closing.length?100:0),
  page('tasks','Tasks & reminders',overdue.length||dueToday.length?`${overdue.length} overdue · ${dueToday.length} due today`:`${plural(openTasks.length,'open task')} · Follow-ups and reminders`,['tasks','reminders','to do','todo','overdue','follow up','schedule'],closingTasks.length?95:overdue.length?85:dueToday.length?60:0),
  page('campaigns','Campaigns',interested?`${plural(interested,'interested contact')} · ${plural(drafts.length,'draft')}`:`${plural(drafts.length,'draft')} · Launch messages and responses`,['campaign','marketing','promotion','launches','new launch','fact sheets','audience'],interested?40:drafts.length?30:0),
  page('chat','AI assistant','Conversations and help with your real estate workspace',['chat','chats','new chat','conversation','copilot']),
  page('assistant','Review queue',pending.length?`${plural(pending.length,'item')} awaiting review${handoffs.length?` · ${plural(handoffs.length,'agent handoff')}`:''}`:'Prepared follow-ups, market touchpoints and agent handoffs',['approvals','approval','reviews','review','handoffs','drafts','assistant activity'],pending.length?75:0),
  page('insights','Market insights','Building price ranges, completed sales and rental references',['market','insights','projects','properties','buildings','developments','property finder','dxb interact','rent','valuation data']),
  page('settings','Workspace settings','Profile, lead sources, integrations and demo controls',['settings','profile','connections','integrations','import','gmail','bayut','bitrix','referrals','social campaigns','currency','time zone','reset demo'])
 ];
 return [
  ...pages,
  ...workspaceProjects(data,options.buildings).map(project=>({kind:'project' as const,id:project.id,title:project.title,preview:[project.area,plural(project.contactIds.length,'client'),plural(project.dealIds.length,'deal'),project.campaignIds.length?plural(project.campaignIds.length,'campaign'):''].filter(Boolean).join(' · '),searchText:[project.title,project.area,project.developer,'project projects property properties building buildings development',...project.contactIds.map(id=>contactMap.get(id)?.name),project.insight?'Property Finder DXB Interact listed prices transactions sale rent':''].join(' ')})),
  ...data.contacts.map(contact=>({kind:'contact' as const,id:contact.id,title:contact.name,preview:[contact.role,contact.building||contact.area,contact.nextAction].filter(Boolean).join(' · '),priority:contact.priority==='Closing'?90:contact.priority==='Listing'?60:0,searchText:[contact.name,'client clients contact contacts',contact.email,contact.phone,contact.role,contact.area,contact.building,contact.source,contact.developer,contact.nextAction,...contact.notes.map(note=>note.text)].join(' ')})),
  ...data.deals.map(deal=>({kind:'deal' as const,id:deal.id,title:deal.name,preview:[deal.property,deal.stage].filter(Boolean).join(' · '),priority:closing.some(item=>item.id===deal.id)?90:0,searchText:[deal.name,'deal deals transaction transactions',deal.property,deal.stage,deal.nextAction,deal.notes,contactMap.get(deal.contactId)?.name].join(' ')})),
  ...data.tasks.map(task=>({kind:'task' as const,id:task.id,title:task.title,preview:[task.done?'Completed':task.due<date?'Overdue':task.due===date?'Due today':task.due,task.time,contactMap.get(task.contactId)?.name].filter(Boolean).join(' · '),priority:!task.done&&task.due<=date?70:0,searchText:[task.title,'task tasks reminder reminders',task.done?'completed':'open',task.due<date&&!task.done?'overdue':'',task.due,task.time,task.priority,contactMap.get(task.contactId)?.name,contactMap.get(task.contactId)?.building].join(' ')})),
  ...data.campaigns.map(campaign=>({kind:'campaign' as const,id:campaign.id,title:campaign.name,preview:[campaign.status==='Draft'?'Draft':'Demo sent',campaign.property,campaign.segment].join(' · '),searchText:[campaign.name,'campaign campaigns launch marketing',campaign.subject,campaign.message,campaign.property,campaign.developer,campaign.segment,campaign.status,...campaign.recipients.map(recipient=>contactMap.get(recipient.contactId)?.name)].join(' ')})),
  ...data.approvals.map(review=>({kind:'review' as const,id:review.id,title:review.title,preview:[review.status,contactMap.get(review.contactId)?.name,review.reason].filter(Boolean).join(' · '),priority:review.status==='Pending'?60:0,searchText:[review.title,'review reviews approval approvals',review.kind,review.status,review.reason,review.message,contactMap.get(review.contactId)?.name,contactMap.get(review.contactId)?.building].join(' ')})),
  ...chats.map(chat=>({kind:'chat' as const,id:chat.id,title:chat.title,href:`/chat/?chat=${encodeURIComponent(chat.id)}`,preview:chat.messages.findLast(message=>message.role==='assistant')?.text||chat.messages.at(-1)?.text||'Start a conversation',searchText:[chat.title,'chat conversation',...chat.messages.map(message=>message.text)].join(' ')}))
 ];
}

export function attentionWorkspacePages(items:WorkspaceSearchItem[]):WorkspaceSearchItem[]{
 return items.filter(item=>item.kind==='page'&&item.needsAttention).sort((a,b)=>(b.priority??0)-(a.priority??0));
}

export function searchWorkspace(items:WorkspaceSearchItem[],query:string):WorkspaceSearchItem[]{
 const text=normalize(query);if(!text)return [];
 const words=text.split(/\s+/);
 const score=(item:WorkspaceSearchItem)=>normalize(item.title)===text?50:item.aliases?.some(alias=>normalize(alias)===text)?45:normalize(item.title).startsWith(text)?30:normalize(item.title).includes(text)?20:5;
 const typeOrder:Record<RecentItem['kind'],number>={page:0,project:1,contact:2,deal:3,task:4,review:5,campaign:6,chat:7};
 return items.filter(item=>words.every(word=>normalize(item.searchText).includes(word))).sort((a,b)=>score(b)-score(a)||typeOrder[a.kind]-typeOrder[b.kind]||(b.priority??0)-(a.priority??0));
}

function historyFor(data:CRMState):RecentItem[]{
 return Array.isArray(data.recentlyOpened)?data.recentlyOpened.filter(item=>item&&Object.hasOwn(SEARCH_KIND_LABELS,item.kind)&&typeof item.id==='string'):[];
}

export function recentWorkspaceItems(data:CRMState,items:WorkspaceSearchItem[]):WorkspaceSearchItem[]{
 const records=new Map(items.map(item=>[`${item.kind}:${item.id}`,item]));const seen=new Set<string>();
 return historyFor(data).flatMap(reference=>{const key=`${reference.kind}:${reference.id}`;const item=records.get(key);if(!item||seen.has(key))return [];seen.add(key);return [item];}).slice(0,12);
}

export function rememberWorkspaceItem(data:CRMState,item:RecentItem):CRMState{
 const history=historyFor(data);if(history[0]?.kind===item.kind&&history[0]?.id===item.id)return data;
 return {...data,recentlyOpened:[item,...history.filter(previous=>previous.kind!==item.kind||previous.id!==item.id)].slice(0,12)};
}
