# Deployment Guide

This guide covers deploying CROVA Fashion Store to a VPS with PM2, Nginx, and CI/CD.

## Prerequisites

- VPS with Node.js 20+ and PM2 installed
- PostgreSQL database
- GitHub repository with Actions enabled
- Domain name pointed to your VPS

## VPS Initial Setup

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install nginx

# 3. Create app directory
sudo mkdir -p /var/www/crova-nextjs
sudo chown $USER:$USER /var/www/crova-nextjs

# 4. Clone repository
cd /var/www/crova-nextjs
git clone https://github.com/your-username/crova-nextjs.git .

# 5. Create uploads directory (CRITICAL for product images)
mkdir -p public/uploads/products
chmod -R 755 public/uploads

# 6. Create log directory
sudo mkdir -p /var/log/crova
sudo chown $USER:$USER /var/log/crova

# 7. Configure environment
cp env.template .env
nano .env  # Edit with your values

# 8. Install dependencies
npm ci --legacy-peer-deps

# 9. Generate Prisma client
npx prisma generate

# 10. Run migrations
npx prisma migrate deploy

# 11. Build app
npm run build

# 12. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx Configuration (CRITICAL for Static Files)

The included `nginx.conf` file properly serves uploaded images from `/uploads`.

### Quick Setup:

```bash
# 1. Copy the nginx config
sudo cp nginx.conf /etc/nginx/sites-available/crova

# 2. Update domain name in the config
sudo nano /etc/nginx/sites-available/crova
# Replace 'your-domain.com' with your actual domain

# 3. Update the root path if different
# Default: /var/www/crova-nextjs

# 4. Enable the site
sudo ln -sf /etc/nginx/sites-available/crova /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Test nginx config
sudo nginx -t

# 6. Add SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 7. Reload nginx
sudo systemctl reload nginx
```

### Why This Matters:

The key section for fixing image errors:

```nginx
location /uploads {
    alias /var/www/crova-nextjs/public/uploads;
    expires 30d;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

This tells Nginx to:
1. Serve `/uploads/*` paths directly from the filesystem
2. NOT proxy these requests to Next.js (which causes the HTML error)
3. Return 404 if file doesn't exist (instead of HTML error page)

## GitHub Actions CI/CD

### Required Secrets

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | Your VPS IP or hostname |
| `VPS_USERNAME` | SSH username |
| `VPS_SSH_KEY` | Private SSH key |

### Workflow

1. Push to `main` → Triggers pipeline
2. Lint & Type Check
3. Build verification
4. SSH to VPS → Pull, Build, Restart PM2

## Environment Variables

See `env.template` for all required variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production URL

## Health Check

```bash
curl https://your-domain.com/api/health
```

## PM2 Commands

```bash
pm2 status          # Check app status
pm2 logs crova      # View logs
pm2 restart crova   # Restart app
pm2 reload crova    # Zero-downtime restart
pm2 stop crova      # Stop app
```

## Troubleshooting

### Images Not Loading (HTML instead of image)

**Cause:** Nginx isn't configured to serve `/uploads` directly.

**Fix:**
```bash
# 1. Check nginx config includes uploads location
sudo grep -A5 "location /uploads" /etc/nginx/sites-available/crova

# 2. Verify uploads directory exists
ls -la /var/www/crova-nextjs/public/uploads/

# 3. Check file permissions
chmod -R 755 /var/www/crova-nextjs/public/uploads/

# 4. Reload nginx
sudo systemctl reload nginx
```

### App not starting

```bash
pm2 logs crova --lines 50
```

### Database issues

```bash
npx prisma migrate status
npx prisma migrate deploy
```

### Full Rebuild

```bash
rm -rf .next node_modules
npm ci --legacy-peer-deps
npm run build
pm2 reload crova
```

### After Code Changes

```bash
cd /var/www/crova-nextjs
git pull origin main
npm ci --legacy-peer-deps
npm run build
pm2 reload crova
```
