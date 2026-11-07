# 2026-11-07：個人適配資格完整性更新

這次按使用者要求修正德國、愛爾蘭、紐西蘭與受理狀態篩選，並不是宣稱全152條今日均查核。仍有26條部分欄位官方證據、126條未完成全面審查；原checkedAt保留，補查放lastRecheckedAt與fieldChecks。

## 德國 EU Blue Card

將一般、緊缺職業、近三年畢業、IT經驗四途徑分開。2026一般€50,700；合格低門檻分支€45,934.20。IT無正式學位可核對最近七年至少三年大學層級、為職務所需的經驗，不再因無學位或低於一般薪資而一律扣分。六個月offer、BA及執照必要條件分開呈現。

來源：[德國官方藍卡](https://www.make-it-in-germany.com/en/visa-recognition/visa-types/eu-blue-card)、[聯邦就業局2026說明](https://www.arbeitsagentur.de/vor-ort/zav/working-and-living-in-germany/iss-en/issue-03-2026/blue-card)。

## 愛爾蘭 Critical Skills

兩年offer是必要條件，不再只憑職類、任何學士和年薪判斷。區分清單＋相關學位、近12個月資格、高薪（不得在排除清單）與特殊例外。高薪無學位者需必要經驗，不直接排除。短offer可研究General Employment Permit，但不保證該途徑一定可申請。

**官方資料差異：** CSEP專頁列€40,904／€36,848，年度MAR表列€40,909／€36,849。網站不將差額區間判為符合，不任選較有利數字。€68,911精確邊界因「over」與門檻措辭亦需主管確認；高於數字不代表職位和雇主都合格。

來源：[CSEP](https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/)、[MAR表](https://www.enterprise.gov.ie/en/what-we-do/workplace-and-skills/economic-migration-policy/minimum-annual-remuneration/)、[GEP](https://www.enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/general-employment-permit/)。

## 紐西蘭 SMC

分開積分、技術工作經驗、技工／技術人員。Red與Amber僅在適用的工作經驗途徑套用，不擴大成所有SMC禁止。一般經驗檢查前段3年與額外NZ2年；Amber前段也須NZ相關經驗並有1.2倍薪資要求。技工為資格後2.5年加額外NZ1.5年及專屬清單；依官方追溯期限、不重複年資。

問卷要求實際ANZSCO、技能等級、雇主認可、工時、聘僱形式、時薪基準日期、歷史證據。薪資採官方表列數字，避免如33.56×1.1自行四捨五入成36.92而與官方36.91不一致。使用者聲明的基準仍需主管審查，不是選較低舊年度便能取得資格。積分路徑不自行把所有學歷／收入／註冊加在一起，也不聲稱提供完整官方SMC計分。

來源：[SR3.35](https://www.immigration.govt.nz/opsmanual/90257.htm)、[SR3.40](https://www.immigration.govt.nz/opsmanual/90261.htm)、[SR3.25](https://www.immigration.govt.nz/opsmanual/80474.htm)、[SR3.10](https://www.immigration.govt.nz/opsmanual/77812.htm)、[Red/Amber](https://www.immigration.govt.nz/live/resident-visas-to-live-in-new-zealand/skilled-residence-pathways-in-new-zealand/skilled-migrant-category-pathway-to-residence/red-and-amber-list-occupations/)、[適用薪資](https://www.immigration.govt.nz/live/resident-visas-to-live-in-new-zealand/skilled-residence-pathways-in-new-zealand/skilled-migrant-category-pathway-to-residence/pay-rates-for-the-skilled-migrant-category-resident-visa/)。

## 受理狀態與評分界線

卡片、搜尋、篩選、比較與建置輸出使用同一份derived applicationStatus，將未開放、本季結束、暫停、邀請、配額、排期、非固定季、待查以及上游未核實標記分開。非固定季不叫「已核實開放」，DV報名與核發仍分開。舊欄位保留相容，不再直接用它蓋過較新的audit.window。

新增必要條件若未知／未滿足，不能只靠其他條件高分就成為優先研究。資格分支不符也不等於其他簽證永久失格。所有輸入仍只在瀏覽器記憶體，無上傳或持久儲存。研究準備度不是核准機率、正式政府積分或法律判決。
