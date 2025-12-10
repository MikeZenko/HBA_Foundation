# HBA Foundation Deployment Guide

## Architecture

- **Frontend**: Next.js app in `/web` folder → Deploy to **Vercel**
- **Backend**: Express API in root folder → Deploy to **Railway**

---

## 1. Deploy Backend to Railway

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository

### Step 2: Configure Service
In Railway Dashboard → Service Settings:
- **Root Directory**: Leave empty (uses root)
- **Start Command**: `npm start`

### Step 3: Add Environment Variables
Go to Variables tab and add:
```
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Step 4: Get Your Backend URL
Railway will provide a URL like:
`https://hba-foundation-production.up.railway.app`

---

## 2. Deploy Frontend to Vercel

### Step 1: Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repo

### Step 2: Configure Build Settings
- **Root Directory**: `web`
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build`

### Step 3: Add Environment Variable
```
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
```

### Step 4: Deploy
Click Deploy and wait for build to complete.

---

## 3. Connect Everything

After both are deployed:

1. **Update Railway CORS**:
   - Set `CORS_ORIGIN` to your Vercel URL

2. **Update Vercel API URL**:
   - Set `NEXT_PUBLIC_API_URL` to your Railway URL
   - Redeploy the frontend

---

## Environment Variables Summary

### Railway (Backend)
| Variable | Example Value |
|----------|---------------|
| PORT | 3000 |
| HOST | 0.0.0.0 |
| NODE_ENV | production |
| CORS_ORIGIN | https://hba-web.vercel.app |

### Vercel (Frontend)
| Variable | Example Value |
|----------|---------------|
| NEXT_PUBLIC_API_URL | https://hba-api.railway.app |

---

## Useful Commands

### Check deployment status
```bash
# Vercel
npx vercel ls

# Railway (if CLI installed)
railway status
```

### Redeploy
```bash
# Vercel (from /web folder)
cd web && npx vercel --prod

# Railway auto-deploys on git push
git push origin main
```
