# BEYBLADE X 百科（第一階段）

Cyberpunk 風格的 BEYBLADE X 百科 + 收藏 + 行事曆 App，純 HTML／CSS／JS + LocalStorage 打造，
可免費部署在 GitHub Pages，並安裝到手機主畫面變成類 App。

## 功能

- 首頁 QR 掃描解鎖動畫，兩顆陀螺對戰特效
- Blade／Ratchet／Bit 百科搜尋與篩選
- 上蓋・軸心・固鎖（Lock Chip／Socket／Latch／Shaft／Base）全圖解
- 我的收藏（可拍照或選圖存入本機）
- 自訂備註
- 行事曆（新增/刪除活動）
- 家長提醒（本機版，App 開啟且時間到會跳出提醒）
- 離線使用（Service Worker 快取，PWA 可安裝）

## 檔案結構

```
beyblade-x-app/
├── index.html
├── style.css
├── app.js
├── manifest.json
├── service-worker.js
├── data/
│   ├── blades.json
│   ├── ratchets.json
│   └── bits.json
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-192.png
    └── icon-maskable-512.png
```

## 部署到 GitHub Pages（免費）

1. 在 GitHub 建立一個新的 repository，例如 `beyblade-x-app`。
2. 把這個資料夾裡的所有檔案上傳到該 repository（根目錄，不要包在多一層資料夾裡）。
3. 進入 repository 的 **Settings → Pages**。
4. Source 選擇 `Deploy from a branch`，Branch 選 `main`，資料夾選 `/ (root)`，按 Save。
5. 等 1～2 分鐘，網址會出現在同一頁，通常是：
   `https://你的帳號.github.io/beyblade-x-app/`

## 讓孩子安裝成「App」

- **Android（Chrome）**：打開網址 → 右上角選單 → 「加到主畫面」／「安裝應用程式」。
- **iPhone（Safari）**：打開網址 → 下方分享圖示 → 「加入主畫面」。

加入後桌面會出現我們設計的霓虹陀螺圖示，點開會以全螢幕 App 模式開啟（沒有網址列）。

## 之後可以怎麼擴充

- **資料庫**：直接編輯 `data/blades.json`、`data/ratchets.json`、`data/bits.json`，
  依相同格式新增更多零件即可，前台會自動讀取。
- **雲端同步（第二階段）**：之後可以加入 Firebase，讓收藏、備註、行事曆改成雲端儲存，
  這樣爸爸手機新增活動、孩子手機就能立刻同步，也能加上推播通知。
- **App 化（第三階段）**：目前的 PWA 已經可以安裝到桌面；若要上架 Google Play／App Store，
  之後可以用 Capacitor 之類的工具把同一份網頁包裝成原生 App。

## 注意事項

- 目前的「家長提醒」是本機版本：提醒事項存在孩子手機的瀏覽器裡，
  必須在提醒時間「有打開這個 App」才會跳出通知，還沒辦法像簡訊一樣主動推播到手機（那需要第二階段的 Firebase 雲端同步）。
- 收藏的照片會直接存成本機資料（LocalStorage），清除瀏覽器資料或換手機會遺失，
  建議之後升級雲端版本做照片備份。
- 資料庫內容為常見零件範例，非官方完整清單，可依實際擁有的零件自行增修。
