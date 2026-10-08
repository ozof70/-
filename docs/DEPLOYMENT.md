# 部署與維護

公開網址：https://cos-closet-production.up.railway.app

Railway 管理：https://railway.com/project/75ced0b5-d449-49c6-918a-141dd071e20d

專案：cos-closet；環境：production；服務：cos-closet。

## 更新網站

在本專案根目錄（包含 Dockerfile 的資料夾）開啟 PowerShell，執行：

```powershell
npx --yes @railway/cli login
npx --yes @railway/cli link --project 75ced0b5-d449-49c6-918a-141dd071e20d --environment production --service cos-closet
npx --yes @railway/cli up
```

目前這台電腦的原始碼目錄為 `C:\Users\herba\Documents\Codex\2026-09-22\ji3\work`。已登入時可略過第一行。部署由 Dockerfile 執行安裝、建置和資料庫遷移；成功後仍使用同一個公開網址。

## 必要設定

- 公開網域導向 3000 port。
- DATA_DIR=/data，Volume 必須掛載到 /data。
- SITE_URL=https://cos-closet-production.up.railway.app。
- 健康檢查 /api/health；正常應顯示 `{"status":"ok"}`。
- SQLite 使用單一服務實例；不要增加 replica。
- Google 登入請依 GOOGLE_LOGIN.md 填入 GOOGLE_CLIENT_ID 與 GOOGLE_CLIENT_SECRET，並部署變數變更。

## 資料保存

SQLite 資料庫、登入紀錄和衣服照片均保存在 /data。重新部署程式不會清除此 Volume；刪除 Volume 則會失去資料。原始碼 ZIP 不含使用者資料，不能當作資料庫備份。

正式累積資料後，請在 Railway Volume 管理頁建立並確認可還原的備份。此部署已設定持久儲存，但尚未啟用自動備份。

## 部署驗證

2026-09-23：Railway 部署狀態 SUCCESS，公開首頁、健康檢查、服裝 API、登入頁和示範照片均回應正常。手機版檢查未發現橫向溢出。登入頁在缺少 Google 憑證時會明確顯示未啟用；真實 Google 帳號登入待憑證設定後驗證。

本機測試已涵蓋照片上傳與讀取、租借申請、權限限制、租期重疊、接受／取消及登出撤銷。沒有在正式資料庫建立測試租借。
