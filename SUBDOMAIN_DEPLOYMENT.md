# Deployment ke Subdomain

## Setup untuk socio.digimarket.co.id

### 1. Konfigurasi DNS

Di panel DNS digimarket.co.id, tambahkan:

```
# A Record untuk subdomain
socio.digimarket.co.id    A    <IP_SERVER_VPS>

# A Record untuk API subdomain
api.socio.digimarket.co.id    A    <IP_SERVER_VPS>
```

### 2. Update Environment Variables

Edit `.env`:

```env
# URLs untuk subdomain
FRONTEND_URL=https://socio.digimarket.co.id
BACKEND_URL=https://api.socio.digimarket.co.id

# Database & Redis (sama)
POSTGRES_USER=sociotools
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=sociotools
REDIS_PASSWORD=your_secure_password

# JWT Secrets (generate dengan: openssl rand -base64 32)
JWT_SECRET=your_min_32_char_secret
JWT_REFRESH_SECRET=your_min_32_char_secret

# Encryption Key (harus tepat 32 karakter)
ENCRYPTION_KEY=your_exact_32_character_key_here

# Tripay
TRIPAY_API_KEY=your_tripay_api_key
TRIPAY_PRIVATE_KEY=your_tripay_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_BASE_URL=https://tripay.co.id/api

# Xendit
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_WEBHOOK_TOKEN=your_xendit_webhook_token
```

### 3. Update Nginx Configuration

Edit `nginx/conf.d/default.conf`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name socio.digimarket.co.id api.socio.digimarket.co.id;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Frontend HTTPS
server {
    listen 443 ssl http2;
    server_name socio.digimarket.co.id;

    ssl_certificate /etc/letsencrypt/live/socio.digimarket.co.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/socio.digimarket.co.id/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://frontend:3000;
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

# Backend API HTTPS
server {
    listen 443 ssl http2;
    server_name api.socio.digimarket.co.id;

    ssl_certificate /etc/letsencrypt/live/socio.digimarket.co.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/socio.digimarket.co.id/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS
        add_header 'Access-Control-Allow-Origin' 'https://socio.digimarket.co.id' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

### 4. Deploy

```bash
# Deploy aplikasi
./deploy.sh

# Setup SSL untuk subdomain
./setup-ssl.sh socio.digimarket.co.id
```

### 5. Update Payment Webhooks

Di dashboard payment gateway, update webhook URLs:
- **Tripay**: `https://api.socio.digimarket.co.id/api/webhooks/tripay`
- **Xendit**: `https://api.socio.digimarket.co.id/api/webhooks/xendit`

## 🔄 Migrasi ke Domain Utama Nanti

Ketika sudah beli domain baru, tinggal:

1. **Update DNS** domain baru ke IP server yang sama
2. **Update `.env`** dengan domain baru
3. **Update Nginx config** dengan domain baru
4. **Setup SSL** untuk domain baru: `./setup-ssl.sh domainbaru.com`
5. **Update webhooks** di payment gateway
6. **Redirect** subdomain lama ke domain baru (optional)

Data dan database tetap sama, tidak perlu migrasi data.

## 📝 Rekomendasi Domain

### Domain yang Cocok untuk SocioTools:

**Pilihan Terbaik (.com):**
1. `sociotools.com` - Paling ideal, sesuai nama brand
2. `socio.tools` - Modern, menggunakan TLD .tools
3. `mysocio.com` - Mudah diingat
4. `sociokit.com` - Alternatif jika sociotools tidak tersedia
5. `sociohub.com` - Menggambarkan platform terpusat

**Pilihan Indonesia (.id / .co.id):**
1. `sociotools.id` - Untuk market Indonesia
2. `sociotools.co.id` - Lebih formal untuk bisnis
3. `socio.id` - Singkat dan mudah diingat
4. `mysocio.id` - Alternatif lokal

**Pilihan Kreatif:**
1. `getsocio.com` - Call to action
2. `usesocio.com` - Modern SaaS naming
3. `socio.app` - Untuk aplikasi
4. `socio.io` - Tech-focused

### Tips Memilih Domain:

✅ **Kriteria Bagus:**
- Pendek (maksimal 15 karakter)
- Mudah dieja dan diingat
- Tidak ada tanda hubung
- Sesuai dengan brand/produk
- Tersedia di social media (@sociotools)

❌ **Hindari:**
- Domain dengan angka atau tanda hubung
- Terlalu panjang
- Sulit dieja
- Mirip dengan brand terkenal

### Cek Ketersediaan:

```bash
# Cek di:
- Namecheap.com
- GoDaddy.com
- Niagahoster.co.id (untuk .id)
- Cloudflare Registrar (harga terbaik)
```

### Estimasi Harga:
- `.com`: $10-15/tahun
- `.id`: Rp 200.000-300.000/tahun
- `.co.id`: Rp 150.000-250.000/tahun
- `.tools`: $20-30/tahun

## 🎯 Rekomendasi Saya:

**Untuk Jangka Panjang:**
1. **Pilihan Utama**: `sociotools.com` atau `socio.tools`
2. **Backup**: `mysocio.com` atau `sociokit.com`
3. **Lokal**: `sociotools.id` (jika fokus market Indonesia)

**Strategi:**
- Beli domain .com untuk kredibilitas internasional
- Beli juga .id untuk proteksi brand di Indonesia
- Redirect semua domain ke domain utama

Apakah ada domain spesifik yang ingin dicek ketersediaannya?
