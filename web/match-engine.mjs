/* Global Migration route matching v1 — local-browser checklist, NOT immigration points/probability. */
export const SOURCE={
  crs:'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html',
  canadaChanges:'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html',
  canadaNoc:'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html',
  iec:'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html',
  au189:'https://immi.homeaffairs.gov.au/supporting/Pages/Work/189-points-table.aspx',
  nz:'https://www.immigration.govt.nz/visas/skilled-migrant-category-resident-visa/',
  chance:'https://www.make-it-in-germany.com/en/advice-support/newsletter/the-new-opportunity-card-what-do-i-need-to-know',
  blue:'https://www.make-it-in-germany.com/en/visa-recognition/visa-types/eu-blue-card',
  ie:'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/',
  nl:'https://ind.nl/en/residence-permits/work/highly-skilled-migrant',
  nlblue:'https://ind.nl/en/residence-permits/work/european-blue-card-residence-permit',
  uk:'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker',
  hpi:'https://www.gov.uk/high-potential-individual-visa/eligibility',
  yms:'https://www.gov.uk/guidance/youth-mobility-scheme-visa-ballot-system',
  cz:'https://mpo.gov.cz/en/foreign-trade/economic-migration/programs-and-projects/digital-nomad-program--275799/',
  au482:'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482',
  us:'https://travel.state.gov/content/travel/en/us-visas/employment/treaty-trader-investor-visa-e.html',
  niw:'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2',
  jp:'https://www.mofa.go.jp/j_info/visit/w_holiday/',
  jphsp:'https://www.moj.go.jp/isa/applications/resources/newimmiact_3_index.html',
  auwh:'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/first-working-holiday-417',
  nzwh:'https://www.immigration.govt.nz/visas/taiwan-working-holiday-visa/',
  dv:'https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry/diversity-visa-instructions.html',
  swt:'https://j1visa.state.gov/programs/summer-work-travel/'
};
export const MODELS=[
 ['eu:germany-eu-blue-card','必要條件',SOURCE.blue],
 ['eu:ireland-critical-skills-employment-permit','必要條件',SOURCE.ie],
 ['eu:netherlands-highly-skilled-migrant','認可雇主／薪資',SOURCE.nl],
 ['eu:netherlands-eu-blue-card','必要條件',SOURCE.nlblue],
 ['extra:uk-skilled-worker','法定 70 分資格制（非排名）',SOURCE.uk],
 ['global:au-482','雇主擔保',SOURCE.au482],
 ['global:nz-smc','官方六分制及替代路徑',SOURCE.nz],
 ['global:ca-ee','CRS 官方積分排名',SOURCE.crs],
 ['global:ca-pnp','省級資格與聯邦申請',SOURCE.crs],
 ['tw:iec_wh','工作度假抽選',SOURCE.iec],
 ['tw:iec_yp','雇主 offer ＋邀請',SOURCE.iec],
 ['tw:iec_coop','在學實習',SOURCE.iec],
 ['eu:czechia-digital-nomad-program','遠距工作必要條件',SOURCE.cz],
 ['tw:yms','年度抽選',SOURCE.yms],
 ['tw:working_holiday','工作度假資格',SOURCE.jp],
 ['tw:wh_417','工作度假資格',SOURCE.auwh],
 ['tw:taiwan_wh','工作度假資格',SOURCE.nzwh],
 ['tw:e1','條約貿易資格',SOURCE.us],
 ['tw:e2','條約投資資格',SOURCE.us],
 ['extra:uk-hpi','法定 70 分資格制（非排名）',SOURCE.hpi],
 ['global:us-eb1a-niw','專業成就與法定標準',SOURCE.niw],
 ['global:au-189','官方積分制：部分項目小計',SOURCE.au189],
 ['extra:germany-opportunity-card','官方六分制／資格認定',SOURCE.chance],
 ['global:jp-hsp','官方高度人才積分制',SOURCE.jphsp],
 ['global:us-dv-lottery','出生地與學歷資格／隨機抽籤',SOURCE.dv],
 ['global:us-j1-summer-work-travel','在學交流工作／J-1 Sponsor',SOURCE.swt]
];
export const DEFAULT_PROFILE={
 age:'',field:'unknown',education:'unknown',years:'',english:'unknown',german:'unknown',
 objective:'settlement',mode:'employment',offerCountry:'none',salary:'',salaryUnit:'year',
 sponsor:'unknown',taiwanHousehold:'unknown',student:'unknown',remoteWork:'unknown',
 business:'unknown',achievements:'unknown',canadianYears:'',auOccupation:'unknown',
 auEnglish:'unknown',auDegree:'unknown',auWorkVerified:'unknown',auYears:'',
 partner:'unknown',hpiUniversity:'unknown',birthPlace:'unknown',destination:'all',
 canadianWorkEligible:'unknown',canadaSpouseAccompanying:'unknown',canadaExperienceNocBand:'unknown',
 canadianOfferEligible:'unknown',canadaOfferNocBand:'unknown',
 twPassportPersonalId:'unknown',iecUsed:'unknown',iecChannel:'bilateral',iecROConfirmation:'unknown',
 iecCoopTaiwanStudent:'unknown',ymsUsed:'unknown',ymsDependentChildren:'unknown',ymsFunds:'unknown'
};
const region={
 germany:'europe',ireland:'europe',netherlands:'europe','united-kingdom':'europe',
 czechia:'europe',austria:'europe',canada:'americas',usa:'americas',
 australia:'oceania','new-zealand':'oceania',japan:'asia'
};
const langs={unknown:-1,none:0,a1:1,a2:2,b1:3,b2:4,c1:5,c2:6};
const numeric=v=>v===''||v===null||v===undefined?null:Number.isFinite(Number(v))?Number(v):null;
export function normalizeProfile(raw={}){
 const p={...DEFAULT_PROFILE};
 for(const key of Object.keys(p))if(Object.hasOwn(raw,key))p[key]=raw[key];
 for(const k of ['age','years','salary','canadianYears','auYears']){
   const x=numeric(p[k]);p[k]=x!==null&&x>=0&&x<=1000000?x:null;
 }
 if(p.age!==null&&p.age>110)p.age=null;
 for(const k of ['years','canadianYears','auYears'])if(p[k]!==null&&p[k]>70)p[k]=null;
 if(!['year','month'].includes(p.salaryUnit))p.salaryUnit='year';
 return p;
}
const item=(label,state,reason,weight=1,hard=false)=>({label,state,reason,weight,hard});
const ok=(name,why,w=1)=>item(name,'met',why,w);
const need=(name,why,w=1)=>item(name,'missing',why,w);
const unknown=(name,why,w=1)=>item(name,'unknown',why,w);
const block=(name,why,w=1)=>item(name,'blocked',why,w,true);
function age(p,low,high){
 if(p.age===null)return unknown('年齡','需確認年齡介於 '+low+'–'+high+' 歲。',2);
 return p.age>=low&&p.age<=high?ok('年齡',p.age+' 歲落在基本年齡範圍。',2)
   :block('年齡',p.age+' 歲不在 '+low+'–'+high+' 歲資格範圍。',2);
}
function offer(p,country){
 return p.offerCountry===country?ok('目的國雇主聘用','已填有當地工作機會；合約、工作內容仍需政府審查。',3)
   :need('目的國雇主聘用','仍需取得該國合格雇主 offer，沒有 offer 不代表將來無法申請。',3);
}
function sponsor(p){
 if(p.offerCountry==='none')return unknown('雇主擔保資格','找到雇主後，確認是否具主管機關認可的擔保資格。',2);
 return p.sponsor==='yes'?ok('雇主擔保資格','你表示雇主具有擔保資格；仍須查證。',2)
   :p.sponsor==='no'?need('雇主擔保資格','目前雇主不符合擔保要求。',2)
   :unknown('雇主擔保資格','須確認雇主是否獲主管機關認可。',2);
}
function degree(p){
 const ranks={unknown:-1,highschool:0,diploma:1,bachelor:2,master:3,phd:4};
 if(p.education==='unknown')return unknown('學歷與專業資歷','未填學歷，需查認證與職位相關要求。',2);
 return ranks[p.education]>=2?ok('學歷基本等級','已填有學士或以上學歷；國外認可與專業關聯仍需查。',2)
   :need('學歷與專業資歷','部分路線要求大學學位；特定 IT 年資可能有例外。',2);
}
function occupation(p,allow=['software','stem']){
 if(p.field==='unknown')return unknown('職業類別','需輸入職業類型、實際職務及代碼。',2);
 return allow.includes(p.field)?ok('職業類別','職業方向可作為研究線索，實際職務代碼仍需查核。',2)
   :need('職業類別','需核對是否屬計畫許可的職業清單。',2);
}
function language(p,key,needed){
 const level=p[key]||'unknown';
 if(langs[level]===undefined||langs[level]<0)return unknown('語言能力','需有效語言證明（約 '+needed.toUpperCase()+'），自評不能當成官方考試。',2);
 return langs[level]>=langs[needed]?ok('語言能力','自評已達約 '+needed.toUpperCase()+'；正式申請需被接受的考試。',2)
   :need('語言能力','可先提升至 '+needed.toUpperCase()+'，實際接受標準另查。',2);
}
function salary(p,country,threshold,period='year'){
 if(p.offerCountry!==country)return unknown('薪資門檻','先有當地 offer 才能以當地貨幣核對最低薪資。',2);
 if(p.salary===null)return unknown('薪資門檻','請輸入當地幣別稅前薪資（不自動換算匯率）。',2);
 const val=period==='month'?(p.salaryUnit==='year'?p.salary/12:p.salary)
   :(p.salaryUnit==='month'?p.salary*12:p.salary);
 return val>=threshold?ok('薪資門檻','填入數字達 2026 一般門檻；仍需核對職業 going rate／例外／津貼。',2)
   :need('薪資門檻','低於 2026 一般門檻；仍可能有合法的降低標準或例外，須個別查。',2);
}
function goal(p,r){
 const temp=['tw:iec_wh','tw:iec_yp','tw:iec_coop','tw:yms','tw:working_holiday',
   'tw:wh_417','tw:taiwan_wh','tw:e1','tw:e2','extra:uk-hpi'].includes(r.id)||
   ['not_direct','status_upgrade_not_pr'].includes(r.audit?.settlement?.state);
 if(p.objective==='settlement')return temp?need('長期身分目標','此計畫不直接授予永久居留，另需身分轉換與申請。',2)
   :ok('長期身分研究','可研究獨立的 PR／定居資格與後續申請程序。',2);
 if(p.objective==='temporary')return temp?ok('短期海外生活','簽證性質較符合短期交流或工作。',2)
   :unknown('短期海外生活','此路線通常偏向正式聘僱或永久居留。',2);
 if(p.objective==='remote')return r.id==='eu:czechia-digital-nomad-program'
   ?ok('遠距工作方向','符合遠距方向，仍須核對實際僱傭及經營條件。',2)
   :need('遠距工作方向','此簽證不能保證你能在其他國家自由遠距工作。',2);
 return unknown('移居目標','請選擇想達成的居留目標。',2);
}
function experience(p,min=1){
 if(p.years===null)return unknown('相關工作年資','未填與職務相符的工作年數。',2);
 return p.years>=min?ok('相關工作年資','有基本年資線索，需確認工作證明及職務匹配。',2)
   :need('相關工作年資','一般要求可能需至少 '+min+' 年合格年資。',2);
}
function special(p,key,name,reason,hard=false){
 return p[key]==='yes'?ok(name,'已填符合相關方向；須再提供符合官方條件的證據。',3)
   :p[key]==='no'?(hard?block(name,reason,3):need(name,reason,3))
   :unknown(name,reason,3);
}
/** Taiwan-specific eligibility: unknown answers are never treated as approval. */
function taiwanIECChecks(p){
 const a=[];
 a.push(p.twPassportPersonalId==='yes'?ok('護照上的身分證字號','已聲明台灣護照載有個人身分證字號；有效期限仍須核對。',2)
  :p.twPassportPersonalId==='no'?block('護照上的身分證字號','IRCC 台灣類別明確要求護照含個人身分證字號。',2)
  :unknown('護照上的身分證字號','需要含個人身分證字號的有效台灣護照；有護照不等於滿足這項條件。',2));
 if(p.iecChannel==='ro'){
  a.push(unknown('RO 額外參與需另審','RO 可提供額外機會，但需官方確認信、個別資格與名額；不能假設 RO 必然接受或同類別可重複。',3));
  if(p.iecROConfirmation!=='yes')a.push(need('RO 確認信','選擇 RO 途徑但尚無官方確認信，不能視為目前可遞件。',2));
 }else{
  a.push(p.iecUsed==='yes'?block('台灣雙邊 IEC 次數','一般雙邊三類別合計一次；已用 WH 不能再假設有另一份普通 YP。可另研究 RO，但須重新核對。',3)
   :p.iecUsed==='no'?ok('台灣雙邊 IEC 次數','聲明尚未抵達加拿大並取得過 IEC 工簽；建立 profile 或核准未領工簽本身不算參加。',3)
   :unknown('台灣雙邊 IEC 次數','需確認是否曾入境並取得 IEC 工簽；一般一次，不是每類別一次。',3));
 }
 return a;
}
function taiwanYMSChecks(p){
 const a=[];
 a.push(p.ymsUsed==='yes'?block('過往 YMS 停留','曾在英國以 YMS 身分停留，不符合再次申請入境的條件。',3)
  :p.ymsUsed==='no'?ok('過往 YMS 停留','聲明未曾在英國以 YMS 停留。',3):unknown('過往 YMS 停留','需核對是否曾經使用英國 YMS。',3));
 a.push(p.ymsDependentChildren==='yes'?block('未成年子女條件','有同住或經濟依賴你的未滿18歲子女，不符合 YMS 5.3。',3)
  :p.ymsDependentChildren==='no'?ok('未成年子女條件','聲明沒有此項法定限制。',3):unknown('未成年子女條件','需確認是否有同住或經濟依賴的未成年子女。',3));
 a.push(p.ymsFunds==='yes'?ok('YMS 財力證明','聲明 GBP 2,530 已連續持有28天，證明期間符合申請時點要求。',2)
  :p.ymsFunds==='no'?need('YMS 財力證明','需準備 GBP 2,530 並依官方規定持有28天；不代表整段停留預算足夠。',2)
  :unknown('YMS 財力證明','不能只看目前餘額；需 GBP 2,530、連續28天與規定的證明日期。',2));
 return a;
}
function checksFor(r,p){
 const id=r.id,out=[goal(p,r)];
 const employers=['eu:germany-eu-blue-card','eu:ireland-critical-skills-employment-permit',
 'eu:netherlands-highly-skilled-migrant','eu:netherlands-eu-blue-card',
 'extra:uk-skilled-worker','global:au-482','global:nz-smc'];
 if(employers.includes(id))out.push(offer(p,r.countryId));
 if(['eu:netherlands-highly-skilled-migrant','extra:uk-skilled-worker','global:au-482','global:nz-smc'].includes(id))
   out.push(sponsor(p));
 switch(id){
 case 'eu:germany-eu-blue-card':
   out.push(occupation(p,['software','stem','other']),degree(p),salary(p,'germany',50700));break;
 case 'eu:ireland-critical-skills-employment-permit':
   out.push(occupation(p,['software','stem','health','other']),degree(p),salary(p,'ireland',40904));break;
 case 'eu:netherlands-highly-skilled-migrant':
   out.push(salary(p,'netherlands',p.age!==null&&p.age<30?4357:5942,'month'));
   if(p.age===null)out.push(unknown('年齡分級','荷蘭薪資標準依是否滿 30 歲及特殊降低標準不同。'));break;
 case 'eu:netherlands-eu-blue-card':
   out.push(degree(p),salary(p,'netherlands',5942,'month'));break;
 case 'extra:uk-skilled-worker':
   out.push(occupation(p,['software','stem','health','business','other']),language(p,'english','b2'),
     salary(p,'united-kingdom',41700));break;
 case 'global:au-482':out.push(experience(p),salary(p,'australia',79423));break;
 case 'global:nz-smc':
   out.push(age(p,18,55),unknown('SMC 各路徑核算','有六分制、技術工作經驗及技工／技術人員路徑；仍須核對紐西蘭當地年資。',2));break;
 case 'global:ca-ee':{
   out.push(p.canadianYears===null||p.canadianWorkEligible==='unknown'
     ?unknown('加拿大合格工作經驗','需確認最近十年的加拿大 TEER 0–3 合格年資；只填工作年數不能直接認定符合 CRS。',3)
     :p.canadianYears>=1&&p.canadianWorkEligible==='yes'
       ?ok('加拿大合格工作經驗','已聲明具備合格加拿大工作年資，仍須政府查核 NOC、工作地及工時。',3)
       :need('加拿大合格工作經驗','可改研究 FSW／其他 EE 途徑，CEC 通常需要至少一年符合條件的工作經驗。',3));
   out.push(p.canadaExperienceNocBand==='unknown'
     ?unknown('高薪 NOC 職類','官方看 NOC 職業中位數，不是你的個人薪資；請先核對政府名單。',2)
     :unknown('NOC 級距需官方證明','已選級距，仍須核對 2026-11-03 政府 NOC 名單與至少十二個月合格經驗。',2));
   out.push(p.offerCountry==='canada'&&p.canadianOfferEligible==='yes'
     ?ok('合格加拿大 job offer','已聲明有符合資格的 offer；2026-11-03 起不要求 LMIA，但仍須由 IRCC 核實真實性。',2)
     :p.canadianOfferEligible==='no'||p.offerCountry==='none'
       ?need('合格加拿大 job offer','目前未有 offer；不代表所有 EE 類別都需要 offer。',2)
       :unknown('合格加拿大 job offer','須核對加拿大 offer 及對應官方高薪職業級距，非所有 offer 都取得 CRS 分。',2));
   out.push(unknown('Labour Market Integration 分數','合法加拿大工作經驗與合格高薪 NOC offer 擇高，不能重複加總。',1),
     unknown('完整 CRS 分數','語言四技能、ECA、婚姻／配偶、轉移技能及其他分數仍須 IRCC 正式計分器。',2));
   break;
 }
 case 'global:ca-pnp':out.push(offer(p,'canada'),unknown('省分／提名類別','須依各省實際計畫、配額與雇主要求核實。',2));break;
 case 'tw:iec_wh':case 'tw:iec_yp':case 'tw:iec_coop':
   out.push(age(p,18,35),...taiwanIECChecks(p));
   if(id==='tw:iec_coop')out.push(special(p,'iecCoopTaiwanStudent','臺灣院校與課程實習','台灣 Co-op 需在台灣大專院校註冊、實習全程保持在學且符合課程；不是任何海外學生都適用。',true));
   if(id==='tw:iec_yp')out.push(offer(p,'canada'));
   if(id==='tw:iec_coop')out.push(special(p,'student','符合學生實習身分','Co-op 主要供符合資格的在學生，需實習安排。',true));
   out.push(need('2026 申請窗口','加拿大 2026 IEC 候選池已關閉，等待 2027 官方公告。',1));break;
 case 'eu:czechia-digital-nomad-program':
   out.push(occupation(p,['software','marketing']),special(p,'remoteWork','境外遠距工作','必須符合境外聘僱／自營及特定職業與公司條件。'));break;
 case 'tw:yms':out.push(p.age===17?unknown('年齡日期需核對','申請日不得超過30歲、簽證生效日須滿18歲；17歲不能直接判定永久失格。',2):age(p,18,30),...taiwanYMSChecks(p),need('2026 YMS 抽選','截至 2026-11-06，2026 抽選已結束，2027 日期待公告。'));break;
 case 'tw:working_holiday':case 'tw:wh_417':case 'tw:taiwan_wh':
   out.push(age(p,18,30));
   if(id==='tw:taiwan_wh')out.push(special(p,'taiwanHousehold','臺灣戶籍','紐西蘭臺灣 WH 需臺灣戶籍證明。',true),
    need('2026 申請窗口','2026 紐西蘭臺灣工作假期已關閉。'));break;
 case 'tw:e1':case 'tw:e2':out.push(special(p,'business','合格貿易／投資／企業','E 類不是一般求職簽證，須有合格企業活動。'));break;
 case 'extra:uk-hpi':
   out.push(special(p,'hpiUniversity','近五年合格大學學位','學校須列於學位授予日期的官方 Global Universities List。',true),
    language(p,'english','b2'));break;
 case 'global:us-eb1a-niw':
   out.push(special(p,'achievements','特殊成就／國家利益證據','EB-1A／NIW 均需依各自高門檻法律與證據判斷。'));break;
 case 'global:au-189':
   out.push(age(p,18,44),special(p,'auOccupation','職業與技術評估','189 必須有符合的提名職業與有效 skills assessment。',true));break;
 case 'extra:germany-opportunity-card':
   out.push(degree(p),unknown('正式六分或資格認定','機會卡存在免積分資格認定路線與符合條件的六分制，建議使用官方自我檢查。',2));break;
 case 'global:us-dv-lottery':
   out.push(p.birthPlace==='taiwan'?
     unknown('出生地年度資格','台灣出生者在 DV-2026 曾列名；當期未公布的資格不能依舊名單自動判定符合。',3):
     p.birthPlace==='mainland'||p.birthPlace==='hongkong'?
       need('出生地歷史資格','DV-2026 排除中國大陸及香港出生者，一些申請人可能依配偶／父母等法定例外另行判定，DV-2027 需新指示。',3):
       unknown('出生地資格','DV 主要依出生地／法定 chargeability（有例外），不是只看台灣護照。',3));
   out.push(p.education==='unknown'?
     unknown('學歷／職業資格','須符合高中或等同的 12 年教育，或指定合格工作經驗。',2):
     ['highschool','diploma','bachelor','master','phd'].includes(p.education)?
       ok('學歷初步方向','填寫的學歷具基礎線索，但是否符合 12 年正式教育須按當期官方文件審核。',2):
       need('學歷／職業資格','如未完成合格高中教育，須確認是否有最近五年的合格工作經驗等替代資格。',2));
   out.push(need('報名與簽證核發狀態','截至 2026-11-06，E-DV 未受理新登記；8/31 官方頁首說舊暫停依 8/28 法院命令不再有效，殘留舊文造成核發狀態需再核實，不得宣稱全面暫停。',2));
   break;
 case 'global:us-j1-summer-work-travel':
   out.push(special(p,'student','合格全職在學身分',
      '須在海外認可的實體授課大學／學院全職就讀，且完成至少一學期。已畢業非在學通常不符合。',true));
   out.push(p.english==='unknown'?
     unknown('英語溝通能力','BridgeUSA 要求能在英語環境有效溝通；須由 sponsor 判斷，沒有固定 CEFR B1/B2 官方標準。',2):
     unknown('英文條件仍需 sponsor 確認','英文自評不等於美國核准的語言能力。',2));
   out.push(unknown('合格 Sponsor 與短期工作安排','需 J-1 sponsor 及符合季節性工作安排，最長四個月，不能當一般開放式 Working Holiday。',2));
   break;
 case 'global:jp-hsp':
   out.push(degree(p),p.offerCountry==='japan'?ok('日本合格活動','已有日本聘用線索，但要按官方積分表計算。',2):
    unknown('日本聘用與活動','須確認活動性質與官方高度人才計分制度。',2));break;
 }
 if(p.destination!=='all'&&region[r.countryId]!==p.destination)
   out.push(need('目的地偏好','此路線不在你優先選擇的地區。'));
 if(p.mode==='remote'&&id!=='eu:czechia-digital-nomad-program')
   out.push(need('跨境遠距工作','此制度不一定允許在任何國家跨境遠距受雇。',2));
 return out;
}
/* 澳洲 189 官方項目僅計算使用者聲明已有正式證明的部分分數。 */
export function australia189Subtotal(raw={}){
 const p=normalizeProfile(raw),items=[],omitted=[];
 if(p.age===null)omitted.push('年齡');
 else items.push({label:'年齡',points:p.age>=18&&p.age<25?25:p.age>=25&&p.age<33?30:p.age>=33&&p.age<40?25:p.age>=40&&p.age<45?15:0});
 const en={competent:0,proficient:10,superior:20};
 if(Object.hasOwn(en,p.auEnglish))items.push({label:'已取得認可英文測驗級別',points:en[p.auEnglish]});
 else omitted.push('官方英文測驗');
 const degrees={diploma:10,bachelor:15,master:15,phd:20};
 if(p.auDegree==='yes'&&Object.hasOwn(degrees,p.education))items.push({label:'已認可學歷',points:degrees[p.education]});
 else omitted.push('澳洲承認學歷');
 if(p.auWorkVerified==='yes'&&p.years!==null)
   items.push({label:'合格海外年資',points:p.years>=8?15:p.years>=5?10:p.years>=3?5:0});
 else omitted.push('經認定的海外相關年資');
 if(p.auWorkVerified==='yes'&&p.auYears!==null)
   items.push({label:'合格澳洲年資',points:p.auYears>=8?20:p.auYears>=5?15:p.auYears>=3?10:p.auYears>=1?5:0});
 else omitted.push('澳洲合格工作年資');
 const overseas=items.find(x=>x.label==='合格海外年資'),local=items.find(x=>x.label==='合格澳洲年資');
 if(overseas&&local&&overseas.points+local.points>20)local.points=20-overseas.points;
 const partners={single:10,partnerEnglish:5,partnerSkilled:10,none:0};
 if(Object.hasOwn(partners,p.partner))items.push({label:'可認定的配偶／單身類別',points:partners[p.partner]});
 else omitted.push('配偶或單身法定加分');
 return {subtotal:items.reduce((n,x)=>n+x.points,0),items,omitted,
   official:SOURCE.au189,threshold:65,complete:false,
   note:'只顯示已聲明具有正式證明的部分積分；仍缺澳洲在學、偏遠地區、專業年、社區語言等可能加分，以及職業評估與邀請資格。65 分是最低門檻，不是獲邀或核准機率。'};
}

/**
 * 加拿大 2026-11-03 Labour Market Integration 因子情境推估。
 * 高薪級距依 IRCC 的 NOC 職業整體中位數，不是個人的薪資。
 * 輸入是使用者自述，非完整 CRS、有效 job offer 或政府資格認定。
 */
export function estimateCanadaLMI(raw={}){
 const p=normalizeProfile(raw);
 const basic={yes:[0,35,46,56,63,70],no:[0,40,53,64,72,80]};
 const wageExtra={below:0,tier13:20,tier15:40,tier20:70};
 const offerTier={below:0,tier13:50,tier15:70,tier20:100};
 const reasons=[];
 const expConfirmed=p.canadianWorkEligible==='yes'&&p.canadianYears!==null&&
   Object.hasOwn(basic,p.canadaSpouseAccompanying);
 let experience=null;
 if(expConfirmed){
   const years=Math.min(5,Math.floor(p.canadianYears));
   const base=basic[p.canadaSpouseAccompanying][years];
   const highWage=p.canadianYears<1?0:Object.hasOwn(wageExtra,p.canadaExperienceNocBand)
     ?wageExtra[p.canadaExperienceNocBand]:null;
   experience={base,highWage,total:highWage===null?null:base+highWage};
   if(highWage===null)reasons.push('需確認合格加拿大工作經驗的高薪 NOC 級距。');
 }else reasons.push('加拿大年資、合法工作資格或隨行配偶欄位未經確認，不能計算工作經驗方案。');
 const offer=p.offerCountry==='canada'&&p.canadianOfferEligible==='yes'&&
   Object.hasOwn(offerTier,p.canadaOfferNocBand)
   ?{total:offerTier[p.canadaOfferNocBand]}:null;
 if(!offer)reasons.push('需有真實且符合 IRCC 規則的加拿大 job offer，並確認官方 NOC 高薪級距。');
 const known=[experience?.total,offer?.total].filter(v=>typeof v==='number');
 const selected=known.length?Math.max(...known):null;
 return {experience,offer,selected,
   alternativesFullyProvided:experience?.total!==null&&experience?.total!==undefined&&offer!==null,
   officialCriteriaVerified:false,completeCRS:false,
   checkedAsOf:'2026-11-03',sources:[SOURCE.canadaChanges,SOURCE.canadaNoc,SOURCE.crs],
   notes:reasons,
   explanation:'僅供研究的 2026-11-03 Labour Market Integration 情境值，依使用者自述資料推估。加拿大工作經驗方案（年資分加高薪職業額外分）與合格 offer 方案擇高、不相加。職業高薪 NOC 依 IRCC 官方職業名單而非個人薪水。完整 CRS、各類別資格、邀請及移民官核定均未計算。'
 };
}

export function matchRoutes(catalog,raw={}){
 const profile=normalizeProfile(raw),routes=Array.isArray(catalog?.routes)?catalog.routes:[];
 const lookup=new Map(routes.map(x=>[x.id,x]));
 const matches=MODELS.map(([id,method,official])=>{
   const r=lookup.get(id);if(!r)return null;
   const checks=checksFor(r,profile),denom=checks.reduce((n,x)=>n+x.weight,0),
     score=Math.round(100*checks.filter(x=>x.state==='met').reduce((n,x)=>n+x.weight,0)/Math.max(1,denom)),
     hard=checks.some(x=>x.hard),season=['season_closed','registration_not_open'].includes(r.audit?.window?.state);
   let tier=hard?'out_of_range':score>=65?'prioritize':score>=33?'prepare':'research';
   if(season&&tier==='prioritize')tier='prepare';
   if(checks.some(x=>x.label==='目的國雇主聘用'&&x.state!=='met')&&tier==='prioritize')tier='prepare';
   if(id.startsWith('tw:iec_')&&profile.iecChannel==='ro'&&tier==='prioritize')tier='prepare';
   return {id,name:r.name,country:r.country,flag:r.flag,countryId:r.countryId,method,official,
     tier,score,checks,met:checks.filter(x=>x.state==='met').length,
     unknown:checks.filter(x=>x.state==='unknown').length,
     gaps:checks.filter(x=>x.state==='missing'||x.state==='blocked').length,
     season,reviewed:Boolean(r.audit?.checkedAt),reviewDate:r.audit?.checkedAt||'',
     reference:r.referenceUrl,settlement:r.audit?.settlement?.detail||'尚未完成官方查核',
     points:id==='global:au-189'?australia189Subtotal(profile):null,
     canadaLMI:id==='global:ca-ee'?estimateCanadaLMI(profile):null};
 }).filter(Boolean);
 const rank={prioritize:0,prepare:1,research:2,out_of_range:3};
 matches.sort((a,b)=>rank[a.tier]-rank[b.tier]||b.score-a.score||Number(b.reviewed)-Number(a.reviewed)||a.id.localeCompare(b.id));
 return {profile,items:matches,counts:{analyzed:matches.length,unassessed:Math.max(0,routes.length-matches.length)},
   statement:'網站探索準備度不是官方計分、移民成功率、法律適用性核定或獲邀預測。未知條件不假設符合；官方積分應另以政府系統核算。'};
}
