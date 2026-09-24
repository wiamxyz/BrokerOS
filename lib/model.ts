export const SOURCES = ['Property Finder','Bayut','Bitrix / company campaign','Referral','Social campaign','Gmail','Manual import'] as const;
export const OWNER_STAGES = ['Cold owner','Contacted','Warming','Engaged','Valuation discussion','Listing opportunity','Listing won','Lost'] as const;
export const DEAL_STAGES = ['Qualified','Viewing','Offer ready','Negotiating','Under contract','Closed won','Closed lost'] as const;
export type Priority = 'Closing' | 'Listing' | 'Nurture';
export type Contact = {id:string;name:string;email:string;phone:string;role:'Buyer'|'Owner'|'Buyer & owner';source:string;area:string;building:string;developer:string;budget:number;priority:Priority;ownerStage:string;nextAction:string;signal:string;optOut:boolean;nurture:'Active'|'Paused'|'Off';notes:{id:string;text:string;at:string}[]};
export type Deal = {id:string;name:string;contactId:string;property:string;value:number;stage:string;closingDate:string;nextAction:string;notes:string;checklist:{label:string;done:boolean}[]};
export type Task = {id:string;title:string;contactId:string;priority:Priority;due:string;time:string;done:boolean};
export type Activity = {id:string;contactId?:string;text:string;at:string;kind:'note'|'system'|'call'|'campaign'|'assistant'};
export type Approval = {id:string;contactId:string;title:string;reason:string;message:string;kind:'handoff'|'follow-up'|'insight';status:'Pending'|'Approved'|'Dismissed'};
export type Recipient = {contactId:string;status:'Delivered'|'Opened'|'Interested'|'Not now'};
export type Campaign = {id:string;name:string;developer:string;segment:string;subject:string;message:string;property:string;price:string;handover:string;paymentPlan:string;selectedIds?:string[];status:'Draft'|'Simulated';recipients:Recipient[];at:string};
export type ChatProposal = {kind:'task'|'draft'|'campaign';contactId:string;title:string;body:string;date?:string;time?:string};
export type ChatReceipt = {text:string;href:string;at:string};
export type ChatMessage = {id:string;role:'user'|'assistant';text:string;proposal?:ChatProposal;receipt?:ChatReceipt;dismissed?:boolean};
export type AssistantChat = {id:string;title:string;messages:ChatMessage[]};
export type CRMState = {version:1;contacts:Contact[];deals:Deal[];tasks:Task[];activities:Activity[];approvals:Approval[];campaigns:Campaign[];chats?:AssistantChat[]};
export const uid = () => crypto.randomUUID();
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function shiftDate(days:number){const d=new Date(today()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export const money=(n:number,compact=false)=>`AED ${new Intl.NumberFormat('en',{notation:compact?'compact':'standard',maximumFractionDigits:compact?2:0}).format(n)}`;
export const ranks:Record<Priority,number>={Closing:0,Listing:1,Nurture:2};
export function priorityFor(t:Task, contacts:Contact[]){return contacts.find(c=>c.id===t.contactId)?.priority??t.priority;}
export function orderedTasks(tasks:Task[],contacts:Contact[]){return [...tasks].sort((a,b)=>ranks[priorityFor(a,contacts)]-ranks[priorityFor(b,contacts)] || a.due.localeCompare(b.due)||a.time.localeCompare(b.time));}
export function audience(contacts:Contact[],segment:string){return contacts.filter(c=>!c.optOut && (segment==='All contacts' || (segment==='Emaar owners' && c.role.includes('Owner') && c.developer==='Emaar') || (segment==='Emaar owners' && c.role==='Buyer & owner' && c.developer==='Emaar') || (segment==='Active buyers' && c.role!=='Owner') || (segment==='Owners & landlords' && c.role!=='Buyer')));}
export const SEGMENTS=['Emaar owners','Active buyers','Owners & landlords','All contacts'];
export const BUILDINGS=[{name:'Creek Harbour · Palace Residences',area:'Dubai Creek Harbour',listed:'2.45M – 3.10M',sale:'2.68M',rent:'155K',psf:'2,180',transactions:12},{name:'Dubai Hills · Park Heights',area:'Dubai Hills Estate',listed:'1.65M – 2.20M',sale:'1.92M',rent:'115K',psf:'1,940',transactions:18},{name:'Downtown · Boulevard Point',area:'Downtown Dubai',listed:'3.20M – 4.10M',sale:'3.65M',rent:'210K',psf:'2,760',transactions:9}];
export function seedState():CRMState {
 const at=new Date().toISOString();
 const raw:[string,Contact['role'],string,string,string,number,Priority,string,string,string][]=[
 ['Omar Al Mansoori','Buyer','Referral','Dubai Creek Harbour','Palace Residences',2850000,'Closing','', 'Confirm offer and deposit','Funds confirmed · ready to offer'],
 ['Sophie Laurent','Buyer','Property Finder','Downtown Dubai','Boulevard Point',3700000,'Closing','','Review seller counteroffer','Counteroffer received · wants to proceed'],
 ['James Miller','Buyer & owner','Bayut','Dubai Hills Estate','Park Heights',2100000,'Closing','Listing won','Arrange contract signing','Offer accepted · signing tomorrow'],
 ['Nadia Haddad','Owner','Manual import','Dubai Creek Harbour','Palace Residences',2900000,'Listing','Engaged','Book a valuation call','Asked for a valuation this morning'],
 ['Khalid Rahman','Owner','Referral','Dubai Hills Estate','Park Heights',1950000,'Listing','Valuation discussion','Discuss the comparative price range','Replied to building market update'],
 ['Emma Wilson','Owner','Gmail','Downtown Dubai','Boulevard Point',3850000,'Listing','Listing opportunity','Confirm listing terms','Ready to discuss exclusive listing'],
 ['Arjun Mehta','Buyer & owner','Bitrix / company campaign','Dubai Creek Harbour','Creek Edge',2600000,'Nurture','Warming','Share a building-level insight','Opened the last market update'],
 ['Layla Hassan','Owner','Manual import','Dubai Marina','Marina Gate',2400000,'Listing','Contacted','Follow up on selling timeline','First conversation · exploring options'],
 ['Daniel Brooks','Owner','Social campaign','Business Bay','Aykon City',1850000,'Nurture','Cold owner','Prepare an introduction','New owner record · no conversation yet'],
 ['Maya Patel','Buyer','Property Finder','Dubai Hills Estate','Golf Grand',2800000,'Nurture','','Confirm budget and move-in date','Interested in new Emaar launches'],
 ['Youssef Karim','Owner','Bayut','Dubai Creek Harbour','Creek Rise',2250000,'Nurture','Warming','Prepare a rent comparison','Considering a sale after tenancy ends'],
 ['Olivia Chen','Buyer','Social campaign','Downtown Dubai','Downtown',3200000,'Nurture','','Send launch fact sheet','Asked about payment plans'],
 ['Hassan Faris','Owner','Manual import','Business Bay','Executive Towers',2300000,'Nurture','Lost','No outreach requested','Chose another agency · do not contact'],
 ['Amelia Reed','Buyer','Gmail','Dubai Hills Estate','Park Heights',2050000,'Closing','','Confirm transfer appointment','Contract signed · transfer scheduled']
 ];
 const contacts:Contact[]=raw.map((r,i)=>({id:`c${i+1}`,name:r[0],email:`${r[0].toLowerCase().replaceAll(' ','.')}@example.com`,phone:'',role:r[1],source:r[2],area:r[3],building:r[4],developer:[7,8,12].includes(i)?'Other':'Emaar',budget:r[5],priority:r[6],ownerStage:r[7],nextAction:r[8],signal:r[9],optOut:i===12,nurture:i===12?'Off':i<6||i===13?'Paused':'Active',notes:[{id:`n${i}`,text:i===0?'Cash buyer. Looking for a 2-bedroom home with creek views. Comfortable at AED 2.85M; wants to make an offer today.':i===3?'Open to selling if the valuation meets expectations. Asked to speak with Walid; pause routine outreach.':`Interested in ${r[3]}. ${r[9]}. Confirm the next step personally.`,at}]}));
 const deals:Deal[]=[
 {id:'d1',name:'Creek-side home',contactId:'c1',property:'Palace Residences · 2 bed',value:2850000,stage:'Offer ready',closingDate:shiftDate(12),nextAction:'Confirm the offer amount and deposit',notes:'Cash purchase. Requested a vacant unit with creek views.'},
 {id:'d2',name:'Downtown upgrade',contactId:'c2',property:'Boulevard Point · 2 bed',value:3650000,stage:'Negotiating',closingDate:shiftDate(18),nextAction:'Review seller counteroffer',notes:'Seller countered at AED 3.65M. Buyer can proceed this month.'},
 {id:'d3',name:'Park Heights investment',contactId:'c3',property:'Park Heights · 2 bed',value:2050000,stage:'Under contract',closingDate:shiftDate(7),nextAction:'Arrange signing appointment',notes:'Buyer and seller aligned. Waiting for signed documents.'},
 {id:'d4',name:'Hills family home',contactId:'c10',property:'Golf Grand · 3 bed',value:2800000,stage:'Viewing',closingDate:shiftDate(35),nextAction:'Confirm weekend viewing',notes:'Comparing two layouts. Mortgage pre-approval pending.'},
 {id:'d5',name:'New launch investment',contactId:'c12',property:'Emaar launch · shortlist',value:3200000,stage:'Qualified',closingDate:shiftDate(50),nextAction:'Confirm preferred payment plan',notes:'Off-plan interest. No specific unit reserved.'},
 {id:'d6',name:'Park Heights transfer',contactId:'c14',property:'Park Heights · 2 bed',value:2050000,stage:'Under contract',closingDate:shiftDate(2),nextAction:'Confirm transfer appointment',notes:'Ready for transfer appointment. Both parties briefed.'},
 {id:'d7',name:'Creek Edge resale',contactId:'c7',property:'Creek Edge · 1 bed',value:1650000,stage:'Closed won',closingDate:shiftDate(-5),nextAction:'Send a post-sale check-in',notes:'Completed sample transaction.'}
 ].map((d,i)=>({...d,checklist:[{label:'Buyer requirements confirmed',done:true},{label:'Offer agreed',done:[2,5,6].includes(i)},{label:'Contract signed',done:i>=5},{label:'Transfer completed',done:i===6}]}));
 const tasks:Task[]=[
 {id:'t1',title:'Confirm Omar’s offer and deposit',contactId:'c1',priority:'Closing',due:today(),time:'09:30',done:false},
 {id:'t2',title:'Review Sophie’s counteroffer',contactId:'c2',priority:'Closing',due:today(),time:'10:30',done:false},
 {id:'t3',title:'Book Nadia’s valuation call',contactId:'c4',priority:'Listing',due:today(),time:'11:00',done:false},
 {id:'t4',title:'Agree listing terms with Emma',contactId:'c6',priority:'Listing',due:today(),time:'14:00',done:false},
 {id:'t5',title:'Review the Emaar launch draft',contactId:'c10',priority:'Nurture',due:today(),time:'16:00',done:false},
 {id:'t6',title:'Prepare James’s signing documents',contactId:'c3',priority:'Closing',due:today(),time:'12:00',done:false},
 {id:'t7',title:'Confirm Amelia’s transfer appointment',contactId:'c14',priority:'Closing',due:shiftDate(1),time:'09:00',done:false},
 {id:'t8',title:'Share Khalid’s price comparison',contactId:'c5',priority:'Listing',due:shiftDate(-1),time:'15:30',done:false},
 {id:'t9',title:'Review new owner contacts',contactId:'',priority:'Nurture',due:today(),time:'08:30',done:true}
 ];
 const approvals:Approval[]=[{id:'a1',contactId:'c4',kind:'handoff',title:'Nadia is ready for a conversation',reason:'She asked for a valuation and a call. Routine nurture is paused.',message:'Nadia owns a 2-bedroom in Palace Residences. She wants to understand an achievable sale price before deciding. Call to agree a valuation appointment.',status:'Pending'},{id:'a2',contactId:'c7',kind:'insight',title:'A useful touchpoint for Arjun',reason:'Opened the last update. A building-level comparison could help his decision.',message:'Hi Arjun, I’ve prepared an illustrative Creek Harbour price comparison. Would you like to discuss how your apartment compares? I’ll verify current transactions before sharing a valuation.',status:'Pending'},{id:'a3',contactId:'c8',kind:'follow-up',title:'Keep the conversation with Layla moving',reason:'She is exploring a sale but has not confirmed her timeline.',message:'Hi Layla, following up on our conversation about Marina Gate. Are you still considering a sale this year, or would a rental update be more useful right now?',status:'Pending'}];
 return {version:1,contacts,deals,tasks,approvals,activities:[{id:'e1',contactId:'c4',text:'Nadia requested a valuation. Nurture paused; handoff awaiting review.',at,kind:'assistant'},{id:'e2',contactId:'c1',text:'Omar confirmed funds and asked to prepare an offer.',at,kind:'call'},{id:'e3',contactId:'c7',text:'Arjun opened the Creek Harbour insight. Follow-up draft prepared.',at,kind:'assistant'}],campaigns:[{id:'p1',name:'Emaar · the next chapter',developer:'Emaar',segment:'Emaar owners',subject:'A new Emaar opportunity, selected for you',message:'Hi {{first_name}},\n\nA new Emaar launch may be a good fit for your next investment. I’ve put together a short fact sheet with the location, indicative pricing and payment plan.\n\nWould you like the details? Reply “Interested” and I’ll walk you through it.\n\nWalid',property:'Dubai Creek Harbour · illustrative launch',price:'From AED 2.4M',handover:'To be confirmed',paymentPlan:'80 / 20 · illustrative',status:'Draft',recipients:[],at},{id:'p2',name:'Dubai Hills · owner update',developer:'Emaar',segment:'Owners & landlords',subject:'Your Dubai Hills market update',message:'A short building-level update to help you plan your next move.',property:'Park Heights',price:'Illustrative market update',handover:'N/A',paymentPlan:'N/A',status:'Simulated',recipients:[{contactId:'c3',status:'Opened'},{contactId:'c5',status:'Interested'},{contactId:'c6',status:'Interested'},{contactId:'c7',status:'Opened'},{contactId:'c8',status:'Delivered'},{contactId:'c11',status:'Delivered'}],at}]};
}
