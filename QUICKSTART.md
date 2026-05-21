# SocioKit - Quick Start Guide

## 🎯 Deployment: sociokit.site

**Arsitektur Hybrid:**
- Frontend: Vercel (gratis, fast, CDN global)
- Backend: VPS (full control, database, queue)

---

## 📋 Checklist Deployment

### ✅ Persiapan

- [ ] VPS Ubuntu ready (min 2GB RAM)
- [ ] Domain sociokit.site connected ke Cloudflare
- [ ] Akun Vercel (gratis)
- [ ] Akun GitHub
- [ ] Akun Tripay (payment gateway)
- [ ] Akun Xendit (payment gateway)

### 🔧 Setup Backend (VPS)

```bash
# 1. SSH ke VPS
ssh root@<IP_VPS>

# 2. Clone repository
cd /var/www
git clone <your-repo> sociokit
cd sociokit

# 3. Run setup script
chmod +x setup-hybrid.sh
./setup-hybrid.sh

# 4. Configure payment gateways
nano .env
# Edit TRIPAY_* dan XENDIT_* values

# 5. Deploy backend
docker-compose -f docker-compose.prod.yml up -d

# 6. Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed

# 7. Setup SSL
certbot --nginx -d api.sociokit.site
```

### 🎨 Setup Frontend (Vercel)

```bash
# 1. Push ke GitHub
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/sociokit-frontend.git
git push -u origin main

# 2. Deploy ke Vercel
# - Login ke vercel.com
# - Import repository
# - Add environment variables:
#   NEXT_PUBLIC_API_URL=https://api.sociokit.site
#   NEXT_PUBLIC_APP_NAME=SocioKit
# - Deploy

# 3. Add custom domain
# - Settings → Domains
# - Add: sociokit.site
# - Add: www.sociokit.site
```

### 🌐 Setup DNS (Cloudflare)

```
Type    Name                Value                       Proxy
----    ----                -----                       -----
A       api.sociokit.site   <IP_VPS>                   DNS only
CNAME   sociokit.site       cname.vercel-dns.com       DNS only
CNAME   www.sociokit.site   cname.vercel-dns.com       DNS only
```

**PENTING:** Set Proxy Status ke "DNS only" (grey cloud)

### 💳 Configure Webhooks

**Tripay Dashboard:**
- Webhook URL: `https://api.sociokit.site/api/webhooks/tripay`

**Xendit Dashboard:**
- Webhook URL: `https://api.sociokit.site/api/webhooks/xendit`

---

## 🧪 Testing

1. **Frontend**: https://sociokit.site
2. **Backend Health**: https://api.sociokit.site/api/health
3. **Register**: Buat akun baru
4. **Login**: Login dengan akun
5. **Facebook Account**: Connect FB account
6. **Payment**: Test payment flow

---

## 💰 Biaya Bulanan

| Service | Biaya |
|---------|-------|
| Vercel Frontend | **GRATIS** |
| VPS (Contabo 2GB) | **$5.5/bulan** |
| Domain .site | **$3/tahun** |
| **TOTAL** | **~$6/bulan** |

---

## 🔄 Update Application

**Frontend (Auto-deploy):**
```bash
git add .
git commit -m "Update"
git push
# Vercel auto-deploy!
```

**Backend:**
```bash
ssh root@<IP_VPS>
cd /var/www/sociokit
git pull
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 📞 Support

**Dokumentasi Lengkap:**
- [DEPLOYMENT_VERCEL_HYBRID.md](DEPLOYMENT_VERCEL_HYBRID.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [PRODUCTION.md](PRODUCTION.md)

**Troubleshooting:**
```bash
# Check backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Check all services
docker-compose -f docker-compose.prod.yml ps

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

---

## 🎉 Selamat!

Aplikasi SocioKit siap production di:
- **Frontend**: https://sociokit.site
- **Backend API**: https://api.sociokit.site

**Next Steps:**
1. Test semua fitur
2. Setup monitoring
3. Backup database rutin
4. Marketing & promosi! 🚀
