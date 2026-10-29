import test from 'node:test';
import assert from 'node:assert/strict';
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
