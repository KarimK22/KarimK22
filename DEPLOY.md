# Mission Control - Vercel Deployment Guide

## 🚀 Quick Deploy (5 minutes)

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the mission-control directory
cd /root/.openclaw/workspace/mission-control
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name? mission-control (or whatever you want)
# - Directory? ./ (just press enter)
# - Override settings? No

# Deploy to production
vercel --prod
```

### Option 2: GitHub + Vercel (More Control)

**Step 1: Push to GitHub**

1. Create a new repository on GitHub (e.g., `mission-control`)
2. Push the code:

```bash
cd /root/.openclaw/workspace/mission-control
git remote add origin https://github.com/YOUR_USERNAME/mission-control.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy to Vercel**

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Click **"Deploy"**

---

## 🔧 Setup Convex Production

After Vercel deploys, you need to set up Convex production:

```bash
# Login to Convex
npx convex login

# Deploy to production
npx convex deploy

# This will give you a production URL like:
# https://your-project.convex.cloud
```

**Add to Vercel Environment Variables:**

1. Go to your Vercel project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_CONVEX_URL` = `https://your-project.convex.cloud`

3. Redeploy from Vercel dashboard

---

## 🔐 Security (Important!)

The API endpoints are currently **unprotected**. Before sharing with your team:

1. Generate an API key:
```bash
openssl rand -hex 32
```

2. Add to Vercel env vars:
   - `API_KEY` = `your-generated-key`

3. Update OpenClaw to include the API key in requests:
```typescript
headers: {
  'Authorization': `Bearer ${process.env.MISSION_CONTROL_API_KEY}`
}
```

---

## 📱 Share with Team

After deployment, you'll get a URL like:
**https://mission-control-xyz.vercel.app**

Share this with your team! They can:
- View dashboards
- Search memories
- Track tasks and content
- See agent activity in real-time

---

## 🔄 Updates

To deploy updates:

**If using Vercel CLI:**
```bash
vercel --prod
```

**If using GitHub:**
Just push to main:
```bash
git add -A
git commit -m "Update Mission Control"
git push
```

Vercel auto-deploys on push!

---

## ✅ Checklist

- [ ] Code committed to git
- [ ] Deployed to Vercel (CLI or GitHub)
- [ ] Convex production deployed
- [ ] Environment variables set
- [ ] API key security added
- [ ] Agents initialized in production
- [ ] URL shared with team

---

## 🆘 Troubleshooting

**"Module not found" errors:**
- Make sure `package.json` is committed
- Vercel should auto-install dependencies

**Convex connection failed:**
- Check `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Make sure it starts with `https://`

**Blank dashboard:**
- Run `npx convex run agents:initialize` against production
- Or use Convex dashboard to run the function

---

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Convex Docs: https://docs.convex.dev
