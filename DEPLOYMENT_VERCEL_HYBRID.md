# Deployment Hybrid: Vercel + VPS
# Frontend di Vercel, Backend di VPS

## Arsitektur:
```
sociokit.site (Vercel)           → Frontend Next.js
api.sociokit.site (VPS)          → Backend NestJS + PostgreSQL + Redis
```

## Setup DNS di Cloudflare:

```
# A Record untuk API (pointing ke VPS)
api.sociokit.site    A    <IP_VPS_ANDA>

# CNAME untuk frontend (pointing ke Vercel)
sociokit.site        CNAME    cname.vercel-dns.com
www.sociokit.site    CNAME    cname.vercel-dns.com
```

---

## 🚀 LANGKAH 1: Deploy Backend ke VPS

### 1.1 Setup VPS (DigitalOcean/Vultr/Contabo)

**Spesifikasi Minimum:**
- 2GB RAM
- 2 CPU cores
- 50GB SSD
- Ubuntu 22.04 LTS

**Harga VPS:**
- DigitalOcean: $12/bulan (2GB RAM)
- Vultr: $12/bulan (2GB RAM)
- Contabo: €5/bulan (~$5.5) - paling murah!

### 1.2 Install Dependencies di VPS

```bash
# SSH ke VPS
ssh root@<IP_VPS>

# Update system
apt update && apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose -y

# Clone repository
cd /var/www
git clone <your-repo-url> sociokit
cd sociokit
```

### 1.3 Configure Backend

```bash
# Copy environment file
cp .env.production.example .env

# Edit dengan nano
nano .env
```

Isi `.env`:
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://sociokit.site

# Database
DATABASE_URL=postgresql://sociokit:your_password@postgres:5432/sociokit
POSTGRES_USER=sociokit
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=sociokit

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT (generate: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Encryption (must be exactly 32 chars)
ENCRYPTION_KEY=your_32_character_encryption_key

# Payment Gateways
TRIPAY_API_KEY=your_tripay_key
TRIPAY_PRIVATE_KEY=your_tripay_private
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_BASE_URL=https://tripay.co.id/api

XENDIT_SECRET_KEY=your_xendit_key
XENDIT_WEBHOOK_TOKEN=your_xendit_token
```

### 1.4 Deploy Backend

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

### 1.5 Setup Nginx + SSL untuk API

```bash
# Install Nginx
apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
nano /etc/nginx/sites-available/sociokit-api
```

Isi config:
```nginx
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
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/sociokit-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d api.sociokit.site
```

---

## 🎨 LANGKAH 2: Deploy Frontend ke Vercel

### 2.1 Push ke GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/sociokit-frontend.git
git push -u origin main
```

### 2.2 Deploy ke Vercel

1. **Login ke Vercel**: https://vercel.com
2. **Import Project**: Click "Add New" → "Project"
3. **Connect GitHub**: Pilih repository frontend
4. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./` (atau `frontend` jika monorepo)
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Environment Variables** di Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://api.sociokit.site
   NEXT_PUBLIC_APP_NAME=SocioKit
   ```

6. **Deploy**: Click "Deploy"

### 2.3 Configure Custom Domain di Vercel

1. Di Vercel Dashboard → Settings → Domains
2. Add domain: `sociokit.site`
3. Add domain: `www.sociokit.site`
4. Vercel akan kasih instruksi DNS

### 2.4 Update DNS di Cloudflare

```
# Untuk frontend (Vercel)
sociokit.site        CNAME    cname.vercel-dns.com
www.sociokit.site    CNAME    cname.vercel-dns.com

# Untuk backend (VPS)
api.sociokit.site    A        <IP_VPS_ANDA>
```

**PENTING**: Set Proxy status di Cloudflare ke "DNS only" (grey cloud) untuk Vercel CNAME.

---

## 🔧 LANGKAH 3: Configure Webhooks

Update webhook URLs di payment gateway:
- **Tripay**: `https://api.sociokit.site/api/webhooks/tripay`
- **Xendit**: `https://api.sociokit.site/api/webhooks/xendit`

---

## ✅ Testing

1. **Frontend**: https://sociokit.site
2. **Backend API**: https://api.sociokit.site/api/health
3. **Test Registration**: Buat akun baru
4. **Test Login**: Login dengan akun
5. **Test Payment**: Coba payment flow

---

## 💰 Estimasi Biaya Bulanan

| Service | Cost |
|---------|------|
| Vercel (Frontend) | **$0** (Free tier cukup) |
| VPS Backend (Contabo) | **$5.5** |
| Domain .site | **$3/tahun** (~$0.25/bulan) |
| **TOTAL** | **~$6/bulan** |

Sangat terjangkau! 🎉

---

## 🔄 Update/Maintenance

**Update Frontend (Vercel):**
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploy!
```

**Update Backend (VPS):**
```bash
ssh root@<IP_VPS>
cd /var/www/sociokit
git pull
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🆚 Perbandingan dengan Full VPS

| Aspek | Hybrid (Vercel+VPS) | Full VPS |
|-------|---------------------|----------|
| **Biaya** | ~$6/bulan | ~$12-20/bulan |
| **Performance** | ⭐⭐⭐⭐⭐ (CDN global) | ⭐⭐⭐ (single location) |
| **Maintenance** | ⭐⭐⭐⭐⭐ (auto-deploy) | ⭐⭐⭐ (manual) |
| **Scalability** | ⭐⭐⭐⭐⭐ (auto-scale) | ⭐⭐ (manual upgrade) |
| **Setup** | Medium | Complex |

**Rekomendasi: Hybrid (Vercel + VPS)** ✅

Lebih murah, lebih cepat, lebih mudah maintenance!
