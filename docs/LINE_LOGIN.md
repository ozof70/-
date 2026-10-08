# LINE 登入設定

1. 在 https://developers.line.biz/console/ 建立 Provider，再建立 **LINE Login** Channel，App types 選 **Web app**。
2. Channel 名稱填 COZ COS CLOSET，補上自己的聯絡 Email、網站介紹與隱私政策。
3. LINE Login 頁籤的 Callback URL 填：
   https://cos-closet-production.up.railway.app/api/auth/line/callback
4. Basic settings 申請 **Email address permission**。網站使用姓名與 Email 建立帳號、提供租借聯絡方式；請依 LINE 要求提供告知畫面截圖。尚未核准時不要啟用正式登入。
5. Railway 此服務 Variables 新增：
   - LINE_CHANNEL_ID：Basic settings 的 Channel ID
   - LINE_CHANNEL_SECRET：Basic settings 的 Channel secret（僅存 Railway，不貼聊天或提交程式庫）
   - SITE_URL：https://cos-closet-production.up.railway.app（已有則沿用）
6. 儲存並部署 Railway，LINE Login 按鈕即啟用。先用 Channel 管理員／測試者測試同意、取消、重新登入。
7. 測試完成後將 LINE Channel 切換 Published，才開放一般使用者。

尚無 Channel 時，按鈕維持停用「準備中」。程式使用 state、nonce、PKCE、伺服器 ID token 驗證與一次性授權紀錄。Google、Apple、LINE 帳號目前各自獨立，不會僅憑相同 Email 自動合併衣櫃。此功能是 LINE 登入，不會自動加好友或發送訊息。

官方文件：https://developers.line.biz/en/docs/line-login/integrate-line-login/
