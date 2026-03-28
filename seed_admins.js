require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admins...');

  // Super Admin: Armando
  const armandoHash = await bcrypt.hash('Moutonblanc98@', 10);
  await prisma.employe.upsert({
    where: { matricule: 'armando001' },
    update: {
      password: armandoHash,
      role: 'SUPER_ADMIN',
      nom: 'ANZAN',
      prenoms: 'Armando',
      direction: 'Direction des Systèmes d\'Information',
      statut: 'actif'
    },
    create: {
      matricule: 'armando001',
      password: armandoHash,
      role: 'SUPER_ADMIN',
      nom: 'ANZAN',
      prenoms: 'Armando',
      direction: 'Direction des Systèmes d\'Information',
      statut: 'actif'
    }
  });

  // Admin: Gérante
  const adminHash = await bcrypt.hash('Admin@2026', 10);
  await prisma.employe.upsert({
    where: { matricule: 'admin' },
    update: {
      password: adminHash,
      role: 'ADMIN',
      nom: 'ADMIN',
      prenoms: 'Gérante',
      direction: 'Direction des Ressources Humaines',
      statut: 'actif'
    },
    create: {
      matricule: 'admin',
      password: adminHash,
      role: 'ADMIN',
      nom: 'ADMIN',
      prenoms: 'Gérante',
      direction: 'Direction des Ressources Humaines',
      statut: 'actif'
    }
  });

  console.log('Seed done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
