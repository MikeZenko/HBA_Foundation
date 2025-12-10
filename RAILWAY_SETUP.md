# Railway Backend Setup Guide

This guide will help you deploy your backend API to Railway.

## Prerequisites
- GitHub account with your repository pushed
- Railway account (sign up at [railway.app](https://railway.app))

---

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub if prompted
5. Select your repository: `MikeZenko/HBA_Foundation`
6. Railway will automatically detect it's a Node.js project

---

## Step 2: Add MongoDB Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add MongoDB"**
3. Railway will create a MongoDB instance
4. **Important**: Copy the MongoDB connection string from the MongoDB service
   - It will look like: `mongodb://mongo:password@containers-us-west-xxx.railway.app:xxxxx`

---

## Step 3: Configure Environment Variables

1. Click on your **backend service** (not the MongoDB service)
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"** and add each of these:

### Required Variables:

```bash
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# Database (use the MongoDB connection string from Step 2)
MONGODB_URI=mongodb://mongo:password@containers-us-west-xxx.railway.app:xxxxx

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long

# CORS (update with your Vercel frontend URL after deployment)
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000

# Admin Account
ADMIN_EMAIL=admin@hbafoundation.org
ADMIN_PASSWORD=change-this-to-secure-password

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Logging
LOG_LEVEL=info
```

### How to Generate Secure JWT Secrets:

You can use this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice to get two different secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

---

## Step 4: Configure Service Settings

1. In your backend service, go to **"Settings"**
2. Make sure these are set:
   - **Root Directory**: Leave empty (uses root)
   - **Start Command**: `npm start` (should be auto-detected)
   - **Healthcheck Path**: `/health` (optional but recommended)

---

## Step 5: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** in the Railway dashboard
3. Wait for the build to complete (check the **"Deployments"** tab)
4. Once deployed, Railway will provide a URL like:
   - `https://hba-foundation-production.up.railway.app`

---

## Step 6: Get Your Backend URL

1. After deployment, go to your service **"Settings"**
2. Under **"Networking"**, you'll see your public URL
3. Copy this URL - you'll need it for your frontend

**Example**: `https://hba-foundation-production.up.railway.app`

---

## Step 7: Test Your Backend

1. Visit your Railway URL + `/health`:
   ```
   https://your-railway-url.railway.app/health
   ```
   You should see: `{"success":true,"message":"Server is healthy",...}`

2. Test the API:
   ```
   https://your-railway-url.railway.app/api/scholarships
   ```

---

## Step 8: Update Frontend (Vercel)

After your backend is deployed:

1. Go to your Vercel project settings
2. Add/Update environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
   ```
3. Redeploy your frontend

---

## Step 9: Update CORS in Railway

Once you have your Vercel frontend URL:

1. Go back to Railway → Your backend service → Variables
2. Update `CORS_ORIGIN` to include your Vercel URL:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000
   ```
3. Railway will automatically redeploy

---

## Troubleshooting

### Backend won't start
- Check the **"Deployments"** tab logs in Railway
- Verify all required environment variables are set
- Make sure `MONGODB_URI` is correct

### Database connection errors
- Verify MongoDB service is running in Railway
- Check `MONGODB_URI` matches the connection string from MongoDB service
- Make sure MongoDB service is in the same Railway project

### CORS errors
- Update `CORS_ORIGIN` in Railway to include your frontend URL
- Make sure there are no trailing slashes in URLs
- Check browser console for specific CORS error messages

### API not responding
- Check Railway deployment logs
- Verify the service is running (green status)
- Test `/health` endpoint first

---

## Useful Railway Features

### View Logs
- Click on your service → **"Deployments"** → Click on latest deployment → **"View Logs"**

### Monitor Usage
- Railway dashboard shows CPU, Memory, and Network usage

### Custom Domain
- Go to Settings → **"Networking"** → Add custom domain

---

## Environment Variables Quick Reference

| Variable | Required | Example |
|----------|----------|---------|
| `PORT` | Yes | `3001` |
| `HOST` | Yes | `0.0.0.0` |
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | `mongodb://...` |
| `JWT_SECRET` | Yes | `32+ char string` |
| `JWT_REFRESH_SECRET` | Yes | `32+ char string` |
| `CORS_ORIGIN` | Yes | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Recommended | `admin@hbafoundation.org` |
| `ADMIN_PASSWORD` | Recommended | `secure-password` |

---

## Next Steps

1. ✅ Backend deployed on Railway
2. ✅ Frontend deployed on Vercel
3. ✅ Environment variables configured
4. ✅ CORS updated
5. 🎉 Your app should be live!

For frontend setup, see `DEPLOYMENT.md`.
