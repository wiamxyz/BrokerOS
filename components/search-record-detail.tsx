'use client';

import Link from 'next/link';
import {ArrowUpRight,UserRound,Handshake,Megaphone} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {useCRM} from '@/components/crm-provider';
import {TaskForm} from '@/components/forms';
import {CampaignEditor} from '@/components/growth-views';
import {Empty,Field,Pill,SectionTitle} from '@/components/crm-ui';
import {BUILDINGS,money,type RecentItem} from '@/lib/model';
import {workspaceProjects} from '@/lib/workspace-search';

export function SearchRecordDetail({item,onClose,onRecord}:{item:RecentItem;onClose:()=>void;onRecord:(item:RecentItem)=>void}){
 const{data,approve}=useCRM();
 const task=item.kind==='task'?data.tasks.find(task=>task.id===item.id):undefined;
 const campaign=item.kind==='campaign'?data.campaigns.find(campaign=>campaign.id===item.id):undefined;
 const review=item.kind==='review'?data.approvals.find(review=>review.id===item.id):undefined;
 const contact=review?data.contacts.find(contact=>contact.id===review.contactId):undefined;
 const project=item.kind==='project'?workspaceProjects(data,BUILDINGS).find(project=>project.id===item.id):undefined;
 if(task)return <TaskForm task={task} onClose={onClose}/>;
 if(campaign)return <CampaignEditor campaign={campaign} onClose={onClose} onContact={id=>onRecord({kind:'contact',id})}/>;
 return <Sheet open onOpenChange={open=>{if(!open)onClose();}}><SheetContent className="detail-sheet">
  <SheetHeader><SheetTitle>{project?.title??review?.title??'Record unavailable'}</SheetTitle><SheetDescription>{project?[project.area,project.developer,'Project context'].filter(Boolean).join(' · '):review?'Assistant review · demo workspace':'This record may have been removed.'}</SheetDescription></SheetHeader>
  <div className="detail-body">
   {project&&<>
    <p className="text-sm text-muted-foreground">Clients, deals and campaigns linked to this property or project.</p>
    {!!project.contactIds.length&&<section><SectionTitle title="Clients"/><div className="search-related-list">{data.contacts.filter(contact=>project.contactIds.includes(contact.id)).map(contact=><Button variant="ghost" className="search-related-row" key={contact.id} onClick={()=>onRecord({kind:'contact',id:contact.id})}><UserRound/><span><strong>{contact.name}</strong><small>{contact.role} · {contact.nextAction}</small></span><ArrowUpRight/></Button>)}</div></section>}
    {!!project.dealIds.length&&<section><SectionTitle title="Deals"/><div className="search-related-list">{data.deals.filter(deal=>project.dealIds.includes(deal.id)).map(deal=><Button variant="ghost" className="search-related-row" key={deal.id} onClick={()=>onRecord({kind:'deal',id:deal.id})}><Handshake/><span><strong>{deal.name}</strong><small>{deal.stage} · {money(deal.value,true)}</small></span><ArrowUpRight/></Button>)}</div></section>}
    {!!project.campaignIds.length&&<section><SectionTitle title="Campaigns"/><div className="search-related-list">{data.campaigns.filter(campaign=>project.campaignIds.includes(campaign.id)).map(campaign=><Button variant="ghost" className="search-related-row" key={campaign.id} onClick={()=>onRecord({kind:'campaign',id:campaign.id})}><Megaphone/><span><strong>{campaign.name}</strong><small>{campaign.status==='Draft'?'Draft':'Demo sent'} · {campaign.segment}</small></span><ArrowUpRight/></Button>)}</div></section>}
    {project.insight&&<section><SectionTitle title="Market reference" aside={<Pill>Sample data</Pill>}/><div className="detail-fields"><Field label="Property Finder · asking range"><p>AED {project.insight.listed}</p></Field><Field label="DXB Interact · sale midpoint"><p>AED {project.insight.sale}</p></Field><Field label="DXB Interact · annual rent"><p>AED {project.insight.rent}</p></Field></div><p className="text-sm text-muted-foreground mt-4">Illustrative placeholders. Verify current comparable units before sharing a valuation.</p></section>}
    <Button variant="outline" asChild><Link href="/insights/" onClick={onClose}>Open market insights<ArrowUpRight/></Link></Button>
   </>}
   {review&&<>
    <Pill tone={review.status==='Pending'?'listing':'neutral'}>{review.status}</Pill>
    {contact&&<Button variant="outline" onClick={()=>onRecord({kind:'contact',id:contact.id})}><UserRound/>{contact.name}<ArrowUpRight/></Button>}
    <Field label="Why this needs a look"><p>{review.reason}</p></Field>
    <Field label={review.kind==='handoff'?'Handoff context':'Prepared draft'}><p className="whitespace-pre-wrap">{review.message}</p></Field>
    {review.status==='Pending'&&<Button disabled={!contact||contact.optOut} onClick={()=>approve(review)}>{review.kind==='handoff'?'Accept handoff':'Approve draft'}</Button>}
    <p className="text-sm text-muted-foreground">{contact?.optOut?'This client has opted out of outreach.':'Approvals update this demo only. No message is sent.'}</p>
    <Button variant="outline" asChild><Link href="/assistant/" onClick={onClose}>Open review queue<ArrowUpRight/></Link></Button>
   </>}
   {!project&&!review&&<Empty title="Record not found" description="Search again to see the latest workspace records."/>}
  </div>
 </SheetContent></Sheet>;
}
