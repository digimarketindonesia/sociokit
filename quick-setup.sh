#!/bin/bash

# Quick Setup Script untuk Subdomain
# Usage: ./quick-setup.sh

set -e

echo "🚀 SocioTools Quick Setup untuk Subdomain"
echo "=========================================="
echo ""

# Generate secure passwords and keys
echo "🔐 Generating secure passwords and keys..."

POSTGRES_PASS=$(openssl rand -base64 24)
REDIS_PASS=$(openssl rand -base64 24)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

echo "✅ Secure keys generated"
echo ""

# Get subdomain from user
read -p "📝 Enter your subdomain (e.g., socio.digimarket.co.id): " SUBDOMAIN

if [ -z "$SUBDOMAIN" ]; then
    echo "❌ Subdomain cannot be empty"
    exit 1
fi

API_SUBDOMAIN="api.$SUBDOMAIN"

echo ""
echo "📋 Configuration Summary:"
echo "   Frontend: https://$SUBDOMAIN"
echo "   Backend API: https://$API_SUBDOMAIN"
echo ""

# Create .env file
echo "📝 Creating .env file..."

cat > .env << EOF
# Auto-generated configuration
# Generated at: $(date)

# Database
POSTGRES_USER=sociotools
POSTGRES_PASSWORD=$POSTGRES_PASS
POSTGRES_DB=sociotools

# Redis
REDIS_PASSWORD=$REDIS_PASS

# JWT Secrets (auto-generated)
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH

# Encryption Key (auto-generated, 32 characters)
ENCRYPTION_KEY=$ENCRYPTION_KEY

# URLs
FRONTEND_URL=https://$SUBDOMAIN
BACKEND_URL=https://$API_SUBDOMAIN

# Tripay Payment Gateway (MUST BE CONFIGURED)
TRIPAY_API_KEY=CONFIGURE_THIS_IN_TRIPAY_DASHBOARD
TRIPAY_PRIVATE_KEY=CONFIGURE_THIS_IN_TRIPAY_DASHBOARD
TRIPAY_MERCHANT_CODE=CONFIGURE_THIS_IN_TRIPAY_DASHBOARD
TRIPAY_BASE_URL=https://tripay.co.id/api

# Xendit Payment Gateway (MUST BE CONFIGURED)
XENDIT_SECRET_KEY=CONFIGURE_THIS_IN_XENDIT_DASHBOARD
XENDIT_WEBHOOK_TOKEN=CONFIGURE_THIS_IN_XENDIT_DASHBOARD

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
EOF

echo "✅ .env file created"
echo ""

# Save credentials to file
CREDS_FILE="credentials_$(date +%Y%m%d_%H%M%S).txt"

cat > $CREDS_FILE << EOF
SocioTools Credentials
Generated: $(date)
Subdomain: $SUBDOMAIN

===========================================
DATABASE CREDENTIALS
===========================================
PostgreSQL User: sociotools
PostgreSQL Password: $POSTGRES_PASS
PostgreSQL Database: sociotools

===========================================
REDIS CREDENTIALS
===========================================
Redis Password: $REDIS_PASS

===========================================
JWT SECRETS
===========================================
JWT Secret: $JWT_SECRET
JWT Refresh Secret: $JWT_REFRESH

===========================================
ENCRYPTION KEY
===========================================
Encryption Key: $ENCRYPTION_KEY

===========================================
IMPORTANT NOTES
===========================================
1. BACKUP THIS FILE SECURELY
2. Configure payment gateways in .env:
   - Tripay: https://tripay.co.id
   - Xendit: https://dashboard.xendit.co
3. Setup DNS records:
   - $SUBDOMAIN -> Your Server IP
   - $API_SUBDOMAIN -> Your Server IP

===========================================
NEXT STEPS
===========================================
1. Configure payment gateway credentials in .env
2. Setup DNS records
3. Run: ./deploy-subdomain.sh $SUBDOMAIN
4. Run: ./setup-ssl.sh $SUBDOMAIN
5. Configure webhooks in payment dashboards
EOF

echo "✅ Credentials saved to: $CREDS_FILE"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Backup $CREDS_FILE securely"
echo "   2. Edit .env and configure payment gateway credentials"
echo "   3. Setup DNS records for $SUBDOMAIN and $API_SUBDOMAIN"
echo ""
echo "📋 Next steps:"
echo "   1. nano .env  # Configure payment gateways"
echo "   2. ./deploy-subdomain.sh $SUBDOMAIN"
echo "   3. ./setup-ssl.sh $SUBDOMAIN"
echo ""
