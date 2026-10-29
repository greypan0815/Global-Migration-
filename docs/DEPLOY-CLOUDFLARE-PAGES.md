# Cloudflare Pages 靜態網站部署教學

本專案已包含**零第三方依賴**的前端與 Node.js 22 靜態資料建置器：無資料庫、無 API 金鑰、無 Workers、無後端、無登入；適合直接連 GitHub 到 Cloudflare Pages。

## 一、正式部署（Git 自動部署）

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 前往 **Workers & Pages → Create application → Pages → Import an existing Git repository**。
3. 連接 GitHub 帳號，選擇 Repository：**\`greypan0815/Global-Migration-\`**。
4. 設定：

   | Cloudflare Pages 欄位 | 填寫內容 |
   |---|---|
   | Project name | \`global-migration\`（可自行命名，依 Cloudflare 可用名稱） |
   | Production branch | \`main\` |
   | Framework preset | **None** |
   | Root directory | 留空（Repository 根目錄） |
   | Build command | **\`npm run build\`** |
   | Build output directory | **\`dist\`** |
   | Node.js version | **22**（Cloudflare v3 預設；可設 \`NODE_VERSION=22\`） |

5. 按下 **Save and Deploy**。正式部署成功後 Cloudflare 會提供一個實際的 \`*.pages.dev\` 網址。
6. 後續你只要把 PR 合併到 **main**，Cloudflare Git 整合就會重新建置並部署正式站；非正式分支可產生預覽部署（依你的 Branch controls 設定）。

**本專案尚未幫你在 Cloudflare 帳號建立 Pages 專案**，上面是部署設定，不代表已經有公開網址。部署成功前勿猜測 \`pages.dev\` URL。

## 二、專案如何運作

\`\`\`text
data/programmes.json          ┐ 99 條原版歐洲路線
src/extra_routes.json         ├ 11 條額外歐洲路線
src/global.json               ├ 31 條全球路線
src/details/*.json            ├ 步驟、條件、申請文件
data/taiwan_applicability.csv ┘ 9 筆臺灣官方資格紀錄
             │
             ▼
  scripts/build_site.mjs
             │
             ▼
dist/index.html / app.js / styles.css
dist/data/catalog.json
             │
             ▼
      Cloudflare Pages
\`\`\`

網站會在 **build 時讀取 Repository 內的資料**，不是瀏覽器每次打開都呼叫 GitHub API。更新現有 JSON 或 CSV 後，下一次 Pages 建置就會更新路線清單。

- **用戶端**：HTML、CSS、原生 JavaScript；沒有 framework、第三方 CDN、追蹤或 cookie。
- **功能**：護照視角切換、關鍵字、國家與簽證類型篩選、臺灣資格標記、永久居留上游分類、收藏（僅存於你的瀏覽器）、最多三條路線比較、手機版、可分享路線 URL。
- **資料安全**：路線與外部來源以純文字／已轉義字串渲染；不會把外部網站 HTML 注入頁面。

## 三、本機執行

在具備 Node.js 22 的電腦：

\`\`\`bash
git clone https://github.com/greypan0815/Global-Migration-.git
cd Global-Migration-
npm test
npm run build
npm run dev
\`\`\`

瀏覽 \`http://localhost:4173\`。只想檢查 build，可以執行 \`npm run build\`，輸出在 \`dist/\`。

**注意**：不要直接雙擊 \`index.html\` 以 \`file://\` 開啟，因為瀏覽器需透過 HTTP 載入 \`/data/catalog.json\`。

## 四、常見問題

- **首頁顯示資料載入失敗**：確認 Pages 的 **Build command 是 \`npm run build\`**、輸出目錄是 **\`dist\`**，並檢查 Deployments → Build logs。
- **根路徑 404**：確認建置輸出存在 \`dist/index.html\`，不是設定成 \`web\` 或 Repository 根目錄。
- **GitHub 權限問題**：在 Cloudflare Git 整合中授權該 Repository；私人 Repo 亦需在 GitHub App 中提供該 Repo 存取權。
- **資料沒有更新**：確認修改進入 production branch，且 Cloudflare 沒有設定忽略變更路徑；本專案的 catalog 於 build 時產生。
- **篩選結果不同**：臺灣「已核對」只涵蓋特定國籍適用性，**並不等於所有其他路線無法申請**；原版資料來源以中國大陸護照為基準。
- **部署沒有要求 npm install？**：專案沒有第三方 Node dependencies，因此不需要 \`node_modules\`。

## 五、參考

- [Cloudflare Pages Git Integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages build image](https://developers.cloudflare.com/pages/configuration/build-image/)

文件與資料沿用上游 [BryceYuuu/RUN](https://github.com/BryceYuuu/RUN) 的 CC BY-SA 4.0；腳本依 MIT 授權。所有數字與移民法律須以目的國當期官方公告為準。
