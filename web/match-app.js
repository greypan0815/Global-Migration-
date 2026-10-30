import {matchRoutes,DEFAULT_PROFILE,SOURCE} from './match-engine.mjs';
const $=id=>document.getElementById(id);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const checkedLink=raw=>{try{const u=new URL(raw,location.origin);return u.protocol==='https:'?u.href:'#';}catch{return '#';}};
const categories={
 prioritize:{label:'優先研究',css:'prioritize',detail:'填入的多項條件已具備；不表示符合全部法定資格。'},
 prepare:{label:'仍需準備',css:'prepare',detail:'有可改善的門檻或正在等待申請窗口。'},
 research:{label:'先補資料',css:'research',detail:'目前資訊尚少，先核對官方要求。'},
 out_of_range:{label:'目前已知不符',css:'out_of_range',detail:'有一項明確的硬性條件不符；可考慮其他路線。'}
};
const state={catalog:null,results:null,filter:'all',limit:9,active:false};
const initProfile=()=>{
 const form=$('profileForm');
 // The form is deliberately never serialized to storage or URLs.
 const entries=new FormData(form),out={...DEFAULT_PROFILE};
 for(const key of Object.keys(out))if(entries.has(key))out[key]=entries.get(key);
 return out;
};
const salaryUnits={
 canada:'CAD，加幣',germany:'EUR，歐元',ireland:'EUR，歐元',
 netherlands:'EUR，歐元','united-kingdom':'GBP，英鎊',
 australia:'AUD，澳幣','new-zealand':'NZD，紐幣',japan:'JPY，日圓'
};
function updateSalary(){
 const country=$('offerCountry').value;
 $('currencyHint').textContent=country==='none'
  ?'未有 offer，可留空。請勿將台幣收入直接當外國薪資。'
  :'只填該職缺當地幣別：'+(salaryUnits[country]||'當地貨幣')+'（稅前）';
}
function dueForRecheck(day){
 if(!day)return true;
 const timestamp=Date.parse(day+'T00:00:00Z');
 return Number.isNaN(timestamp)||Date.now()-timestamp>90*86400000;
}
function categoryButton(key,label,count){
 const active=state.filter===key;
 return '<button type="button" class="'+(active?'active':'')+
   '" data-filter="'+escapeHtml(key)+'" aria-pressed="'+active+'">'+escapeHtml(label)+
   ' · '+count+'</button>';
}
function breakdownCard(result){
 const points=result.points;if(!points)return '';
 const parts=points.items.map(part=>
   '<li>'+escapeHtml(part.label)+'：<strong>'+part.points+' 分</strong></li>').join('');
 return '<div class="partial-points"><h4>澳洲 189 · 已填、已確認項目小計（不完整）</h4>'+
   '<div class="partial-big">'+points.subtotal+' <small>分，非最終 SkillSelect 分數</small></div>'+
   '<ul>'+parts+'</ul>'+
   (points.omitted.length?'<p>尚未納入：'+escapeHtml(points.omitted.join('、'))+'。</p>':'')+
   '<p>'+escapeHtml(points.note)+'</p>'+
   '<a class="official-small" href="'+escapeHtml(checkedLink(points.official))+
   '" target="_blank" rel="noopener noreferrer">查看澳洲完整官方積分表 ↗</a></div>';
}
function checkRow(check){
 const symbol={met:'✓',missing:'!',unknown:'?',blocked:'×'}[check.state]||'?';
 return '<li><span class="check-state '+escapeHtml(check.state)+'">'+symbol+'</span>'+
   '<div><strong>'+escapeHtml(check.label)+'</strong><p>'+escapeHtml(check.reason)+'</p></div></li>';
}
function matchCard(item){
 const kind=categories[item.tier];
 const css=item.tier==='out_of_range'?' is-blocked':item.tier==='research'?' is-low':'';
 const progress=Math.max(0,Math.min(100,item.score));
 const metText=item.met+' 項已具備 · '+item.gaps+' 項需補強 · '+item.unknown+' 項未確認';
 const audit=item.reviewed?'已核對部分政策欄位 '+item.reviewDate:
   '尚未完整官方核對的探索項目';
 let statusWarning='';
 if(item.season)statusWarning='<p class="match-card-warning">這個計畫的 2026 申請季已關閉；已符合年齡並不表示現在可參加當年度抽選。</p>';
 if(item.tier==='out_of_range')statusWarning='<p class="match-card-warning">已有明確不符合的條件，請先查看說明。網站不會把這條視為目前可申請。</p>';
 if(item.reviewed&&dueForRecheck(item.reviewDate))statusWarning+='<p class="match-card-warning">官方政策核查已逾 90 天，需重新確認有效日期、薪資和受理窗口。</p>';
 return '<article class="match-card'+css+'">'+
  '<div class="match-card-head"><div><div class="match-country">'+escapeHtml(item.flag)+
  ' '+escapeHtml(item.country)+' · '+escapeHtml(audit)+'</div>'+
  '<h3 class="match-name">'+escapeHtml(item.name)+'</h3>'+
  '<p class="match-method">'+escapeHtml(item.method)+'</p></div>'+
  '<span class="match-status '+escapeHtml(kind.css)+'">'+escapeHtml(kind.label)+'</span></div>'+
  '<div class="meter-labels"><span>自訂條件準備度 · 非核准率／官方積分</span>'+
  '<strong>'+progress+'／100</strong></div>'+
  '<div class="meter" role="meter" aria-label="'+escapeHtml(item.name)+'自訂條件準備度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'"><span style="width:'+progress+'%"></span></div>'+
  '<div class="meter-legend"><span><b>'+escapeHtml(metText)+'</b></span></div>'+
  statusWarning+
  '<details class="check-details"><summary>展開條件分析（'+item.checks.length+' 項）</summary>'+
  '<ul>'+item.checks.map(checkRow).join('')+'</ul>'+
  '<div class="audit-foot">永久居留：'+escapeHtml(item.settlement)+
  '<br>本分析不涵蓋全部移民法規，也不證明個人資格已獲政府認定。</div></details>'+
  breakdownCard(item)+
  '<div class="match-card-actions"><a href="'+escapeHtml(checkedLink(item.official))+
  '" target="_blank" rel="noopener noreferrer">查看政府規定 ↗</a>'+
  '<a href="/#route='+encodeURIComponent(item.id)+'">查看網站路線詳情 ↗</a></div>'+
  '</article>';
}
function safeRender(){
 if(!state.active||!state.catalog)return;
 state.results=matchRoutes(state.catalog,initProfile());
 render();
}
function render(){
 const data=state.results;
 if(!data)return;
 const categoriesCount={all:data.items.length,prioritize:0,prepare:0,research:0,out_of_range:0};
 for(const row of data.items)categoriesCount[row.tier]++;
 const items=data.items.filter(row=>state.filter==='all'||row.tier===state.filter);
 const visible=items.slice(0,state.limit);
 const section=$('matchResults');
 const counts=data.counts;
 let markup='<div class="results-top"><div><p class="tiny-overline">PERSONALISED MATCHING · TAIWAN PASSPORT</p>'+
  '<h2>你的移居路線地圖</h2></div><div class="results-count">已分析 '+counts.analyzed+' 條路線</div></div>'+
  '<p class="results-subline">以你填入的條件作初步探索，結果會依可確認的條件與未知資訊更新；與正式法律核准率完全不同。</p>'+
  '<div class="metrics"><div class="metric"><strong>'+counts.analyzed+'</strong><small>納入初步條件檢查</small></div>'+
  '<div class="metric"><strong>'+categoriesCount.prioritize+'</strong><small>可優先研究</small></div>'+
  '<div class="metric"><strong>'+counts.unassessed+'</strong><small>其他路線仍須自行核對</small></div></div>'+
  '<div class="result-warning">⚠️ <strong>準備度不是移民分數，更不是成功率。</strong>沒有填寫／沒有官方證明的項目不會被視為合格。英國 Skilled Worker 的 70 分和澳洲 SkillSelect 的 65 分等法定制度，須另外按法律逐項核算。</div>'+
  '<div class="result-switches" role="group" aria-label="篩選建議適配等級">'+
  categoryButton('all','全部',categoriesCount.all)+
  categoryButton('prioritize','優先研究',categoriesCount.prioritize)+
  categoryButton('prepare','仍需準備',categoriesCount.prepare)+
  categoryButton('research','先補資料',categoriesCount.research)+
  categoryButton('out_of_range','已知不符',categoriesCount.out_of_range)+
  '</div>';
 if(!visible.length)markup+='<div class="results-empty-filter">目前沒有符合這個分析分類的路線。可以切換「全部」或更改條件。</div>';
 else markup+=visible.map(matchCard).join('');
 if(items.length>visible.length)markup+='<button type="button" id="showMoreMatches" class="button button-outline" style="width:100%">顯示更多路線（尚有 '+(items.length-visible.length)+' 條） ↓</button>';
 markup+='<div class="results-end">除上列優先研究項目外，還有 <strong>'+counts.unassessed+
  '</strong> 條未納入此問卷評估，並非不適合臺灣人。請使用 <a href="/">完整 150 條移居路線清單</a> 延伸研究。<br>本工具沒有計算官方 CRS、SMC、機會卡或日本高度人才完整分數。資料及限制請看政府官方網站。</div>';
 section.innerHTML=markup;
 section.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
   state.filter=button.dataset.filter;state.limit=9;render();
 }));
 const more=$('showMoreMatches');if(more)more.addEventListener('click',()=>{state.limit+=9;render();});
}
function errorUI(message){
 $('matchResults').innerHTML='<div class="result-empty"><div class="result-empty-art">!</div>'+
 '<h2>暫時無法載入路線資料</h2><p>'+escapeHtml(message)+'</p>'+
 '<a class="button button-outline" href="/">回到主站檢查網站資料</a></div>';
}
async function boot(){
 const form=$('profileForm');
 form.addEventListener('submit',event=>{
   event.preventDefault();
   if(!form.reportValidity())return;
   state.active=true;state.filter='all';state.limit=9;
   if(!state.catalog){errorUI('靜態資料尚未準備好，請確認 Cloudflare Pages 建置輸出。');return;}
   safeRender();
   if(window.matchMedia('(max-width:720px)').matches)$('matchResults').scrollIntoView({behavior:'smooth',block:'start'});
 });
 form.addEventListener('reset',()=>{
   state.active=false;state.filter='all';state.limit=9;state.results=null;
   setTimeout(()=>{
     updateSalary();
     $('matchResults').innerHTML='<div class="result-empty"><div class="result-empty-art" aria-hidden="true">✳</div>'+
     '<h2>資料已清除</h2><p>這份表單的輸入不會儲存或上傳。重新輸入即可再次分析。</p></div>';
   },0);
 });
 form.addEventListener('input',()=>{if(state.active)safeRender();});
 form.addEventListener('change',event=>{
   if(event.target.name==='offerCountry')updateSalary();
   if(state.active)safeRender();
 });
 try{
   const response=await fetch('/data/catalog.json',{cache:'no-store'});
   if(!response.ok)throw Error('HTTP '+response.status);
   const catalog=await response.json();
   if(catalog.schemaVersion!==2||!Array.isArray(catalog.routes))
     throw Error('資料格式版本不符；請重新部署最新 main。');
   state.catalog=catalog;
 }catch(err){
   console.error('Catalog loading error',err);
   errorUI('請確認 dist/data/catalog.json 存在且網站部署的是最新版本。');
   $('analyzeButton').disabled=true;
 }
 updateSalary();
}
boot();
