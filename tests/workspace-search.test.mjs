import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILDINGS,seedState,today} from '../lib/model.ts';
import {initialChats} from '../lib/assistant-chat.ts';
import {attentionWorkspacePages,workspaceProjects,workspaceItems,searchWorkspace,recentWorkspaceItems,rememberWorkspaceItem} from '../lib/workspace-search.ts';

test('search finds contacts by source and property, regardless of case or spacing',()=>{
 const data=seedState();const items=workspaceItems(data,initialChats(data));
 assert.ok(searchWorkspace(items,'  PROPERTY Finder  ').some(item=>item.kind==='contact'&&item.id==='c2'));
 assert.ok(searchWorkspace(items,'PALACE').some(item=>item.kind==='contact'&&item.id==='c1'));
 assert.deepEqual(searchWorkspace(items,'not-in-the-workspace'),[]);
 assert.deepEqual(searchWorkspace(items,'   '),[]);
});
test('search includes conversation messages and linked deal contact names',()=>{
 const data=seedState();const items=workspaceItems(data,[{id:'chat-1',title:'Morning plan',messages:[{id:'m1',role:'assistant',text:'Discuss the Marina valuation tomorrow.'}]}]);
 assert.equal(searchWorkspace(items,'marina tomorrow')[0].id,'chat-1');
 assert.ok(searchWorkspace(items,'omar').some(item=>item.kind==='deal'&&item.id==='d1'));
 assert.equal(searchWorkspace(items,'Omar Al Mansoori')[0].kind,'contact');
});
test('last opened is empty until a record is actually visited',()=>{
 const data=seedState();assert.deepEqual(recentWorkspaceItems(data,workspaceItems(data,initialChats(data))),[]);
});
test('opening an item moves it to the front without duplicates or mutating the source',()=>{
 const data=seedState();let next=rememberWorkspaceItem(data,{kind:'contact',id:'c1'});
 next=rememberWorkspaceItem(next,{kind:'deal',id:'d1'});next=rememberWorkspaceItem(next,{kind:'contact',id:'c1'});
 assert.equal(data.recentlyOpened,undefined);
 assert.deepEqual(next.recentlyOpened,[{kind:'contact',id:'c1'},{kind:'deal',id:'d1'}]);
 assert.equal(rememberWorkspaceItem(next,{kind:'contact',id:'c1'}),next);
});
test('history resolves current titles and skips deleted or malformed entries',()=>{
 const data=seedState();data.recentlyOpened=[null,{kind:'contact',id:'missing'},{kind:'contact',id:'c1'},{kind:'contact',id:'c1'}];data.contacts[0].name='Updated name';
 const recent=recentWorkspaceItems(data,workspaceItems(data,[]));assert.equal(recent.length,1);assert.equal(recent[0].title,'Updated name');
 data.recentlyOpened='invalid';assert.deepEqual(recentWorkspaceItems(data,workspaceItems(data,[])),[]);
});
test('recent history has a bounded size',()=>{
 let data=seedState();for(const contact of data.contacts)data=rememberWorkspaceItem(data,{kind:'contact',id:contact.id});assert.equal(data.recentlyOpened.length,12);assert.equal(data.recentlyOpened[0].id,'c14');
});

test('every workspace page is searchable by a familiar name and has a real destination',()=>{
 const items=workspaceItems(seedState(),[]);
 const aliases={today:'home',contacts:'clients',owners:'landlords',deals:'offers',tasks:'reminders',campaigns:'marketing',chat:'new chat',assistant:'approvals',insights:'projects',settings:'integrations'};
 assert.equal(items.filter(item=>item.kind==='page').length,10);
 for(const[id,alias]of Object.entries(aliases)){
  const result=searchWorkspace(items,alias)[0];assert.equal(result.kind,'page');assert.equal(result.id,id);assert.equal(result.href,id==='today'?'/':`/${id}/`);
 }
});
test('attention pages rank closing and listings ahead of promotion, using current work',()=>{
 const data=seedState();const items=workspaceItems(data,[],{today:today()});
 assert.deepEqual(attentionWorkspacePages(items).map(item=>item.id),['deals','tasks','owners','assistant','campaigns']);
 assert.match(items.find(item=>item.kind==='page'&&item.id==='tasks').preview,/1 overdue/);
 data.deals=data.deals.map(deal=>({...deal,stage:'Closed won'}));data.tasks=data.tasks.map(task=>({...task,done:true}));
 data.contacts=data.contacts.map(contact=>({...contact,ownerStage:'Listing won'}));data.approvals=data.approvals.map(review=>({...review,status:'Approved'}));data.campaigns=[];
 assert.deepEqual(attentionWorkspacePages(workspaceItems(data,[],{today:today()})),[]);
});
test('project context combines related clients, deals, campaigns and building references',()=>{
 const data=seedState();const project=workspaceProjects(data,BUILDINGS).find(project=>project.id==='park heights');
 assert.deepEqual(project.contactIds,['c3','c5','c14']);assert.deepEqual(project.dealIds,['d3','d6']);assert.deepEqual(project.campaignIds,['p2']);assert.equal(project.insight.sale,'1.92M');
 const items=workspaceItems(data,[],{buildings:BUILDINGS});
 assert.equal(searchWorkspace(items,'Park Heights')[0].kind,'project');
 assert.ok(searchWorkspace(items,'projects').some(item=>item.kind==='project'));
 assert.ok(!workspaceProjects(data,BUILDINGS).some(project=>project.title==='To be confirmed'));
});
test('tasks, campaigns and reviews are searchable by their own content and linked clients',()=>{
 const data=seedState();const items=workspaceItems(data,[]);
 for(const[kind,id,query]of [['task','t1','deposit'],['task','t9','completed'],['campaign','p1','next chapter'],['campaign','p2','khalid'],['review','a1','achievable sale price']]){
  assert.ok(searchWorkspace(items,query).some(item=>item.kind===kind&&item.id===id),`${kind}: ${query}`);
 }
});
test('equally relevant records precede chats and results are not cut off by chat volume',()=>{
 const data=seedState();const chats=Array.from({length:40},(_,i)=>({id:`chat-${i}`,title:`Update ${i}`,messages:[{id:`m${i}`,role:'assistant',text:'Palace Residences and Nadia Haddad.'}]}));
 const results=searchWorkspace(workspaceItems(data,chats,{buildings:BUILDINGS}),'Palace');
 assert.equal(results[0].kind,'project');assert.ok(results.findIndex(item=>item.kind==='contact')<results.findIndex(item=>item.kind==='chat'));assert.ok(results.length>40);
});
test('history accepts all new result types and resolves the latest record text',()=>{
 let data=seedState();for(const item of [{kind:'page',id:'tasks'},{kind:'project',id:'park heights'},{kind:'task',id:'t1'},{kind:'campaign',id:'p1'},{kind:'review',id:'a1'}])data=rememberWorkspaceItem(data,item);
 data.tasks[0].title='Confirm updated offer';
 const recent=recentWorkspaceItems(data,workspaceItems(data,[],{buildings:BUILDINGS}));assert.equal(recent.length,5);assert.equal(recent.find(item=>item.kind==='task').title,'Confirm updated offer');
});
