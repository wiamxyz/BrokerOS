import {test,expect} from '@playwright/test';
const pageErrors=new WeakMap();
// Use the editor's paragraph shortcuts on macOS. Native Cmd+ArrowLeft during
// ProseMirror's initial focus guard can be mistaken for a browser selection reset.
const cursorStart=process.platform==='darwin'?'Control+a':'Control+Home';
const cursorEnd=process.platform==='darwin'?'Control+e':'Control+End';
const panel=page=>page.locator('#value-chat');
const editor=page=>page.getByRole('textbox',{name:'Message about tagged values'});
async function tag(page,name){const button=page.getByRole('button',{name,exact:true});await button.locator("..").hover();await button.click();await expect(editor(page)).toBeFocused();}
async function close(page){await page.getByRole('button',{name:'Close AI chat',exact:true}).click();await expect(panel(page)).toBeHidden();}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
test.beforeEach(async({page})=>{const errors=[];pageErrors.set(page,errors);page.on('pageerror',error=>errors.push(error.message));await page.goto('/');await expect(page.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();});
test('tags are stable across table and detail views; row actions remain independent',async({page})=>{
 await page.goto('/contacts/');
 await tag(page,'Tag Name: Omar Al Mansoori for AI chat');
 await expect(page.locator('[data-tag-pill]')).toHaveCount(1);
 await close(page);
 await tag(page,'Tagged Name: Omar Al Mansoori. Open AI chat');
 await expect(page.locator('[data-tag-pill]')).toHaveCount(1);
 await close(page);
 await page.getByRole('button',{name:'Omar Al Mansoori',exact:true}).click();
 const detail=page.getByRole('dialog');await expect(detail.getByRole('heading',{name:/Omar/})).toBeVisible();
 await detail.getByRole('heading',{name:/Omar/}).hover();await detail.getByRole('button',{name:'Tagged Name: Omar Al Mansoori. Open AI chat',exact:true}).click();
 await expect(editor(page)).toBeVisible();await expect(page.locator('[data-tag-pill]')).toHaveCount(1);
 await expect(page.getByRole('button',{name:'Edit',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Remove Omar Al Mansoori (Name)',exact:true}).click();
 await expect(page.locator('[data-tag-pill]')).toHaveCount(0);await expect(panel(page)).toBeVisible();
});
test('inline tags preserve text order, cursor, undo, and drafts across refresh',async({page})=>{
 await tag(page,'Tag Ready to close: 4 for AI chat');
 await editor(page).press(cursorStart);await page.keyboard.insertText('Compare ');
 await editor(page).press(cursorEnd);await page.keyboard.insertText(' with last month');
 await expect(editor(page)).toContainText('Compare 4');await expect(editor(page)).toContainText('with last month');
 await page.getByRole('button',{name:'Remove 4 (Ready to close)'}).click();
 await expect(page.locator('[data-tag-pill]')).toHaveCount(0);
 await editor(page).press('ControlOrMeta+z');await expect(page.locator('[data-tag-pill]')).toHaveCount(1);
 await close(page);await page.reload();await page.getByRole('button',{name:'Expand AI sidebar',exact:true}).click();
 await expect(editor(page)).toContainText('Compare 4');await expect(editor(page)).toContainText('with last month');
 await noOverflow(page);
});
test('multiple values, separate history, new chats, and sent snapshots share one store',async({page})=>{
 await tag(page,'Tag Ready to close: 4 for AI chat');await close(page);
 await tag(page,'Tag Owners in progress: 7 for AI chat');await expect(page.locator('[data-tag-pill]')).toHaveCount(2);
 await editor(page).press(cursorEnd);await page.keyboard.insertText('Explain these');
 await page.getByRole('button',{name:'Send message',exact:true}).click();
 await expect(panel(page)).toContainText('This is a sample reply');
 await expect(panel(page).getByText('Previous conversations',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'All conversations',exact:true}).click();await expect(panel(page).getByText('Previous conversations',{exact:true})).toBeVisible();
 const title=await page.evaluate(()=>JSON.parse(localStorage.getItem('brokeros-demo-v1')).chats[0].title);
 await panel(page).getByRole('button',{name:'New chat',exact:true}).click();await expect(page.locator('[data-tag-pill]')).toHaveCount(0);
 await editor(page).fill('A separate draft');await page.getByRole('button',{name:'All conversations',exact:true}).click();
 await panel(page).getByRole('button',{name:title,exact:true}).click();await expect(page.locator('[data-tag-pill]')).toHaveCount(2);
 await close(page);await page.goto('/chat/?chat='+encodeURIComponent(await page.evaluate(()=>JSON.parse(localStorage.getItem('brokeros-demo-v1')).composerSession.id)));
 await expect(page.getByText('This is a sample reply',{exact:false})).toBeVisible();
 await expect(editor(page)).toBeVisible();
});
test('existing reviewed CRM actions and creation forms still work',async({page})=>{
 await page.goto('/chat/?chat=example-1');await page.getByRole('button',{name:'Add reminder',exact:true}).click();
 await expect(page.getByText('Saved to your workspace',{exact:false})).toBeVisible();
 await page.goto('/contacts/');await page.getByRole('button',{name:'Add contact',exact:true}).click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('button',{name:/save|create/i})).toBeVisible();
 await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.goto('/deals/');await page.getByRole('button',{name:'Value',exact:true}).click();await expect(page.locator('[aria-sort="ascending"]')).toHaveCount(1);
 await noOverflow(page);
});
test('sidebar resize preserves preferred width and fully collapses',async({page},info)=>{
 test.skip(info.project.name==='mobile','Desktop resize handle; mobile uses viewport-fit sheet.');
 await tag(page,'Tag Ready to close: 4 for AI chat');const handle=page.getByRole('separator',{name:'Resize AI sidebar'});
 await handle.focus();await handle.press('ArrowLeft');await expect(handle).toHaveAttribute('aria-valuenow','400');
 const box=await handle.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+120);await page.mouse.down();await page.mouse.move(box.x-80,box.y+120);await page.mouse.up();
 const width=Number(await handle.getAttribute('aria-valuenow'));expect(width).toBeGreaterThan(450);
 await close(page);await expect(page.locator('.value-chat-spacer')).toHaveCount(0);
 await page.reload();await page.getByRole('button',{name:'Expand AI sidebar',exact:true}).click();await expect(handle).toHaveAttribute('aria-valuenow',String(width));
 await page.setViewportSize({width:800,height:850});await expect(handle).toHaveCount(0);await noOverflow(page);
 await page.setViewportSize({width:1440,height:1000});await expect(handle).toHaveAttribute('aria-valuenow',String(width));
});
test('compact layouts keep composer, search, navigation, and cards within viewport',async({page})=>{
 for(const width of [320,390,768]){await page.setViewportSize({width,height:750});await noOverflow(page);}
 await page.setViewportSize({width:320,height:650});
 await tag(page,'Tag Ready to close: 4 for AI chat');await noOverflow(page);
 await expect(page.getByRole('button',{name:'Send message',exact:true})).toBeInViewport();
 await page.screenshot({path:`test-results/compact-chat-${test.info().project.name}.png`});
 await close(page);await page.getByRole('button',{name:'Open navigation',exact:true}).click();
 await page.getByRole('button',{name:'Search workspace',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search entire workspace'}).fill('Park Heights');
 await expect(page.getByRole('button',{name:/Park Heights/}).first()).toBeVisible();await noOverflow(page);
});

test.afterEach(async({page})=>{expect(pageErrors.get(page)).toEqual([]);});

test('keyboard tagging restores focus and every CRM page renders without overflow',async({page})=>{
 const source=page.getByRole('button',{name:'Tag Ready to close: 4 for AI chat',exact:true});
 await source.focus();await source.press('Enter');await expect(editor(page)).toBeFocused();
 await editor(page).press('Escape');await expect(panel(page)).toBeHidden();
 await expect(page.getByRole('button',{name:'Tagged Ready to close: 4. Open AI chat',exact:true})).toBeFocused();
 for(const path of ['/owners/','/tasks/','/campaigns/','/assistant/','/insights/','/settings/']){
  await page.goto(path);await expect(page.locator('h1')).toBeVisible();await noOverflow(page);
 }
});

test('deal status, review text, and sample market figures can be tagged',async({page})=>{
 await page.goto('/deals/');const stage=page.getByRole('button',{name:'Tag Stage: Offer ready for AI chat',exact:true}).first();await stage.locator('..').hover();await stage.click();await expect(editor(page)).toContainText('Offer ready');await close(page);
 await page.goto('/assistant/');const review=page.getByRole('button',{name:/^Tag Title: Nadia/}).first();await review.locator('..').hover();await review.click();await expect(page.locator('[data-tag-pill]')).toHaveCount(2);await close(page);
 await page.goto('/insights/');await tag(page,'Tag Sale midpoint: AED 2.68M for AI chat');await expect(page.locator('[data-tag-pill]')).toHaveCount(3);await noOverflow(page);
});
