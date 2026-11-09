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
- **純前端 Web Audio API 擬真音效 (Procedural Audio Synthesizer)**：
  - 刀劍揮擊破空聲、金屬打擊音效、翻滾風聲、技能轟鳴與舒緩的奇幻鋼琴/琶音背景音樂（BGM），零外部音訊檔案缺失問題（100% 穩定零 404）。

---

## 🎮 操作指引 (Controls)

| 按鍵 / 操作 | 功能描述 |
| :--- | :--- |
| **W / A / S / D** 或 **方向鍵** | 控制主角移動與轉向 |
| **空白鍵 (Space)** 或 **滑鼠左鍵** | 普通攻擊（三段連斬） |
| **Shift 鍵** 或 **滑鼠右鍵** | 衝刺翻滾 (Dodge Roll) |
| **數字鍵 1** | 施放技能 1：疾風旋刃 (Whirlwind) |
| **數字鍵 2** | 施放技能 2：以太天衝 (Aether Beam) |
| **數字鍵 3** | 施放技能 3：聖樹祈願 (Sanctuary Heal) |
| **按鍵 B** | 開啟 / 關閉 裝備與背包介面 (Inventory) |
| **右上角房間徽章** | 點擊一鍵複製多人連線邀請網址 |
| **左上角音效按鈕** | 切換音效與 BGM 開啟/靜音 |

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
