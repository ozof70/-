# SEO 與 Google 搜尋收錄

公開網址： https://cos-closet-production.up.railway.app/

## 網站端

- 首頁與探索頁使用不同標題、描述與 canonical。
- 首頁有可讀的品牌、Cosplay 租借與分享介紹，伺服器輸出 WebSite、WebPage 與 Organization JSON-LD。
- 探索页的公開上架商品由伺服器輸出 HTML；會員與私人租借仍由授權 API 載入。
- `/robots.txt` 開放公開頁面與必要資源，提供 sitemap 位置。
- `/sitemap.xml` 只包含首頁與探索頁。登入、後台加上 noindex；會員資料不進 sitemap。
- `/opengraph-image` 產生 1200×630 PNG 分享圖。
- `GOOGLE_SITE_VERIFICATION` 是 Search Console HTML tag 的 content 值，需在 Railway 設定並持續保留。
- 深淺色與語言切換不會覆蓋各頁專用的 SEO 標題。語言切換使用 cookie，目前沒有獨立語系網址，因此沒有設定虛假的 hreflang。

## Search Console

使用網站管理員帳號建立 **URL prefix**：`https://cos-closet-production.up.railway.app/`。無須驗證整個 railway.app 網域。

1. 使用 HTML tag 驗證所有權。
2. Sitemaps 提交 `https://cos-closet-production.up.railway.app/sitemap.xml`。
3. URL inspection 檢查首頁，執行 Test live URL，確認允許收錄，再 Request indexing。探索頁可同樣檢查。
4. 之後查看 Page indexing 報告與 Search results 成效。新網站的資料需等待 Google 抓取；已提交不等於已收錄或保證排名。

Google 官方： https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl

網址與品牌請保持一致。在自己的公開社群頁或 GitHub 放網站連結，有助訪客與搜尋引擎發現。日後使用自有網域時，需同步更新 `lib/seo.ts`、OAuth callback、SITE_URL、Search Console 與舊網址轉址。

## 檢查

`node scripts/check-seo.mjs https://cos-closet-production.up.railway.app` 可檢查公開頁 metadata、JSON-LD、網站地圖、分享圖和登入頁 noindex。這只驗證技術設定，不能證明 Google 已收錄。
