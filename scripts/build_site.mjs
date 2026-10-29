#!/usr/bin/env node
/**
 * Global Migration static catalogue builder.
 * No external dependencies; compatible with Cloudflare Pages Node.js 22.
 *
 * Original Mainland-oriented records remain intact. Taiwan eligibility is
 * an explicit overlay and never inferred from a country's existence.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GITHUB = 'https://github.com/greypan0815/Global-Migration-/blob/main';
export const COUNTRY_INFO = {
  albania:['🇦🇱','阿爾巴尼亞','Albania'], andorra:['🇦🇩','安道爾','Andorra'],
  austria:['🇦🇹','奧地利','Austria'], belgium:['🇧🇪','比利時','Belgium'],
  bulgaria:['🇧🇬','保加利亞','Bulgaria'], croatia:['🇭🇷','克羅埃西亞','Croatia'],
  cyprus:['🇨🇾','賽普勒斯','Cyprus'], czechia:['🇨🇿','捷克','Czechia'],
  denmark:['🇩🇰','丹麥','Denmark'], estonia:['🇪🇪','愛沙尼亞','Estonia'],
  finland:['🇫🇮','芬蘭','Finland'], france:['🇫🇷','法國','France'],
  germany:['🇩🇪','德國','Germany'], greece:['🇬🇷','希臘','Greece'],
  hungary:['🇭🇺','匈牙利','Hungary'], iceland:['🇮🇸','冰島','Iceland'],
  ireland:['🇮🇪','愛爾蘭','Ireland'], italy:['🇮🇹','義大利','Italy'],
  latvia:['🇱🇻','拉脫維亞','Latvia'], liechtenstein:['🇱🇮','列支敦斯登','Liechtenstein'],
  lithuania:['🇱🇹','立陶宛','Lithuania'], luxembourg:['🇱🇺','盧森堡','Luxembourg'],
  malta:['🇲🇹','馬爾他','Malta'], montenegro:['🇲🇪','蒙特內哥羅','Montenegro'],
  netherlands:['🇳🇱','荷蘭','Netherlands'], norway:['🇳🇴','挪威','Norway'],
  poland:['🇵🇱','波蘭','Poland'], portugal:['🇵🇹','葡萄牙','Portugal'],
  romania:['🇷🇴','羅馬尼亞','Romania'], slovakia:['🇸🇰','斯洛伐克','Slovakia'],
  slovenia:['🇸🇮','斯洛維尼亞','Slovenia'], spain:['🇪🇸','西班牙','Spain'],
  sweden:['🇸🇪','瑞典','Sweden'], switzerland:['🇨🇭','瑞士','Switzerland'],
  turkiye:['🇹🇷','土耳其','Türkiye'], 'united-kingdom':['🇬🇧','英國','United Kingdom'],
  usa:['🇺🇸','美國','United States'], canada:['🇨🇦','加拿大','Canada'],
  australia:['🇦🇺','澳洲','Australia'], 'new-zealand':['🇳🇿','紐西蘭','New Zealand'],
  japan:['🇯🇵','日本','Japan'], 'south-korea':['🇰🇷','韓國','South Korea'],
  singapore:['🇸🇬','新加坡','Singapore'], 'hong-kong':['🇭🇰','香港','Hong Kong'],
  philippines:['🇵🇭','菲律賓','Philippines'], thailand:['🇹🇭','泰國','Thailand'],
  malaysia:['🇲🇾','馬來西亞','Malaysia'], uae:['🇦🇪','阿拉伯聯合大公國','United Arab Emirates'],
  'latin-america':['🌎','拉丁美洲','Latin America']
};

export const TYPE_LABELS = {
  work:'技術就業', 'digital-nomad':'數位遊牧', 'self-employed':'自雇經營',
  startup:'創業', 'residence-by-investment':'投資居留',
  citizenship:'入籍', passive:'被動收入', youth:'打工度假',
  study:'學生／實習', other:'其他'
};

// The interface is Traditional Chinese; legacy descriptions are converted
// conservatively, and retain their upstream provenance. This is not a legal
// translation, nor a replacement for official-language source documents.
const HAN = {
  '国':'國','欧':'歐','蓝':'藍','签':'簽','证':'證','业':'業','专':'專',
  '术':'術','学':'學','师':'師','员':'員','职':'職','务':'務','区':'區',
  '经':'經','济':'濟','资':'資','费':'費','别':'別','发':'發','现':'現',
  '许':'許','够':'夠','财':'財','产':'產','业':'業','创':'創','业':'業',
  '临':'臨','时':'時','认':'認','开':'開','关':'關','额':'額','类':'類',
  '条':'條','件':'件','护':'護','页':'頁','领':'領','张':'張','维':'維',
  '净':'淨','税':'稅','审':'審','查':'查','历':'歷','应':'應','际':'際',
  '后':'後','为':'為','体':'體','与':'與','机':'機','会':'會','资':'資',
  '验':'驗','门':'門','岁':'歲','东':'東','兰':'蘭','岛':'島','尔':'爾',
  '国':'國','马':'馬','罗':'羅','亚':'亞','苏':'蘇','达':'達','贝':'貝',
  '乌':'烏','华':'華','严':'嚴','并':'並','还':'還','过':'過','进':'進',
  '业':'業','规':'規','则':'則','证':'證','书':'書','来':'來','联':'聯',
  '获':'獲','临':'臨','应':'應','补':'補','总':'總','应':'應','资':'資',
  '标':'標','准':'準','点':'點','优':'優','势':'勢','长':'長','级':'級',
  '择':'擇','转':'轉','实':'實','无':'無','门':'門','兴':'興','关':'關',
  '业':'業','条':'條','岁':'歲','处':'處','参':'參','与':'與','证':'證',
  '国':'國','项':'項','目':'目','项':'項','华':'華','强':'強','难':'難',
  '缓':'緩','紧':'緊','对':'對','应':'應','际':'際','满':'滿','将':'將',
  '仅':'僅','个':'個','从':'從','员':'員','属':'屬','办':'辦','义':'義',
  '岁':'歲','续':'續','试':'試','约':'約','满':'滿','劳':'勞','语':'語',
  '东':'東','乡':'鄉','选':'選','帮':'幫','决':'決','设':'設','计':'計',
  '导':'導','举':'舉','级':'級','额':'額','内':'內','标':'標','数':'數',
  '么':'麼','国':'國','户':'戶','险':'險','医':'醫','养':'養','险':'險',
  '户':'戶','岁':'歲','执':'執','败':'敗','请':'請','谢':'謝','诚':'誠',
  '赞':'讚','称':'稱','亿':'億','万':'萬','货':'貨','贸':'貿','易':'易',
  '响':'響','继':'繼','复':'復','阅':'閱','档':'檔','备':'備','态':'態',
  '览':'覽','图':'圖','较':'較','场':'場','动':'動','职':'職','权':'權',
  '雇':'雇','稳':'穩','负':'負','负':'負','毕':'畢','级':'級','础':'礎',
  '释':'釋','统':'統','织':'織','龄':'齡','数':'數','居':'居','单':'單',
  '双':'雙','环':'環','态':'態','机':'機','业':'業','约':'約','签':'簽',
  '汉':'漢','湾':'灣','湾':'灣','岛':'島','开':'開','见':'見','环':'環',
  '并':'並','陈':'陳','说':'說','细':'細','际':'際','设':'設','类':'類',
  '种':'種','计':'計','学':'學','补':'補','查':'查','尔':'爾','经':'經'
};
const PHRASES = [
  ['阿联酋','阿拉伯聯合大公國'],['新西兰','紐西蘭'],['澳大利亚','澳洲'],
  ['爱尔兰','愛爾蘭'],['德国','德國'],['美国','美國'],['英国','英國'],
  ['日本','日本'],['加拿大','加拿大'],['数字游民','數位遊牧'],
  ['技术移民','技術移民'],['居留许可','居留許可'],['工作许可','工作許可'],
  ['高度人才','高度人才'],['签证','簽證'],['永久居留','永久居留'],
  ['创业签证','創業簽證'],['技术工作','技術工作'],['工作签','工作簽'],
  ['机会卡','機會卡'],['红白红卡','紅白紅卡'],['蓝卡','藍卡'],
  ['职业','職業'],['企业','企業'],['自雇','自雇'],['雇主','雇主'],
  ['欧洲','歐洲'],['移民','移民'],['西班牙','西班牙'],['葡萄牙','葡萄牙']
];
export function traditional(value) {
  let text=String(value??'');
  for(const [a,b] of PHRASES) text=text.split(a).join(b);
  return [...text].map(ch=>HAN[ch]??ch).join('');
}
const asText = v => traditional(v??'').trim();
const cleanArray = value => Array.isArray(value)?value.filter(Boolean).map(asText).filter(Boolean):[];
const cleanPairs = value => Array.isArray(value)
  ?value.filter(v=>Array.isArray(v)&&v[0]).map(([a,b])=>[asText(a),asText(b)])
  :[];
const validUrl = url => {
  try { const u=new URL(url);return u.protocol==='https:'?u.toString():null; }
  catch {return null;}
};
function sourcesFrom(...values) {
  const out=[], seen=new Set();
  for(const list of values){
    if(!Array.isArray(list))continue;
    for(const item of list){
      const title=Array.isArray(item)?item[0]:item?.title;
      const url=validUrl(Array.isArray(item)?item[1]:item?.url);
      if(!url||seen.has(url))continue;
      seen.add(url);out.push({title:asText(title||'官方或參考資料'),url});
    }
  }
  return out.slice(0,15);
}
export function parseCsv(text) {
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted&&text[i+1]==='"'){field+='"';i++;}
      else quoted=!quoted;
    }else if(c===','&&!quoted){row.push(field);field='';}
    else if((c==='\n'||c==='\r')&&!quoted){
      if(c==='\r'&&text[i+1]==='\n')i++;
      row.push(field);
      if(row.some(x=>x!==''))rows.push(row);
      row=[];field='';
    }else field+=c;
  }
  if(quoted)throw Error('Unterminated CSV quoted field');
  if(field!==''||row.length){row.push(field);rows.push(row);}
  if(!rows.length)return [];
  const [headers,...body]=rows;
  return body.map((cells,i)=>{
    if(cells.length!==headers.length)throw Error('Invalid CSV width at row '+(i+2));
    return Object.fromEntries(headers.map((h,j)=>[h,cells[j]]));
  });
}
function prKind(text) {
  const raw=String(text??'');
  if(/不通永居|不適用永居|不适用永居|不可轉永居|无法获得永居/.test(raw))return 'not_indicated';
  if(/可能通向永居|可申請永居|可申请永居|通往永久居留/.test(raw))return 'upstream_possible';
  return 'needs_review';
}
function normalizeDetail(d={}) {
  return {
    facts:cleanPairs(d.facts),
    steps:cleanPairs(d.steps),
    fit:cleanArray(d.fit),unfit:cleanArray(d.unfit),
    docs:cleanArray(d.docs),tips:cleanArray(d.tips)
  };
}
function countryInfo(slug, fallback) {
  const row=COUNTRY_INFO[slug]??['🌐',asText(fallback||slug),slug];
  return {countryId:slug,country:row[1],countryEn:row[2],flag:row[0],
    region:Object.keys(COUNTRY_INFO).indexOf(slug)<36?'europe':'global'};
}
const TAIWAN_COUNTRIES = {CA:'canada',US:'usa',GB:'united-kingdom',JP:'japan',AU:'australia',NZ:'new-zealand'};
const TW_INFO = {
  iec_wh:{name:'IEC Working Holiday 打工度假',type:'youth',summary:'加拿大開放式工作許可方向；須符合 IEC 年齡、護照及邀請條件。加拿大工作經驗不會自動取得永久居留。',pr:'CEC／PNP 需另行達標，不自動取得 PR',facts:[['簽證','Working Holiday'],['工作許可','通常為開放式'],['資格','需依當季 IEC 邀請與規定']],steps:[['核對當季臺灣資格與名額','確認名額與類別'],['建立 IEC profile','獲邀後依規定申請'],['合法在加拿大工作','累積合格工作經驗'],['另行評估 CEC／PNP','PR 不是自動取得']]},
  iec_yp:{name:'IEC Young Professionals 專業青年',type:'work',summary:'需有符合專業發展條件的加拿大雇主 offer；通常為指定雇主工作許可。',pr:'合格工作經驗可能用於其他 PR 申請',facts:[['工作許可','指定雇主'],['必要條件','合資格雇主 offer']],steps:[['取得雇主 offer','確認職業類別與專業發展資格'],['參加 IEC 邀請','提交指定雇主文件'],['合法工作','依 CEC／PNP 規則另行評估']]},
  iec_coop:{name:'IEC International Co-op 實習',type:'study',summary:'提供符合學生資格的國際實習機會，需有合資格的實習安排。',pr:'不代表符合 CEC 工作經驗',facts:[['要求','學生身分與合格實習']],steps:[['確認學生資格','核對學校與雇主安排'],['申請 IEC','取得相應工作許可']]},
  e1:{name:'E-1 條約貿易商簽證',type:'startup',summary:'臺灣列於美國 E-1 條約適用名單；須滿足實質貿易、國籍及企業職位等條件。',pr:'非自動取得綠卡的簽證',facts:[['適用性','臺灣列於條約國名單'],['性質','非移民簽證']],steps:[['確認條約身分與交易條件','查閱美國國務院與 USCIS'],['準備貿易／企業證據','依官方程序申請']]},
  e2:{name:'E-2 條約投資人簽證',type:'startup',summary:'臺灣列於美國 E-2 條約適用名單；需符合實質投資或合格企業雇員條件。',pr:'不會自動轉為美國綠卡',facts:[['適用性','臺灣列於條約國名單'],['性質','非移民簽證']],steps:[['確認合資格投資／企業雇員條件','查閱官方規定'],['準備資金來源與企業證據','按官方簽證程序申請']]},
  yms:{name:'Youth Mobility Scheme 青年交流',type:'youth',summary:'臺灣申請英國青年交流簽證需參加 ballot；官方公告 2026 年抽選已結束。',pr:'青年交流簽證並非直接取得永居',facts:[['2026 年度','抽選已結束'],['程序','先通過 ballot']],steps:[['追蹤下年度官方 ballot 公告','核對資格與窗口'],['獲選再申請簽證','依官方流程提供文件']]},
  working_holiday:{name:'日本打工度假',type:'youth',summary:'臺灣參加日本打工度假；自 2026 年 2 月起可終身參加兩次，每次最長一年，須核對申請窗口。',pr:'打工度假非永久居留',facts:[['期限','每次最長一年'],['參與次數','符合規則者終身兩次']],steps:[['確認日本台灣交流協會當期受理公告','核對年齡與材料'],['提交打工度假申請','依准許範圍工作及停留']]},
  wh_417:{name:'Working Holiday Visa 417',type:'youth',summary:'臺灣一般護照適用澳洲 417 類打工度假；不是 Working Holiday 462。',pr:'417 本身並非自動 PR',facts:[['類別','Subclass 417'],['提醒','臺灣應核對 417 條件']],steps:[['核對 417 當期資格','檢查護照年齡與健康等要求'],['官方申請','依准許停留與工作條件遵守規則']]},
  taiwan_wh:{name:'Taiwan Working Holiday Visa',type:'youth',summary:'紐西蘭針對臺灣護照與臺灣戶籍者的打工度假類別；2026 年度已關閉。',pr:'打工度假非自動 PR',facts:[['2026 年度','已關閉'],['必要條件','臺灣護照及臺灣戶籍證明']],steps:[['追蹤下次開放時間','查看官方日期與名額'],['核對戶籍與文件','依官方要求提交申請']]}
};
function taiwanStatus(value) {
  if(value==='2026_closed'||value==='2026_ballots_finished')return 'closed_window';
  return 'check_window';
}
export function buildCatalog(input) {
  const {programmes=[],details={},extras={},global=[],profiles={},taiwan=[]}=input;
  const countries=new Map(),routes=[];
  const register=(slug,fallback)=>{
    if(!countries.has(slug)){
      const info=countryInfo(slug,fallback);
      const p=profiles[slug]??{};
      countries.set(slug,{...info,routeCount:0,
        // Contextual data only: does not imply Taiwan passport entry privileges.
        livingCost:Number.isFinite(p.col)?p.col:null,
        rentIndex:Number.isFinite(p.rent)?p.rent:null});
    }
    return countries.get(slug);
  };
  const add=route=>{
    if(routes.some(r=>r.id===route.id))throw Error('Duplicate route ID: '+route.id);
    if(!route.countryId||!route.name)throw Error('Invalid route record');
    register(route.countryId).routeCount++;
    routes.push(route);
  };
  for(const p of programmes){
    const c=register(p.country_slug,p.country), d=details[p.slug]??{};
    const pr=asText(p.pr);
    add({
      id:'eu:'+p.slug,origin:'europe',...countryInfo(p.country_slug,p.country),
      name:asText(p.programme),originalName:String(p.programme??''),
      type:p.route_type,typeLabel:TYPE_LABELS[p.route_type]??'其他',
      summary:asText(d.summary||p.audience||'請查看來源與各國官方說明。'),
      threshold:asText(p.threshold),pr,prKind:prKind(p.pr),family:asText(p.family),
      status:p.status==='closed'?'closed':'upstream_open',
      verification:'needs_review',verified:p.verified||'',
      sources:sourcesFrom(p.sources,d.sources),...normalizeDetail(d),
      audience:asText(p.audience),
      referenceUrl:GITHUB+'/docs/europe/'+p.country_slug+'.md#'+encodeURIComponent(p.slug)
    });
  }
  for(const [slug,list] of Object.entries(extras)){
    register(slug);
    for(const e of list){
      const info=countryInfo(slug), pr=asText(e.pr||'');
      add({id:'extra:'+e.id,origin:'extra',...info,
        name:asText(e.name),originalName:e.name,type:e.type,typeLabel:TYPE_LABELS[e.type]??'其他',
        summary:asText(e.summary),threshold:asText((e.facts||[]).find(f=>/门槛|年薪|月薪|收入|资金|主申请人|资本/.test(f[0]))?.[1]||''),
        pr,prKind:prKind(e.pr),family:'',status:e.status==='closed'?'closed':'upstream_open',
        verification:'needs_review',verified:'',sources:sourcesFrom(e.sources),...normalizeDetail(e),
        audience:'',referenceUrl:GITHUB+'/docs/europe/'+slug+'.md#'+encodeURIComponent(e.id)});
    }
  }
  for(const g of global){
    register(g.slug,g.name);
    for(const r of g.routes||[]){
      const info=countryInfo(g.slug,g.name),d=normalizeDetail(r);
      add({id:'global:'+r.id,origin:'global',...info,
        name:asText(r.name),originalName:r.name,type:r.type,typeLabel:TYPE_LABELS[r.type]??'其他',
        summary:asText(r.summary||g.tagline),threshold:asText((r.facts||[]).find(f=>/年薪|月薪|门槛|最低|资金|投资/.test(f[0]))?.[1]||''),
        pr:'',prKind:'needs_review',family:'',status:r.status==='closed'?'closed':'upstream_open',
        verification:'needs_review',verified:'2026-10',
        sources:sourcesFrom(r.sources,g.links),...d,audience:'',
        referenceUrl:GITHUB+'/docs/global/'+g.slug+'.md#'+encodeURIComponent(r.id)});
    }
  }
  for(const t of taiwan){
    if(t.taiwan_passport_eligible!=='yes')continue;
    const slug=TAIWAN_COUNTRIES[t.country_iso];
    if(!slug)throw Error('Unknown Taiwan country ISO: '+t.country_iso);
    const meta=TW_INFO[t.route_id];
    if(!meta)throw Error('Missing Taiwan content metadata: '+t.route_id);
    const info=countryInfo(slug);
    add({id:'tw:'+t.route_id,origin:'taiwan',...info,
      name:meta.name,originalName:meta.name,type:meta.type,typeLabel:TYPE_LABELS[meta.type]??'其他',
      summary:meta.summary,threshold:'',pr:meta.pr,prKind:'needs_review',
      family:'',status:taiwanStatus(t.application_status_2026),
      verification:'official_checked',verified:t.verified_as_of,
      sources:sourcesFrom([{title:'目的國政府／移民主管機關',url:t.official_url}]),
      ...normalizeDetail(meta),audience:asText(t.eligibility_scope.replaceAll('_',' ')),
      age:t.age_range,eligibilityNote:asText(t.notes),
      referenceUrl:GITHUB+'/docs/taiwan/'+(t.country_iso==='CA'?'canada-iec.md':'README.md')});
  }
  if(routes.length===0)throw Error('No routes generated');
  const types=Object.entries(TYPE_LABELS).map(([id,label])=>({id,label,count:routes.filter(r=>r.type===id).length})).filter(x=>x.count);
  return {schemaVersion:1,edition:'Taiwan + Mainland reference',verificationCutoff:'2026-10-30',
    dataNotice:'原始中國大陸導向資料與臺灣額外官方核對資料分層呈現；非法律意見。',
    counts:{countries:countries.size,routes:routes.length,taiwanChecked:routes.filter(r=>r.verification==='official_checked').length,
      europe:routes.filter(r=>r.origin==='europe'||r.origin==='extra').length,global:routes.filter(r=>r.origin==='global').length},
    types,countries:[...countries.values()].sort((a,b)=>a.country.localeCompare(b.country,'zh-Hant')),
    routes};
}

function loadJson(file){return JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8'));}
export function main(){
  const details={};
  const directory=path.join(ROOT,'src/details');
  for(const filename of fs.readdirSync(directory).filter(f=>f.endsWith('.json')).sort()){
    Object.assign(details,loadJson('src/details/'+filename));
  }
  const catalog=buildCatalog({
    programmes:loadJson('data/programmes.json'),
    extras:loadJson('src/extra_routes.json'),
    global:loadJson('src/global.json'),
    profiles:loadJson('data/country_profiles.json'),
    details,
    taiwan:parseCsv(fs.readFileSync(path.join(ROOT,'data/taiwan_applicability.csv'),'utf8'))
  });
  const output=path.join(ROOT,'dist');
  fs.rmSync(output,{recursive:true,force:true});
  fs.mkdirSync(path.join(output,'data'),{recursive:true});
  for(const entry of fs.readdirSync(path.join(ROOT,'web'),{withFileTypes:true})){
    if(!entry.isFile())continue;
    fs.copyFileSync(path.join(ROOT,'web',entry.name),path.join(output,entry.name));
  }
  fs.writeFileSync(path.join(output,'data/catalog.json'),JSON.stringify(catalog));
  if(!fs.existsSync(path.join(output,'index.html')))throw Error('Missing dist/index.html');
  console.log('Global Migration static build OK:',JSON.stringify(catalog.counts));
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
