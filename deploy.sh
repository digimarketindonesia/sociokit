#!/bin/bash

# SocioTools Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting SocioTools deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "📝 Copy .env.production.example to .env and configure it"
    exit 1
fi

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

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

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

# Seed database (only on first deployment)
read -p "🌱 Seed database? (y/N): " -n 1 -r
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

# Show logs
echo ""
echo "📊 Deployment complete!"
echo ""
echo "Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "Stop services: docker-compose -f docker-compose.prod.yml down"
echo ""
