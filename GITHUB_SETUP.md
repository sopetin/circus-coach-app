# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `circus-coach-app` (or any name you like)
3. Make it **Public** (free) or **Private** (your choice)
4. **DO NOT** check "Add a README file" or any other options
5. Click "Create repository"

## Step 2: Connect and Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/circus-coach-app.git

# Push your code
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel with Auto-Deploy

1. Go to https://vercel.com
2. Sign up/login (free, can use GitHub account)
3. Click "Add New Project"
4. Click "Import Git Repository"
5. Select your `circus-coach-app` repository
6. Click "Import"
7. Vercel will auto-detect React settings - just click "Deploy"
8. Wait ~2 minutes for deployment
9. Your app will be live at: `https://circus-coach-app.vercel.app`

## Benefits of GitHub + Vercel

✅ **Automatic deployments** - Every time you push to GitHub, Vercel auto-deploys
✅ **Version control** - Track all your changes
✅ **Free hosting** - Both GitHub and Vercel are free
✅ **Easy updates** - Just push code, deployment happens automatically

## Updating Your App

After making changes:
```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically deploy the new version!
