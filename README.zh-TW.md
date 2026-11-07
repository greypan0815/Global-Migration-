# Global Migration｜全球移居手冊（臺灣／中國大陸雙入口）

> **2026-11-07 國別資格更新：** 德國藍卡例外、愛爾蘭兩年offer／相關學位、紐西蘭三分支及受理狀態已分開核查；詳見[本輪範圍與官方來源](docs/taiwan/eligibility-update-2026-11-07.md)。不是全152條當日驗證。

> **2026-11-06 選定台灣條件複核：** 上游無新增提交；補上 IEC 普通一次／RO 區別、YMS 排除與財力條件，並更正 DV 全面暫停的過度斷言。[本次研究與政府來源](docs/taiwan/research-2026-11-06.md)。不是全部152條當日查核。


**繁體中文臺灣護照入口｜首次適配：2026-10-30**

本專案 Fork 自 [BryceYuuu/RUN](https://github.com/BryceYuuu/RUN)，保留原有中國大陸護照的資料與署名，另外建立臺灣護照讀者可用的官方來源補充層。

> **重要範圍限制**：目前是臺灣適用性**第一版**，不是原有各國移民路線全部重新核對完成。原版國家頁面仍包含以中國大陸護照為基準的免簽數、限制、費用比較與文件流程；未經重新驗證的資料不可直接用來提交臺灣護照申請。

## ✳ 個人移民路徑適配分析（新增）

網站提供 [個人分析頁面 `/match.html`](https://global-migration.cryptotraderonme.workers.dev/match.html)（須先成功部署最新版 main）：填寫年齡、學歷、職業、語言、工作經驗、移居目標、海外雇主 offer 及薪資，立即看到不同路線的**自訂條件準備度、待補條件、硬性限制、官方來源**。亦提供澳洲 189 已有正式證明項目的**積分小計**；加拿大 CRS、紐西蘭 SMC、德國機會卡與英國 Skilled Worker 則連回相應官方制度。

**重要**：準備度分數是整理已知條件的指標，**不是**官方移民分數、獲邀概率、核准概率或法律意見。個人表單不儲存、不上傳；需申請時仍以官方網頁及個別正式審核為準。詳見 [分析方法說明](docs/taiwan/personal-matcher.md)。

## 🌐 靜態互動網站（Cloudflare Pages）

本 Repository 新增**繁體中文互動網站**：可以搜尋約 150 條路線、按國家／簽證類型／臺灣護照核對狀態篩選，收藏及比較最多三條路線，並直接點開申請流程與來源。

**[Cloudflare Pages 一鍵部署設定與操作教學](docs/DEPLOY-CLOUDFLARE-PAGES.md)**

專案採原生 HTML／CSS／JavaScript，透過 `npm run build` 產生 `dist/`。Cloudflare Pages 設定：**Build command = `npm run build`、Output = `dist`、Production branch = `main`**。初次部署仍需在你的 Cloudflare 帳號授權連接此 GitHub Repository。

## 🇨🇦🇬🇧🇧🇪 2026-11-03 官方政策同步

已依 IRCC、GOV.UK、歐盟委員會官方來源更新 [加拿大 CRS／英國 Earned Settlement／比利時 EU Blue Card 專頁](docs/taiwan/november-2026-policy-update.md)。

- **加拿大 Express Entry：** 11/03 新 Labour Market Integration 因子生效，合格加拿大工作經驗或高薪 NOC job offer 擇高計分、不可相加，LMIA 不再是合格 offer 的必要條件；重算期間暫停邀請輪次。
- **英國 Skilled Worker／Global Talent／HPI：** 11/02 公布 Earned Settlement 政策，但**現行 ILR 法律及後續正式實施日須分開**；不能直接說所有人都已改十年。
- **比利時 EU Blue Card：** 歐盟官網列完整申請審理上限 90 天，不等於保證核發。
- **2026/11 更新後：** 152 條路線不變、26 條部分欄位有政府核查、126 條仍待逐項驗證，個人適配模型仍為 26 條。

## 官方政策核查更新（2026-10-30）

- 152 條路線可搜尋，目前 **26 條優先路線的部分欄位**附有政府來源與核查日期；其餘 126 條仍需審查（新增 2026-11-03 加拿大、英國、比利時核查）。
- **10 條**路線有臺灣適用國籍／地區的官方明確依據（含捷克 Digital Nomad Program），不代表其它 140 條不適用。
- 2026 加拿大 IEC 已關閉候選人池；英國 YMS 及紐西蘭台灣打工度假已結束當年度窗口。
- [軟體工程師直接海外就業指南](docs/taiwan/tech-employment.md) ｜ [官方核查方式及證據品質](docs/taiwan/audit-methodology.md)

## 🎟️ 2026-10-31 增補：美國 DV 綠卡樂透與 J-1 交流簽證

已新增 [美、加、英抽籤／打工度假制度比較](docs/taiwan/lotteries-and-youth-visas.md)，網站可搜尋獨立的「美國 DV 綠卡樂透」與「美國 J-1 Summer Work Travel」路線。

- **加拿大 IEC：** 2026 候選池已結束；**英國 YMS：** 2026 兩次 ballot 已結束。
- **美國 DV：** 不是 Working Holiday。依出生地（非單純護照）及教育／合格職業資格；官方未受理新 DV 登記，核發頁已有舊暫停失效的新說明，殘留舊文造成狀態需另核實。
- **美國 J-1 Summer Work Travel：** 合格全職大專院校學生的暑期交流，最長四個月，不是已畢業者通用的打工度假。
- 本版資料庫為 **152 條路線**，個人適配問卷提供 **26 條**具專屬模型的研究選項，其餘 126 條仍可查看。

## 從這裡開始

- **[🇹🇼 臺灣護照專區：官方已確認的路線、限制、後續 PR 方向](docs/taiwan/README.md)**
- **[🇨🇦 加拿大 IEC：WH／YP／RO → CEC／PNP 研究方向](docs/taiwan/canada-iec.md)**
- **[📑 臺灣申請人文件準備：戶籍／學歷／工作經驗／驗證](docs/taiwan/documents.md)**
- **[📊 臺灣適用性資料 CSV](data/taiwan_applicability.csv)**
- [🧭 原版選路指南（含中國大陸護照專屬限制）](docs/routes/choose-route.md)
- [🌏 全球國家總覽](docs/global/README.md) ／ [🇪🇺 歐洲 36 國](docs/europe/README.md)

## 首輪確認的臺灣身分差異

| 國家 | 路線 | 需要知道的差異 |
|---|---|---|
| 加拿大 | IEC | 臺灣可申請 WH、YP、International Co-op，**2026 申請季已關閉**；PR 要另行符合移民條件 |
| 美國 | E-1／E-2 | 美國官方條約名單包含臺灣；不是一般求職／永久居留簽證 |
| 捷克 | Digital Nomad Program | 台灣列入官方適用名單，但有 IT／行銷專業、僱傭或自由業等資格限制 |
| 英國 | YMS | 臺灣需 ballot；2026 年官方已公告抽選結束 |
| 日本 | Working Holiday | 臺灣可參加，自 2026 年 2 月起可終身兩次（各 1 年） |
| 澳洲 | subclass 417 | 臺灣一般護照列入 417，不能與 462 混淆 |
| 紐西蘭 | Taiwan Working Holiday | 額外要求臺灣戶籍證明；2026 年度申請已關閉 |

官方連結、年齡、限制與查核日期請以 [臺灣護照專區](docs/taiwan/README.md) 為準。

## 如何使用這份資料？

先選擇 **臺灣**或**中國大陸**的護照身分，再分開確認申請資格、就業簽證、合法工作經驗、永久居留與入籍。此專案會保留尚待驗證的標記；切勿把簡體中文原版中的「中國不適用」自動套到臺灣。

文件內容採 [CC BY-SA 4.0](LICENSE)，程式採 [MIT](LICENSE-CODE)。所有規劃應回到目的國政府當期公告。
