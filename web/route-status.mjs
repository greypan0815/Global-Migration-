/** One canonical application-state vocabulary for build output, cards and filtering.
 * "No fixed season" is NOT a claim that this applicant can submit now.
 * Visa issuance is deliberately excluded from this registration/application state.
 */
export const APPLICATION_STATES=Object.freeze({
 registration_not_open:'新登記尚未開放',season_closed:'當期申請／抽選已結束',paused:'暫停新申請',
 invitation_based:'邀請制／等待獲邀',quota_and_check:'配額制／需核對窗口',priority_date_based:'按優先日期／排期',
 no_fixed_season:'非固定申請季／仍須合格條件',check_official:'受理窗口待官方確認',
 legacy_open:'上游標示開放／未核實現況',legacy_closed:'上游標示停止／待複核',unknown:'申請狀態尚未確認'
});
export function applicationState(route){
 const official=route?.audit?.window?.state;
 if(official)return Object.hasOwn(APPLICATION_STATES,official)?official:'unknown';
 const legacy={upstream_open:'legacy_open',closed:'legacy_closed',closed_window:'season_closed',check_window:'check_official',registration_not_open:'registration_not_open'};
 return legacy[route?.status]||'unknown';
}
export function applicationLabel(route){return APPLICATION_STATES[applicationState(route)];}
export function applicationFilterOptions(routes=[]){
 const counts=new Map();for(const r of routes){const state=applicationState(r);counts.set(state,(counts.get(state)||0)+1);}
 return Object.entries(APPLICATION_STATES).filter(([key])=>counts.has(key)).map(([value,label])=>({value,label,count:counts.get(value)}));
}
export function applicationUnavailable(route){return ['registration_not_open','season_closed','paused','legacy_closed'].includes(applicationState(route));}
