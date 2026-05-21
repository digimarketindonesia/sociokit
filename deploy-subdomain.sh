#!/bin/bash

# SocioTools Subdomain Deployment Script
# Usage: ./deploy-subdomain.sh socio.digimarket.co.id

set -e

SUBDOMAIN=$1

if [ -z "$SUBDOMAIN" ]; then
    echo "Usage: ./deploy-subdomain.sh socio.digimarket.co.id"
    exit 1
fi

API_SUBDOMAIN="api.$SUBDOMAIN"

echo "🚀 Deploying SocioTools to subdomain: $SUBDOMAIN"
echo "📡 API will be at: $API_SUBDOMAIN"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "📝 Creating .env from template..."
    cp .env.production.example .env

    # Update URLs in .env
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$SUBDOMAIN|g" .env
    sed -i "s|BACKEND_URL=.*|BACKEND_URL=https://$API_SUBDOMAIN|g" .env

    echo "✅ .env created. Please edit it with your actual values:"
    echo "   - Database passwords"
    echo "   - JWT secrets"
    echo "   - Encryption key"
    echo "   - Payment gateway credentials"
    echo ""
    echo "Then run this script again."
    exit 0
fi

# Update Nginx config with subdomain
echo "📝 Updating Nginx configuration..."
sed -i "s|yourdomain.com|$SUBDOMAIN|g" nginx/conf.d/default.conf
sed -i "s|www.yourdomain.com|www.$SUBDOMAIN|g" nginx/conf.d/default.conf
sed -i "s|api.yourdomain.com|$API_SUBDOMAIN|g" nginx/conf.d/default.conf

echo "✅ Nginx configuration updated"

# Load environment variables
source .env

# Check required variables
required_vars=(
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "ENCRYPTION_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build services
echo "🔨 Building services..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Seed database
read -p "🌱 Seed database with initial data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose -f docker-compose.prod.yml exec -T backend npx prisma db seed
fi

# Check service health
echo "🏥 Checking service health..."
sleep 5

if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Services are running"
else
    echo "❌ Some services failed to start"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo ""
echo "📊 Deployment complete!"
echo ""
echo "🌐 Your application is running at:"
echo "   Frontend: https://$SUBDOMAIN"
echo "   Backend API: https://$API_SUBDOMAIN"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo ""
echo "1. Setup SSL certificate:"
echo "   ./setup-ssl.sh $SUBDOMAIN"
echo ""
echo "2. Configure payment webhooks:"
echo "   Tripay: https://$API_SUBDOMAIN/api/webhooks/tripay"
echo "   Xendit: https://$API_SUBDOMAIN/api/webhooks/xendit"
echo ""
echo "3. Test the application:"
echo "   - User registration"
echo "   - Facebook account connection"
echo "   - Payment flows"
echo ""
echo "📋 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop services: docker-compose -f docker-compose.prod.yml down"
echo ""
