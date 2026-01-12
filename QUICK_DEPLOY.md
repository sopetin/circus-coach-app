# Quick Deployment Guide

## ✅ Your code is ready! All changes are committed.

## Option 1: Automated Setup (Recommended)

Run this command in your terminal:

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus
./setup-github.sh
```

The script will guide you through:
1. Creating a GitHub repository
2. Pushing your code
3. Setting up Vercel deployment

## Option 2: Manual Setup

### Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `circus-coach-app`
3. Description: "Circus Coach Management App"
4. Make it **PUBLIC** (required for free hosting)
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

### Step 2: Push to GitHub

Run these commands (you'll be prompted for username/password):

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus
git remote add origin https://github.com/sopetin/circus-coach-app.git
git branch -M main
git push -u origin main
```

**Note:** GitHub no longer accepts passwords. You'll need a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "Circus App Deployment"
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

### Step 3: Deploy to Vercel (Free & Automatic)

1. Go to: https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Add New Project"
5. Find and select `circus-coach-app`
6. Click "Deploy"

Vercel will:
- ✅ Auto-detect React settings
- ✅ Build your app
- ✅ Give you a public URL (e.g., `circus-coach-app.vercel.app`)
- ✅ Auto-deploy on every future push!

## 🚀 Future Updates from Cursor

After making changes, just run:

```bash
git add -A
git commit -m "Your update description"
git push
```

Vercel automatically rebuilds and deploys in 1-2 minutes!

## 📝 Notes

- Your app will be publicly accessible
- Data is stored in browser localStorage (per user)
- No backend/server needed
- Free hosting on Vercel
- Custom domain available (optional)
