# Firebase Setup Guide (Free Cloud Storage)

## Why Firebase?

- ✅ **Free tier**: 1GB storage, 50K reads/day, 20K writes/day
- ✅ **Real-time sync**: Changes appear instantly on all devices
- ✅ **Offline support**: Works even without internet
- ✅ **Automatic backup**: Data stored in the cloud

## Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Project name: `circus-coach-app` (or any name)
4. Disable Google Analytics (optional, not needed)
5. Click **"Create project"**
6. Wait for project to be created, then click **"Continue"**

## Step 2: Get Your Firebase Config

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` (or "Add app" → Web)
5. App nickname: `Circus Coach App`
6. **DO NOT** check "Also set up Firebase Hosting"
7. Click **"Register app"**
8. **Copy the config object** (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 3: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** (left sidebar)
2. Click **"Create database"**
3. Select **"Start in test mode"** (for now, we'll secure it later)
4. Choose a location (closest to you)
5. Click **"Enable"**

## Step 4: Update Your Code

1. Open: `/Users/Evgenii_Sopetin/Desktop/Circus/src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Install Dependencies

Run in terminal:

```bash
cd /Users/Evgenii_Sopetin/Desktop/Circus
npm install
```

## Step 6: Deploy

```bash
./deploy-github-pages.sh
```

## ✅ That's It!

Your app will now:
- ✅ Sync data across all devices automatically
- ✅ Work offline (syncs when back online)
- ✅ Store data in the cloud (free tier)
- ✅ Update in real-time on all devices

## Security (Optional - Recommended)

After testing, secure your Firestore:

1. Go to Firestore Database → Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appData/{document} {
      allow read, write: if true; // Public read/write for now
      // For production, add authentication
    }
  }
}
```

3. Click **"Publish"**

## Testing

1. Open your app on Device A
2. Add a student
3. Open your app on Device B
4. The student should appear automatically! 🎉

## Troubleshooting

**"Firebase not configured"**
- Make sure you updated `firebase.js` with your config
- Check that all values are correct (no quotes around values)

**"Permission denied"**
- Check Firestore Rules (should allow read/write)
- Make sure Firestore is enabled

**Data not syncing**
- Check browser console for errors
- Make sure you're online
- Wait a few seconds (sync happens in real-time)
