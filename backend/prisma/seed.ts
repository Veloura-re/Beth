import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ 
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Beth Reward System...');

  // 1. Create Default Organization
  const org = await prisma.organization.upsert({
    where: { id: 'default-org-id' },
    update: {},
    create: {
      id: 'default-org-id',
      name: 'Beth Global Rewards',
    },
  });

  const users = [
    { email: 'super@beth.com', name: 'Super Admin', role: Role.SUPERADMIN, password: 'SuperPass123' },
    { email: 'admin@beth.com', name: 'Local Admin', role: Role.ADMIN, password: 'AdminPass123' },
    { email: 'agent@beth.com', name: 'Field Agent', role: Role.AGENT, password: 'AgentPass123' },
    { email: 'painter@beth.com', name: 'Master Painter', role: Role.PAINTER, password: 'PainterPass123' },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        role: u.role,
        organizationId: org.id
      },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        role: u.role,
        organizationId: org.id,
      },
    });
    console.log(`✅ Created ${u.role}: ${u.email}`);
  }

  console.log('🚀 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
