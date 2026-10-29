import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCatalog, parseCsv,traditional,COUNTRY_INFO} from '../scripts/build_site.mjs';

test('TW and mainland-oriented records remain distinct',()=>{
  const catalog=buildCatalog({
    programmes:[{
      country_slug:'germany',country:'德国',programme:'德国欧盟蓝卡',
      slug:'germany-eu-blue-card',route_type:'work',status:'open',pr:'可能通向永居',
      threshold:'EUR 50,700 annual',sources:[{title:'Official',url:'https://example.org/guide'}]
    }],
    details:{'germany-eu-blue-card':{summary:'技术工作',facts:[['薪资','EUR 50,700']],
      steps:[['取得雇主 offer','']],fit:['工程师']}},
    extras:{spain:[{id:'spain-nlv',name:'非营利居留',type:'passive',
      summary:'被动收入居留',steps:[['准备文件','']]}]},
    global:[{slug:'canada',name:'加拿大',routes:[{id:'ca-ee',name:'Express Entry',
      type:'work',summary:'快速通道'}]}],
    profiles:{germany:{col:70,rent:20}},
    taiwan:[{country_iso:'CA',route_id:'iec_wh',route_name_zh_tw:'IEC Working Holiday',
      taiwan_passport_eligible:'yes',age_range:'18-35',
      application_status_2026:'check_current_round',
      verified_as_of:'2026-10-30',
      official_url:'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html',
      eligibility_scope:'passport_and_program_conditions',notes:'No guarantee'}]
  });
  assert.equal(catalog.counts.routes,4);
  assert.equal(catalog.counts.countries,3);
  assert.equal(catalog.counts.taiwanChecked,1);
  assert.equal(catalog.routes.find(r=>r.id==='eu:germany-eu-blue-card').verification,'needs_review');
  assert.equal(catalog.routes.find(r=>r.id==='tw:iec_wh').verification,'official_checked');
  assert.equal(catalog.routes.find(r=>r.id==='eu:germany-eu-blue-card').prKind,'upstream_possible');
  assert.equal(catalog.routes.find(r=>r.id==='eu:germany-eu-blue-card').sources[0].url,'https://example.org/guide');
  assert.equal(catalog.routes.find(r=>r.id==='tw:iec_wh').country,'加拿大');
  assert.equal(catalog.routes.find(r=>r.id==='eu:germany-eu-blue-card').name,'德國歐盟藍卡');
});
test('the Taiwan CSV parser handles commas in quoted fields',()=>{
  const result=parseCsv('route_id,notes\r\nfoo,"a,b"\r\nbar,"quoted ""content"""\r\n');
  assert.deepEqual(result,[{route_id:'foo',notes:'a,b'},{route_id:'bar',notes:'quoted "content"'}]);
});
test('malformed CSV rows and unknown Taiwan country are rejected',()=>{
  assert.throws(()=>parseCsv('a,b\nx\n'),/Invalid CSV width/);
  assert.throws(()=>buildCatalog({
    programmes:[{country_slug:'germany',programme:'Test',slug:'t',route_type:'work'}],
    taiwan:[{country_iso:'XX',route_id:'iec_wh',taiwan_passport_eligible:'yes'}]
  }),/Unknown Taiwan country ISO/);
});
test('every expected country is mapped and the UI groups 36 European countries',()=>{
  const keys=Object.keys(COUNTRY_INFO);
  assert.equal(keys.length,49);
  assert.deepEqual(keys.slice(0,36).length,36);
  assert.equal(COUNTRY_INFO['united-kingdom'][1],'英國');
  assert.equal(COUNTRY_INFO['new-zealand'][1],'紐西蘭');
});
test('unsupported URLs are not published as source links',()=>{
  const catalog=buildCatalog({
    programmes:[{country_slug:'germany',programme:'签证',slug:'test',route_type:'work',
      sources:[{title:'Bad',url:'javascript:alert(1)'},{title:'Good',url:'https://example.org'}]}]
  });
  assert.equal(catalog.routes[0].sources.length,1);
  assert.equal(traditional('技术签证'),'技術簽證');
});


function sourceData(path){
  return fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
}
test('actual 150-route catalogue has exactly 22 reviewed records and 10 Taiwan nationality confirmations',()=>{
  const policy=JSON.parse(sourceData('data/policy_reviews.json'));
  const c=buildCatalog({
    programmes:JSON.parse(sourceData('data/programmes.json')),
    extras:JSON.parse(sourceData('src/extra_routes.json')),
    global:JSON.parse(sourceData('src/global.json')),
    profiles:JSON.parse(sourceData('data/country_profiles.json')),
    taiwan:parseCsv(sourceData('data/taiwan_applicability.csv')),
    policyReviews:policy.routes
  });
  assert.equal(c.schemaVersion,2);
  assert.equal(c.counts.countries,49);
  assert.equal(c.counts.routes,150);
  assert.equal(c.counts.officialFieldReviews,22);
  assert.equal(c.counts.nonAudited,128);
  assert.equal(c.counts.taiwanChecked,10);
  const get=id=>{const r=c.routes.find(x=>x.id===id);assert.ok(r,'missing '+id);return r;};
  assert.equal(get('eu:czechia-digital-nomad-program').verification,'official_checked');
  assert.match(get('eu:czechia-digital-nomad-program').summary,/台灣/);
  assert.equal(get('global:us-eb1a-niw').audit.passport.state,'chargeability_matters');
  assert.match(get('global:us-eb1a-niw').summary,/出生地/);
  assert.equal(get('global:nz-smc').facts.find(x=>x[0]==='共通要求')?.[1].includes('55'),true);
  assert.equal(get('eu:ireland-critical-skills-employment-permit').audit.settlement.state,'status_upgrade_not_pr');
  assert.equal(get('eu:netherlands-highly-skilled-migrant').threshold.includes('€4,357'),true);
  for(const id of ['tw:iec_wh','tw:iec_yp','tw:iec_coop']){
    assert.equal(get(id).status,'closed_window');
    assert.equal(get(id).audit.window.state,'season_closed');
    assert.match(get(id).summary,/已關閉/);
  }
  const legacy=get('eu:albania-digital-mobile-worker-unique-permit');
  assert.equal(legacy.verification,'needs_review');
  assert.equal(legacy.audit,null);
  assert.notEqual(legacy.sourceGrade,'reviewed_specific_fields');
  for(const record of c.routes.filter(r=>r.audit)){
    assert.ok(record.audit.reviewedFields.length,'empty review scope: '+record.id);
    assert.equal(record.sourceGrade,'reviewed_specific_fields');
    assert.ok(record.sources.length>0,'missing reviewed source: '+record.id);
    assert.ok(record.sources.every(s=>new URL(s.url).protocol==='https:'));
    assert.ok(record.audit.checkedAt.match(/^\d{4}-\d\d-\d\d$/));
  }
});

test('review overrides legacy unverified facts without claiming all routes were checked',()=>{
  const sample={country_slug:'germany',country:'德国',programme:'德国欧盟蓝卡',
    slug:'germany-eu-blue-card',route_type:'work',pr:'可能通向永居',
    sources:[{title:'blog',url:'https://example.org'}]};
  const recordId='eu:germany-eu-blue-card';
  const review={checkedAt:'2026-10-30',reviewedFields:['salary'],
    passport:{state:'third_country_route',detail:'依第三國規則審查'},
    window:{state:'no_fixed_season',detail:'依官方辦理'},
    work:{state:'employer_specific',detail:'需合格雇主'},
    settlement:{state:'conditional_settlement',detail:'另行提出申請'},
    summary:'官方摘要',
    threshold:'€50,700',
    facts:[['核對數字','€50,700']],
    sources:[{title:'政府',url:'https://example.gov/bluecard'}]};
  const c=buildCatalog({programmes:[sample],details:{'germany-eu-blue-card':{facts:[['過時數字','€1']]}},
    policyReviews:{[recordId]:review}});
  const x=c.routes[0];
  assert.equal(x.facts.length,1);
  assert.equal(x.facts[0][1],'€50,700');
  assert.equal(x.sources.length,1);
  assert.equal(x.sources[0].url,'https://example.gov/bluecard');
  assert.equal(x.verification,'needs_review');
  assert.equal(x.audit.checkedAt,'2026-10-30');
  assert.throws(()=>buildCatalog({programmes:[sample],policyReviews:{'eu:missing':review}}),/missing route/);
});
