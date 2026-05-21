import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'Admin@123456',
    10,
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@sociotools.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@sociotools.com',
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash: adminPassword,
      fullName: 'System Admin',
      role: 'ADMIN',
      emailVerified: true,
      affiliateCode: 'ADMIN001',
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create default plans
  const plans = [
    {
      name: '1 Bulan',
      durationMonths: 1,
      price: 50000,
      features: [
        'Akses semua tools',
        '5 akun Facebook',
        'Auto Post Group & Fanpage',
        'Shortlink Unlimited',
        'Share to Story',
      ],
      sortOrder: 1,
    },
    {
      name: '3 Bulan',
      durationMonths: 3,
      price: 120000,
      features: [
        'Akses semua tools',
        '10 akun Facebook',
        'Auto Post Group & Fanpage',
        'Shortlink Unlimited',
        'Share to Story',
        'Hemat Rp 30.000',
      ],
      sortOrder: 2,
    },
    {
      name: '6 Bulan',
      durationMonths: 6,
      price: 200000,
      features: [
        'Akses semua tools',
        '20 akun Facebook',
        'Auto Post Group & Fanpage',
        'Shortlink Unlimited',
        'Share to Story',
        'Hemat Rp 100.000',
      ],
      sortOrder: 3,
    },
    {
      name: '1 Tahun',
      durationMonths: 12,
      price: 350000,
      features: [
        'Akses semua tools',
        'Unlimited akun Facebook',
        'Auto Post Group & Fanpage',
        'Shortlink Unlimited',
        'Share to Story',
        'Priority Support',
        'Hemat Rp 250.000',
      ],
      sortOrder: 4,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.name.replace(/\s/g, '-').toLowerCase() },
      update: plan,
      create: {
        id: plan.name.replace(/\s/g, '-').toLowerCase(),
        ...plan,
      },
    });
  }

  console.log(`✅ ${plans.length} subscription plans created`);

  // Create default affiliate settings
  await prisma.affiliateSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      commissionRate: 20.0,
      minWithdrawal: 50000,
      cookieDays: 30,
      isActive: true,
    },
  });

  console.log('✅ Affiliate settings created');

  // Create default bank accounts
  const bankAccounts = [
    { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'SocioTools', sortOrder: 1 },
    { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'SocioTools', sortOrder: 2 },
    { bankName: 'BNI', accountNumber: '1122334455', accountHolder: 'SocioTools', sortOrder: 3 },
  ];

  for (const bank of bankAccounts) {
    await prisma.bankAccount.create({
      data: bank,
    });
  }

  console.log(`✅ ${bankAccounts.length} bank accounts created`);

  console.log('🎉 Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
