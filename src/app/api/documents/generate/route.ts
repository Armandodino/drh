import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// POST /api/documents/generate - Generate and download PDF
export async function POST(request: NextRequest) {
  try {
    const { type, congeId } = await request.json();

    if (!type || !congeId) {
      return NextResponse.json(
        { error: 'Type et ID du congé requis' },
        { status: 400 }
      );
    }

    if (!['cessation', 'reprise'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de document invalide. Utilisez "cessation" ou "reprise"' },
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
    const dateStr = `Yopougon, le ${today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })}`;

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

    const diffTime = Math.abs(new Date(conge.dateFin).getTime() - new Date(conge.dateDebut).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const anneeConge = new Date(conge.dateDebut).getFullYear();
    const civilite = agent.prenom === 'Marie' || agent.prenom === 'Fatou' ? 'Madame' : 'Monsieur';
    const numeroRef = `N°_____/MY/DRH/${today.getFullYear()}`;

    const title = type === 'cessation' 
      ? 'CERTIFICAT DE CESSATION DE SERVICE'
      : 'CERTIFICAT DE REPRISE DE SERVICE';

    let bodyText: string;
    
    if (type === 'cessation') {
      bodyText = `${civilite} ${agent.nom} ${agent.prenom} (Mle ${agent.matricule}) ${(agent.fonction || 'Agent').toUpperCase()}, en service à la ${agent.direction.toUpperCase()} de la Mairie de Yopougon, bénéficiaire d'un congé annuel de ${conge.nbJours || diffDays} jours au titre de l'année ${anneeConge}, est autorisé à jouir de son congé à compter du ${dateDebut}.\n\nA l'issue de son congé, l'intéressé(e) reprendra le service à son poste habituel le ${dateFin}.`;
    } else {
      bodyText = `${civilite} ${agent.nom} ${agent.prenom} (Mle ${agent.matricule}) ${(agent.fonction || 'Agent').toUpperCase()}, en service à la ${agent.direction.toUpperCase()} de la Mairie de Yopougon, bénéficiaire d'un congé au titre de l'année ${anneeConge}, a effectivement repris le service le ${dateFin}.`;
    }

    // Prepare document data
    const documentData = {
      type,
      document: {
        header: {
          republique: "REPUBLIQUE DE COTE D'IVOIRE",
          devise: 'Union - Discipline - Travail',
          date: dateStr,
          numero: numeroRef,
        },
        title,
        body: bodyText,
        footer: {
          formule: 'Le présent certificat est établi pour servir et valoir ce que de droit.',
          signature: {
            qualite: 'P/Le Maire & P.O.',
            titre: 'Le Directeur des Ressources Humaines',
            nom: 'SANOGO Amadou',
          },
        },
      },
    };

    // Generate unique filename
    const filename = type === 'cessation' 
      ? `cessation_${agent.matricule}_${Date.now()}.pdf`
      : `reprise_${agent.matricule}_${Date.now()}.pdf`;
    
    const outputPath = path.join('/tmp', filename);
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_document.py');

    // Execute Python script to generate PDF
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${outputPath}" '${JSON.stringify(documentData)}'`,
      { timeout: 30000 }
    );

    if (stderr && !stdout.includes('success')) {
      console.error('PDF generation error:', stderr);
      return NextResponse.json(
        { error: 'Erreur lors de la génération du PDF' },
        { status: 500 }
      );
    }

    // Read the generated PDF
    const pdfBuffer = await readFile(outputPath);

    // Clean up temp file
    await unlink(outputPath).catch(() => {});

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}_${agent.matricule}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
