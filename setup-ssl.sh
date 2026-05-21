#!/bin/bash

# SSL Certificate Setup Script
# Usage: ./setup-ssl.sh yourdomain.com

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./setup-ssl.sh yourdomain.com"
    exit 1
fi

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Create certbot directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Get certificate
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@$DOMAIN \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN

echo "✅ SSL certificate obtained"

# Reload nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ Nginx reloaded"
echo ""
echo "Certificate will auto-renew. To manually renew:"
echo "docker run --rm -v $(pwd)/certbot/conf:/etc/letsencrypt -v $(pwd)/certbot/www:/var/www/certbot certbot/certbot renew"
