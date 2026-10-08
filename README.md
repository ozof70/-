# COZ COS CLOSET｜共用衣櫃

手機優先、繁體中文的 Cos 服裝租借網站。正式部署目標為 Railway。

## 已實作
服裝搜尋／篩選／排序、照片上傳、衣主上下架、租借申請、接受／婉拒、取消申請、租金與押金顯示、租期重疊保護。桌機四欄、手機兩欄與底部導覽。

Google 登入採 OAuth 授權碼與 PKCE、state／nonce 校驗、Google JWT 簽章驗證、七天伺服器工作階段與登出撤銷。不使用 Email 當作身分主鍵，不將 Google Client Secret 或 token 放到前端。尚未設定憑證時明確顯示未啟用。

## 本機執行

需要 Node.js 24 以上。

```sh
npm ci
npm run dev
```

預設 http://localhost:5173 。資料庫與上傳照片在 .data/，啟動時會執行尚未套用的 Drizzle SQL 遷移。已有的遷移不可修改。

## Railway 部署

目前網站已部署： https://cos-closet-production.up.railway.app

管理專案： https://railway.com/project/75ced0b5-d449-49c6-918a-141dd071e20d

production 服務使用 `/data` Volume、單一 replica、HTTPS 公開網域及 `/api/health` 健康檢查。更新現有網站請參閱 [部署與維護](docs/DEPLOYMENT.md)，不需要再建立專案。

以下步驟僅供新環境使用：

1. 建立空白專案與服務，使用本目錄的 Dockerfile。
2. 為服務加入 Volume，掛載在 /data；執行一個 replica。
3. 設定 DATA_DIR=/data。Dockerfile 已有預設值。
4. 部署後為服務產生公開網域，目標 port 為 3000，健康檢查 /api/health。
5. Google 登入依 docs/GOOGLE_LOGIN.md 設定。

SQLite 資料庫、登入工作階段與照片都放在同一持久化 Volume，重新部署會保留。此架構適合目前單一服務的 MVP；水平擴充前請遷移到共用資料庫與物件儲存。

未掛載 Volume 時，Railway 的啟動程序會直接停止，避免在暫存容器裡接受上架資料。

## 設定值

- GOOGLE_CLIENT_ID：Google OAuth 網頁應用程式 Client ID。
- GOOGLE_CLIENT_SECRET：Google OAuth Client Secret，僅放在 Railway 的環境變數。
- SITE_URL：完整 HTTPS 網站 origin，不帶路徑；省略時使用 Railway 的 RAILWAY_PUBLIC_DOMAIN。
- DATA_DIR：持久化資料目錄，Railway 使用 /data。

## 本版界線

未接線上金流、押金代收／退款、物流、站內聊天或租借爭議處理。示範商品使用 AI 生成照片且不可提出真實申請。

Google OAuth 程式已完成，但需要網站擁有者建立 Google Cloud 憑證後，才能完成真實帳號端到端登入驗證。

## 技術

Next.js、React、TypeScript、Tailwind、Radix、Node.js SQLite、Drizzle SQL 遷移、jose。

主要介面：app/closet.tsx。Google 登入：app/api/auth/google/。工作階段：lib/auth.ts。資料存取：db/raw.ts。持久化照片：lib/runtime-env.ts。

## 管理後台

`/admin` 提供服裝上下架、租借取消、會員查詢與操作紀錄。僅指定 Google 管理員可使用；設定與操作方式見 [管理後台說明](docs/ADMIN.md)。

## Google 搜尋與 SEO

公開頁面提供專屬 metadata、canonical、品牌 JSON-LD、網站地圖、robots.txt 與 PNG 分享圖。Search Console 設定、收錄檢查與驗證指令見 [SEO 說明](docs/SEO.md)。
