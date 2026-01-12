# How to Run the Deployment Script

## Method 1: Using Terminal (Recommended)

1. **Open Terminal** (Press `Cmd + Space`, type "Terminal", press Enter)

2. **Navigate to your project folder:**
   ```bash
   cd /Users/Evgenii_Sopetin/Desktop/Circus
   ```

3. **Run the script:**
   ```bash
   ./deploy-github-pages.sh
   ```

That's it! The script will:
- Install gh-pages if needed
- Build your React app
- Deploy it to GitHub Pages

## Method 2: From Cursor's Terminal

1. In Cursor, open the terminal (View → Terminal, or `` Ctrl + ` ``)

2. Make sure you're in the right directory:
   ```bash
   cd /Users/Evgenii_Sopetin/Desktop/Circus
   ```

3. Run:
   ```bash
   ./deploy-github-pages.sh
   ```

## If You Get "Permission Denied" Error

If you see an error like "Permission denied", make the script executable:

```bash
chmod +x deploy-github-pages.sh
```

Then run it again:
```bash
./deploy-github-pages.sh
```

## What Happens Next?

1. The script builds your app
2. Deploys to GitHub Pages
3. Your app will be live at: **https://sopetin.github.io/circus-coach-app**

⏳ It may take 1-2 minutes for the site to appear.

## Troubleshooting

**Error: "gh-pages not found"**
- The script will install it automatically, but if it fails:
  ```bash
  npm install --save-dev gh-pages
  ```

**Error: "Build failed"**
- Make sure all dependencies are installed:
  ```bash
  npm install
  ```

**Error: "Not a git repository"**
- Make sure you've pushed to GitHub first:
  ```bash
  git push -u origin main
  ```
