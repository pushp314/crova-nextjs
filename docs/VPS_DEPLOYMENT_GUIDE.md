# VPS Deployment Guide - Static File Serving

This guide covers deploying the NOVA e-commerce platform on a VPS with proper static file serving for uploaded images using the formidable-based upload system.

## Architecture Overview

```
VPS Server
├── Next.js App (Port 3000)
│   ├── API Routes (/api/*)
│   └── Pages
└── Static Files
    └── /public/uploads/
        ├── products/
        ├── banners/
        ├── proofs/
        └── avatars/
```

## Upload System Structure

### Directory Organization

```
/public/uploads/
├── products/           # Product images (flat structure)
│   └── product-name-1234567890-98765.jpg
├── banners/           # Banner images (date-organized)
│   └── 2025/
│       └── 01/
│           └── banner-name-1234567890-98765.jpg
├── proofs/            # Delivery proof images
│   └── 2025/01/
└── avatars/           # User avatars
    └── 2025/01/
```

### File Naming Convention

- **Format**: `{original-name}-{timestamp}-{random}.{ext}`
- **Example**: `blue-tshirt-1705234567890-123456789.jpg`
- **Sanitization**: Special characters replaced with underscores
- **Collision Protection**: Timestamp + random number ensures uniqueness

## Deployment Options

### Option 1: Next.js Built-in Static Serving (Recommended)

Next.js automatically serves files from `/public` directory.

**Pros:**
- Zero configuration required
- Works with `next start` in production
- No additional server needed
- Automatic cache headers

**Cons:**
- Limited control over cache policies
- No CDN integration out-of-the-box

**Setup:**

```bash
# Build the application
npm run build

# Start production server
npm start
# OR with PM2
pm2 start npm --name "nova-ecommerce" -- start
```

**Image URLs:**
```
https://yourdomain.com/uploads/products/tshirt-123.jpg
https://yourdomain.com/uploads/banners/2025/01/banner-123.jpg
```

---

### Option 2: Nginx Reverse Proxy + Static Serving (Best Performance)

Use Nginx to serve static files directly and proxy API/page requests to Next.js.

**Pros:**
- Maximum performance for static files
- Advanced cache control
- Compression (gzip/brotli)
- Rate limiting capabilities
- CDN-ready

**Cons:**
- Requires Nginx configuration
- More complex setup

**Nginx Configuration:**

```nginx
# /etc/nginx/sites-available/nova-ecommerce

upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Rate limiting for uploads
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=10r/m;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Max upload size (must match formidable config)
    client_max_body_size 30M; # 6 files × 5MB each

    # Compression
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1000;

    # Root directory
    root /var/www/nova-ecommerce;

    # Static file serving with aggressive caching
    location /uploads/ {
        alias /var/www/nova-ecommerce/public/uploads/;
        
        # Cache images for 1 year
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security headers
        add_header X-Content-Type-Options "nosniff";
        add_header X-Frame-Options "SAMEORIGIN";
        
        # CORS for CDN (optional)
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        
        # Prevent directory listing
        autoindex off;
        
        # Return 404 for non-existent files (no fallback)
        try_files $uri =404;
    }

    # Upload endpoint with rate limiting
    location /api/upload {
        limit_req zone=upload_limit burst=5 nodelay;
        
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Disable buffering for uploads
        proxy_request_buffering off;
        proxy_buffering off;
        
        # Timeout for large uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Next.js application (all other routes)
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Enable and Start:**

```bash
# Test configuration
sudo nginx -t

# Enable site
sudo ln -s /etc/nginx/sites-available/nova-ecommerce /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx

# Start Next.js with PM2
cd /var/www/nova-ecommerce
pm2 start npm --name "nova-ecommerce" -- start
pm2 save
pm2 startup
```

---

### Option 3: Standalone Express Server (Alternative)

Use a separate Express server to serve static files if you need custom middleware.

**Server Script (`server.js`):**

```javascript
const express = require('express');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // Serve static uploads with cache headers
  server.use('/uploads', express.static(
    path.join(__dirname, 'public/uploads'),
    {
      maxAge: '1y', // Cache for 1 year
      immutable: true,
      setHeaders: (res, filePath) => {
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'SAMEORIGIN');
      },
    }
  ));

  // All other routes go to Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
```

**Package.json:**

```json
{
  "scripts": {
    "dev": "next dev -p 9002",
    "build": "next build",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

**Start with PM2:**

```bash
pm2 start server.js --name "nova-ecommerce"
pm2 save
```

---

## Environment Configuration

### Production `.env`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nova_ecommerce"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret-key-here"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Crova <noreply@yourdomain.com>"

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Upload Configuration
MAX_UPLOAD_SIZE=5242880  # 5MB in bytes
MAX_FILES_PER_UPLOAD=6
```

---

## File Permissions

Set correct permissions for upload directories:

```bash
cd /var/www/nova-ecommerce

# Create upload directories
mkdir -p public/uploads/{products,banners,proofs,avatars}

# Set ownership to Node.js process user
sudo chown -R $USER:$USER public/uploads

# Set directory permissions (755 = rwxr-xr-x)
sudo find public/uploads -type d -exec chmod 755 {} \;

# Set file permissions (644 = rw-r--r--)
sudo find public/uploads -type f -exec chmod 644 {} \;
```

---

## Disk Space Management

### Monitor Upload Directory Size

```bash
# Check total size
du -sh /var/www/nova-ecommerce/public/uploads

# Check size by bucket
du -sh /var/www/nova-ecommerce/public/uploads/*

# Find large files
find /var/www/nova-ecommerce/public/uploads -type f -size +5M
```

### Automated Cleanup (Optional)

Create a cron job to remove old unused images:

```bash
# Edit crontab
crontab -e

# Add job to run monthly (example: delete files older than 1 year)
0 2 1 * * find /var/www/nova-ecommerce/public/uploads -type f -mtime +365 -delete
```

---

## Backup Strategy

### Daily Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-uploads.sh

UPLOAD_DIR="/var/www/nova-ecommerce/public/uploads"
BACKUP_DIR="/backups/uploads"
DATE=$(date +%Y-%m-%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Compress and backup
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz -C $UPLOAD_DIR .

# Keep only last 30 days of backups
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete

echo "Backup completed: uploads-$DATE.tar.gz"
```

**Make executable and schedule:**

```bash
chmod +x /usr/local/bin/backup-uploads.sh

# Add to crontab (run daily at 3 AM)
0 3 * * * /usr/local/bin/backup-uploads.sh >> /var/log/upload-backups.log 2>&1
```

---

## CDN Integration (Optional)

### Cloudflare CDN Setup

1. **Point domain to Cloudflare**
2. **Enable Cloudflare CDN**
3. **Create Page Rule for `/uploads/*`:**
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 year

### AWS CloudFront Setup

1. **Create CloudFront Distribution**
   - Origin: `yourdomain.com`
   - Origin Path: `/uploads`
   - Cache Policy: CachingOptimized

2. **Update Image URLs in Frontend:**
   ```typescript
   const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
   const imageUrl = `${CDN_URL}/products/image.jpg`;
   ```

---

## Monitoring & Logging

### Nginx Access Logs

```bash
# View upload requests
tail -f /var/log/nginx/access.log | grep "/uploads"

# View upload POST requests
tail -f /var/log/nginx/access.log | grep "POST /api/upload"
```

### PM2 Logs

```bash
# View Next.js application logs
pm2 logs nova-ecommerce

# View only error logs
pm2 logs nova-ecommerce --err
```

### Disk Usage Alert

```bash
# Add to crontab to check daily
0 9 * * * df -h | grep -E '^/dev/' | awk '{ if ($5+0 > 80) print $0 }' | mail -s "Disk Usage Alert" admin@yourdomain.com
```

---

## Troubleshooting

### Issue: 413 Request Entity Too Large

**Nginx:**
```nginx
client_max_body_size 30M;
```

**Next.js API Route (not needed with formidable, but for reference):**
```typescript
export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};
```

### Issue: CORS Errors for Images

**Nginx:**
```nginx
location /uploads/ {
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

### Issue: Permission Denied

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/nova-ecommerce/public/uploads

# Fix permissions
sudo chmod -R 755 /var/www/nova-ecommerce/public/uploads
```

### Issue: Slow Upload Performance

1. **Enable buffering in Nginx** (for large files):
   ```nginx
   proxy_buffering on;
   proxy_buffer_size 4k;
   proxy_buffers 8 4k;
   ```

2. **Increase Node.js memory**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" pm2 start npm -- start
   ```

---

## Security Checklist

- ✅ SSL/TLS enabled (HTTPS)
- ✅ Rate limiting on upload endpoints
- ✅ File type validation (server-side)
- ✅ File size limits enforced
- ✅ Directory listing disabled
- ✅ RBAC for upload endpoints (ADMIN/DELIVERY)
- ✅ Unique filenames prevent enumeration
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options)
- ✅ No sensitive data in upload directories
- ✅ Regular backups configured

---

## Performance Optimization

### Image Optimization

Consider adding Sharp for automatic image optimization:

```bash
npm install sharp
```

**Middleware (`src/lib/image-optimizer.ts`):**

```typescript
import sharp from 'sharp';
import path from 'path';

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: {
    width?: number;
    quality?: number;
  } = {}
) {
  await sharp(inputPath)
    .resize(options.width || 1200, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: options.quality || 85 })
    .toFile(outputPath);
}
```

### Lazy Loading Images

Already implemented in frontend components using Next.js Image component.

---

## Deployment Checklist

- [ ] Build application: `npm run build`
- [ ] Set environment variables in production `.env`
- [ ] Create upload directories with correct permissions
- [ ] Configure Nginx (if using Option 2)
- [ ] Test upload endpoint: `curl -X POST -F "file=@test.jpg" https://yourdomain.com/api/upload?bucket=products`
- [ ] Verify static file access: `curl -I https://yourdomain.com/uploads/products/test.jpg`
- [ ] Start application with PM2
- [ ] Configure firewall (UFW): `sudo ufw allow 80,443/tcp`
- [ ] Set up SSL with Let's Encrypt: `sudo certbot --nginx -d yourdomain.com`
- [ ] Configure backup cron jobs
- [ ] Set up monitoring (PM2, Nginx logs)
- [ ] Test full upload flow (frontend → API → storage → display)

---

## Quick Start Commands

```bash
# 1. Clone and install
git clone <repository-url>
cd nova-ecommerce
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with production values

# 3. Database setup
npx prisma generate
npx prisma migrate deploy

# 4. Build application
npm run build

# 5. Start with PM2
pm2 start npm --name "nova-ecommerce" -- start
pm2 save
pm2 startup

# 6. Configure Nginx (if using)
sudo nano /etc/nginx/sites-available/nova-ecommerce
# Paste configuration from above
sudo nginx -t
sudo systemctl restart nginx

# 7. SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Done! Access at https://yourdomain.com
```

---

## Support

For issues or questions:
- Check logs: `pm2 logs nova-ecommerce`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Review [Next.js deployment docs](https://nextjs.org/docs/deployment)
- Review [formidable documentation](https://github.com/node-formidable/formidable)

---

**Last Updated**: January 2025
**Next.js Version**: 15.3.3
**Formidable Version**: 3.5.2
