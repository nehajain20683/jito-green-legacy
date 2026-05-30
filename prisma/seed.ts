// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // JITO Green Legacy Campaigns
  const campaigns = [
    { name: 'Dadi Campaign', slug: 'dadi', description: 'Plant trees in honour of your grandmother — a tribute as enduring as her wisdom and love.', treePrice: 500, active: true },
    { name: 'Maa Campaign', slug: 'maa', description: 'Honour your mother with a living legacy that grows stronger with every passing year.', treePrice: 500, active: true },
    { name: 'Beti Campaign', slug: 'beti', description: 'Celebrate your daughter with a tree that grows alongside her, strong and rooted.', treePrice: 500, active: true },
    { name: 'Poti Campaign', slug: 'poti', description: 'Gift your granddaughter a forest of possibilities — a green inheritance for the future.', treePrice: 500, active: true },
    { name: 'Individual Tree Purchase', slug: 'individual', description: 'Buy 1 tree or any custom quantity — starting at ₹500 per tree.', treePrice: 500, active: true },
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.upsert({
      where: { slug: campaign.slug },
      update: { name: campaign.name, description: campaign.description },
      create: campaign,
    });
  }

  // Admin user
  const hashedPassword = await bcrypt.hash('admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@jitomumbai.org' },
    update: {},
    create: {
      name: 'JITO Admin',
      email: 'admin@jitomumbai.org',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Also keep old admin email working
  await prisma.user.upsert({
    where: { email: 'admin@treeplantation.org' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@treeplantation.org',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Plantation sites
  const sites = [
    { siteName: 'Aravalli Greens', location: 'Aravalli Hills, Rajasthan', acreage: 50, partnerName: 'Forest Department Rajasthan' },
    { siteName: 'Western Ghats Restoration', location: 'Sahyadri, Maharashtra', acreage: 120, partnerName: 'Maharashtra Forest Corp' },
    { siteName: 'Yamuna Floodplain Forest', location: 'Delhi NCR', acreage: 30, partnerName: 'DDA Green Cell' },
  ];

  const existingSites = await prisma.plantationSite.count();
  if (existingSites === 0) {
    for (const site of sites) {
      await prisma.plantationSite.create({ data: site });
    }
  }

  console.log('✅ JITO Green Legacy seed completed');
  console.log('   Admin: admin@jitomumbai.org / admin@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

  // Seed a test field officer
  const officerPass = await bcrypt.hash('officer@123', 12);
  const existing = await prisma.fieldOfficer.findFirst({ where: { email: 'officer@jitomumbai.org' } }).catch(() => null);
  if (!existing) {
    await prisma.fieldOfficer.create({
      data: {
        name:        'Ramesh Patil',
        email:       'officer@jitomumbai.org',
        mobile:      '+919876543211',
        password:    officerPass,
        employeeId:  'JGL-FO-001',
        designation: 'Field Officer',
        district:    'Palghar',
        state:       'Maharashtra',
      },
    });
  }
  console.log('✅ Field Officer seeded: officer@jitomumbai.org / officer@123');
