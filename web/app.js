/* Global Migration — interactive static catalogue; no dependencies */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = val => String(val ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);
  const url = raw => {
    try {const a=new URL(raw,location.href); return a.protocol==='https:'?a.href:'#';}
    catch{return '#';}
  };
  const storeGet = (key,fallback) => {
    try {const x=localStorage.getItem(key);return x===null?fallback:JSON.parse(x);}
    catch{return fallback;}
  };
  const storeSet = (key,value) => {try {localStorage.setItem(key,JSON.stringify(value));}catch{}};
  const savedIds=storeGet('gm:favorites:v1',[]);
  const state = {
    passport:storeGet('gm:passport:v1','tw')==='cn'?'cn':'tw',
    query:'',country:'all',region:'all',type:'all',verify:'all',pr:'all',
    status:'all',evidence:'all',savedOnly:false,sort:'relevance',visible:12,countryTab:'all',
    favorites:new Set(Array.isArray(savedIds)?savedIds:[]),compare:[]
  };
  let catalog=null,lookup=new Map(),toastHandle;
  const kind=r=>{
    if(state.passport==='cn')return {text:'原版中國大陸視角',cls:''};
    const v=r.audit?.passport?.state;
    if(v==='confirmed_for_taiwan')return {text:'臺灣列入適用對象',cls:'checked'};
    if(v==='third_country_route')return {text:'一般第三國制度（個案申請）',cls:'checked'};
    if(v==='chargeability_matters')return {text:'出生地排期（非護照）',cls:'checked'};
    return {text:'臺灣資格待核對',cls:''};
  };
  const windowLabels={
    season_closed:'2026 年申請季已結束',
    no_fixed_season:'非固定抽選 · 請核實',
    check_official:'請查當期受理窗口',
    invitation_based:'邀請制，需另符合條件',
    priority_date_based:'依每月排期判定',
    quota_and_check:'有年度名額 · 須查窗口',
    paused:'暫停新申請'
  };
  const status=r=>r.audit?.window?.state
    ?(windowLabels[r.audit.window.state]||'依當期官方規則申請')
    :({closed_window:'上游標示該年度已結束',
        check_window:'需查當期申請窗口',
        closed:'上游標示已停止',
        upstream_open:'上游標示開放（未核實）'}[r.status]||'狀態待核實');
  const prLabels={
    not_direct:'非直接永居',separate_application:'需另申請 PR',
    conditional_settlement:'符合條件可申請永居',status_upgrade_not_pr:'居留升級 ≠ 永居',
    direct_residence_application:'通過 PR 審查才取得',resident_visa:'核准為 Resident Visa'
  };
  const prLabel=r=>r.audit?.settlement?.state
    ?(prLabels[r.audit.settlement.state]||'依官方規則評估')
    :({upstream_possible:'僅上游標示可能',not_indicated:'上游標示不通永居',needs_review:'尚待個別核對'}[r.prKind]||'尚待確認');
  const reviewLabel=r=>({
    reviewed_specific_fields:'部分欄位經官方核對',
    official_links_not_audited:'有官方連結、未逐條核對',
    generic_country_portal:'僅國家官方入口',
    third_party_only:'僅第三方來源',
    missing_route_source:'缺少路線直接來源'
  }[r.sourceGrade]||'來源待核對');
  const sourceLabel=r=>r.audit?.checkedAt?'官方欄位核對':r.origin==='taiwan'?'臺灣補充':'上游參考';
  const prCategory=r=>{
    if(r.audit?.settlement?.state)return ['not_direct','status_upgrade_not_pr'].includes(r.audit.settlement.state)
      ?'not_direct':'reviewed_possible';
    return r.prKind==='upstream_possible'?'upstream_possible':'needs_review';
  };
  const scopeLabel={
    taiwan_eligibility:'臺灣國籍資格',2026_window:'2026 申請季',2026_ballot_window:'2026 抽選狀態',
    2026_program_status:'2026 計畫狀態',2026_salary:'2026 薪資',2026_income_threshold:'2026 薪資',
    stamp4_not_pr:'Stamp 4 非 PR',three_pathways:'移民途徑',chargeability:'出生地排期',
    work_rights:'工作權',pr_not_automatic:'非自動 PR',conditional_pr:'永居條件',
    target_occupation:'適用職業',target_group:'申請對象',sponsor:'雇主資格',
    age:'年齡',offer:'聘僱',visa_type:'簽證類型'
  };
  function toast(text){
    const node=$('toast');
    node.textContent=text;
    node.classList.add('show');
    clearTimeout(toastHandle);
    toastHandle=setTimeout(()=>node.classList.remove('show'),2700);
  }
  function setPassport(passport){
    state.passport=passport;
    storeSet('gm:passport:v1',passport);
    if(passport==='cn'){
      if(state.verify==='checked')state.verify='all';
      state.compare=state.compare.filter(id=>!id.startsWith('tw:'));
    }
    $('featuredSection').hidden=passport==='cn';
    state.visible=12;
    document.querySelectorAll('[data-passport]').forEach(btn=>{
      const active=btn.dataset.passport===passport;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',String(active));
    });
    $('verifyFilter').disabled=passport==='cn';
    $('verifyFilter').value=state.verify;
    $('noticeTitle').textContent=passport==='tw'?'先確認你的臺灣護照資格':'原版資料以中國大陸護照為基準';
    $('noticeText').textContent=passport==='tw'
      ?'「臺灣已核對」僅代表特定計畫列有臺灣的國籍／地區資格；其他路線仍待核對。正式申請以當期官方規定為準。'
      :'此模式呈現上游中國大陸導向的移居資料，不代表所有路線已經個別核准；移民與國籍條件仍須自行查證。';
    renderResults();
  }
  function resetFilters(){
    Object.assign(state,{query:'',country:'all',region:'all',type:'all',verify:'all',
      pr:'all',status:'all',evidence:'all',savedOnly:false,sort:'relevance',visible:12});
    $('searchInput').value='';
    $('countryFilter').value='all';
    $('verifyFilter').value='all';
    $('prFilter').value='all';
    $('statusFilter').value='all';
    $('evidenceFilter').value='all';
    $('savedOnly').checked=false;
    $('sortBy').value='relevance';
    syncFilterButtons();
    renderResults();
  }
  function syncFilterButtons(){
    document.querySelectorAll('[data-region]').forEach(button=>{
      const on=button.dataset.region===state.region;
      button.classList.toggle('active',on);
      button.setAttribute('aria-pressed',String(on));
    });
    document.querySelectorAll('[data-type]').forEach(button=>{
      const on=button.dataset.type===state.type;
      button.classList.toggle('active',on);
      button.setAttribute('aria-pressed',String(on));
    });
  }
  function renderChoices(){
    const typeContainer=$('typeChoices');
    const types=[{id:'all',label:'全部',count:catalog.counts.routes},...catalog.types];
    typeContainer.innerHTML=types.map(t=>
      '<button type="button" class="type-option'+(t.id===state.type?' active':'')+
      '" data-type="'+esc(t.id)+'" aria-pressed="'+String(t.id===state.type)+'">'+
      esc(t.label)+'</button>'
    ).join('');
    const select=$('countryFilter');
    select.innerHTML='<option value="all">全部國家／地區</option>'+
      catalog.countries.map(c=>'<option value="'+esc(c.countryId)+'">'+
        esc(c.flag)+' '+esc(c.country)+'</option>').join('');
    select.value=state.country;
  }
  function sortRoutes(arr){
    if(state.sort==='country')return arr.sort((a,b)=>a.country.localeCompare(b.country,'zh-Hant')||a.name.localeCompare(b.name,'zh-Hant'));
    if(state.sort==='name')return arr.sort((a,b)=>a.name.localeCompare(b.name,'zh-Hant'));
    return arr.sort((a,b)=>{
      const score=r=>(state.passport==='tw'&&r.verification==='official_checked'?130:0)
        +(r.audit?.priority||0)*2+(r.audit?.checkedAt?25:0)
        +(r.type==='work'?35:0)+(r.type==='youth'?10:0)
        +(r.status==='closed'||r.status==='closed_window'?-220:0);
      return score(b)-score(a)||a.country.localeCompare(b.country,'zh-Hant')||a.name.localeCompare(b.name,'zh-Hant');
    });
  }
  function matchingRoutes(){
    const q=state.query.trim().toLocaleLowerCase();
    return sortRoutes(catalog.routes.filter(r=>{
      if(state.passport==='cn'&&r.origin==='taiwan')return false;
      if(state.country!=='all'&&r.countryId!==state.country)return false;
      if(state.region!=='all'&&r.region!==state.region)return false;
      if(state.type!=='all'&&r.type!==state.type)return false;
      if(state.passport==='tw'){
        if(state.verify==='checked'&&r.verification!=='official_checked')return false;
        if(state.verify==='needs_review'&&r.verification==='official_checked')return false;
      }
      if(state.pr!=='all'&&prCategory(r)!==state.pr)return false;
      if(state.evidence!=='all'&&r.sourceGrade!==state.evidence)return false;
      if(state.status!=='all'&&r.status!==state.status)return false;
      if(state.savedOnly&&!state.favorites.has(r.id))return false;
      if(q){
        const haystack=[r.country,r.countryEn,r.name,r.originalName,r.summary,r.audience,
          r.threshold,r.typeLabel,r.pr,r.audit?.passport?.detail,r.audit?.work?.detail,r.audit?.window?.detail,...(r.facts||[]).flat(),
          ...(r.sources||[]).map(s=>s.title)].join(' ').toLocaleLowerCase();
        if(!haystack.includes(q))return false;
      }
      return true;
    }));
  }
  function featureCard(r){
    return '<article class="feature-card">'+
      '<div class="feature-top"><span class="feature-flag">'+esc(r.flag)+' '+esc(r.country)+
      '</span><span class="feature-kicker">臺灣資格已核對</span></div>'+
      '<h3>'+esc(r.name)+'</h3><p>'+esc(r.summary)+'</p>'+
      '<div class="feature-footer"><span>'+esc(status(r))+'</span>'+
      '<button type="button" data-action="open" data-id="'+esc(r.id)+'">查看路線 ↗</button></div></article>';
  }
  function renderFeatured(){
    const order=['eu:germany-eu-blue-card','eu:ireland-critical-skills-employment-permit','eu:netherlands-highly-skilled-migrant'];
    const list=order.map(id=>lookup.get(id)).filter(Boolean);
    $('featuredGrid').innerHTML=list.length?list.map(featureCard).join(''):
      '<div class="loading-state">臺灣專屬資料暫無法顯示，請查看原始 GitHub 資料。</div>';
  }
  function routeCard(r){
    const ver=kind(r);
    const isSaved=state.favorites.has(r.id);
    const isCompared=state.compare.includes(r.id);
    const rate=r.threshold||((r.facts||[]).find(row=>/薪|收入|資金|門檻|資本|金額/.test(row[0]))||[])[1]||'請見詳細資格';
    const statusClass=r.status==='closed'||r.status==='closed_window'?'closed':ver.cls;
    return '<article class="route-card" data-card-id="'+esc(r.id)+'">'+
      '<div class="card-top"><div class="card-country"><span class="flag">'+esc(r.flag)+'</span>'+
      '<span>'+esc(r.country)+'</span></div><span class="card-type">'+esc(r.typeLabel)+'</span></div>'+
      '<div class="card-status '+esc(statusClass)+'"><span class="dot"></span>'+
      esc(ver.text)+' · '+esc(status(r))+'</div>'+
      '<h3 class="card-title">'+esc(r.name)+'</h3>'+
      '<p class="card-summary">'+esc(r.summary)+'</p>'+
      '<div class="card-facts"><div class="card-fact"><small>資格／門檻（摘要）</small><strong title="'+esc(rate)+'">'+esc(rate)+'</strong></div>'+
      '<div class="card-fact"><small>永居方向</small><strong title="'+esc(prLabel(r))+'">'+esc(prLabel(r))+'</strong></div></div>'+
      '<div class="card-bottom"><div class="card-controls">'+
      '<button type="button" class="icon-button" data-action="save" data-id="'+esc(r.id)+
      '" aria-label="'+(isSaved?'移除收藏':'加入收藏')+'" aria-pressed="'+isSaved+'" title="收藏">'+(isSaved?'★':'☆')+'</button>'+
      '<button type="button" class="icon-button" data-action="compare" data-id="'+esc(r.id)+
      '" aria-label="'+(isCompared?'移除比較':'加入比較')+'" aria-pressed="'+isCompared+'" title="最多比較三條路線">⇄</button>'+
      '</div><button type="button" class="detail-button" data-action="open" data-id="'+esc(r.id)+
      '">路線詳情 <span aria-hidden="true">↗</span></button></div></article>';
  }
  function renderFilterHints(){
    const hints=[];
    if(state.country!=='all')hints.push(lookupCountry(state.country)?.country||state.country);
    if(state.region!=='all')hints.push(state.region==='europe'?'歐洲':'其他地區');
    if(state.type!=='all')hints.push(catalog.types.find(x=>x.id===state.type)?.label||state.type);
    if(state.passport==='tw'&&state.verify==='checked')hints.push('臺灣資格已核對');
    if(state.passport==='tw'&&state.verify==='needs_review')hints.push('臺灣待核對');
    if(state.pr!=='all')hints.push(state.pr==='upstream_possible'?'上游標示可能永居':state.pr==='needs_review'?'永居未核對':'上游標示不通永居');
    if(state.status!=='all')hints.push('狀態：'+(status({status:state.status})));
    if(state.savedOnly)hints.push('我的收藏');
    $('activeFilters').innerHTML=hints.map(s=>'<span class="active-filter-chip">'+esc(s)+'</span>').join('');
  }
  function lookupCountry(slug){return catalog.countries.find(c=>c.countryId===slug);}
  function renderResults(){
    if(!catalog)return;
    const all=matchingRoutes(),shown=all.slice(0,state.visible);
    $('resultCount').textContent=all.length.toLocaleString('zh-TW');
    $('activeHint').textContent=state.passport==='tw'?' · 臺灣護照視角':' · 中國大陸護照視角';
    $('routeGrid').innerHTML=shown.map(routeCard).join('');
    $('emptyState').hidden=all.length!==0;
    $('loadMore').hidden=shown.length>=all.length;
    $('loadMore').textContent='顯示更多路線（尚有 '+(all.length-shown.length)+' 條） ↓';
    renderFilterHints();
    renderCompareTray();
  }
  function renderCountries(){
    const items=catalog.countries.filter(c=>state.countryTab==='all'||c.region===state.countryTab)
      .sort((a,b)=>b.routeCount-a.routeCount||a.country.localeCompare(b.country,'zh-Hant'));
    $('countryGrid').innerHTML=items.map(c=>'<button class="country-card" data-country="'+esc(c.countryId)+'" type="button">'+
      '<span class="country-flag">'+esc(c.flag)+'</span><span><strong>'+esc(c.country)+
      '</strong><small>'+esc(c.routeCount)+' 條路線</small></span><span class="country-arrow" aria-hidden="true">↗</span></button>').join('');
  }
  function setCountryTab(id){
    state.countryTab=id;
    document.querySelectorAll('[data-tab]').forEach(btn=>{
      const on=btn.dataset.tab===id;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));
    });
    renderCountries();
  }
  function renderCompareTray(){
    const tray=$('compareTray');
    tray.hidden=state.compare.length===0;
    $('compareCount').textContent=state.compare.length+'/3';
    $('openCompare').disabled=state.compare.length<2;
    $('compareSelected').innerHTML=state.compare.map(id=>{
      const r=lookup.get(id);
      return r?'<button type="button" class="compare-pill" data-remove-compare="'+esc(id)+'" aria-label="從比較移除'+esc(r.name)+'">'+
        esc(r.flag)+' '+esc(r.name)+' ×</button>':'';
    }).join('');
  }
  function saveRoute(id){
    if(state.favorites.has(id))state.favorites.delete(id);
    else state.favorites.add(id);
    storeSet('gm:favorites:v1',[...state.favorites]);
    toast(state.favorites.has(id)?'已加入我的收藏':'已移除收藏');
    renderResults();
  }
  function compareRoute(id){
    const index=state.compare.indexOf(id);
    if(index>=0)state.compare.splice(index,1);
    else if(state.compare.length>=3){toast('一次最多比較 3 條路線');return;}
    else state.compare.push(id);
    renderResults();
  }
  const pill = text=>'<span class="pill">'+esc(text)+'</span>';
  const factsHtml = pairs => pairs.length?'<div class="detail-grid">'+pairs.map(([title,value])=>
    '<div class="detail-fact"><small>'+esc(title)+'</small><strong>'+esc(value||'需核對')+'</strong></div>').join('')+'</div>':'';
  const bulletHtml = items=>'<ul class="detail-bullets">'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  function block(title,inner){return inner?'<section class="detail-section"><h3>'+esc(title)+'</h3>'+inner+'</section>':'';}
  function detailHtml(r){
    const ver=kind(r),sources=r.sources||[];
    let facts=[['路線類型',r.typeLabel],['資料狀態',ver.text],['申請／開放狀態',status(r)]];
    if(r.age)facts.push(['年齡條件（摘要）',r.age]);
    if(r.threshold)facts.push(['上游門檻概要',r.threshold]);
    if(r.pr)facts.push(['永居／長期居留',r.pr]);
    else facts.push(['永居／長期居留','尚待依各國官方規則確認']);
    if(r.family)facts.push(['家屬',r.family]);
    if(r.verified)facts.push([r.origin==='taiwan'?'台灣資料核查日期':'上游資料核查日期',r.verified]);
    facts.push(...(r.facts||[]).slice(0,16));
    const stepHtml=(r.steps||[]).length?
      '<ol class="step-list">'+r.steps.map(([name,note],i)=>'<li><span class="step-index">'+(i+1)+
      '</span><div><strong>'+esc(name)+'</strong>'+(note?'<p>'+esc(note)+'</p>':'')+'</div></li>').join('')+'</ol>':'';
    const sourceHtml=sources.length?
      '<div class="source-list">'+sources.map(s=>'<a class="source-link" href="'+esc(url(s.url))+
      '" target="_blank" rel="noopener noreferrer"><span>'+esc(s.title)+'</span><span>↗</span></a>').join('')+'</div>'
      :'<p class="detail-intro">本筆未附單獨來源，請透過原始路線頁查證，勿直接依此申請。</p>';
    const warning=r.verification==='official_checked'
      ?'「臺灣資格已核對」只表示原始官方來源列出台灣為適用對象，並非保證符合全部資格、當前有名額或可取得 PR。'
      :'此為原專案資料；台灣護照的資格、戶籍要求、受理狀態與居留權利尚未逐條核對。';
    return '<div class="dialog-body"><div class="detail-country"><span>'+esc(r.flag)+'</span>'+
      esc(r.country)+' · '+esc(r.typeLabel)+'</div>'+
      '<h2 class="detail-heading">'+esc(r.name)+'</h2>'+
      '<p class="detail-intro">'+esc(r.summary)+'</p>'+
      '<div class="detail-tags">'+pill(ver.text)+pill(status(r))+pill(sourceLabel(r))+'</div>'+
      '<div class="detail-callout">'+esc(warning)+'</div>'+
      block('核心條件與概要',factsHtml(facts))+
      block('申請與轉換流程（摘要）',stepHtml)+
      block('較適合的情況',(r.fit||[]).length?bulletHtml(r.fit):'')+
      block('可能不適合／限制',(r.unfit||[]).length?bulletHtml(r.unfit):'')+
      block('申請文件（上游參考）',(r.docs||[]).length?bulletHtml(r.docs):'')+
      block('注意事項',(r.tips||[]).length?bulletHtml(r.tips):'')+
      block('來源與核查連結',sourceHtml)+
      '<div class="detail-footer-actions"><a class="button button-outline" href="'+esc(url(r.referenceUrl))+
      '" target="_blank" rel="noopener noreferrer">查看原始文件 ↗</a>'+
      '<button class="button button-primary" type="button" id="shareRoute">複製路線連結 ⧉</button></div></div>';
  }
  function openRoute(id,changeHash=true){
    const r=lookup.get(id);if(!r)return;
    $('routeDialogContent').innerHTML=detailHtml(r);
    const dialog=$('routeDialog');
    if(!dialog.open)dialog.showModal();
    if(changeHash)history.replaceState(null,'','#route='+encodeURIComponent(id));
    $('shareRoute').addEventListener('click',()=>shareRoute(id),{once:false});
  }
  function closeRoute(){
    const dialog=$('routeDialog');
    if(dialog.open)dialog.close();
    if(location.hash.startsWith('#route='))history.replaceState(null,'',location.pathname+location.search+'#explore');
  }
  async function shareRoute(id){
    const target=new URL(location.href);target.hash='route='+encodeURIComponent(id);
    try {await navigator.clipboard.writeText(target.href);toast('已複製可分享連結');}
    catch {window.prompt('複製以下路線連結',target.href);}
  }
  function showCompare(){
    const selected=state.compare.map(id=>lookup.get(id)).filter(Boolean);
    if(selected.length<2){toast('請至少選擇兩條路線');return;}
    const tableRows=[
      ['目的國',r=>r.flag+' '+r.country],['簽證類型',r=>r.typeLabel],
      ['護照適用性',r=>kind(r).text],['申請狀態',status],
      ['門檻／條件',r=>r.threshold||r.age||'請查官方'],['永久居留方向',r=>r.pr||prLabel(r)],
      ['家屬資訊',r=>r.family||'尚待核對'],['資料核查日期',r=>r.verified||'未標示'],
      ['資料來源',r=>r.sources.length+' 筆可追溯連結']
    ];
    $('compareDialogContent').innerHTML='<div class="comparison-body"><h2>並排比較你的選擇</h2>'+
      '<p>僅供研究對照。上游「可能永居」並不代表符合申請資格，實際門檻請以官方當期公告為準。</p>'+
      '<div class="comparison-scroll"><table class="compare-table"><thead><tr><th scope="col">比較項目</th>'+
      selected.map(r=>'<th scope="col">'+esc(r.flag)+' '+esc(r.name)+'</th>').join('')+
      '</tr></thead><tbody>'+tableRows.map(([title,fn])=>'<tr><th scope="row">'+esc(title)+'</th>'+
      selected.map(r=>'<td>'+esc(fn(r))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></div>';
    $('compareDialog').showModal();
  }
  function actionHandler(event){
    const action=event.target.closest('[data-action]');
    if(!action)return;
    const id=action.dataset.id;
    if(action.dataset.action==='open')openRoute(id);
    if(action.dataset.action==='save')saveRoute(id);
    if(action.dataset.action==='compare')compareRoute(id);
  }
  function attachEvents(){
    document.querySelectorAll('[data-passport]').forEach(b=>b.addEventListener('click',()=>setPassport(b.dataset.passport)));
    $('heroVerified').addEventListener('click',()=>{
      setPassport('tw');state.verify='checked';$('verifyFilter').value='checked';renderResults();
      $('explore').scrollIntoView({behavior:'smooth'});
    });
    $('searchInput').addEventListener('input',event=>{state.query=event.target.value;state.visible=12;renderResults();});
    $('countryFilter').addEventListener('change',event=>{state.country=event.target.value;state.visible=12;renderResults();});
    $('verifyFilter').addEventListener('change',event=>{state.verify=event.target.value;state.visible=12;renderResults();});
    $('prFilter').addEventListener('change',event=>{state.pr=event.target.value;state.visible=12;renderResults();});
    $('statusFilter').addEventListener('change',event=>{state.status=event.target.value;state.visible=12;renderResults();});
    $('savedOnly').addEventListener('change',event=>{state.savedOnly=event.target.checked;state.visible=12;renderResults();});
    $('sortBy').addEventListener('change',event=>{state.sort=event.target.value;renderResults();});
    $('typeChoices').addEventListener('click',e=>{
      const b=e.target.closest('[data-type]');if(!b)return;
      state.type=b.dataset.type;state.visible=12;syncFilterButtons();renderResults();
    });
    $('regionChoices').addEventListener('click',e=>{
      const b=e.target.closest('[data-region]');if(!b)return;
      state.region=b.dataset.region;state.visible=12;syncFilterButtons();renderResults();
    });
    $('resetFilters').addEventListener('click',resetFilters);
    $('emptyReset').addEventListener('click',resetFilters);
    $('loadMore').addEventListener('click',()=>{state.visible+=12;renderResults();});
    $('toggleFilters').addEventListener('click',()=>{$('filtersPanel').classList.toggle('open');});
    $('featuredGrid').addEventListener('click',actionHandler);
    $('routeGrid').addEventListener('click',actionHandler);
    $('countryTabs').addEventListener('click',e=>{
      const b=e.target.closest('[data-tab]');if(b)setCountryTab(b.dataset.tab);
    });
    $('countryGrid').addEventListener('click',e=>{
      const b=e.target.closest('[data-country]');if(!b)return;
      state.country=b.dataset.country;state.region='all';state.visible=12;
      $('countryFilter').value=state.country;
      syncFilterButtons();renderResults();
      $('explore').scrollIntoView({behavior:'smooth'});
    });
    $('compareSelected').addEventListener('click',e=>{
      const b=e.target.closest('[data-remove-compare]');if(b)compareRoute(b.dataset.removeCompare);
    });
    $('clearCompare').addEventListener('click',()=>{state.compare=[];renderResults();});
    $('openCompare').addEventListener('click',showCompare);
    $('closeDetail').addEventListener('click',closeRoute);
    $('closeCompare').addEventListener('click',()=>$('compareDialog').close());
    $('routeDialog').addEventListener('click',e=>{if(e.target===$('routeDialog'))closeRoute();});
    $('compareDialog').addEventListener('click',e=>{if(e.target===$('compareDialog'))$('compareDialog').close();});
    $('routeDialog').addEventListener('close',()=>{
      if(location.hash.startsWith('#route='))history.replaceState(null,'',location.pathname+location.search+'#explore');
    });
    document.addEventListener('keydown',e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();$('explore').scrollIntoView();$('searchInput').focus();
      }
    });
    window.addEventListener('hashchange',()=>{
      if(!catalog)return;
      if(location.hash.startsWith('#route=')){
        const id=decodeURIComponent(location.hash.slice(7));openRoute(id,false);
      }else if($('routeDialog').open)$('routeDialog').close();
    });
  }
  function initStats(){
    const {counts}=catalog;
    for(const [key,value] of [
      ['heroCountryCount',counts.countries],['heroRouteCount',counts.routes],
      ['statCountries',counts.countries],['statRoutes',counts.routes],
      ['statTaiwan',counts.taiwanChecked]
    ])$(key).textContent=value.toLocaleString('zh-TW');
  }
  async function start(){
    attachEvents();
    try{
      const response=await fetch('/data/catalog.json',{cache:'no-cache'});
      if(!response.ok)throw Error('HTTP '+response.status);
      catalog=await response.json();
      if(catalog.schemaVersion!==2||!Array.isArray(catalog.routes))throw Error('資料格式不相容');
      lookup=new Map(catalog.routes.map(r=>[r.id,r]));
      initStats();renderChoices();renderFeatured();renderCountries();setPassport(state.passport);
      if(location.hash.startsWith('#route=')){
        const id=decodeURIComponent(location.hash.slice(7));
        if(lookup.has(id))openRoute(id,false);
      }
    }catch(error){
      console.error('Failed to load migration catalogue',error);
      $('routeGrid').innerHTML='<div class="loading-state">資料載入失敗。請確認 Cloudflare Pages 的建置指令為 npm run build，輸出目錄為 dist，然後重新整理。</div>';
      $('featuredGrid').innerHTML='<div class="loading-state">暫時無法載入路線資料。</div>';
      $('resultCount').textContent='0';
      toast('資料載入失敗，請檢查部署設定');
    }
  }
  start();
})();
