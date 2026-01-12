# Firebase Setup - Step by Step Guide

## 🎯 Goal
Set up Firebase so your app data syncs across all devices automatically.

---

## Step 1: Create Firebase Account & Project

### 1.1 Go to Firebase Console
1. Open your browser
2. Go to: **https://console.firebase.google.com/**
3. Sign in with your Google account (or create one if needed)

### 1.2 Create a New Project
1. Click the **"Add project"** button (or "Create a project")
2. **Project name**: Enter `circus-coach-app` (or any name you like)
3. Click **"Continue"**
4. **Google Analytics**: 
   - You can disable it (toggle OFF) - it's optional
   - Or leave it enabled - doesn't matter
5. Click **"Create project"**
6. Wait 10-30 seconds for Firebase to set up your project
7. When you see "Your new project is ready", click **"Continue"**

---

## Step 2: Enable Firestore Database

### 2.1 Open Firestore
1. In the Firebase Console, look at the left sidebar
2. Click on **"Firestore Database"** (or "Build" → "Firestore Database")

### 2.2 Create Database
1. Click the **"Create database"** button
2. **Security rules**: Select **"Start in test mode"**
   - This allows read/write for now (we'll secure it later)
   - Click **"Next"**
3. **Cloud Firestore location**: 
   - Choose a location closest to you (e.g., `us-central`, `europe-west`, etc.)
   - Click **"Enable"**
4. Wait for the database to be created (10-20 seconds)

---

## Step 3: Get Your Firebase Config

### 3.1 Add Web App
1. In Firebase Console, click the **gear icon** ⚙️ (top left, next to "Project Overview")
2. Click **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. You'll see icons for different platforms (iOS, Android, Web)
5. Click the **Web icon** `</>` (or click "Add app" → Web)

### 3.2 Register Your App
1. **App nickname**: Enter `Circus Coach App` (or any name)
2. **Firebase Hosting**: 
   - **DO NOT** check "Also set up Firebase Hosting" (we're using GitHub Pages)
   - Leave it unchecked
3. Click **"Register app"**

### 3.3 Copy Your Config
1. You'll see a code block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "circus-coach-app.firebaseapp.com",
  projectId: "circus-coach-app",
  storageBucket: "circus-coach-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

2. **Copy this entire config object** (all 6 lines)
3. Click **"Continue to console"** (you can close this popup)

---

## Step 4: Update Your Code

### 4.1 Open the Config File
1. In Cursor, open: `/Users/Evgenii_Sopetin/Desktop/Circus/src/config/firebase.js`

### 4.2 Replace the Placeholder Values
1. Find this section:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

2. Replace it with your actual config from Step 3.3
3. Make sure to keep the quotes around each value!

**Example:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdef",
  authDomain: "circus-coach-app.firebaseapp.com",
  projectId: "circus-coach-app",
  storageBucket: "circus-coach-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4.3 Save the File
- Press `Cmd + S` (or File → Save)

---

## Step 5: Install Dependencies

### 5.1 Open Terminal
1. In Cursor, open Terminal (`` Ctrl + ` `` or View → Terminal)

### 5.2 Install Firebase
Run this command:

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus
npm install
```

This will install Firebase and other dependencies.

---

## Step 6: Test It!

### 6.1 Start the App
```bash
npm start
```

### 6.2 Check the Browser Console
1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Go to the "Console" tab
3. Look for messages like:
   - ✅ "Data loaded from Firebase" (if you have existing data)
   - ✅ "Data saved to Firebase" (when you make changes)
   - ❌ If you see errors, check that your config is correct

### 6.3 Test Sync
1. Open the app in two different browsers (or devices)
2. Add a student in Browser 1
3. Wait 1-2 seconds
4. Check Browser 2 - the student should appear automatically! 🎉

---

## Step 7: Deploy to GitHub Pages

Once everything works locally:

```bash
./deploy-github-pages.sh
```

Your app will be live with cloud sync! 🌐

---

## 🔒 Security (Optional - Do Later)

After testing, you can secure your database:

1. Go to Firestore Database → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appData/{document} {
      allow read, write: if true; // Public for now
    }
  }
}
```

3. Click **"Publish"**

**Note:** For production, you'd want to add authentication, but for now this works.

---

## ✅ Checklist

- [ ] Created Firebase project
- [ ] Enabled Firestore Database
- [ ] Copied Firebase config
- [ ] Updated `src/config/firebase.js`
- [ ] Ran `npm install`
- [ ] Tested locally (`npm start`)
- [ ] Verified data syncs between devices
- [ ] Deployed to GitHub Pages

---

## 🆘 Troubleshooting

**"Firebase not configured" error:**
- Check that you replaced ALL placeholder values in `firebase.js`
- Make sure there are quotes around each value
- Restart the app (`npm start`)

**"Permission denied" error:**
- Go to Firestore → Rules
- Make sure rules allow read/write (test mode)

**Data not syncing:**
- Check browser console for errors
- Make sure you're online
- Wait a few seconds (sync happens in real-time)

**Can't find Firestore:**
- Look in left sidebar under "Build"
- Or search for "Firestore" in the Firebase Console

---

## 🎉 You're Done!

Once set up, your app will:
- ✅ Sync data across all devices automatically
- ✅ Work offline (syncs when back online)
- ✅ Store data in the cloud (free tier)
- ✅ Update in real-time on all devices
