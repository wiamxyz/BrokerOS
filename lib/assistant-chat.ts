import type {AssistantChat,ChatMessage,ChatProposal,CRMState} from './model';

export const chatSuggestions=['Plan my closing priorities','Prepare an owner follow-up','Prepare an Emaar launch'];
const localDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

export function prepareReply(question:string,data:CRMState,id:string):ChatMessage {
 const text=question.toLowerCase();
 const closing=data.contacts.filter(c=>c.priority==='Closing'&&!c.optOut);
 const owners=data.contacts.filter(c=>c.role!=='Buyer'&&!c.optOut&&!['Listing won','Lost'].includes(c.ownerStage));
 const owner=owners.find(c=>c.nurture==='Paused'&&c.priority==='Listing')||owners[0];
 let answer='This demo can help you plan closing priorities, prepare an owner follow-up or prepare an Emaar launch. Ask about one of those workflows, or start a new chat to choose an example. Responses use sample workspace records; no live AI is connected.';
 let proposal:ChatProposal|undefined;
 if(/emaar|launch|campaign/.test(text)) {
  answer='Prepare a launch draft for your Emaar owners. Review the message below, then save it to Campaigns to select recipients and complete the fact sheet. Developer pricing and availability still need verification.';
  proposal={kind:'campaign',contactId:'',title:'Emaar launch · personal introduction',body:'Hi {{first_name}},\n\nA new Emaar launch may be relevant to your plans. Would you like a short fact sheet with the location, payment plan and verified pricing?\n\nIf you’re interested, I can arrange a personal walkthrough.\n\nWalid'};
 } else if(/owner|follow.?up|listing|valuation/.test(text)) {
  if(owner){answer=`${owner.name} is a useful next conversation. ${owner.signal}. I’ve prepared a draft for you to edit. Save it to the review queue before any personal outreach. You can open ${owner.name} to check the contact and property context.`;
   proposal={kind:'draft',contactId:owner.id,title:`Follow up with ${owner.name}`,body:`Hi ${owner.name.split(' ')[0]}, following up on your plans for ${owner.building}. Would a short call to discuss your timing and a verified building-level comparison be useful?\n\nWalid`};
  }else answer='There are no eligible owners in this workspace. Add an owner in Contacts to prepare a follow-up.';
 } else if(/clos|priorit|today|offer|deal/.test(text)) {
  const buyers=closing.slice(0,4);
  answer=buyers.length?`Start with buyers ready to move:\n\n${buyers.map((c,i)=>`${i+1}. ${c.name} — ${c.nextAction}.`).join('\n')}\n\nThen review owner conversations in the Owner pipeline. I’ve prepared a reminder for the first buyer; review the date and time before adding it.`:'There are no contacts marked Ready to close. Review Deals and update a contact’s priority when an offer becomes active.';
  if(buyers[0])proposal={kind:'task',contactId:buyers[0].id,title:`Call ${buyers[0].name} about the offer`,body:buyers[0].nextAction,date:localDate(),time:'09:30'};
 }
 return {id,role:'assistant',text:answer,...(proposal?{proposal}:{})};
}

export function initialChats(data:CRMState):AssistantChat[]{return chatSuggestions.map((title,i)=>({id:`example-${i+1}`,title,messages:[{id:`example-user-${i}`,role:'user',text:title},prepareReply(title,data,`example-response-${i}`)]}));}
export function chatsFor(data:CRMState){return data.chats??initialChats(data);}
export function saveChat(data:CRMState,chat:AssistantChat):CRMState{return {...data,chats:[chat,...chatsFor(data).filter(c=>c.id!==chat.id)]};}

export function applyChatProposal(data:CRMState,chatId:string,messageId:string,input:ChatProposal,recordId:string,at:string):{data:CRMState;error?:string}{
 const chat=chatsFor(data).find(c=>c.id===chatId);
 const message=chat?.messages.find(m=>m.id===messageId);
 if(!chat||!message?.proposal)return {data,error:'This proposal is no longer available.'};
 if(message.receipt||message.dismissed)return {data,error:'This proposal has already been handled.'};
 if(input.kind!==message.proposal.kind||input.contactId!==message.proposal.contactId)return {data,error:'The proposal context changed. Open a new conversation.'};
 const title=input.title.trim(),body=input.body.trim();
 if(!title||!body)return {data,error:'Add a title and message before saving.'};
 const contact=data.contacts.find(c=>c.id===input.contactId);
 if(input.kind!=='campaign'&&(!contact||contact.optOut))return {data,error:'This contact is unavailable or marked do not contact.'};
 let next=data,text='',href='';
 if(input.kind==='task'&&contact){
  if(!input.date||!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!Number.isFinite(Date.parse(input.date+'T12:00:00Z'))||new Date(input.date+'T12:00:00Z').toISOString().slice(0,10)!==input.date||!input.time||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time))return {data,error:'Choose a valid reminder date and time.'};
  const existing=data.tasks.find(t=>!t.done&&t.contactId===contact.id&&t.title===title&&t.due===input.date&&t.time===input.time);
  next=existing?data:{...data,tasks:[{id:recordId,contactId:contact.id,title,priority:contact.priority,due:input.date,time:input.time,done:false},...data.tasks]};
  text=existing?`A matching reminder already exists for ${contact.name}. No duplicate was added.`:`Reminder added for ${contact.name} on ${input.date} at ${input.time} (Dubai time).`;
  href='/tasks/';
 }else if(input.kind==='draft'&&contact){
  next={...data,approvals:[{id:recordId,contactId:contact.id,title,message:body,reason:'Prepared in an assistant conversation; saved for agent review.',kind:'follow-up',status:'Pending'},...data.approvals]};
  text=`Follow-up draft for ${contact.name} saved to the review queue. No message was sent.`;href='/assistant/';
 }else if(input.kind==='campaign'){
  next={...data,campaigns:[{id:recordId,name:title,developer:'Emaar',segment:'Emaar owners',subject:title,message:body,property:'To be confirmed',price:'To be confirmed',handover:'To be confirmed',paymentPlan:'To be confirmed',status:'Draft',recipients:[],at},...data.campaigns]};
  text='Emaar launch draft saved to Campaigns. Select recipients and verify the fact sheet before simulating delivery. No messages were sent.';href='/campaigns/';
 }
 const updated={...chat,messages:chat.messages.map(m=>m.id===messageId?{...m,proposal:{...input,title,body},receipt:{text,href,at}}:m)};
 next=saveChat({...next,activities:[{id:`activity-${recordId}`,contactId:contact?.id,text,kind:'assistant',at},...next.activities]},updated);
 return {data:next};
}
