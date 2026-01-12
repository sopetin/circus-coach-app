# Deploy to GitHub Pages (Free, No Vercel Needed!)

## ✅ Simple Setup - Just GitHub!

### Step 1: Push Your Code (if not done already)

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository: https://github.com/sopetin/circus-coach-app
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

### Step 3: Deploy Your App

Run this command:

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus
./deploy-github-pages.sh
```

Or manually:

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d build
```

### Step 4: Access Your Live App

Your app will be available at:
**https://sopetin.github.io/circus-coach-app**

(It may take 1-2 minutes to go live)

## 🔄 Future Updates

After making changes in Cursor:

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus
git add -A
git commit -m "Your update"
git push
./deploy-github-pages.sh
```

That's it! No Vercel needed.

## 📝 Notes

- ✅ Completely free
- ✅ Uses only GitHub (no extra accounts)
- ✅ Automatic HTTPS
- ✅ Custom domain support (optional)
- ⚠️ Takes 1-2 minutes to update after deployment
