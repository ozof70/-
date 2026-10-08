# 啟用 Google 登入

Google 登入程式與登入頁已完成，但需要你的 Google Cloud 專案設定。未填入憑證時訪客可瀏覽，不能上架或租借。

1. 開啟 https://console.cloud.google.com/ 並建立或選擇你的專案。
2. 進入 Google Auth Platform，設定 Branding（應用程式名稱 COS CLOSET、支援 Email 等）與 Audience。供一般使用者使用時選 External；Testing 階段先加入你的測試 Google 帳號。
3. 在 Clients 建立 OAuth client，Application type 選 Web application。
4. 在 Authorized redirect URIs 加入網站的完整回呼網址：`https://cos-closet-production.up.railway.app/api/auth/google/callback`。必須完全一致，不能只填首頁。
5. 在 Railway 服務的 Variables 填入 GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、SITE_URL。SITE_URL 使用 `https://cos-closet-production.up.railway.app`，不能含 /login 或 /api 等路徑。
6. 部署變數變更，使用一般瀏覽器開啟網站登入頁，按「使用 Google 帳號登入」完成測試。
7. 依 Google Console 顯示的要求完成正式公開設定與需要的驗證。

請勿把 Client Secret 放入 Git、前端程式碼、NEXT_PUBLIC_* 或公開文件。網站只要求 openid、email、profile，無需開啟 Google Drive 或 Gmail 權限。

本機測試時可另加 http://localhost:5173/api/auth/google/callback；正式環境只接受 HTTPS 的 SITE_URL。請勿使用內嵌 WebView 測試 Google 授權，改用 Chrome、Safari 等一般瀏覽器。

官方文件：https://developers.google.com/identity/openid-connect/openid-connect
Railway 變數：https://docs.railway.com/variables
