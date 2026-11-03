# 🇹🇼 2026 年 11 月政策更新：加拿大、英國與比利時

> 最後政策欄位核查：**2026-11-03**。本頁由政府第一手來源整理。只更新所列路線的部分法律／積分欄位，並不代表網站 **152 條路線**均已在今天逐條驗證。

[台灣護照專區](README.md) ｜ [適配分析方法](personal-matcher.md) ｜ [政策核查原則](audit-methodology.md)

## 🇨🇦 加拿大 Express Entry：11/03 已生效

IRCC 已公布 [CRS 勞動市場整合因子新制](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html)：**2026-11-03** 生效。合格加拿大工作經驗（包含基本年資分與高薪職業經驗加分）及合格高薪 NOC 工作 offer **擇較高一種，不可相加**。

| 計分方式 | 條件與分數 |
|---|---|
| 加拿大合格工作經驗的基本年資分 | 有隨行配偶：1／2／3／4／5+ 年，35／46／56／63／70 分。無隨行配偶：40／53／64／72／80 分 |
| 符合高薪 NOC 至少 12 個月加拿大經驗 | 職類達 1.3／1.5／2.0 倍級距，額外 20／40／70 分，符合時加在上述基本工作年資分上 |
| 合格高薪職業的 job offer | 職類達 1.3／1.5／2.0 倍級距：50／70／100 分 |
| 勞動市場整合因子 | 加拿大經驗方案或 job offer 方案 **擇高**，不能將兩方案相加 |

**重要：高薪級距看的是 [IRCC 的 NOC 職業薪資中位數名單](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html)，不是個人的年薪。** 即使是軟體工程師，也不能只憑職稱或台幣／加幣薪資推測級距。

自 11/03 起，符合條件的 job offer 不再要求 **LMIA**，但移民官仍須確認職位真實、申請人合格、雇主具履約能力等。符合 FSW／FST 的計畫資格要求，也**不代表**該 offer 必然取得高薪 NOC 的 CRS 分。

IRCC 表示既有 Express Entry 檔案將重新計分，最多可能花兩週，**重算期間暫停邀請輪次**；這不等於永久停辦 Express Entry。

本站的 [前端適配分析](../../web/match.html) 只提供**使用者自行確認條件下的單一因子情境值**，並不產生完整 CRS。正式計分請使用 [IRCC CRS 工具](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html)。擁有 IEC 工作許可不等於所有工作都可計入 CRS／CEC；仍要核對工作地、NOC、工時等。

## 🇬🇧 英國 Earned Settlement：11/02 公布，不等於當天全面生效

| 時間與地位 | 內容 |
|---|---|
| **2026-11-03 現行 GOV.UK 法律頁** | [Skilled Worker 的 ILR](https://www.gov.uk/indefinite-leave-to-remain-tier-2-t2-skilled-worker-visa/time-uk) 仍列一般五年合格居留規定；另有 [Long Residence 十年合法居留途徑](https://www.gov.uk/long-residence) |
| **2026-11-02 政府政策公告** | [Earned Settlement](https://www.gov.uk/government/news/home-secretary-unveils-new-rules-for-migrants-settling-in-the-uk) 提出一般十年，新制依貢獻、收入及資格分三／五／十年等情況 |
| **後續具體實施** | 須等待正式 [Immigration Rules 修訂](https://www.gov.uk/government/collections/immigration-rules-statement-of-changes)、政府技術指引及必要過渡安排，申請時應使用實際生效規則 |

**Skilled Worker**：合格雇主、職務、英文及最低薪資要求仍需個別符合。不可因政策宣布就將目前所有申請人的 ILR 年限改為十年。

**Global Talent**：依現行 [GOV.UK 專屬規則](https://www.gov.uk/indefinite-leave-to-remain-business-investor-global-talent/eligibility)，特定背書／獎項類別可在三年、其他類別可能五年申請 ILR；**不是所有 Global Talent 一律三年**。

**HPI**：HPI 簽證本身不是直接定居途徑，也不能將 HPI 時間用於 Skilled Worker 等指定五年途徑。但現行獨立的 [Long Residence 規則](https://www.gov.uk/long-residence/eligibility) 可能計入符合條件的其他合法居留時間，故不能因新政策公布就聲稱「HPI／學生時間已完全不計入所有英國合法長居」。

網站已為相關路線加入**現行法規／已宣布改革**的政策時間軸，分開標示 2026-11-02 公布日期與尚待確認的完整生效日期。

## 🇧🇪 比利時 EU Blue Card：90 天審理期限

[歐盟官方 EU Blue Card Belgium](https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal/eu-blue-card/eu-blue-card-belgium_en) 已列出完整申請的**法定最長審理時間 90 天**。這不是保證 90 天內一定獲准、收到簽證或正式工作身分。

上游宣稱「2026 年 10 月才從 120 天縮短到 90 天」，本次**未找到足夠官方證據支持這個精確生效時間**，因此不將這項時間說法視為已核實。比利時各大區薪資門檻亦各不相同，需要向負責大區確認當期金額。

## 與原始 RUN 專案的同步方式

同步上游新增的政策概念與來源，但**不整批覆蓋** Fork 的台灣護照資料、2026 IEC／YMS／DV／J-1 受理狀態與本機個人適配模型。你會看到原本的 **152 條路線**維持不變，官方*特定欄位*稽核從 **24 條增加至 26 條**；其餘 **126 條**仍待逐條政府來源核對。

本文件為研究摘要，不保證個人符合任一簽證或永久居留申請要求。
