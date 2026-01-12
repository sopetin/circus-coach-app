#!/bin/bash

# GitHub Repository Setup Script
# This script helps you push your code to GitHub

echo "🚀 Setting up GitHub deployment for Circus Coach App"
echo ""

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote 'origin' already exists:"
    git remote -v
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "Keeping existing remote. Run 'git push' to deploy."
        exit 0
    fi
fi

echo "📝 Please create a GitHub repository first:"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: circus-coach-app"
echo "   3. Make it PUBLIC (required for free hosting)"
echo "   4. DO NOT initialize with README/gitignore"
echo "   5. Click 'Create repository'"
echo ""
read -p "Have you created the repository? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the repository first, then run this script again."
    exit 1
fi

echo "Enter your GitHub repository URL:"
echo "Format: https://github.com/sopetin/circus-coach-app.git"
read -p "Repository URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo ""
echo "🔗 Adding remote repository..."
git remote add origin "$repo_url"

echo "📤 Pushing code to GitHub..."
echo "You'll be prompted for your GitHub username and password."
echo ""

git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Next steps:"
    echo "   1. Go to https://vercel.com"
    echo "   2. Sign up/Login with GitHub"
    echo "   3. Click 'Add New Project'"
    echo "   4. Import your 'circus-coach-app' repository"
    echo "   5. Click 'Deploy'"
    echo ""
    echo "Vercel will automatically deploy your app and give you a public URL!"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   - Your GitHub credentials"
    echo "   - Repository URL is correct"
    echo "   - Repository exists and is public"
fi
