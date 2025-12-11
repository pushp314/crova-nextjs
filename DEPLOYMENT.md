# Deployment Guide

This guide covers deploying CROVA Fashion Store to a VPS with PM2 and CI/CD.

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

# 2. Install PM2
sudo npm install -g pm2

# 3. Create app directory
sudo mkdir -p /opt/crova
sudo chown $USER:$USER /opt/crova

# 4. Clone repository
cd /opt/crova
git clone https://github.com/your-username/crova-nextjs.git .

# 5. Create log directory
sudo mkdir -p /var/log/crova
sudo chown $USER:$USER /var/log/crova

# 6. Configure environment
cp env.template .env
nano .env  # Edit with your values

# 7. Install dependencies
npm ci --legacy-peer-deps

# 8. Generate Prisma client
npx prisma generate

# 9. Run migrations
npx prisma migrate deploy

# 10. Build app
npm run build

# 11. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

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
curl http://your-domain.com/api/health
```

## Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Add SSL with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
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

**App not starting:**
```bash
pm2 logs crova --lines 50
```

**Database issues:**
```bash
npx prisma migrate status
npx prisma migrate deploy
```

**Rebuild:**
```bash
rm -rf .next node_modules
npm ci --legacy-peer-deps
npm run build
pm2 reload crova
```
