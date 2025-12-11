#!/bin/bash

# ============================================
# CROVA Deployment Script
# ============================================
# Run this script on your VPS to deploy updates:
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================

set -e  # Exit on any error

echo "🚀 Starting CROVA deployment..."

# Configuration
APP_DIR="/opt/crova"
BRANCH="main"

# Navigate to app directory
cd "$APP_DIR"

echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/$BRANCH

echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🏗️  Building application..."
npm run build

echo "♻️  Restarting PM2..."
pm2 reload crova --update-env 2>/dev/null || pm2 start ecosystem.config.js

echo "⏳ Waiting for app to start..."
sleep 5

echo "🔍 Running health check..."
if curl -s -f http://localhost:3000/api/health > /dev/null; then
    echo "✅ Deployment successful! App is running."
else
    echo "❌ Health check failed. Check logs with: pm2 logs crova"
    exit 1
fi

echo ""
echo "============================================"
echo "🎉 Deployment complete!"
echo "============================================"
