# COZ COS CLOSET 管理後台

後台網址：`https://cos-closet-production.up.railway.app/admin`

## 啟用管理員

在 Railway 服務 Variables 設定：

```
ADMIN_GOOGLE_EMAILS=dennis02101014@gmail.com,yixuan9512@gmail.com
```

必須使用名單內帳號的 **Google 登入**。管理員由伺服器檢查已驗證的 Google 身分與 Email；未設定名單時不開放任何管理員。LINE、Apple 或同名帳號不會因此取得權限。登入後在探索衣櫃右上方點「管理後台」，或直接開啟 `/admin`。

Google 登入會儲存已驗證身分提供的頭貼網址，並在衣櫃與後台顯示。既有帳號請重新登入一次；沒有頭貼或圖片載入失敗時顯示姓名首字。新增 `0004_google_profile_picture.sql` 遷移只加入可空的頭貼欄位，保留既有帳號與租借資料。

## 功能

- 總覽服裝、上架中、會員、待確認與已確認租借數量。
- 依服裝／出租者搜尋；管理下架與恢復上架必須填原因。
- 管理下架阻止新租借申請，出租者無法自行重新上架。既有租借不會自動取消。
- 搜尋租借紀錄，可取消待確認或已確認租借。取消已確認租借後會釋放租期；**不會自動退款或取消物流**，管理員須先聯絡双方。
- 查詢會員資料、上架與租借數量。
- 操作紀錄保留管理員、時間、目標編號與原因。
- 搜尋結果每頁 30 筆，支援手機、深淺色與中英文介面。

## 部署與資料

使用 Node.js 24+。首次安裝執行 `npm ci`，開發 `npm run dev`，正式環境 `npm run build` 後 `npm start`。啟動時自動執行資料庫遷移 `0003_admin_management.sql`；既有資料不會刪除。Railway 必須保留 `/data` volume，並設定 `DATA_DIR=/data`、`SITE_URL` 與既有 Google OAuth 憑證。

正式更新前備份 SQLite 資料與照片 volume。GitHub 僅存放程式碼，切勿上傳 `.env`、OAuth Secret、session 資料或 `.data`。移除管理員時修改 `ADMIN_GOOGLE_EMAILS` 並重新部署；每次後台請求都重新檢查名單。
