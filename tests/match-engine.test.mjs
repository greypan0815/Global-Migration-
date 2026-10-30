import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matchRoutes,australia189Subtotal,normalizeProfile,MODELS,SOURCE} from '../web/match-engine.mjs';
import {buildCatalog,parseCsv} from '../scripts/build_site.mjs';

const readJson=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const actual=()=>{
 const catalog=buildCatalog({
  programmes:readJson('data/programmes.json'),
  extras:readJson('src/extra_routes.json'),
  global:readJson('src/global.json'),
  profiles:readJson('data/country_profiles.json'),
  taiwan:parseCsv(fs.readFileSync(new URL('../data/taiwan_applicability.csv',import.meta.url),'utf8')),
  policyReviews:readJson('data/policy_reviews.json').routes
 });
 return catalog;
};
const find=(data,id)=>{
 const r=data.items.find(x=>x.id===id);
 assert.ok(r,'missing route '+id);
 return r;
};
test('analyzes curated 24 routes with no fabricated approval probability',()=>{
 const data=matchRoutes(actual(),{});
 assert.equal(data.counts.analyzed,24);
 assert.equal(data.counts.unassessed,126);
 assert.match(data.statement,/不是官方計分/);
 for(const r of data.items){
  assert.ok(r.score>=0&&r.score<=100);
  assert.ok(r.official.startsWith('https://'));
  assert.ok(r.checks.length>0);
  assert.ok(['prioritize','prepare','research','out_of_range'].includes(r.tier));
  assert.ok(['必要條件','認可雇主／薪資','法定 70 分資格制（非排名）'].includes(r.method)||r.method.length>2);
 }
});
test('explicit youth age and Taiwan household hard exclusions are not ranked as eligible',()=>{
 const data=matchRoutes(actual(),{age:36,taiwanHousehold:'no'});
 for(const id of ['tw:iec_wh','tw:yms','tw:working_holiday','tw:wh_417','tw:taiwan_wh'])
  assert.equal(find(data,id).tier,'out_of_range',id);
 const nz=find(data,'tw:taiwan_wh');
 assert.ok(nz.checks.some(c=>c.state==='blocked'&&c.label==='臺灣戶籍'));
});
test('2026 ballot closures remain visible even when a user is age-eligible',()=>{
 const data=matchRoutes(actual(),{age:27,objective:'temporary'});
 for(const id of ['tw:iec_wh','tw:iec_yp','tw:yms','tw:taiwan_wh']){
  const r=find(data,id);
  assert.equal(r.season,true);
  assert.notEqual(r.tier,'prioritize');
 }
});
test('real local job offer and matching salary improve research readiness without declaring visa eligibility',()=>{
 const empty=matchRoutes(actual(),{age:27,education:'bachelor',years:3,field:'software'});
 const has=matchRoutes(actual(),{
  age:27,education:'bachelor',years:3,field:'software',
  offerCountry:'germany',salary:56000,salaryUnit:'year'
 });
 assert.ok(find(has,'eu:germany-eu-blue-card').score>find(empty,'eu:germany-eu-blue-card').score);
 assert.ok(find(has,'eu:germany-eu-blue-card').checks.some(x=>x.label==='薪資門檻'&&x.state==='met'));
 assert.ok(find(has,'eu:germany-eu-blue-card').settlement.includes('Settlement')||find(has,'eu:germany-eu-blue-card').settlement.includes('永居'));
});
test('Dutch HSM age tiers and same-country currencies are respected',()=>{
 const c=actual();
 const young=find(matchRoutes(c,{age:29,offerCountry:'netherlands',salary:4500,salaryUnit:'month'}),'eu:netherlands-highly-skilled-migrant');
 const old=find(matchRoutes(c,{age:30,offerCountry:'netherlands',salary:4500,salaryUnit:'month'}),'eu:netherlands-highly-skilled-migrant');
 assert.ok(young.checks.some(x=>x.label==='薪資門檻'&&x.state==='met'));
 assert.ok(old.checks.some(x=>x.label==='薪資門檻'&&x.state==='missing'));
 const foreign=find(matchRoutes(c,{age:29,offerCountry:'ireland',salary:100000,salaryUnit:'year'}),'eu:netherlands-highly-skilled-migrant');
 assert.ok(foreign.checks.some(x=>x.label==='薪資門檻'&&x.state==='unknown'));
});
test('Australian 189 partial point components follow official age/education/language/experience brackets',()=>{
 const result=australia189Subtotal({age:27,education:'bachelor',years:3,auDegree:'yes',
  auWorkVerified:'yes',auEnglish:'proficient',partner:'single'});
 assert.equal(result.subtotal,70);
 assert.equal(result.complete,false);
 assert.ok(result.omitted.includes('澳洲合格工作年資'));
 const capped=australia189Subtotal({age:27,education:'phd',auDegree:'yes',
  auEnglish:'superior',years:9,auYears:9,auWorkVerified:'yes',partner:'single'});
 const work=capped.items.filter(x=>x.label.includes('年資')).reduce((n,x)=>n+x.points,0);
 assert.equal(work,20,'combined skilled experience cap');
 assert.equal(capped.complete,false);
 assert.equal(capped.threshold,65);
});
test('incomplete or self-reported language never becomes a claimed official 189 score',()=>{
 const result=australia189Subtotal({age:27,education:'bachelor',years:8,english:'c2'});
 assert.equal(result.subtotal,30);
 assert.ok(result.omitted.includes('官方英文測驗'));
 assert.ok(result.omitted.includes('澳洲承認學歷'));
 assert.ok(result.omitted.includes('經認定的海外相關年資'));
});
test('offer/age checks do not assume missing values are eligible',()=>{
 const unknown=matchRoutes(actual(),{});
 assert.equal(normalizeProfile({}).field,'unknown');
 assert.ok(find(unknown,'eu:czechia-digital-nomad-program').checks.some(x=>x.label==='職業類別'&&x.state==='unknown'));
 const w=find(unknown,'tw:wh_417');
 assert.ok(w.checks.some(x=>x.label==='年齡'&&x.state==='unknown'));
 const p=normalizeProfile({age:'not-a-number',years:-3,salary:'',auYears:'bad'});
 assert.equal(p.age,null);
 assert.equal(p.years,null);
 assert.equal(p.salary,null);
 assert.equal(p.auYears,null);
});
test('country model links and privacy behavior are explicit',()=>{
 assert.equal(MODELS.length,24);
 for(const [,name,url] of MODELS){assert.ok(name.length>3);assert.ok(url.startsWith('https://'));}
 assert.ok(SOURCE.crs.includes('canada.ca'));
 assert.ok(SOURCE.au189.includes('homeaffairs.gov.au'));
 const app=fs.readFileSync(new URL('../web/match-app.js',import.meta.url),'utf8');
 assert.ok(!app.includes('localStorage'));
 assert.ok(!app.includes('sessionStorage'));
 assert.ok(app.includes("fetch('/data/catalog.json'"));
 const markup=fs.readFileSync(new URL('../web/match.html',import.meta.url),'utf8');
 assert.ok(markup.includes('id="profileForm"'));
 assert.ok(markup.includes('id="matchResults"'));
});
