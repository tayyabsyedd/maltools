/**
 * prisma/seed.ts
 *
 * Database Seeder — Creates Your Admin Account
 *
 * Run this ONCE to create your admin user in the database:
 *   npx ts-node prisma/seed.ts
 *
 * ⚠️  CHANGE THE EMAIL AND PASSWORD BELOW before running!
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── CHANGE THESE VALUES ──────────────────────────────────────────────────
  const ADMIN_NAME     = 'Tayyab';
  const ADMIN_EMAIL    = 'admin@maltools.com';   // ← change to your email
  const ADMIN_PASSWORD = 'Admin@123456';         // ← change to a strong password
  // ─────────────────────────────────────────────────────────────────────────

  // Hash the password (bcrypt adds security — never store plain text passwords)
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Create admin user (or update if already exists)
  const user = await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: {},
    create: {
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: hashedPassword,
      role:     'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin user created:', user.email);
  console.log('');
  console.log('─────────────────────────────────────');
  console.log('  Login with:');
  console.log('  Email:    ', ADMIN_EMAIL);
  console.log('  Password: ', ADMIN_PASSWORD);
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
