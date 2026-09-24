import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState} from '../lib/model.ts';
import {initialChats} from '../lib/assistant-chat.ts';
import {workspaceItems,searchWorkspace,recentWorkspaceItems,rememberWorkspaceItem} from '../lib/workspace-search.ts';

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
