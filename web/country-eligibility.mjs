/** Selected official requirements checked 2026-11-07. Research checklist, never a legal decision.
 * Branch-specific exclusions are not exclusions from every immigration route.
 * All values remain browser-local; unconfirmed evidence is never treated as satisfied.
 */
export const ELIGIBILITY_DATE='2026-11-07';
export const COUNTRY_DEFAULTS={
 offerMonths:'',offerPermanent:'unknown',
 dePath:'unknown',deQualification:'unknown',deJobMatches:'unknown',deShortage:'unknown',deGraduate3:'unknown',deItYears7:'',deItAcademic:'unknown',deItJob:'unknown',deBA:'unknown',deLicence:'unknown',
 iePath:'unknown',ieCriticalList:'unknown',ieRelatedDegree:'unknown',ieGraduate12:'unknown',ieNotIneligible:'unknown',ieRelevantSkills:'unknown',ieEmployer:'unknown',ieRemuneration:'unknown',
 nzPath:'unknown',nzOccupationCode:'',nzOccupationChecked:'unknown',nzSkill:'unknown',nzList:'unknown',nzAccredited:'unknown',nzHours:'',nzContract:'unknown',nzServiceHistory:'unknown',nzEnglish:'unknown',
 nzHourlyPay:'',nzWageBase:'',nzWageDate:'',nzWageConfirmed:'unknown',nzExperiencePay:'unknown',nzExperienceEvidence:'unknown',nzSeparatePeriods:'unknown',
 nzRelevantYears10:'',nzRelevantNZYears10:'',nzSkilledYears4:'',nzTradesListed:'unknown',nzQualification4:'unknown',nzPostQualYears10:'',nzPostQualNZYears3:'',nzPointsBasis:'unknown',nzPointsConfirmed:'unknown',nzIncomeMultiple:'unknown',nzPointsWorkUsed:'unknown'
};
const numerics={offerMonths:1200,deItYears7:7,nzHours:168,nzHourlyPay:10000,nzWageBase:1000,nzRelevantYears10:10,nzRelevantNZYears10:10,nzSkilledYears4:4,nzPostQualYears10:10,nzPostQualNZYears3:3};
const choices={
 dePath:['standard','shortage','graduate','it'],iePath:['listed','graduate','high_salary','special'],
 nzPath:['points','experience','trades'],nzSkill:['1','2','3','4','5'],nzList:['none','amber','red'],
 nzContract:['permanent','fixed','services'],nzIncomeMultiple:['1.5','2','3'],nzPointsBasis:['qualification','income','registration'],deLicence:['not_required','yes','no']
};
const numeric=v=>v===null||v===undefined||typeof v==='boolean'||String(v).trim()===''?null:Number.isFinite(Number(v))?Number(v):null;
export function normalizeCountryFields(raw={}){
 const p={...COUNTRY_DEFAULTS};
 for(const k of Object.keys(p)){
  const v=raw[k];
  if(k in numerics){const n=numeric(v);p[k]=n!==null&&n>=0&&n<=numerics[k]?n:null;}
  else if(k==='nzOccupationCode')p[k]=/^\d{6}$/.test(String(v??''))?String(v):'';
  else if(k==='nzWageDate')p[k]=/^\d{4}-\d{2}-\d{2}$/.test(String(v??''))&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===String(v)?String(v):'';
  else p[k]=(choices[k]||['yes','no']).includes(v)?v:'unknown';
 }
 return p;
}
const check=(id,label,state,reason,{hard=false,required=true,weight=2}={})=>({id,label,state,reason,hard,required,weight});
const unknown=(id,label,reason)=>check(id,label,'unknown',reason);
const declared=(p,key,label,reason)=>check(key,label,p[key]==='yes'?'met':p[key]==='no'?'missing':'unknown',p[key]==='yes'?'你已聲明具備文件或已核對此條件；仍須政府個案審查。 '+reason:reason);
function minYears(p,key,label,min,reason){return check(key,label,p[key]===null?'unknown':p[key]>=min?'met':'missing',`須至少 ${min} 年。${reason}`);}
function contract(p,country,months){
 if(p.offerCountry!==country)return unknown('contract-duration','聘僱期限','尚無此目的國 offer，不能用另一國合約或薪資代入。');
 if(p.offerPermanent==='yes')return check('contract-duration','聘僱期限','met',`聲明是符合至少 ${months} 個月要求的無固定期限 offer；須核對正式聘僱條款。`);
 if(p.offerMonths===null)return unknown('contract-duration','聘僱期限',`需至少 ${months} 個月；請填正式 offer 期限或確認無固定期限。`);
 return check('contract-duration','聘僱期限',p.offerMonths>=months?'met':'blocked',`本次 offer ${p.offerMonths} 個月；此路線需至少 ${months} 個月。短於此門檻需改找符合要求的 offer 或其他簽證。`,{hard:p.offerMonths<months});
}
function annualPay(p,country){return p.offerCountry===country&&typeof p.salary==='number'&&Number.isFinite(p.salary)?(p.salaryUnit==='month'?p.salary*12:p.salary):null;}
function yearCheck(asOf){return String(asOf).startsWith('2026-')?null:unknown('policy-year','年度門檻需重核','這份門檻僅核對2026年度，跨年不能自動沿用；請先查主管機關。');}
function salaryCheck(p,country,min,max=min,strict=false,asOf){
 const current=yearCheck(asOf);if(current)return current;
 const v=annualPay(p,country);
 if(v===null)return unknown('salary','薪資門檻','尚無該國 offer 的當地幣別稅前薪資；未換算台幣，也不代入其他國家的 offer。');
 if(v<min)return check('salary','薪資門檻','missing',`已填年薪 ${v.toLocaleString()}，低於所選分支門檻 ${min.toLocaleString()}；特殊例外或另一條路線仍需另查。`);
 if((strict&&v===max)||v<max)return unknown('salary','薪資門檻','金額位於官方頁面措辭／數字差異的邊界；不可自行判為已達標，須向主管機關確認。');
 return check('salary','薪資門檻','met',`已填年薪 ${v.toLocaleString()}，數值達本次2026所選分支比較門檻；薪酬組成及其他法定條件仍需審查。`);
}
function german(p,asOf){
 const a=[contract(p,'germany',6)];
 if(p.dePath==='unknown')return [...a,unknown('de-path','藍卡適用分支','選擇一般、緊缺職業、近三年畢業或IT經驗途徑；不能把所有人都套到學士＋€50,700。')];
 if(p.dePath==='it'){
  a.push(declared(p,'deItJob','德國 IT 專業聘用','必須是合格IT專業人士／經理職務，而不是只憑自填軟體工程職稱。'),minYears(p,'deItYears7','最近七年合格 IT 經驗',3,'須在最近七年內至少三年，不使用一般總年資推定。'),declared(p,'deItAcademic','IT 經驗的層級與職務需要','經驗需達大學層級且為德國工作所需；此分支不要求正式大學學位。'));
 }else{
  a.push(declared(p,'deQualification','認可學歷／第三級資格','德國學位、可比對外國學位或符合官方要求的至少三年第三級Level 6資格；不單看最高學歷名稱。'),declared(p,'deJobMatches','工作與資格相關','正式職務必須與資格相符。'));
  if(p.dePath==='shortage')a.push(declared(p,'deShortage','緊缺職業清單','須確認實際職業在官方緊缺清單，不能由software／STEM分類自動推定。'));
  if(p.dePath==='graduate')a.push(declared(p,'deGraduate3','近三年畢業資格','需符合取得最近學位／同等資格不足三年的規定，非單以年齡判斷。'));
 }
 if(p.dePath!=='standard')a.push(declared(p,'deBA','聯邦就業局 BA 同意','較低門檻途徑須BA同意；尚待程序處理不等於已獲核准，也不代表永遠不能申請。'));
 a.push(check('deLicence','職業執照要求',p.deLicence==='yes'||p.deLicence==='not_required'?'met':p.deLicence==='no'?'missing':'unknown','受規管職業需要符合執業許可規定；非受規管也需先確認。'));
 a.push(salaryCheck(p,'germany',p.dePath==='standard'?50700:45934.20,undefined,false,asOf));
 return a;
}
function ireland(p,asOf){
 const a=[contract(p,'ireland',24),declared(p,'ieEmployer','愛爾蘭合格雇主','需真實在愛爾蘭經營及註冊雇主、符合EEA僱員比例或法定豁免，不能只憑有offer認定。'),declared(p,'ieRemuneration','薪酬組成','依官方合格基本薪資及可計算項目，不能把任意獎金全部加進最低報酬。')];
 if(p.iePath==='unknown')return [...a,unknown('ie-path','Critical Skills 分支','需選職業清單、近12個月取得資格、高薪一般職類或特殊例外；不同分支要求不同。')];
 if(p.iePath==='special')return [...a,unknown('ie-special','公共薪資／醫護等特殊條件','這些例外須依官方規則另行評估；本站不套用一般學位和薪資公式。')];
 if(p.iePath==='high_salary'){
  a.push(declared(p,'ieNotIneligible','高薪職類不在排除清單','須不在Ineligible List且不違反公共利益；高薪不是所有職務自動適用。'),declared(p,'ieRelevantSkills','職務所需學歷或經驗','無大學學位者仍須具備必要經驗；有學位也要符合職務要求。'),salaryCheck(p,'ireland',68911,68911,true,asOf));
 }else{
  a.push(declared(p,'ieCriticalList','Critical Skills 職業清單','核對實際職務及官方職業碼，不能用廣泛的「軟體」分類代替。'),declared(p,'ieRelatedDegree','與職務相關的學位','清單較低薪資途徑需要相關學位或以上；只填任何學士不等於符合。'));
  if(p.iePath==='graduate')a.push(declared(p,'ieGraduate12','申請前12個月取得資格','須核對資格取得日與實際申請日，不依年齡或大學排名推定。'));
  a.push(salaryCheck(p,'ireland',p.iePath==='graduate'?36848:40904,p.iePath==='graduate'?36849:40909,false,asOf));
 }
 a.push(check('ie-source-difference','官方數字有細微差異','unknown','CSEP專頁列€40,904／€36,848；年度報酬表列€40,909／€36,849。網站保留差異，落在差額區間不判符合，正式金額請主管機關確認。',{required:false,weight:0}));
 return a;
}
function nzWage(p,multiplier,asOf){
 if(p.offerCountry!=='new-zealand')return unknown('nz-wage','紐西蘭適用薪資','先有紐西蘭工作／offer，再使用紐幣時薪比較。');
 if(p.nzWageConfirmed!=='yes'||p.nzWageBase===null||p.nzWageBase<=0||!p.nzWageDate||p.nzWageDate>asOf)
  return unknown('nz-wage','紐西蘭適用薪資','需依INZ確認適用的SMC基準、起算日期／工簽日期與規則；不能把今日薪資門檻套到所有歷史經驗。');
 if(p.nzHourlyPay===null)return unknown('nz-wage','紐西蘭適用薪資','請填紐幣稅前時薪；年薪須按合約最大工時換算，本站不猜工時。');
 const bands=[
 ['2026-03-09',35,38.50,42,52.50,70,105],['2025-08-18',33.56,36.91,40.27,50.34,67.12,100.68],
 ['2024-02-28',31.61,34.77,37.93,47.41,63.22,94.83],['2023-02-27',29.66,32.62,35.59,44.49,59.32,88.98],
 ['2022-10-24',27.76,30.53,33.31,41.64,55.52,83.28],['2021-07-19',27,29.70,32.40,40.50,54,81],
 ['2020-02-24',25.5,28.05,30.60,38.25,51,76.50]];
 const band=bands.find(x=>p.nzWageDate>=x[0]);
 if(!band||band[1]!==p.nzWageBase||!String(asOf).startsWith('2026-'))return unknown('nz-wage','紐西蘭適用薪資','所填基準與日期不符合本次已核對INZ表，或已跨年度；不可使用未驗證的基準。');
 const threshold=band[{1:1,1.1:2,1.2:3,1.5:4,2:5,3:6}[multiplier]];
 if(!Number.isFinite(threshold))return unknown('nz-wage','紐西蘭適用薪資','尚未核對適用乘數。');
 return check('nz-wage','紐西蘭適用薪資',p.nzHourlyPay+1e-8>=threshold?'met':'missing',`依你已聲明核對的基準 NZD ${p.nzWageBase}（日期${p.nzWageDate}），所選分支需 ${multiplier} 倍＝NZD ${threshold}/小時；適用日期仍須INZ審核。`);
}
function nzCommon(p){
 const a=[declared(p,'nzAccredited','紐西蘭認可雇主','需在INZ合格accredited employer的具體工作／offer；其他國家的擔保資格不能代入。'),declared(p,'nzEnglish','SMC 接受的英文證明或豁免','自評英文不等於法定語言證明，需使用當期可接受測驗或合法替代證明。')];
 a.push(check('nz-code','已核對實際 ANZSCO 職業',p.nzOccupationChecked==='yes'&&/^\d{6}$/.test(p.nzOccupationCode)?'met':'unknown','需核對六位ANZSCO代碼、職責、skill level及適用清單；網站不單憑填入代碼推定分類。'));
 a.push(check('nz-hours','每週合格工作時數',p.nzHours===null?'unknown':p.nzHours>=30?'met':'missing','一般需至少每週30小時，不能用兼職或合約外加班推定。'));
 if(p.offerCountry!=='new-zealand')a.push(unknown('nz-contract','紐西蘭工作期限','不能用其他國家的聘僱期限判斷紐西蘭資格。'));
 else if(p.nzContract==='permanent')a.push(check('nz-contract','紐西蘭工作期限','met','已聲明無固定期限的合格工作；仍須核對正式文件。'));
 else if(p.nzContract==='fixed')a.push(contract(p,'new-zealand',12));
 else if(p.nzContract==='services')a.push(contract(p,'new-zealand',6),declared(p,'nzServiceHistory','服務合約的額外歷史','除連續至少六個月合約外，需核對合約工作歷史及至少12個月紐西蘭合格工作等額外條件。'));
 else a.push(unknown('nz-contract','紐西蘭工作期限','需確認永久、至少12個月定期聘僱，或符合額外條件的至少六個月服務合約。'));
 return a;
}
function nzExperienceEvidence(p){return [declared(p,'nzExperienceEvidence','年資證據與期限','年資需直接相關、合格職類並符合法定時間窗；新兩路徑不計自雇。'),declared(p,'nzSeparatePeriods','分段年資不得重複','前段相關經驗與後段紐西蘭skilled experience需分開計算，不重複使用同一段期間。'),declared(p,'nzExperiencePay','歷史工作期間的薪資證據','不只目前時薪達標；需證明所主張紐西蘭經驗在各適用日期達該分支薪資及合法條件。')];}
function newZealand(p,asOf){
 const a=nzCommon(p);
 if(p.nzPath==='unknown')return [...a,unknown('nz-path','SMC 所選子途徑','請分開選積分、技術工作經驗或技工／技術人員；不以學歷或總年資直接推定符合。')];
 if(p.nzPath==='points'){
  a.push(check('nz-points-basis','單一基本積分類別',p.nzPointsBasis==='unknown'?'unknown':'met','學歷、收入、職業註冊擇一基本類別，再加符合法規的紐西蘭工作積分；不能把三種基本分相加。'),declared(p,'nzPointsConfirmed','已逐項確認六分及證據','請按2026-08-24後SR3.25官方表與適用年資規則確認；本站不根據最高學歷自行算完整SMC分。'));
  if(p.nzSkill==='unknown')a.push(unknown('nz-skill','積分路徑職位技能等級','Skill level 1–3與4–5的基本時薪條件不同，需先核對。'));
  else if(p.nzPointsBasis==='income'&&p.nzIncomeMultiple==='unknown')a.push(unknown('nz-income','收入積分乘數','收入基本積分另需1.5／2／3倍對應條件，不能只達一般工作時薪就申報收入分。'));
  else a.push(nzWage(p,Math.max(['4','5'].includes(p.nzSkill)?1.5:1,p.nzPointsBasis==='income'?Number(p.nzIncomeMultiple):1),asOf));
  if(p.nzPointsBasis==='income'&&['1.5','2'].includes(p.nzIncomeMultiple)&&p.nzPointsWorkUsed==='no')a.push(check('nz-income-six','收入基本分不足六分','missing','1.5倍或2倍收入基本分不能單獨達六分；需符合法定NZ經驗補分或改選其他合格基本類別。'));
  if(p.nzPointsWorkUsed==='unknown')a.push(unknown('nz-points-work','是否使用紐西蘭年資補足六分','須確認是否用到合格紐西蘭工作積分；歷史薪資與年資窗口另需符合。'));
  else if(p.nzPointsWorkUsed==='yes')a.push(declared(p,'nzExperienceEvidence','積分年資證據','需依現行SR3.25核對1／1.5／2年等相應積分及追溯時窗。'),declared(p,'nzExperiencePay','歷史工作薪資證據','使用收入基本分時，相關歷史工作也須符合相應收入乘數。'));
  a.push(check('nz-points-list','Red／Amber 不等於全部 SMC 排除','unknown','Red與Amber主要限制工作經驗子途徑；積分路徑仍須依自身完整條件審查，不因紅黃名單自動排除。',{required:false,weight:0}));
  return a;
 }
 if(p.nzSkill==='unknown')a.push(unknown('nz-skill','職業技能等級','此子途徑要求ANZSCO skill level 1–3。'));
 else a.push(check('nz-skill','職業技能等級',['1','2','3'].includes(p.nzSkill)?'met':'missing','此所選子途徑限skill level 1–3；4／5可另研究積分路徑，並非所有SMC都被排除。'));
 if(p.nzPath==='experience'){
  if(p.nzList==='unknown')return [...a,unknown('nz-list','Red／Amber 職業分類','須先核對官方清單，未確認不能採最低的一般經驗門檻。')];
  if(p.nzList==='red')return [...a,check('nz-red','所選工作經驗分支不適用','missing','這個職業在Red List，不能走Skilled Work Experience子途徑；可另研究積分路徑，不代表整個SMC永久失格。')];
  const amber=p.nzList==='amber';
  a.push(minYears(p,amber?'nzRelevantNZYears10':'nzRelevantYears10',amber?'前段紐西蘭相關經驗':'前段相關工作經驗',3,'最近十年內的直接相關經驗；不包含下列額外兩年同一期間。'),minYears(p,'nzSkilledYears4','額外紐西蘭 skilled experience',2,'需在申請前四年內累積，並符合本分支歷史薪資門檻。'),...nzExperienceEvidence(p),nzWage(p,amber?1.2:1.1,asOf));
 }else{
  a.push(declared(p,'nzTradesListed','Trades and Technician 官方職業清單','須列入此途徑的專屬清單；不依一般軟體／STEM職稱推定。'),declared(p,'nzQualification4','相關 Level 4 或以上資格','需NZQCF認可且直接相關；紐西蘭取得的資格另須符合120學分要求，海外資格按IQA／豁免規則確認。'),minYears(p,'nzPostQualYears10','取得資格後的前段相關經驗',2.5,'最近十年內，須在取得相關資格之後；不能重複計入後段。'),minYears(p,'nzPostQualNZYears3','額外取得資格後的紐西蘭經驗',1.5,'需在申請前三年內、資格取得後，與前段合計四年且不重複。'),...nzExperienceEvidence(p),nzWage(p,1,asOf));
 }
 return a;
}
export function countryEligibilityChecks(id,profile={},asOf=new Date().toISOString().slice(0,10)){
 const p={...profile,...normalizeCountryFields(profile)};
 if(id==='eu:germany-eu-blue-card')return german(p,asOf);
 if(id==='eu:ireland-critical-skills-employment-permit')return ireland(p,asOf);
 if(id==='global:nz-smc')return newZealand(p,asOf);
 return [];
}
export function selectedCountryPath(id,p){
 return id==='eu:germany-eu-blue-card'?({standard:'德國藍卡：一般資格',shortage:'德國藍卡：緊缺職業',graduate:'德國藍卡：近三年畢業',it:'德國藍卡：IT 經驗／無正式學位'}[p.dePath]||'德國藍卡：尚未選分支')
 :id==='eu:ireland-critical-skills-employment-permit'?({listed:'愛爾蘭：清單職業＋相關學位',graduate:'愛爾蘭：近12個月取得資格',high_salary:'愛爾蘭：高薪職類',special:'愛爾蘭：特殊例外待審'}[p.iePath]||'愛爾蘭：尚未選分支')
 :id==='global:nz-smc'?({points:'紐西蘭 SMC：積分路徑',experience:'紐西蘭 SMC：技術工作經驗',trades:'紐西蘭 SMC：技工／技術人員'}[p.nzPath]||'紐西蘭 SMC：尚未選子途徑'):null;
}
