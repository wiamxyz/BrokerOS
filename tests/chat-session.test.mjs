import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const cache=new Map();
function load(file){const absolute=path.resolve('lib',file+'.ts');if(cache.has(absolute))return cache.get(absolute);const sandbox={exports:{}};cache.set(absolute,sandbox.exports);const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('module','exports','require',code)(sandbox,sandbox.exports,name=>load(path.basename(name)));return sandbox.exports;}
const {seedState}=load('model');const {chatsFor}=load('assistant-chat');const {switchConversation,submitConversation,currentSession}=load('chat-session');
const tag={type:'tag',tag:{id:'["contact:c1","Name"]',value:'Omar Al Mansoori',label:'Name'}};
const draft=[{type:'text',text:'Compare '},tag,{type:'text',text:' please'}];
test('legacy CRM state loads without migration or losing records',()=>{const data=seedState();assert.deepEqual(currentSession(data),{id:null,parts:[],caret:0});assert.equal(chatsFor(data).length,3);});
test('switching stores an unsent draft and reopening keeps exact inline order',()=>{let data={...seedState(),composerSession:{id:null,parts:draft,caret:9}};data=switchConversation(data,'example-1','draft-1');assert.deepEqual(chatsFor(data)[0].composerParts,draft);const order=chatsFor(data).map(c=>c.id);data=switchConversation(data,'draft-1','unused');assert.deepEqual(currentSession(data).parts,draft);assert.deepEqual(chatsFor(data).map(c=>c.id),order);});
test('sending tags produces snapshot-only demo reply, preserving all CRM records',()=>{const data={...seedState(),composerSession:{id:null,parts:draft,caret:9}};const next=submitConversation(data,'chat-1','user-1','reply-1');assert.equal(next.chats[0].messages[0].text,'Compare Omar Al Mansoori please');assert.match(next.chats[0].messages[1].text,/sample reply/);assert.equal(next.chats[0].messages[1].proposal,undefined);for(const key of ['contacts','deals','tasks','approvals','campaigns'])assert.deepEqual(next[key],data[key]);assert.equal(next.composerSession.parts[0].tag.id,tag.tag.id);});
test('plain CRM prompts keep reviewable actions; blank sends do nothing',()=>{const data=seedState();assert.equal(submitConversation(data,'chat','user','reply'),data);const next=submitConversation(data,'chat','user','reply','Plan my closing priorities');assert.equal(next.chats[0].messages[1].proposal.kind,'task');assert.deepEqual(next.tasks,data.tasks);});
test('unknown conversation selection leaves the current draft intact',()=>{const data={...seedState(),composerSession:{id:null,parts:draft,caret:9}};assert.equal(switchConversation(data,'missing','draft'),data);});
