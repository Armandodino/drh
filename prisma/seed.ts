import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin accounts
  const adminPassword = await bcrypt.hash('admin123', 10);
  const devPassword = await bcrypt.hash('dev2026', 10);

  // Admin DRH
  const admin = await prisma.employe.upsert({
    where: { matricule: 'drh001' },
    update: {},
    create: {
      matricule: 'drh001',
      nom: 'ANZAN',
      prenoms: 'Admin DRH',
      sexe: 'M',
      direction: 'Direction des Ressources Humaines',
      fonction: 'Directeur RH',
      role: 'ADMIN_DRH',
      password: adminPassword,
      statut: 'actif',
      joursCongeAnnuel: 30,
    },
  });

  // Developer account
  const dev = await prisma.employe.upsert({
    where: { matricule: 'dev001' },
    update: {},
    create: {
      matricule: 'dev001',
      nom: 'DEVELOPPEUR',
      prenoms: 'Système',
      sexe: 'M',
      direction: 'Direction des Systèmes d\'Information',
      fonction: 'Développeur',
      role: 'DEV',
      password: devPassword,
      statut: 'actif',
      joursCongeAnnuel: 30,
    },
  });

  console.log('✅ Created admin accounts:');
  console.log('   - drh001 / admin123 (Admin DRH)');
  console.log('   - dev001 / dev2026 (Developer)');

  // Create some sample employees
  const sampleEmployees = [
    {
      matricule: 'ag001',
      nom: 'KOUASSI',
      prenoms: 'Jean-Baptiste',
      sexe: 'M',
      direction: 'Direction des services techniques',
      fonction: 'Chef de service',
      dateEmbauche: new Date('2020-01-15'),
    },
    {
      matricule: 'ag002',
      nom: 'KONAN',
      prenoms: 'Marie-Claire',
      sexe: 'F',
      direction: 'Direction économique et financière',
      fonction: 'Comptable',
      dateEmbauche: new Date('2019-06-01'),
    },
    {
      matricule: 'ag003',
      nom: 'YAO',
      prenoms: 'Koffi Emmanuel',
      sexe: 'M',
      direction: 'Direction de la Communication',
      fonction: 'Attaché de presse',
      dateEmbauche: new Date('2021-03-10'),
    },
  ];

  for (const emp of sampleEmployees) {
    await prisma.employe.upsert({
      where: { matricule: emp.matricule },
      update: {},
      create: {
        ...emp,
        role: 'AGENT',
        statut: 'actif',
        joursCongeAnnuel: 30,
      },
    });
  }

  console.log('✅ Created 3 sample employees');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
