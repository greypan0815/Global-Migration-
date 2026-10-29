# Global Migration｜全球移居手冊（臺灣／中國大陸雙入口）

**繁體中文臺灣護照入口｜首次適配：2026-10-30**

本專案 Fork 自 [BryceYuuu/RUN](https://github.com/BryceYuuu/RUN)，保留原有中國大陸護照的資料與署名，另外建立臺灣護照讀者可用的官方來源補充層。

> **重要範圍限制**：目前是臺灣適用性**第一版**，不是原有各國移民路線全部重新核對完成。原版國家頁面仍包含以中國大陸護照為基準的免簽數、限制、費用比較與文件流程；未經重新驗證的資料不可直接用來提交臺灣護照申請。

## 🌐 靜態互動網站（Cloudflare Pages）

本 Repository 新增**繁體中文互動網站**：可以搜尋約 150 條路線、按國家／簽證類型／臺灣護照核對狀態篩選，收藏及比較最多三條路線，並直接點開申請流程與來源。

**[Cloudflare Pages 一鍵部署設定與操作教學](docs/DEPLOY-CLOUDFLARE-PAGES.md)**

專案採原生 HTML／CSS／JavaScript，透過 `npm run build` 產生 `dist/`。Cloudflare Pages 設定：**Build command = `npm run build`、Output = `dist`、Production branch = `main`**。初次部署仍需在你的 Cloudflare 帳號授權連接此 GitHub Repository。

## 官方政策核查更新（2026-10-30）

- 150 條路線可搜尋，但僅 **22 條優先路線的部分欄位**經官方資料比對；其餘 128 條仍需審查。
- **10 條**路線有臺灣適用國籍／地區的官方明確依據（含捷克 Digital Nomad Program），不代表其它 140 條不適用。
- 2026 加拿大 IEC 已關閉候選人池；英國 YMS 及紐西蘭台灣打工度假已結束當年度窗口。
- [軟體工程師直接海外就業指南](docs/taiwan/tech-employment.md) ｜ [官方核查方式及證據品質](docs/taiwan/audit-methodology.md)

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
