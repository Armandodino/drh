import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const emp1 = await prisma.employe.create({
      data: {
        matricule: 'MAT-001',
        nom: 'KOUASSI',
        prenoms: 'Jean Marc',
        direction: 'Direction Technique',
        fonction: 'Ingénieur',
        sexe: 'M',
        dateEmbauche: new Date('2020-01-15'),
        telephone: '0102030405',
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
        dateEmbauche: new Date('2021-03-10'),
        telephone: '0506070809',
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
        dateEmbauche: new Date('2022-06-20'),
        telephone: '0708091011',
      }
    });

    const now = new Date();
    
    // For emp1: Approved leave in the future
    const depart1 = new Date(now);
    depart1.setDate(now.getDate() + 10);
    const retour1 = new Date(depart1);
    retour1.setDate(depart1.getDate() + 15);

    await prisma.conge.create({
      data: {
        employeId: emp1.id,
        type: 'Annuel',
        dateDepart: depart1,
        dateRetour: retour1,
        nombreJours: 15,
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
        employeId: emp2.id,
        type: 'Maternité',
        dateDepart: depart2,
        dateRetour: retour2,
        nombreJours: 90,
        motif: 'Congé Maternité',
        statut: 'en_cours'
      }
    });

    // For emp3: Approved leave returning tomorrow
    const depart3 = new Date(now);
    depart3.setDate(now.getDate() - 5);
    const retour3 = new Date(now);
    retour3.setDate(now.getDate() + 1); // Ends tomorrow

    await prisma.conge.create({
      data: {
        employeId: emp3.id,
        type: 'Maladie',
        dateDepart: depart3,
        dateRetour: retour3,
        nombreJours: 6,
        motif: 'Consultation',
        statut: 'approuve'
      }
    });

    return NextResponse.json({ success: true, message: 'Test data inserted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
