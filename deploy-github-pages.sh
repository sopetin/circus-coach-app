#!/bin/bash

# Deploy to GitHub Pages
# This script builds your app and deploys it to GitHub Pages

echo "🚀 Building and deploying to GitHub Pages..."
echo ""

# Install gh-pages if not already installed
if ! npm list -g gh-pages &> /dev/null; then
    echo "📦 Installing gh-pages..."
    npm install --save-dev gh-pages
fi

# Build the app
echo "🔨 Building React app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to GitHub Pages
echo "📤 Deploying to GitHub Pages..."
npx gh-pages -d build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully deployed to GitHub Pages!"
    echo "🌐 Your app is live at: https://sopetin.github.io/circus-coach-app"
    echo ""
    echo "⏳ It may take a few minutes for changes to appear."
else
    echo ""
    echo "❌ Deployment failed. Make sure you've pushed to GitHub first."
fi
