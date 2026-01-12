# Deployment Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `circus-coach-app` (or any name you prefer)
3. Description: "Circus Coach Management App"
4. Make it **Public** (required for free Vercel deployment)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/sopetin/circus-coach-app.git
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password.

## Step 3: Deploy to Vercel (Free)

1. Go to https://vercel.com
2. Sign up/Login with your GitHub account
3. Click "Add New Project"
4. Import your `circus-coach-app` repository
5. Vercel will auto-detect React settings
6. Click "Deploy"

Vercel will:
- Build your app automatically
- Give you a public URL (e.g., `circus-coach-app.vercel.app`)
- Auto-deploy on every push to GitHub

## Step 4: Future Updates

After making changes in Cursor:

```bash
git add -A
git commit -m "Your update description"
git push
```

Vercel will automatically rebuild and deploy your changes within 1-2 minutes!

## Alternative: Use GitHub Pages (Free)

If you prefer GitHub Pages:

1. In your GitHub repo, go to Settings > Pages
2. Source: Deploy from a branch
3. Branch: main, folder: / (root)
4. Save

Note: You'll need to update `package.json` to add a `homepage` field and build script.
