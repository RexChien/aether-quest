# ⚔️ Aether Quest (蒼空之境)

> **2.5D 依蘇 (Ys) / 薩爾達 (Zelda) 風格網頁多人連線合作動作冒險 MMORPG**  
> Powered by **Three.js** + **Trystero (Serverless WebRTC P2P)** + **Web Audio API** + **Vite**

---

## 🌟 遊戲特色 (Key Features)

- **2.5D 俯瞰視角與低多邊形奇幻風格 (Stylized Isometric World)**：
  - 古代遺跡石柱、神殿祭壇、浮空以太水晶與微波粼粼的清澈水流。
  - 柔和的黃金時段陽光陰影與大氣霧效。
- **爽快流暢的動作戰鬥系統 (Fluid ARPG Combat)**：
  - **三段連斬 (3-Hit Combo Attack)**：揮刀斬擊、回旋反切與跳劈下墜，附帶藍色以太劍氣拖尾特效。
  - **衝刺翻滾 (Dodge Roll)**：具備無敵偵與快速位移，躲避怪物致命攻擊。
  - **三大職業技能**：
    - `[1]` **疾風旋刃 (Whirlwind Slash)**：360 度大範圍旋風斬擊。
    - `[2]` **以太天衝 (Aether Beam)**：凝聚蒼穹光芒的高傷直線貫穿衝擊波。
    - `[3]` **聖樹祈願 (Sanctuary Heal)**：沐浴於自然綠意中恢復生命值。
- **怪物 AI 與首領討伐 (Monster AI & Boss Raid)**：
  - **綠晶史萊姆 (Forest Slime)**：可愛跳躍撞擊，草地遊蕩。
  - **蒼空獵手 (Crystal Stalker)**：迅捷凶猛的以太獵手，附帶前突刺。
  - **骸骨守衛 (Skeleton Guardian)**：遺跡巡邏死靈衛兵。
  - **【太古以太巨像・泰坦】(Aether Titan Boss)**：坐鎮北方神殿祭壇的巨大石像首領，具備紅色地面攻擊預警圈 (Telegraph Indicator) 與巨量生命值。
- **暗黑/依蘇經典打寶裝備系統 (Diablo & Ys-style Loot)**：
  - 6 大品質階級：**普通 (白) ➔ 魔法 (藍) ➔ 稀有 (黃) ➔ 史詩 (紫) ➔ 傳奇 (金) ➔ 神話 (青)**。
  - 掉落時於地面升起沖天光柱 (Light Pillars) 與立體旋轉寶石。
  - 靠近自動拾取，裝備可增加攻擊力、防禦力、生命值、暴擊率與跑速。
- **0 伺服器成本！P2P WebRTC 無伺服器多人連線 (Zero-Server-Cost Multiplayer)**：
  - 透過 **Trystero** 與 Nostr/BitTorrent 網路即時握手。
  - 支援網址分享邀請：只要好友點擊同一個網址（例如 `#room=my-guild`），即可進入同一個以太世界一同組隊討伐首領！
  - 即時同步隊友位置、朝向、揮刀斬擊動作、技能釋放、生命條與聊天氣泡。
- **♿ 身障無障礙與純滑鼠單手體驗 (Accessibility-First & Mouse Navigation)**：
  - **滑鼠單手點擊/按住走位**：點擊或長按地面任意處，角色即刻平滑移動至目標點，並顯示金色定位光圈，無需繁瑣鍵盤操作。
  - **FF12 戰略戰術自動戰鬥系統 (FF12 Gambit System)**：
    - 啟發自《Final Fantasy XII》權能戰術系統，設定條件後角色全自動戰鬥！
    - **條件 1 (危急治癒)**：自身 HP < 50% ➔ 自動施放【聖樹祈願】回血。
    - **條件 2 (求生閃避)**：身處 Boss/怪物危險紅色預警圈內 ➔ 自動向外【翻滾脫離】。
    - **條件 3 (群體清場)**：周圍敵人 >= 2 隻或首領戰 ➔ 自動釋放【疾風旋刃】AOE。
    - **條件 4 (以太殲滅)**：遭遇首領且 MP 充足 ➔ 自動施放直線貫穿【以太天衝】。
    - **條件 5 (近戰討伐)**：敵人在武器攻擊範圍內 ➔ 自動發動三段連斬。
  - **一鍵切換與自訂設定**：
    - 點擊頂部 `[🤖 戰術自動: 開/關]` (或快捷鍵 `Z`) 即刻切換。
    - 按 `G` 或點擊 `[⚖️ 戰術設定]` 可自訂各條規則開關與閾值，並提供「純滑鼠身障單手」、「全力輸出」、「穩健生存」、「全手動」四大快速預設。
- **純前端 Web Audio API 擬真音效 (Procedural Audio Synthesizer)**：
  - 刀劍揮擊破空聲、金屬打擊音效、翻滾風聲、技能轟鳴與舒緩的奇幻鋼琴/琶音背景音樂（BGM），零外部音訊檔案缺失問題（100% 穩定零 404）。

---

## 🎮 操作指引 (Controls)

| 操作方式 | 按鍵 / 操作 | 功能描述 |
| :--- | :--- | :--- |
| **♿ 身障單手推薦** | **滑鼠點擊 / 長按地面** | 單手導引角色走位，配合自動戰術即可全自動戰鬥 |
| **戰術開關** | **按鍵 Z** 或 頂部按鈕 | 開啟 / 關閉 FF12 自動戰術施法與戰鬥 |
| **戰術設定** | **按鍵 G** 或 頂部按鈕 | 開啟戰略戰術面板 (Gambit 設定與預設) |
| **鍵盤傳統移動** | **W / A / S / D** 或 **方向鍵** | 控制主角移動與轉向 |
| **手動普通攻擊** | **空白鍵 (Space)** 或 **滑鼠左鍵** | 普通攻擊（三段連斬） |
| **手動閃避翻滾** | **Shift 鍵** 或 **滑鼠右鍵** | 衝刺翻滾 (Dodge Roll) 脫離危險 |
| **手動技能 1** | **數字鍵 1** | 施放技能 1：疾風旋刃 (Whirlwind) |
| **手動技能 2** | **數字鍵 2** | 施放技能 2：以太天衝 (Aether Beam) |
| **手動技能 3** | **數字鍵 3** | 施放技能 3：聖樹祈願 (Sanctuary Heal) |
| **背包裝備** | **按鍵 B** | 開啟 / 關閉 裝備與背包介面 (Inventory) |
| **多人連線** | **右上角房間徽章** | 點擊一鍵複製多人連線邀請網址 |
| **音效切換** | **左上角音效按鈕** | 切換音效與 BGM 開啟/靜音 |

---

## 🛠️ 技術棧 (Tech Stack)

- **Engine**: Three.js (r174)
- **Multiplayer Networking**: Trystero (v0.26.0 - WebRTC P2P)
- **Language**: TypeScript + Modern ESNext
- **Bundler & Dev Server**: Vite 6
- **Audio Engine**: Web Audio API (Procedural Synthesizer)

---

## 🚀 本地開發與建置 (Quick Start)

### 1. 安裝相依套件
```bash
npm install
```

### 2. 啟動本機開發伺服器
```bash
npm run dev
```
瀏覽器打開 `http://localhost:3000` 即可暢玩。

### 3. 編譯打包 (Production Build)
```bash
npm run build
```
產生的最佳化靜態檔案位於 `dist/` 目錄，可直接部署至 GitHub Pages、Vercel 或 Cloudflare Pages！

---

## 📜 授權 (License)

MIT License © 2026 RexChien
