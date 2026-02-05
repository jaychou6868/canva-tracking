# 部署指南

## 準備工作

已完成：
- ✅ 後端代碼完成
- ✅ 前端代碼完成
- ✅ Git 倉庫初始化
- ✅ 本地提交完成

需要完成：
- 📤 推送到 GitHub
- 🚀 部署後端到 Zeabur
- 🌐 部署前端到 Vercel

## 第一步：推送到 GitHub

```bash
# 在 GitHub 創建新倉庫（名稱：canva-tracking）
# 然後執行：

cd /Users/karen/自動seo/canva-tracking
git remote add origin https://github.com/YOUR_USERNAME/canva-tracking.git
git push -u origin main
```

## 第二步：部署後端到 Zeabur

1. 登入 Zeabur Dashboard
2. 點擊「New Project」
3. 選擇「Deploy from GitHub」
4. 選擇 `canva-tracking` 倉庫
5. Root Directory 設為：`backend`
6. 設定環境變數：

```env
NODE_ENV=production
PORT=3000

# Supabase Connection Pooling (必須使用兩個 URL)
# DATABASE_URL: Transaction Pooler (port 6543) + pgbouncer=true
DATABASE_URL=postgresql://postgres.xxx:password@aws-x.pooler.supabase.com:6543/postgres?pgbouncer=true

# DIRECT_URL: Session Pooler (port 5432) for Prisma migrations
DIRECT_URL=postgresql://postgres.xxx:password@aws-x.pooler.supabase.com:5432/postgres

BASE_URL=https://你的zeabur域名.zeabur.app
IP_SALT=random-salt-12345
FRONTEND_URL=https://你的vercel域名.vercel.app
```

7. 部署完成後，記下 Zeabur 給你的網址

## 第三步：配置 Supabase 資料庫

1. 登入 Supabase
2. 選擇你的專案
3. 取得 Connection String：
   - 格式：`postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-x.pooler.supabase.com:5432/postgres`
4. 將此連結設為 Zeabur 的 `DATABASE_URL`

## 第四步：執行資料庫遷移

Zeabur 會在部署時自動執行 `npm run start:migrate`，這會：
1. 執行 `prisma migrate deploy`（建立資料表）
2. 啟動服務

如果需要手動執行：
```bash
npx prisma migrate deploy
```

## 第五步：部署前端到 Vercel

1. 登入 Vercel Dashboard
2. 點擊「Add New Project」
3. 選擇 `canva-tracking` 倉庫
4. Framework Preset：Next.js
5. Root Directory：`frontend`
6. 設定環境變數：

```env
NEXT_PUBLIC_API_URL=https://你的zeabur網址.zeabur.app
```

7. 點擊 Deploy

## 第六步：更新 CORS 設定

部署完成後，回到 Zeabur 更新 `FRONTEND_URL` 環境變數為實際的 Vercel 網址。

## 測試

1. 打開 Vercel 給你的網址
2. 點擊「建立新活動」
3. 填寫資料並生成連結
4. 測試短網址重定向
5. 查看統計報表

## 故障排除

### 後端無法連接資料庫
- ⚠️ **重要**：Prisma + Supabase 必須使用雙 URL 配置
  - `DATABASE_URL`: port **6543** + `?pgbouncer=true` (Transaction Pooler)
  - `DIRECT_URL`: port **5432** (Session Pooler for migrations)
- 檢查兩個 URL 的用戶名、密碼、host 是否正確
- 確認 Prisma schema 中有設定 `directUrl = env("DIRECT_URL")`
- 檢查 Supabase IP 白名單設定（通常不需要）

### 前端無法連接後端
- 檢查 `NEXT_PUBLIC_API_URL` 是否正確
- 檢查後端 CORS 設定的 `FRONTEND_URL`
- 確認兩邊都已部署完成

### Prisma 遷移失敗
- 在 Zeabur 查看 Deployment Logs
- 確認 DATABASE_URL 格式正確
- 可能需要手動執行：`npx prisma migrate deploy`
