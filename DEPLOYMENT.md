# Deployment Guide

## Deploy to Vercel (Free)

Your app is ready to deploy! Follow these steps:

### Option 1: Using Vercel CLI (Recommended)

1. Run the deployment command:
```bash
vercel
```

2. Follow the prompts:
   - If you don't have a Vercel account, it will open a browser to sign up (free)
   - After signing in, return to the terminal
   - Press Enter to accept default settings
   - Your app will be deployed!

3. You'll get a URL like: `https://circus-coach-app.vercel.app`

### Option 2: Using Vercel Website

1. Go to https://vercel.com
2. Sign up/login (free)
3. Click "Add New Project"
4. Import your Git repository (if you push to GitHub) OR
5. Drag and drop your project folder

### Option 3: Using GitHub (Recommended for updates)

1. Create a GitHub repository
2. Push your code:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

3. Go to https://vercel.com
4. Import your GitHub repository
5. Vercel will auto-deploy on every push!

## Important Notes

- **Data Storage**: The app uses localStorage, so data is stored in each user's browser
- **Free Tier**: Vercel free tier includes:
  - Unlimited deployments
  - Custom domain support
  - Automatic HTTPS
  - Global CDN

## Updating Your App

After making changes:
```bash
git add .
git commit -m "Your update message"
vercel --prod
```

Or if using GitHub, just push and Vercel auto-deploys!
