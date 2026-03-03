import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    
    // Convert to key-value object
    const settingsMap: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    // Default settings
    const defaults: Record<string, string> = {
      storeName: 'ProMat Shop',
      storeLogo: '',
      storeBanner: '',
      whatsappNumber: '+2250700000000',
      storeAddress: 'Abidjan, Côte d\'Ivoire',
      storeEmail: 'contact@promatshop.ci',
      storePhone: '+2250700000000',
      currency: 'CFA',
      welcomeMessage: 'Bienvenue chez ProMat Shop, votre quincaillerie de confiance!',
      orderMessage: 'Nouvelle commande reçue!',
    };

    return NextResponse.json({ 
      settings: { ...defaults, ...settingsMap } 
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Update each setting
    for (const [key, value] of Object.entries(data)) {
      await db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
