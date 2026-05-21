# SocioTools - Production Deployment

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose installed
- Domain name with DNS configured
- Tripay & Xendit accounts (for payments)

### 2. Initial Setup

```bash
# Clone repository
git clone <your-repo-url>
cd sociotools

# Copy environment file
cp .env.production.example .env

# Edit .env with your actual values
nano .env
```

### 3. Deploy

```bash
# Make scripts executable
chmod +x deploy.sh backup.sh setup-ssl.sh

# Deploy application
./deploy.sh

# Setup SSL (after DNS is configured)
./setup-ssl.sh yourdomain.com
```

### 4. Configure Payment Webhooks

Update webhook URLs in your payment gateway dashboards:
- **Tripay**: `https://api.yourdomain.com/api/webhooks/tripay`
- **Xendit**: `https://api.yourdomain.com/api/webhooks/xendit`

## File Structure

```
sociotools/
├── backend/
│   ├── Dockerfile              # Backend container
│   └── ...
├── frontend/
│   ├── Dockerfile              # Frontend container
│   └── ...
├── nginx/
│   ├── nginx.conf              # Main Nginx config
│   └── conf.d/
│       └── default.conf        # Site configuration
├── docker-compose.prod.yml     # Production compose file
├── ecosystem.config.js         # PM2 configuration
├── .env.production.example     # Environment template
├── deploy.sh                   # Deployment script
├── backup.sh                   # Database backup script
├── setup-ssl.sh                # SSL certificate setup
└── DEPLOYMENT.md               # Detailed deployment guide
```

## Management Commands

### Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Database Backup
```bash
./backup.sh
```

### Update Application
```bash
git pull
./deploy.sh
```

### Database Migrations
```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Monitoring

### Check Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Check Resource Usage
```bash
docker stats
```

### Access Database
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U sociotools
```

### Access Redis
```bash
docker-compose -f docker-compose.prod.yml exec redis redis-cli
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env
```

### Database connection issues
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check connection
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull
```

### SSL certificate issues
```bash
# Renew certificate
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot renew

# Reload Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate secure JWT secrets (32+ characters)
- [ ] Configure firewall rules
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up regular backups
- [ ] Enable monitoring/alerting
- [ ] Review Nginx security headers
- [ ] Limit database access
- [ ] Enable Redis password

## Performance Optimization

### Database
- Enable connection pooling
- Add indexes for frequently queried fields
- Regular VACUUM and ANALYZE

### Redis
- Configure maxmemory policy
- Enable persistence (AOF)
- Monitor memory usage

### Nginx
- Enable gzip compression
- Configure caching headers
- Optimize worker processes

## Backup Strategy

### Automated Backups
Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/sociotools/backup.sh
```

### Manual Backup
```bash
./backup.sh
```

### Restore from Backup
```bash
gunzip backups/sociotools_YYYYMMDD_HHMMSS.sql.gz
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U sociotools < backups/sociotools_YYYYMMDD_HHMMSS.sql
```

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

For issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables in `.env`
3. Check service health: `docker-compose -f docker-compose.prod.yml ps`
4. Review [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
