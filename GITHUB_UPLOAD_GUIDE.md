# Panduan Upload ke GitHub

## ✅ FILE YANG HARUS DI-UPLOAD

### 📁 Backend Files
```
backend/
├── src/                          ✅ Upload (source code)
│   ├── modules/
│   ├── common/
│   ├── database/
│   ├── main.ts
│   └── app.module.ts
├── prisma/                       ✅ Upload
│   ├── schema.prisma            ✅ Upload (database schema)
│   └── seed.ts                  ✅ Upload (seed script)
├── package.json                  ✅ Upload
├── package-lock.json             ✅ Upload
├── tsconfig.json                 ✅ Upload
├── nest-cli.json                 ✅ Upload
├── Dockerfile                    ✅ Upload
└── .env.example                  ✅ Upload (template only!)
```

### 📁 Frontend Files
```
frontend/
├── src/                          ✅ Upload (source code)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── hooks/
├── public/                       ✅ Upload (static assets)
├── package.json                  ✅ Upload
├── package-lock.json             ✅ Upload
├── tsconfig.json                 ✅ Upload
├── next.config.js                ✅ Upload
├── tailwind.config.ts            ✅ Upload
├── postcss.config.js             ✅ Upload
├── Dockerfile                    ✅ Upload
└── .env.local.example            ✅ Upload (template only!)
```

### 📁 Root Files
```
sociotools/
├── docker-compose.yml            ✅ Upload (development)
├── docker-compose.prod.yml       ✅ Upload (production)
├── .gitignore                    ✅ Upload (PENTING!)
├── README.md                     ✅ Upload
├── DEPLOYMENT.md                 ✅ Upload
├── PRODUCTION.md                 ✅ Upload
├── QUICKSTART.md                 ✅ Upload
├── DEPLOYMENT_VERCEL_HYBRID.md   ✅ Upload
├── SUBDOMAIN_DEPLOYMENT.md       ✅ Upload
├── .env.production.example       ✅ Upload (template)
├── .env.subdomain.example        ✅ Upload (template)
├── deploy.sh                     ✅ Upload
├── deploy-subdomain.sh           ✅ Upload
├── backup.sh                     ✅ Upload
├── setup-ssl.sh                  ✅ Upload
├── setup-hybrid.sh               ✅ Upload
├── quick-setup.sh                ✅ Upload
└── nginx/                        ✅ Upload
    ├── nginx.conf
    └── conf.d/
        └── default.conf
```

---

## ❌ FILE YANG TIDAK BOLEH DI-UPLOAD

### 🔒 Secrets & Credentials (BAHAYA!)
```
❌ .env                           # Environment variables dengan password
❌ .env.local                     # Local environment
❌ .env.production                # Production secrets
❌ credentials*.txt               # File credentials
❌ *_credentials_*.txt            # Auto-generated credentials
❌ *.pem                          # SSL certificates
❌ *.key                          # Private keys
```

### 📦 Dependencies & Build
```
❌ node_modules/                  # Dependencies (install dengan npm)
❌ dist/                          # Build output backend
❌ build/                         # Build output
❌ .next/                         # Next.js build
❌ out/                           # Next.js export
```

### 💾 Data & Uploads
```
❌ uploads/                       # User uploads
❌ backups/                       # Database backups
❌ *.sql                          # SQL dumps
❌ *.sql.gz                       # Compressed backups
❌ postgres_data/                 # Docker volume data
❌ redis_data/                    # Redis data
```

### 🔐 SSL & Certificates
```
❌ certbot/                       # SSL certificates
❌ *.crt                          # Certificate files
❌ *.pem                          # PEM files
```

### 📝 Logs & Cache
```
❌ logs/                          # Log files
❌ *.log                          # Individual logs
❌ .cache/                        # Cache directories
❌ temp/                          # Temporary files
❌ tmp/                           # Temp directory
```

---

## 🚀 Langkah Upload ke GitHub

### 1. Buat Repository di GitHub
```
1. Login ke github.com
2. Click "New repository"
3. Nama: sociokit
4. Visibility: Private (recommended untuk production)
5. Jangan centang "Initialize with README" (sudah ada)
6. Create repository
```

### 2. Initialize Git (di local)
```bash
cd /path/to/sociotools

# Initialize git
git init

# Add .gitignore (PENTING!)
# File .gitignore sudah dibuat, pastikan ada!

# Add all files
git add .

# Check apa yang akan di-commit
git status

# PENTING: Pastikan .env TIDAK ada di list!
# Jika ada .env, hapus dari staging:
git rm --cached .env
git rm --cached backend/.env
git rm --cached frontend/.env.local

# Commit
git commit -m "Initial commit: SocioKit MVP"

# Add remote
git remote add origin https://github.com/username/sociokit.git

# Push
git branch -M main
git push -u origin main
```

### 3. Verify (Cek di GitHub)
```
✅ Source code ada
✅ .env.example ada (template)
✅ Documentation ada
❌ .env TIDAK ada (secrets)
❌ node_modules TIDAK ada
❌ credentials*.txt TIDAK ada
```

---

## ⚠️ PENTING: Jika Sudah Terlanjur Commit .env

Jika sudah terlanjur commit file .env dengan secrets:

```bash
# Remove from git history
git rm --cached .env
git rm --cached backend/.env
git rm --cached frontend/.env.local

# Commit removal
git commit -m "Remove sensitive files"

# Force push (HATI-HATI!)
git push -f origin main

# PENTING: Ganti semua password/secrets yang sudah ter-expose!
```

---

## 📝 Best Practices

### ✅ DO:
- Commit source code
- Commit configuration templates (.env.example)
- Commit documentation
- Commit Dockerfiles
- Commit deployment scripts
- Use .gitignore
- Use private repository untuk production

### ❌ DON'T:
- Commit .env files
- Commit passwords/API keys
- Commit node_modules
- Commit build outputs
- Commit user uploads
- Commit database backups
- Commit SSL certificates

---

## 🔐 Menyimpan Secrets

Secrets (passwords, API keys) simpan di:

1. **Local Development**: `.env` (tidak di-commit)
2. **Production VPS**: `.env` di server (tidak di-commit)
3. **Vercel**: Environment Variables di dashboard
4. **Backup**: Password manager (1Password, Bitwarden, dll)

---

## 📦 Clone & Setup di Server Baru

Ketika clone di VPS:

```bash
# Clone repository
git clone https://github.com/username/sociokit.git
cd sociokit

# Copy environment template
cp .env.production.example .env

# Edit dengan secrets yang benar
nano .env

# Install & deploy
./setup-hybrid.sh
```

---

## ✅ Checklist Sebelum Push

- [ ] .gitignore sudah ada dan benar
- [ ] .env TIDAK ada di staging area
- [ ] credentials*.txt TIDAK ada
- [ ] node_modules TIDAK ada
- [ ] Source code lengkap
- [ ] Documentation lengkap
- [ ] .env.example ada (template)
- [ ] README.md ada

---

Sudah jelas? Mau saya bantu cek file apa yang akan di-commit?
