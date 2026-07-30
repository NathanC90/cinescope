[English](README.md) | **繁體中文**

# CineScope

一個電影探索應用：瀏覽熱門片單、搜尋、開啟詳細頁，並建立重新整理後依然存在的待看清單。以
React、TypeScript 與 Vite 打造。

## 特點

- **除了 React 之外沒有任何執行時期依賴。** 路由、資料取得、主題與資料保存各自都只用約 40 行
  應用程式碼實作，而不是引入套件，因此打包後僅約 65 kB（gzip），也沒有需要稽核的依賴樹。
- **可深層連結的路由。** `#/movie/5` 與 `#/watchlist` 都能分享、重新整理後仍有效；在靜態代管
  上，若改用 History API 的路徑形式，沒有伺服器 rewrite 就會出現 404。
- **不會有請求競態。** 所有 fetch 都經過 `useAsync`，它會中止被取代的請求，因此較慢的搜尋回應
  不會覆蓋較新的結果。
- **預設就無障礙。** 跳至主要內容連結、可見的焦點樣式、收藏切換鈕上的 `aria-pressed`、有標籤的
  搜尋輸入框、載入時的 `aria-busy`，骨架動畫也遵循 `prefers-reduced-motion`。
- **淺色與深色主題。** 預設跟隨作業系統，使用者選擇後便記住其偏好。
- **確實可用的載入與空狀態。** 骨架畫面的尺寸與它所替代的卡片相同，因此內容載入時版面不會跳動。

## 執行方式

```bash
npm install
npm run dev
```

專案內附本機示範資料，因此不需任何設定即可執行。

若要載入即時資料，請將它指向代理 Worker（見下節）——`VITE_API_BASE` 是公開網址，不是憑證：

```bash
cp .env.example .env
# 然後設定 VITE_API_BASE=https://<your-worker>.workers.dev
```

## TMDB key 永遠不會進到瀏覽器

Vite 應用若直接呼叫 TMDB，就必須把 API key 打包進前端，任何人都讀得到。所以這個專案不這麼做：
`worker/` 是一個小型的 Cloudflare Worker，把 key 當作 secret 保管，並在伺服器端轉發請求。

它不是開放的中繼站。只有本應用實際使用的三個端點可被存取、只有允許清單上的來源可以呼叫、未知的
查詢參數會被丟棄，而且來源允許清單缺失時會以拒絕為預設。回應會在邊緣節點快取，因此重複瀏覽不會
再向 TMDB 發出請求。

部署方式：

```bash
cd worker
npx wrangler deploy
npx wrangler secret put TMDB_KEY   # 會提示輸入 key；不會存進版本庫
```

接著在 `worker/wrangler.toml` 中把 `ALLOWED_ORIGINS` 設為你自己的來源，並把 Worker 網址加為名為
`API_BASE` 的 repo variable，讓部署流程能取用：

```bash
gh variable set API_BASE --body "https://<your-worker>.workers.dev"
```

## 檢查

```bash
npm run check   # 針對純邏輯的 assert 自我檢查
npm run lint    # oxlint
npm run build   # 型別檢查 + 生產環境建置
```

`npm run check` 涵蓋 hash 解析（錯誤 id、query string、來回轉換）、格式化輔助函式，以及 Worker
的路由與來源允許清單——也就是那些可能不拋出任何錯誤，卻悄悄產生錯誤輸出或洩漏資訊的邏輯。

## 結構

| 路徑 | 用途 |
| --- | --- |
| `src/lib/tmdb.ts` | 資料層；把 API 結構轉成適合 UI 的領域型別，並可退回示範資料 |
| `src/lib/useRoute.ts` | Hash 路由 |
| `src/lib/useAsync.ts` | Fetch 生命週期：載入、錯誤、中止 |
| `src/lib/useWatchlist.ts` | 以 localStorage 為底、透過 `useSyncExternalStore` 共享的 store |
| `src/lib/useTheme.ts` | 主題，預設跟隨系統並保存偏好 |
| `src/components/` | Header、MovieCard、MovieGrid、DetailView |
| `worker/` | Cloudflare Worker，代理 TMDB 以將 API key 留在伺服器端 |

電影資料來自 [TMDB](https://www.themoviedb.org/)。本產品使用 TMDB API，但未經 TMDB 認可或認證。
