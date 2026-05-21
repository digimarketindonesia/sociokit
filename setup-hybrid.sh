#!/bin/bash

# SocioKit Hybrid Deployment Setup
# Frontend: Vercel | Backend: VPS

set -e

echo "🚀 SocioKit Hybrid Deployment Setup"
echo "===================================="
echo ""
echo "Arsitektur:"
echo "  Frontend: sociokit.site (Vercel)"
echo "  Backend:  api.sociokit.site (VPS)"
echo ""

# Check if running on VPS
if [ ! -f /etc/os-release ]; then
    echo "❌ This script should run on Ubuntu VPS"
    exit 1
fi

# Get VPS IP
VPS_IP=$(curl -s ifconfig.me)
echo "📍 VPS IP Address: $VPS_IP"
echo ""

# Generate secure credentials
echo "🔐 Generating secure credentials..."
POSTGRES_PASS=$(openssl rand -base64 24)
REDIS_PASS=$(openssl rand -base64 24)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Create .env for backend
cat > .env << EOF
# Auto-generated for SocioKit
# Generated: $(date)

NODE_ENV=production
PORT=3001
FRONTEND_URL=https://sociokit.site

# Database
DATABASE_URL=postgresql://sociokit:${POSTGRES_PASS}@postgres:5432/sociokit
POSTGRES_USER=sociokit
POSTGRES_PASSWORD=${POSTGRES_PASS}
POSTGRES_DB=sociokit

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASS}

# JWT Secrets
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Key (32 chars)
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Payment Gateways - CONFIGURE THESE!
TRIPAY_API_KEY=CONFIGURE_IN_TRIPAY_DASHBOARD
TRIPAY_PRIVATE_KEY=CONFIGURE_IN_TRIPAY_DASHBOARD
TRIPAY_MERCHANT_CODE=CONFIGURE_IN_TRIPAY_DASHBOARD
TRIPAY_BASE_URL=https://tripay.co.id/api

XENDIT_SECRET_KEY=CONFIGURE_IN_XENDIT_DASHBOARD
XENDIT_WEBHOOK_TOKEN=CONFIGURE_IN_XENDIT_DASHBOARD

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
EOF

echo "✅ Backend .env created"

# Save credentials
CREDS_FILE="sociokit_credentials_$(date +%Y%m%d_%H%M%S).txt"
cat > $CREDS_FILE << EOF
SocioKit Deployment Credentials
Generated: $(date)
VPS IP: $VPS_IP

========================================
DNS CONFIGURATION (Cloudflare)
========================================
Add these records in Cloudflare:

A Record:
  api.sociokit.site  →  $VPS_IP

CNAME Records (for Vercel):
  sociokit.site      →  cname.vercel-dns.com
  www.sociokit.site  →  cname.vercel-dns.com

Set Proxy Status: DNS only (grey cloud)

========================================
DATABASE CREDENTIALS
========================================
PostgreSQL User: sociokit
PostgreSQL Password: $POSTGRES_PASS
PostgreSQL Database: sociokit

========================================
REDIS CREDENTIALS
========================================
Redis Password: $REDIS_PASS

========================================
JWT SECRETS
========================================
JWT Secret: $JWT_SECRET
JWT Refresh Secret: $JWT_REFRESH

========================================
ENCRYPTION KEY
========================================
Encryption Key: $ENCRYPTION_KEY

========================================
VERCEL ENVIRONMENT VARIABLES
========================================
Add these in Vercel Dashboard:

NEXT_PUBLIC_API_URL=https://api.sociokit.site
NEXT_PUBLIC_APP_NAME=SocioKit

========================================
WEBHOOK URLS (Configure in Payment Dashboards)
========================================
Tripay:  https://api.sociokit.site/api/webhooks/tripay
Xendit:  https://api.sociokit.site/api/webhooks/xendit

========================================
IMPORTANT NOTES
========================================
1. BACKUP THIS FILE SECURELY!
2. Configure payment gateway credentials in .env
3. Setup DNS records in Cloudflare
4. Deploy frontend to Vercel
5. Configure webhooks in payment dashboards
EOF

echo "✅ Credentials saved to: $CREDS_FILE"
echo ""

# Install Docker if not exists
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker installed"
fi

# Install Docker Compose if not exists
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    apt install docker-compose -y
    echo "✅ Docker Compose installed"
fi

# Install Nginx if not exists
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt update
    apt install nginx certbot python3-certbot-nginx -y
    echo "✅ Nginx installed"
fi

# Create Nginx config for API
echo "📝 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/sociokit-api << 'EOF'
server {
    listen 80;
    server_name api.sociokit.site;

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

        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://sociokit.site' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/sociokit-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "✅ Nginx configured"

echo ""
echo "📊 Setup Complete!"
echo ""
echo "⚠️  NEXT STEPS:"
echo ""
echo "1. Configure Payment Gateways:"
echo "   nano .env"
echo "   # Edit TRIPAY_* and XENDIT_* values"
echo ""
echo "2. Setup DNS in Cloudflare:"
echo "   A Record:    api.sociokit.site  →  $VPS_IP"
echo "   CNAME:       sociokit.site      →  cname.vercel-dns.com"
echo "   CNAME:       www.sociokit.site  →  cname.vercel-dns.com"
echo ""
echo "3. Deploy Backend:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo "   docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy"
echo "   docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed"
echo ""
echo "4. Setup SSL:"
echo "   certbot --nginx -d api.sociokit.site"
echo ""
echo "5. Deploy Frontend to Vercel:"
echo "   - Push frontend to GitHub"
echo "   - Import to Vercel"
echo "   - Add environment variables (see $CREDS_FILE)"
echo "   - Add custom domain: sociokit.site"
echo ""
echo "6. Configure Webhooks (see $CREDS_FILE)"
echo ""
echo "📋 Credentials saved in: $CREDS_FILE"
echo "🔒 BACKUP THIS FILE SECURELY!"
echo ""
