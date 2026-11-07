import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {countryEligibilityChecks,normalizeCountryFields} from '../web/country-eligibility.mjs';
import {applicationState,applicationLabel,applicationFilterOptions,applicationUnavailable} from '../web/route-status.mjs';
import {matchRoutes} from '../web/match-engine.mjs';
import {buildCatalog,parseCsv} from '../scripts/build_site.mjs';
const DATE='2026-11-07';
const DE='eu:germany-eu-blue-card',IE='eu:ireland-critical-skills-employment-permit',NZ='global:nz-smc';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const catalog=buildCatalog({programmes:json('data/programmes.json'),extras:json('src/extra_routes.json'),global:json('src/global.json'),taiwan:parseCsv(read('data/taiwan_applicability.csv')),policyReviews:json('data/policy_reviews.json').routes});
const checks=(id,p,date=DATE)=>countryEligibilityChecks(id,p,date);
const by=(a,id)=>{const c=a.find(x=>x.id===id);assert.ok(c,'missing check '+id);return c;};
const analysis=(id,p)=>matchRoutes(catalog,p).items.find(x=>x.id===id);
const DE_IT={offerCountry:'germany',offerMonths:6,salary:48000,salaryUnit:'year',dePath:'it',deItYears7:4,deItAcademic:'yes',deItJob:'yes',deBA:'yes',deLicence:'not_required'};
const IE_LIST={offerCountry:'ireland',offerMonths:24,iePath:'listed',ieCriticalList:'yes',ieRelatedDegree:'yes',ieEmployer:'yes',ieRemuneration:'yes',salary:45000,salaryUnit:'year'};
const NZ_COMMON={offerCountry:'new-zealand',nzAccredited:'yes',nzEnglish:'yes',nzOccupationCode:'261313',nzOccupationChecked:'yes',nzSkill:'1',nzHours:40,nzContract:'permanent',nzHourlyPay:40,nzWageBase:35,nzWageDate:'2026-03-09',nzWageConfirmed:'yes',nzExperiencePay:'yes',nzExperienceEvidence:'yes',nzSeparatePeriods:'yes'};
test('German IT exception does not require a degree or the 50700 general salary floor',()=>{
 const c=checks(DE,{...DE_IT,education:'highschool'});
 assert.equal(by(c,'salary').state,'met');
 assert.ok(!c.some(x=>x.id==='deQualification'));
 assert.equal(by(c,'deItYears7').state,'met');
 assert.ok(c.every(x=>!x.required||x.state==='met'));
});
test('German IT requires three years within seven, academic-level relevance and six-month offer',()=>{
 assert.equal(by(checks(DE,{...DE_IT,deItYears7:2.5}),'deItYears7').state,'missing');
 assert.equal(by(checks(DE,{...DE_IT,deItAcademic:'unknown'}),'deItAcademic').state,'unknown');
 assert.equal(by(checks(DE,{...DE_IT,offerMonths:5}),'contract-duration').hard,true);
 assert.equal(by(checks(DE,{...DE_IT,offerMonths:''}),'contract-duration').state,'unknown');
});
test('German salary and BA threshold boundaries are branch-specific',()=>{
 assert.equal(by(checks(DE,{...DE_IT,salary:45934.2}),'salary').state,'met');
 assert.equal(by(checks(DE,{...DE_IT,salary:45934.19}),'salary').state,'missing');
 assert.equal(by(checks(DE,{...DE_IT,dePath:'standard',salary:48000}),'salary').state,'missing');
 assert.equal(by(checks(DE,{...DE_IT,dePath:'standard',salary:50700}),'salary').state,'met');
 assert.equal(by(checks(DE,{...DE_IT,deBA:'unknown'}),'deBA').state,'unknown');
});
test('unknown German branch and next-year rates cannot silently pass',()=>{
 assert.equal(by(checks(DE,{offerCountry:'germany',offerMonths:12,salary:80000}),'de-path').state,'unknown');
 assert.equal(by(checks(DE,DE_IT,'2027-01-01'),'policy-year').state,'unknown');
 assert.equal(by(checks(DE,{...DE_IT,offerCountry:'ireland'}),'salary').state,'unknown');
});
test('Irish offer below two years is excluded from CSEP regardless of high salary',()=>{
 const c=checks(IE,{...IE_LIST,offerMonths:12,salary:100000});
 assert.equal(by(c,'contract-duration').hard,true);
 assert.equal(analysis(IE,{...IE_LIST,age:27,offerMonths:12}).tier,'out_of_range');
});
test('Irish blank term or irrelevant degree cannot become prioritize just by checking generic academic level',()=>{
 for(const extra of [{offerMonths:''},{ieRelatedDegree:'unknown'},{ieCriticalList:'unknown'}]){
  const r=analysis(IE,{age:27,education:'bachelor',field:'software',...IE_LIST,...extra});
  assert.notEqual(r.tier,'prioritize');assert.ok(r.unresolvedRequired>0);
 }
 assert.equal(by(checks(IE,{...IE_LIST,ieRelatedDegree:'no'}),'ieRelatedDegree').state,'missing');
});
test('Irish high-salary route uses necessary experience instead of forcing a degree',()=>{
 const c=checks(IE,{...IE_LIST,iePath:'high_salary',education:'highschool',ieNotIneligible:'yes',ieRelevantSkills:'yes',salary:70000});
 assert.ok(!c.some(x=>x.id==='ieRelatedDegree'));
 assert.equal(by(c,'salary').state,'met');
 assert.equal(by(c,'ieRelevantSkills').state,'met');
 assert.equal(by(checks(IE,{...IE_LIST,iePath:'high_salary',salary:68911}),'salary').state,'unknown');
});
test('conflicting Irish official salary boundaries are unknown, not selected opportunistically',()=>{
 assert.equal(by(checks(IE,{...IE_LIST,salary:40905}),'salary').state,'unknown');
 assert.equal(by(checks(IE,{...IE_LIST,salary:40909}),'salary').state,'met');
 assert.equal(by(checks(IE,{...IE_LIST,iePath:'graduate',ieGraduate12:'yes',salary:36848}),'salary').state,'unknown');
 assert.equal(by(checks(IE,{...IE_LIST,iePath:'graduate',ieGraduate12:'yes',salary:36849}),'salary').state,'met');
 assert.equal(by(checks(IE,{...IE_LIST,iePath:'graduate',ieGraduate12:'unknown'}),'ieGraduate12').state,'unknown');
});
test('SMC Red list excludes only selected work-experience pathway, not all SMC',()=>{
 const red=analysis(NZ,{age:27,...NZ_COMMON,nzPath:'experience',nzList:'red'});
 assert.ok(red.checks.some(c=>c.id==='nz-red'&&c.state==='missing'));
 assert.notEqual(red.tier,'out_of_range');
 const points=checks(NZ,{...NZ_COMMON,nzPath:'points',nzList:'red',nzPointsBasis:'qualification',nzPointsConfirmed:'yes',nzPointsWorkUsed:'no'});
 assert.ok(!points.some(c=>c.id==='nz-red'));
 assert.equal(by(points,'nzPointsConfirmed').state,'met');
});
test('SMC ordinary experience requires disjoint 3+2 periods and 1.1 wage',()=>{
 const p={...NZ_COMMON,nzPath:'experience',nzList:'none',nzRelevantYears10:3,nzSkilledYears4:2};
 const c=checks(NZ,p);assert.equal(by(c,'nz-wage').state,'met');
 assert.equal(by(c,'nzRelevantYears10').state,'met');assert.equal(by(c,'nzSkilledYears4').state,'met');
 assert.equal(by(checks(NZ,{...p,nzSkilledYears4:1.5}),'nzSkilledYears4').state,'missing');
 assert.equal(by(checks(NZ,{...p,nzSeparatePeriods:'unknown'}),'nzSeparatePeriods').state,'unknown');
 assert.equal(by(checks(NZ,{...p,nzHourlyPay:38.49}),'nz-wage').state,'missing');
});
test('SMC Amber requires NZ-only relevant years plus extra NZ skilled years and 1.2 wage',()=>{
 const p={...NZ_COMMON,nzPath:'experience',nzList:'amber',nzRelevantYears10:8,nzSkilledYears4:2};
 assert.equal(by(checks(NZ,p),'nzRelevantNZYears10').state,'unknown');
 assert.equal(by(checks(NZ,{...p,nzRelevantNZYears10:3}),'nz-wage').state,'missing');
 const c=checks(NZ,{...p,nzRelevantNZYears10:3,nzHourlyPay:42});
 assert.equal(by(c,'nz-wage').state,'met');
 assert.equal(by(c,'nzRelevantNZYears10').state,'met');
});
test('SMC trades need listed occupation, relevant qualification and post-qualification 2.5+1.5 years',()=>{
 const p={...NZ_COMMON,nzPath:'trades',nzTradesListed:'yes',nzQualification4:'yes',nzPostQualYears10:2.5,nzPostQualNZYears3:1.5,nzHourlyPay:35,nzList:'red'};
 const c=checks(NZ,p);assert.equal(by(c,'nz-wage').state,'met');
 assert.equal(by(c,'nzPostQualNZYears3').state,'met');assert.ok(!c.some(x=>x.id==='nz-red'));
 assert.equal(by(checks(NZ,{...p,nzQualification4:'unknown'}),'nzQualification4').state,'unknown');
 assert.equal(by(checks(NZ,{...p,nzPostQualNZYears3:1}),'nzPostQualNZYears3').state,'missing');
});
test('SMC wage is date/evidence-specific and uses table amounts instead of rounding errors',()=>{
 const p={...NZ_COMMON,nzPath:'experience',nzList:'none',nzRelevantYears10:3,nzSkilledYears4:2};
 assert.equal(by(checks(NZ,{...p,nzWageConfirmed:'unknown'}),'nz-wage').state,'unknown');
 assert.equal(by(checks(NZ,{...p,nzWageBase:33.56,nzWageDate:'2026-03-09'}),'nz-wage').state,'unknown');
 assert.equal(by(checks(NZ,{...p,nzWageBase:33.56,nzWageDate:'2025-08-18',nzHourlyPay:36.91}),'nz-wage').state,'met');
 assert.equal(by(checks(NZ,{...p,nzWageBase:33.56,nzWageDate:'2025-08-18',nzHourlyPay:36.90}),'nz-wage').state,'missing');
});
test('SMC points do not combine all bases or claim 6 from only 3-point income',()=>{
 const p={...NZ_COMMON,nzPath:'points',nzPointsBasis:'income',nzIncomeMultiple:'1.5',nzPointsConfirmed:'yes',nzPointsWorkUsed:'no',nzHourlyPay:52.50};
 assert.equal(by(checks(NZ,p),'nz-income-six').state,'missing');
 assert.equal(by(checks(NZ,{...p,nzHourlyPay:40}),'nz-wage').state,'missing');
 const six=checks(NZ,{...p,nzIncomeMultiple:'3',nzHourlyPay:105});
 assert.equal(by(six,'nz-wage').state,'met');assert.ok(!six.some(x=>x.id==='nz-income-six'));
});
test('normalizer rejects blanks, non-numbers, excessive experience, invalid occupational codes',()=>{
 const p=normalizeCountryFields({deItYears7:8,offerMonths:' ',nzWageBase:NaN,nzOccupationCode:'<b>123',nzSkill:'admin',nzPostQualNZYears3:7});
 assert.equal(p.deItYears7,null);assert.equal(p.offerMonths,null);assert.equal(p.nzWageBase,null);
 assert.equal(p.nzOccupationCode,'');assert.equal(p.nzSkill,'unknown');assert.equal(p.nzPostQualNZYears3,null);
});
test('date-stamped evidence remains scoped and route count does not inflate',()=>{
 assert.equal(catalog.counts.routes,152);assert.equal(catalog.counts.officialFieldReviews,26);
 for(const id of [DE,IE,NZ]){const r=catalog.routes.find(x=>x.id===id);assert.equal(r.audit.lastRecheckedAt,DATE);assert.equal(r.audit.checkedAt,'2026-10-30');}
 assert.equal(catalog.routes.find(x=>x.id==='tw:iec_wh').audit.lastRecheckedAt,'2026-11-06');
 assert.equal(catalog.routes.find(x=>x.id===IE).audit.evidenceConflicts.length,1);
});
test('application status is identical in filter vocabulary, cards and build output',()=>{
 for(const r of catalog.routes){assert.equal(r.applicationStatus.state,applicationState(r));assert.equal(r.applicationStatus.label,applicationLabel(r));}
 const find=id=>catalog.routes.find(x=>x.id===id);
 assert.equal(applicationState(find('global:us-dv-lottery')),'registration_not_open');
 assert.equal(applicationState(find('global:ca-ee')),'invitation_based');
 assert.equal(applicationState(find('extra:uk-hpi')),'quota_and_check');
 assert.equal(applicationState(find(DE)),'no_fixed_season');
 assert.equal(applicationState({status:'upstream_open'}),'legacy_open');
 assert.equal(applicationState({status:'upstream_open',audit:{window:{state:'unknown_new_state'}}}),'unknown');
 assert.ok(applicationUnavailable(find('tw:yms')));
 const options=applicationFilterOptions(catalog.routes);
 assert.equal(options.reduce((n,x)=>n+x.count,0),152);
 assert.ok(options.some(x=>x.value==='registration_not_open'));
 assert.ok(options.some(x=>x.value==='invitation_based'));
});
