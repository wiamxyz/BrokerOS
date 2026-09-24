import type {AssistantChat,CRMState,RecentItem} from './model';

export type WorkspaceSearchItem=RecentItem&{title:string;preview:string;searchText:string};

export function workspaceItems(data:CRMState,chats:AssistantChat[]):WorkspaceSearchItem[]{
 return [
  ...chats.map(chat=>({kind:'chat' as const,id:chat.id,title:chat.title,preview:chat.messages.findLast(message=>message.role==='assistant')?.text||chat.messages.at(-1)?.text||'Start a conversation',searchText:[chat.title,...chat.messages.map(message=>message.text)].join(' ')})),
  ...data.contacts.map(contact=>({kind:'contact' as const,id:contact.id,title:contact.name,preview:[contact.role,contact.building||contact.area,contact.nextAction].filter(Boolean).join(' · '),searchText:[contact.name,contact.email,contact.phone,contact.role,contact.area,contact.building,contact.source,contact.developer,contact.nextAction,...contact.notes.map(note=>note.text)].join(' ')})),
  ...data.deals.map(deal=>({kind:'deal' as const,id:deal.id,title:deal.name,preview:[deal.property,deal.stage].filter(Boolean).join(' · '),searchText:[deal.name,deal.property,deal.stage,deal.nextAction,deal.notes,data.contacts.find(contact=>contact.id===deal.contactId)?.name].join(' ')}))
 ];
}

export function searchWorkspace(items:WorkspaceSearchItem[],query:string):WorkspaceSearchItem[]{
 const text=query.trim().toLocaleLowerCase();
 if(!text)return [];
 const words=text.split(/\s+/);
 const score=(item:WorkspaceSearchItem)=>item.title.toLocaleLowerCase()===text?3:item.title.toLocaleLowerCase().startsWith(text)?2:item.title.toLocaleLowerCase().includes(text)?1:0;
 return items.filter(item=>words.every(word=>item.searchText.toLocaleLowerCase().includes(word))).sort((a,b)=>score(b)-score(a)).slice(0,24);
}

function historyFor(data:CRMState):RecentItem[]{
 return Array.isArray(data.recentlyOpened)?data.recentlyOpened.filter(item=>item&&['chat','contact','deal'].includes(item.kind)&&typeof item.id==='string'):[];
}

export function recentWorkspaceItems(data:CRMState,items:WorkspaceSearchItem[]):WorkspaceSearchItem[]{
 const records=new Map(items.map(item=>[`${item.kind}:${item.id}`,item]));
 const seen=new Set<string>();
 return historyFor(data).flatMap(reference=>{const key=`${reference.kind}:${reference.id}`;const item=records.get(key);if(!item||seen.has(key))return [];seen.add(key);return [item];}).slice(0,12);
}

export function rememberWorkspaceItem(data:CRMState,item:RecentItem):CRMState{
 const history=historyFor(data);
 if(history[0]?.kind===item.kind&&history[0]?.id===item.id)return data;
 return {...data,recentlyOpened:[item,...history.filter(previous=>previous.kind!==item.kind||previous.id!==item.id)].slice(0,12)};
}
