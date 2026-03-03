import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/documents - Get document templates info
export async function GET() {
  return NextResponse.json({
    templates: [
      {
        id: 'cessation',
        name: 'Certificat de Cessation de Service',
        description: 'Document autorisant un agent à prendre son congé',
      },
      {
        id: 'reprise',
        name: 'Certificat de Reprise de Service',
        description: 'Document confirmant la reprise de service après congé',
      },
    ],
  });
}

// POST /api/documents - Generate document data for PDF
export async function POST(request: NextRequest) {
  try {
    const { type, congeId, agentId } = await request.json();

    if (!type || !congeId) {
      return NextResponse.json(
        { error: 'Type et ID du congé requis' },
        { status: 400 }
      );
    }

    // Get congé with agent info
    const conge = await db.conge.findUnique({
      where: { id: congeId },
      include: {
        agent: true,
      },
    });

    if (!conge) {
      return NextResponse.json(
        { error: 'Congé non trouvé' },
        { status: 404 }
      );
    }

    const agent = conge.agent;
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '/');

    const dateDebut = new Date(conge.dateDebut).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const dateFin = new Date(conge.dateFin).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Calculate number of days
    const diffTime = Math.abs(new Date(conge.dateFin).getTime() - new Date(conge.dateDebut).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Determine year for "au titre de l'année"
    const anneeConge = new Date(conge.dateDebut).getFullYear();

    if (type === 'cessation') {
      return NextResponse.json({
        type: 'cessation',
        document: {
          header: {
            republique: 'REPUBLIQUE DE COTE D\'IVOIRE',
            devise: 'Union - Discipline - Travail',
            lieu: 'Yopougon',
            date: dateStr,
            numero: `N°_____/MY/DRH/${today.getFullYear()}`,
          },
          title: 'CERTIFICAT DE CESSATION DE SERVICE',
          content: {
            civilite: agent.prenom === 'Marie' || agent.prenom === 'Fatou' ? 'Madame' : 'Monsieur',
            nomComplet: `${agent.nom} ${agent.prenom}`,
            matricule: agent.matricule,
            fonction: agent.fonction || 'Agent',
            direction: agent.direction,
            service: agent.service,
            nbJours: conge.nbJours || diffDays,
            anneeConge: anneeConge,
            dateDebut: dateDebut,
            dateReprise: dateFin,
          },
          footer: {
            formule: 'Le présent certificat est établi pour servir et valoir ce que de droit.',
            signature: {
              qualite: 'P/Le Maire & P.O.',
              titre: 'Le Directeur des Ressources Humaines',
              nom: 'SANOGO Amadou',
            },
          },
        },
      });
    } else if (type === 'reprise') {
      return NextResponse.json({
        type: 'reprise',
        document: {
          header: {
            republique: 'REPUBLIQUE DE COTE D\'IVOIRE',
            devise: 'Union - Discipline - Travail',
            lieu: 'Yopougon',
            date: dateStr,
            numero: `N°_____/MY/DRH/${today.getFullYear()}`,
          },
          title: 'CERTIFICAT DE REPRISE DE SERVICE',
          content: {
            civilite: agent.prenom === 'Marie' || agent.prenom === 'Fatou' ? 'Madame' : 'Monsieur',
            nomComplet: `${agent.nom} ${agent.prenom}`,
            matricule: agent.matricule,
            fonction: agent.fonction || 'Agent',
            direction: agent.direction,
            service: agent.service,
            anneeConge: anneeConge,
            dateReprise: dateFin,
          },
          footer: {
            formule: 'Le présent certificat est établi pour servir et valoir ce que de droit.',
            signature: {
              qualite: 'P/Le Maire & P.O.',
              titre: 'Le Directeur des Ressources Humaines',
              nom: 'SANOGO Amadou',
            },
          },
        },
      });
    }

    return NextResponse.json(
      { error: 'Type de document invalide' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du document' },
      { status: 500 }
    );
  }
}
