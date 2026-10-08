# 啟用 Apple 登入

程式已包含 Apple 登入流程。目前尚無 Apple 開發者設定，因此登入頁保留停用按鈕；Google 登入仍可使用。

## Apple 設定

依 [Apple 網頁登入文件](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/)，需要 Apple Developer Program 帳號，並將網站的 Services ID 關聯到已啟用 Sign in with Apple 的主要 App ID。

在 Apple Developer 的 Certificates, Identifiers & Profiles：

1. 建立或選擇主要 App ID，啟用 Sign in with Apple。
2. 建立網站用的 Services ID（例如 `com.yourcompany.coscloset.web`，請使用自己的唯一識別碼），啟用 Sign in with Apple，選擇上述主要 App ID。
3. Domains and Subdomains 填 `cos-closet-production.up.railway.app`。
4. Return URLs 填 `https://cos-closet-production.up.railway.app/api/auth/apple/callback`。
5. 建立啟用 Sign in with Apple 的 Key，關聯主要 App ID，記下 Key ID，下載 `.p8` 私鑰並安全保存。私鑰通常只能下載一次。
6. 在開發者會員資料取得 Team ID。

## Railway Variables

在 Railway 服務填入以下變數，再部署：

| 名稱 | 值 |
| --- | --- |
| `APPLE_CLIENT_ID` | 網站的 Services ID，不是 App 的 Bundle ID |
| `APPLE_TEAM_ID` | 10 碼 Team ID |
| `APPLE_KEY_ID` | 私鑰對應的 10 碼 Key ID |
| `APPLE_PRIVATE_KEY` | `.p8` 完整文字，包含 BEGIN PRIVATE KEY 與 END PRIVATE KEY；可貼多行，也支援字面 `\n` 換行 |
| `SITE_URL` | `https://cos-closet-production.up.railway.app`（既有值保持不變） |

私鑰只放 Railway 的伺服器變數，不要貼到聊天、提交到程式庫，或使用 `NEXT_PUBLIC_` 名稱。程式即時簽發 5 分鐘有效的 client secret，不需手動建立長效 client secret。完整設定後 Apple 按鈕才會啟用，仍需實際登入驗收。

## 驗收

1. 登入頁按「使用 Apple 登入」，確認進入 Apple 官方頁面。
2. 測試分享 Email、隱藏 Email，以及取消登入。
3. 成功後應返回衣櫃，可上架服裝與查看自己的租借紀錄。
4. 登出再登入，確認回到同一帳號。Apple 只在首次授權提供姓名，再次登入會保留原姓名。
5. 手機 Safari、Chrome 各測一次，登入需允許必要 Cookie，回呼使用 HTTPS。

Google 與 Apple 帳號不會因 Email 相同自動合併；既有 Google 衣櫃不會自動出現在新 Apple 帳號。目前沒有自動寄信功能；未來寄信到 Apple 隱藏 Email 須另設定 Private Email Relay。

尚未取得實際 Apple 設定前，只能驗證程式、簽章、登入狀態與停用流程，不能宣稱已通過真實 Apple 帳號登入。

## 官方素材與文件

- [Google 登入品牌規範](https://developers.google.com/identity/branding-guidelines)：使用官方 Google Logo 原始素材。
- [Apple 官方按鈕素材](https://appleid.cdn-apple.com/appleid/button?height=50&width=330&color=black&border=false&type=sign-in&border_radius=8&scale=2&locale=zh_TW)
- [Apple 權杖交換](https://developer.apple.com/documentation/signinwithapplerestapi/generate-and-validate-tokens)
