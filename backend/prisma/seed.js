require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ 
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚨 Purging existing system data...');
  await prisma.scan.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.cashoutRequest.deleteMany();
  await prisma.painterPayout.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  
  console.log('🌱 Seeding Beth Reward System...');

  const org = await prisma.organization.create({
    data: {
      id: 'default-org-id',
      name: 'Beth Global Rewards',
    },
  });

  const users = [
    { email: 'super@beth.com', name: 'Super Admin', role: 'SUPERADMIN', password: 'SuperPass123' },
    { email: 'admin@beth.com', name: 'Local Admin', role: 'ADMIN', password: 'AdminPass123' },
    { email: 'agent@beth.com', name: 'Field Agent', role: 'AGENT', password: 'AgentPass123' },
    { email: 'painter@beth.com', name: 'Master Painter', role: 'PAINTER', password: 'PainterPass123' },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        role: u.role,
        organizationId: org.id,
      },
    });
    console.log(`✅ Provisioned ${u.role}: ${u.email}`);
  }

  console.log('📦 Provisioning Strategic Initiatives...');
  const c1 = await prisma.campaign.create({
    data: {
      name: 'AURORA OVERLAY PROTOCOL',
      description: 'Strategic visual branding for regional depots.',
      rewardPerScan: 15,
      painterMargin: 0.10,
      organizationId: org.id
    }
  });

  const c2 = await prisma.campaign.create({
    data: {
      name: 'MERIDIAN SCAN INITIATIVE',
      description: 'High-volume technical ID verification pulse.',
      rewardPerScan: 10,
      painterMargin: 0.05,
      organizationId: org.id
    }
  });

  const painter = await prisma.user.findFirst({ where: { role: 'PAINTER' } });
  const agent = await prisma.user.findFirst({ where: { role: 'AGENT' } });

  console.log('✅ Created Campaigns.');

  const qr = await prisma.qRCode.create({
    data: {
      campaignId: c1.id,
      rewardPoints: 100,
      locationName: 'District Alpha',
      painterId: painter ? painter.id : null,
      status: 'ACTIVE'
    }
  });

  if (agent && painter) {
    await prisma.scan.create({
      data: {
        agentId: agent.id,
        painterId: painter.id,
        campaignId: c1.id,
        qrId: qr.id,
        pointsEarned: 15,
        painterEarned: 1.5,
        systemRevenue: 3.5
      }
    });
    console.log('✅ Logged Initial Pulse Scan.');
  }

  console.log('🚀 STRATEGIC BOOTSTRAP COMPLETE!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
