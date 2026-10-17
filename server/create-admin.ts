import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || process.env.STORE_ADMIN_EMAIL || 'admin@lumora.luxury').trim().toLowerCase();
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.argv[4] || 'Store Owner';

  if (!email || !email.includes('@')) {
    console.error('Usage: tsx server/create-admin.ts <email> <password> [name]');
    process.exit(1);
  }

  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || 'Store';
  const lastName = nameParts.slice(1).join(' ') || 'Owner';

  console.log(`[Lumora Admin Tool] Provisioning admin account for: ${email}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      firstName,
      lastName,
    },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log(`[Lumora Admin Tool] SUCCESS! Admin account is active and verified.`);
  console.log(`  - ID: ${admin.id}`);
  console.log(`  - Email: ${admin.email}`);
  console.log(`  - Role: ${admin.role}`);
  console.log(`  - Verified: ${admin.isVerified}`);
  console.log(`  - Password: (set as requested)`);
}

createAdmin()
  .catch((err) => {
    console.error('[Lumora Admin Tool] Error creating admin:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
