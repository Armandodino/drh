import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Adding test employees...");

  const emp1 = await prisma.employe.create({
    data: {
      matricule: 'MAT-001',
      nom: 'KOUASSI',
      prenoms: 'Jean Marc',
      direction: 'Direction Technique',
      fonction: 'Ingénieur',
      sexe: 'M',
      date_embauche: new Date('2020-01-15'),
      contact: '0102030405',
    }
  });

  const emp2 = await prisma.employe.create({
    data: {
      matricule: 'MAT-002',
      nom: 'TOURE',
      prenoms: 'Awa',
      direction: 'Direction des Affaires Financières',
      fonction: 'Comptable',
      sexe: 'F',
      date_embauche: new Date('2021-03-10'),
      contact: '0506070809',
    }
  });

  const emp3 = await prisma.employe.create({
    data: {
      matricule: 'MAT-003',
      nom: 'DIOMANDE',
      prenoms: 'Ibrahim',
      direction: 'Secrétariat Général',
      fonction: 'Assistant',
      sexe: 'M',
      date_embauche: new Date('2022-06-20'),
      contact: '0708091011',
    }
  });

  console.log("Added 3 test employees.");

  // For emp1: Approved leave in the future
  const now = new Date();
  const depart1 = new Date(now);
  depart1.setDate(now.getDate() + 10);
  const retour1 = new Date(depart1);
  retour1.setDate(depart1.getDate() + 15);

  await prisma.conge.create({
    data: {
      employe_id: emp1.id,
      type: 'Annuel',
      date_depart: depart1,
      date_retour: retour1,
      nombre_jours: 15,
      motif: 'Repos annuel',
      statut: 'approuve'
    }
  });

  // For emp2: Leave in progress ending soon (for alert testing)
  const depart2 = new Date(now);
  depart2.setDate(now.getDate() - 10);
  const retour2 = new Date(now);
  retour2.setDate(now.getDate() + 2); // Ends in 2 days

  await prisma.conge.create({
    data: {
      employe_id: emp2.id,
      type: 'Maternité',
      date_depart: depart2,
      date_retour: retour2,
      nombre_jours: 90,
      motif: 'Congé Maternité',
      statut: 'en_cours'
    }
  });

  // For emp3: Approved leave returning soon
  const depart3 = new Date(now);
  depart3.setDate(now.getDate() - 5);
  const retour3 = new Date(now);
  retour3.setDate(now.getDate() + 1); // Ends tomorrow

  await prisma.conge.create({
    data: {
      employe_id: emp3.id,
      type: 'Maladie',
      date_depart: depart3,
      date_retour: retour3,
      nombre_jours: 6,
      motif: 'Consultation',
      statut: 'approuve'
    }
  });
  
  console.log("Added test leaves.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
