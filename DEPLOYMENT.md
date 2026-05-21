# Production Deployment Guide

## Prerequisites

- VPS with Ubuntu 20.04+ (minimum 2GB RAM, 2 CPU cores)
- Domain name configured with DNS
- PostgreSQL 15+
- Redis 7+
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

## Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

### 2. Database Setup

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE sociotools;
CREATE USER sociotools_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sociotools TO sociotools_user;
\q

# Run migrations
cd /var/www/sociotools/backend
npx prisma migrate deploy
npx prisma db seed
```

### 3. Backend Configuration

Create `/var/www/sociotools/backend/.env`:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://sociotools_user:your_secure_password@localhost:5432/sociotools

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (Generate secure keys)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (Generate 32-character key)
ENCRYPTION_KEY=your-32-character-encryption-key

# Tripay
TRIPAY_API_KEY=your-tripay-api-key
TRIPAY_PRIVATE_KEY=your-tripay-private-key
TRIPAY_MERCHANT_CODE=your-merchant-code
TRIPAY_BASE_URL=https://tripay.co.id/api

# Xendit
XENDIT_SECRET_KEY=your-xendit-secret-key
XENDIT_WEBHOOK_TOKEN=your-webhook-verification-token

# Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### 4. Build and Start Backend

```bash
cd /var/www/sociotools/backend

# Install dependencies
npm ci --production

# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name sociotools-api
pm2 save
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/sociotools-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/sociotools-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com
```

## Frontend Deployment (Vercel)

### 1. Push to GitHub

```bash
cd /var/www/sociotools/frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/sociotools-frontend.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
   - `NEXT_PUBLIC_APP_NAME=SocioTools`
4. Deploy

### 3. Configure Custom Domain

1. In Vercel dashboard, go to Settings > Domains
2. Add your domain: `yourdomain.com`
3. Update DNS records as instructed

## Post-Deployment

### 1. Configure Webhooks

Update webhook URLs in payment gateways:
- Tripay: `https://api.yourdomain.com/api/webhooks/tripay`
- Xendit: `https://api.yourdomain.com/api/webhooks/xendit`

### 2. Test Critical Flows

- [ ] User registration
- [ ] User login
- [ ] Facebook account connection
- [ ] Auto post creation
- [ ] Shortlink creation
- [ ] Payment (Tripay, Xendit, Manual)
- [ ] Affiliate commission
- [ ] Admin dashboard access

### 3. Monitoring Setup

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Check logs
pm2 logs sociotools-api
```

### 4. Backup Configuration

```bash
# Database backup script
cat > /var/www/sociotools/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/sociotools"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump sociotools > $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /var/www/sociotools/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/sociotools/backup.sh") | crontab -
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall (ufw)
- [ ] Configure fail2ban
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Regular security updates

## Maintenance

### Update Application

```bash
cd /var/www/sociotools/backend
git pull
npm ci --production
npm run build
pm2 restart sociotools-api
```

### Database Migrations

```bash
cd /var/www/sociotools/backend
npx prisma migrate deploy
pm2 restart sociotools-api
```

### Monitor Resources

```bash
# Check PM2 status
pm2 status

# Check system resources
htop

# Check disk space
df -h

# Check logs
pm2 logs sociotools-api --lines 100
```

## Troubleshooting

### Backend won't start
```bash
pm2 logs sociotools-api --err
# Check database connection
# Check Redis connection
# Verify environment variables
```

### Database connection issues
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT 1"
```

### Redis connection issues
```bash
sudo systemctl status redis
redis-cli ping
```

## Support

For issues, check:
1. PM2 logs: `pm2 logs sociotools-api`
2. Nginx logs: `/var/log/nginx/error.log`
3. PostgreSQL logs: `/var/log/postgresql/`
4. Redis logs: `/var/log/redis/`
