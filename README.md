# Canva CTA 追蹤系統

追蹤 Canva 簡報中的購買按鈕點擊和二維碼掃描數據。

## 功能特色

- 🔗 生成追蹤短網址
- 📱 自動生成二維碼
- 📊 即時統計報表
- 📈 每日趨勢分析
- 🎯 區分點擊 vs 掃碼
- 🔒 去重邏輯（24小時）

## 技術棧

**後端：**
- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- TypeScript

**前端：**
- Next.js 14
- React
- Tailwind CSS
- Recharts

## 快速開始

### 後端

```bash
cd backend
npm install
cp .env.example .env
# 編輯 .env 設定資料庫連線
npx prisma migrate dev
npm run dev
```

### 前端

```bash
cd frontend
npm install
cp .env.example .env.local
# 編輯 .env.local 設定 API URL
npm run dev
```

## 部署

### Zeabur（後端）

1. 推送到 GitHub
2. 在 Zeabur 連接 GitHub 倉庫
3. 選擇 `backend` 目錄
4. 設定環境變數：
   - `DATABASE_URL`
   - `BASE_URL`
   - `IP_SALT`
   - `FRONTEND_URL`

### Vercel（前端）

1. 在 Vercel 連接 GitHub 倉庫
2. 設定根目錄為 `frontend`
3. 設定環境變數：
   - `NEXT_PUBLIC_API_URL`

## 使用方式

1. 建立新活動，輸入活動名稱和購課網址
2. 系統生成追蹤連結和二維碼
3. 在 Canva 簡報最後一頁：
   - 購買按鈕：設定連結為生成的「購買按鈕連結」
   - 二維碼：上傳生成的二維碼圖片
4. 分享 Canva 簡報到郵件
5. 在系統中查看即時統計數據

## 授權

MIT License
