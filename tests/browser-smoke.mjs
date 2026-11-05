/** Real Chromium smoke test with production CSP. Playwright is CI-only, not a runtime dependency. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const pw=process.env.PLAYWRIGHT_MODULE;
if(!pw)throw Error('Set PLAYWRIGHT_MODULE to the CI-only playwright/index.mjs');
const {chromium}=await import(pathToFileURL(pw).href);
const remote=process.env.SMOKE_BASE_URL;
const base=remote||'http://127.0.0.1:4287';
const server=remote?null:spawn(process.execPath,['scripts/serve_site.mjs'],{env:{...process.env,PORT:'4287'},stdio:'ignore'});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser;
try{
 for(let i=0;i<30;i++){try{if((await fetch(base)).ok)break;}catch{}await delay(100);}
 const moduleResponse=await fetch(base+'/match-engine.mjs');
 assert.match(moduleResponse.headers.get('content-type')||'',/(java|ecma)script/);
 const catalog=await (await fetch(base+'/data/catalog.json')).json();
 assert.equal(catalog.counts.routes,152);
 assert.equal(catalog.researchChecks.checkedAt,'2026-11-06');
 assert.match(catalog.sourceCommit,/^[0-9a-f]{40}$/);
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];const csp=[];const disallowedRequests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/Content Security Policy|Refused to|Applying inline style/i.test(m.text()))csp.push(m.text());});
 page.on('request',r=>{if(!r.url().startsWith(base)||r.method()!=='GET')disallowedRequests.push({url:r.url(),method:r.method()});});
 // The preview server is intentionally tiny; apply the same headers as production while testing it.
 if(!remote){
  const rule=fs.readFileSync('web/_headers','utf8').split('\n').find(s=>s.trim().startsWith('Content-Security-Policy:')).split('Content-Security-Policy:')[1].trim();
  await page.route(base+'/**',async route=>{
   const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),'content-security-policy':rule,'x-content-type-options':'nosniff'}});
  });
 }
 await page.goto(base+'/#route=global%3Aus-dv-lottery');
 await page.locator('#routeDialog[open]').waitFor();
 assert.match(await page.locator('#routeDialogContent').innerText(),/不再有效/);
 assert.match(await page.locator('#routeDialogContent').innerText(),/核發與報名分開看/);
 await page.locator('#closeDetail').click();
 assert.equal(await page.locator('#statRoutes').innerText(),'152');
 assert.match(await page.locator('#buildVersion').innerText(),/2026-11-06/);
 const storageBeforeMatcher=await page.evaluate(()=>JSON.stringify(Object.entries(localStorage)));
 await page.goto(base+'/match.html');
 await page.locator('[name=age]').fill('27');
 await page.locator('[name=field]').selectOption('software');
 await page.locator('[name=education]').selectOption('bachelor');
 await page.locator('#extraFields summary').click();
 await page.locator('[name=twPassportPersonalId]').selectOption('yes');
 await page.locator('[name=iecUsed]').selectOption('yes');
 await page.locator('#analyzeButton').click();
 await page.locator('.match-card').first().waitFor();
 const meter=await page.locator('.meter').first().evaluate(el=>({value:Number(el.getAttribute('aria-valuenow')),parent:el.getBoundingClientRect().width,fill:el.firstElementChild.getBoundingClientRect().width}));
 assert.ok(meter.value>0);assert.ok(Math.abs(meter.fill/meter.parent-meter.value/100)<.02,'CSP-safe progress meter rendered');
 await page.locator('[data-filter=out_of_range]').click();
 const wh=page.locator('.match-card').filter({has:page.getByRole('heading',{name:'IEC Working Holiday 打工度假',exact:true})});
 assert.equal(await wh.locator('.match-status').innerText(),'目前已知不符');
 await page.locator('[name=ymsUsed]').selectOption('yes');
 const yms=page.locator('.match-card').filter({has:page.getByRole('heading',{name:'Youth Mobility Scheme 青年交流',exact:true})});
 assert.equal(await yms.locator('.match-status').innerText(),'目前已知不符');
 await page.locator('[name=iecChannel]').selectOption('ro');
 await page.locator('[data-filter=all]').click();
 for(let i=0;i<4;i++){if(await page.locator('#showMoreMatches').count())await page.locator('#showMoreMatches').click();}
 assert.equal(await wh.count(),1);assert.notEqual(await wh.locator('.match-status').innerText(),'優先研究');
 await wh.locator('summary').click();assert.match(await wh.innerText(),/RO 額外參與需另審/);
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'mobile horizontal overflow');
 if(process.env.SMOKE_SCREENSHOT)await page.screenshot({path:process.env.SMOKE_SCREENSHOT,fullPage:true});
 await page.getByRole('button',{name:'清除全部條件'}).click();
 await page.locator('#matchResults h2').filter({hasText:'資料已清除'}).waitFor();
 assert.equal(await page.locator('[name=age]').inputValue(),'');
 assert.equal(await page.evaluate(()=>JSON.stringify(Object.entries(localStorage))),storageBeforeMatcher,'matcher changed storage with profile data');
 assert.deepEqual(errors,[]);assert.deepEqual(csp,[]);assert.deepEqual(disallowedRequests,[]);
 console.log(JSON.stringify({result:'PASS',scope:remote?'live':'local-with-production-CSP',checks:['catalog-and-revision','module-MIME','DV-correction-dialog','Taiwan-IEC-used-block','YMS-used-block','RO-not-auto-eligible','CSP-meter','mobile-layout','privacy-reset'],sourceCommit:catalog.sourceCommit}));
}finally{if(browser)await browser.close();if(server)server.kill('SIGTERM');}
