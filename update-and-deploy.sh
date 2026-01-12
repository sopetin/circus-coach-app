#!/bin/bash

# Quick update and deploy script
# Use this after making changes in Cursor

echo "🔄 Updating and deploying Circus Coach App..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository!"
    exit 1
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit."
    echo "Current status:"
    git status
    exit 0
fi

# Show changes
echo "📝 Changes detected:"
git status --short
echo ""

# Ask for commit message
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update from Cursor - $(date +'%Y-%m-%d %H:%M')"
fi

# Add, commit, and push
echo ""
echo "📦 Staging changes..."
git add -A

echo "💾 Committing changes..."
git commit -m "$commit_msg"

echo "🚀 Pushing to GitHub..."
git push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "⏳ Vercel will auto-deploy in 1-2 minutes"
    echo "🌐 Check your Vercel dashboard for the live URL"
else
    echo ""
    echo "❌ Push failed. Check your GitHub credentials."
    echo "   You may need a Personal Access Token instead of password."
fi
