import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/seed - Initialize database with sample data
export async function POST() {
  try {
    // Check if already seeded
    const existingCategories = await db.category.count();
    const existingAgents = await db.agent.count();
    
    // Create demo agents for DRH if not exists
    if (existingAgents === 0) {
      const agents = [
        {
          matricule: 'DEV001',
          nom: 'Diallo',
          prenom: 'Amadou',
          email: 'a.diallo@yopougon.ci',
          telephone: '+22507000001',
          direction: 'Direction des Ressources Humaines',
          service: 'Service Personnel',
          fonction: 'Directeur',
          soldeConges: 30,
          password: 'admin123',
          role: 'admin',
        },
        {
          matricule: 'AGT001',
          nom: 'Koné',
          prenom: 'Fatou',
          email: 'f.kone@yopougon.ci',
          telephone: '+22507000002',
          direction: 'Direction des Finances',
          service: 'Service Comptabilité',
          fonction: 'Comptable',
          soldeConges: 25,
          password: 'agent123',
          role: 'agent',
        },
        {
          matricule: 'AGT002',
          nom: 'Touré',
          prenom: 'Ibrahim',
          email: 'i.toure@yopougon.ci',
          telephone: '+22507000003',
          direction: 'Direction Technique',
          service: 'Service Voirie',
          fonction: 'Technicien',
          soldeConges: 22,
          password: 'agent123',
          role: 'agent',
        },
        {
          matricule: 'AGT003',
          nom: 'Kouassi',
          prenom: 'Marie',
          email: 'm.kouassi@yopougon.ci',
          telephone: '+22507000004',
          direction: "Direction de l'État Civil",
          service: 'Service État Civil',
          fonction: "Agent d'accueil",
          soldeConges: 28,
          password: 'agent123',
          role: 'responsable',
        },
        // Agent correspondant à l'exemple du PDF
        {
          matricule: '989-A',
          nom: 'Coulibaly',
          prenom: 'Drissa',
          email: 'd.coulibaly@yopougon.ci',
          telephone: '+22507000005',
          direction: 'Direction du Service Informatique',
          service: 'Service Informatique',
          fonction: 'Informaticien',
          soldeConges: 31,
          password: 'agent123',
          role: 'agent',
        },
      ];

      const createdAgents = [];
      for (const agent of agents) {
        const created = await db.agent.create({ data: agent });
        createdAgents.push(created);
      }

      // Create demo conges - using the correct agent (Coulibaly Drissa with matricule 989-A)
      const existingConges = await db.conge.count();
      if (existingConges === 0 && createdAgents.length > 0) {
        const today = new Date();
        const annee = today.getFullYear();
        
        const congesData = [
          // Congé pour Coulibaly Drissa (index 4) - correspondant à l'exemple
          {
            agentId: createdAgents[4].id, // Coulibaly Drissa (989-A)
            type: 'Congé Annuel',
            dateDebut: new Date(annee, 7, 2), // 02/08/current year
            dateFin: new Date(annee, 8, 1), // 01/09/current year
            nbJours: 31,
            statut: 'approuve',
          },
          {
            agentId: createdAgents[1].id, // Koné Fatou
            type: 'Congé Annuel',
            dateDebut: new Date(annee, 5, 15),
            dateFin: new Date(annee, 6, 5),
            nbJours: 20,
            statut: 'en_attente',
          },
          {
            agentId: createdAgents[2].id, // Touré Ibrahim
            type: 'Congé Exception',
            dateDebut: new Date(annee, 2, 10),
            dateFin: new Date(annee, 2, 12),
            nbJours: 3,
            statut: 'approuve',
          },
          {
            agentId: createdAgents[3].id, // Kouassi Marie
            type: 'Congé Maladie',
            dateDebut: new Date(annee, 1, 20),
            dateFin: new Date(annee, 1, 25),
            nbJours: 6,
            statut: 'refuse',
          },
        ];

        for (const conge of congesData) {
          await db.conge.create({ data: conge });
        }
      }
    }

    if (existingCategories > 0) {
      return NextResponse.json({ message: 'Database already seeded' });
    }

    // Create default admin
    await db.admin.create({
      data: {
        email: 'admin@oluwaquincaillerie.ci',
        password: 'oluwa2024',
        name: 'Administrateur',
        role: 'super_admin',
      },
    });

    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Plomberie',
          slug: 'plomberie',
          description: 'Tuyaux, robinets, chauffe-eau et accessoires de plomberie',
          icon: 'Droplets',
          sortOrder: 1,
        },
      }),
      db.category.create({
        data: {
          name: 'Électricité',
          slug: 'electricite',
          description: 'Câbles, prises, interrupteurs et matériel électrique',
          icon: 'Zap',
          sortOrder: 2,
        },
      }),
      db.category.create({
        data: {
          name: 'Peinture',
          slug: 'peinture',
          description: 'Peintures intérieures, extérieures et accessoires',
          icon: 'Paintbrush',
          sortOrder: 3,
        },
      }),
      db.category.create({
        data: {
          name: 'Outils',
          slug: 'outils',
          description: 'Outils à main, électriques et accessoires',
          icon: 'Wrench',
          sortOrder: 4,
        },
      }),
      db.category.create({
        data: {
          name: 'Quincaillerie',
          slug: 'quincaillerie',
          description: 'Vis, boulons, charnières et accessoires',
          icon: 'Cog',
          sortOrder: 5,
        },
      }),
      db.category.create({
        data: {
          name: 'Bâtiment',
          slug: 'batiment',
          description: 'Ciment, briques, sable et matériaux de construction',
          icon: 'Building2',
          sortOrder: 6,
        },
      }),
    ]);

    // Create sample products
    const products = [
      // Plomberie
      {
        name: 'Robinet Mural Chrome',
        slug: 'robinet-mural-chrome',
        description: 'Robinet mural haute qualité avec finition chromée, idéal pour salle de bain',
        price: 25000,
        oldPrice: 30000,
        stock: 15,
        categoryId: categories[0].id,
        featured: true,
      },
      {
        name: 'Tuyau PVC 50mm (3m)',
        slug: 'tuyau-pvc-50mm-3m',
        description: 'Tuyau PVC de qualité supérieure, diamètre 50mm, longueur 3 mètres',
        price: 8500,
        stock: 50,
        categoryId: categories[0].id,
        featured: false,
      },
      {
        name: 'Chauffe-eau 50L',
        slug: 'chauffe-eau-50l',
        description: 'Chauffe-eau électrique 50 litres avec thermostat réglable',
        price: 85000,
        oldPrice: 95000,
        stock: 8,
        categoryId: categories[0].id,
        featured: true,
      },
      // Électricité
      {
        name: 'Câble Électrique 2.5mm² (100m)',
        slug: 'cable-electrique-2-5mm-100m',
        description: 'Câble électrique rigide 2.5mm², bobine de 100 mètres, normes CE',
        price: 35000,
        stock: 25,
        categoryId: categories[1].id,
        featured: true,
      },
      {
        name: 'Prise Murale Double',
        slug: 'prise-murale-double',
        description: 'Prise murale double avec terre, blanc, lot de 10',
        price: 12000,
        stock: 40,
        categoryId: categories[1].id,
        featured: false,
      },
      {
        name: 'Interrupteur Variateur',
        slug: 'interrupteur-variateur',
        description: 'Interrupteur variateur pour ampoules LED, capacité 300W',
        price: 8500,
        stock: 30,
        categoryId: categories[1].id,
        featured: false,
      },
      // Peinture
      {
        name: 'Peinture Acrylique Blanche (20L)',
        slug: 'peinture-acrylique-blanche-20l',
        description: 'Peinture acrylique haute couvrance, blanc mat, seau de 20 litres',
        price: 45000,
        oldPrice: 52000,
        stock: 20,
        categoryId: categories[2].id,
        featured: true,
      },
      {
        name: 'Pinceau Set 5 pièces',
        slug: 'pinceau-set-5-pieces',
        description: 'Set de 5 pinceaux de différentes tailles, poils synthétiques',
        price: 5500,
        stock: 35,
        categoryId: categories[2].id,
        featured: false,
      },
      // Outils
      {
        name: 'Marteau 500g',
        slug: 'marteau-500g',
        description: 'Marteau en acier forgé, manche en bois, poids 500g',
        price: 7500,
        stock: 45,
        categoryId: categories[3].id,
        featured: false,
      },
      {
        name: 'Perceuse Visseuse 18V',
        slug: 'perceuse-visseuse-18v',
        description: 'Perceuse visseuse sans fil 18V avec 2 batteries et chargeur',
        price: 75000,
        oldPrice: 85000,
        stock: 12,
        categoryId: categories[3].id,
        featured: true,
      },
      {
        name: 'Niveau Laser',
        slug: 'niveau-laser',
        description: 'Niveau laser automatique, portée 20m, avec trépied',
        price: 35000,
        stock: 10,
        categoryId: categories[3].id,
        featured: false,
      },
      // Quincaillerie
      {
        name: 'Visserie Assortiment 500pc',
        slug: 'visserie-assortiment-500pc',
        description: 'Kit de 500 vis et chevilles assorties dans boîte compartimentée',
        price: 8500,
        stock: 60,
        categoryId: categories[4].id,
        featured: true,
      },
      {
        name: 'Cadenas 40mm (lot de 3)',
        slug: 'cadenas-40mm-lot-3',
        description: 'Lot de 3 cadenas en laiton, diamètre 40mm, avec clés',
        price: 6500,
        stock: 25,
        categoryId: categories[4].id,
        featured: false,
      },
      // Bâtiment
      {
        name: 'Ciment CPA 42.5 (50kg)',
        slug: 'ciment-cpa-42-5-50kg',
        description: 'Ciment Portland artificiel 42.5, sac de 50kg',
        price: 8500,
        stock: 100,
        categoryId: categories[5].id,
        featured: true,
      },
      {
        name: 'Brique Creuse 12',
        slug: 'brique-creuse-12',
        description: 'Brique creuse 12, dimensions 30x20x12cm, vendue à l\'unité',
        price: 350,
        stock: 500,
        categoryId: categories[5].id,
        featured: false,
      },
    ];

    for (const product of products) {
      await db.product.create({ data: product });
    }

    // Create default settings with new store info
    const settings = [
      { key: 'storeName', value: 'Oluwa Quincaillerie' },
      { key: 'whatsappNumber', value: '+2250707155414' },
      { key: 'storeAddress', value: 'Abidjan, Côte d\'Ivoire' },
      { key: 'storeEmail', value: 'contact@oluwaquincaillerie.ci' },
      { key: 'storePhone', value: '+2250506363001' },
      { key: 'currency', value: 'CFA' },
      { key: 'welcomeMessage', value: 'Bienvenue chez Oluwa Quincaillerie, votre partenaire de confiance pour tous vos travaux!' },
    ];

    for (const setting of settings) {
      await db.setting.create({ data: setting });
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      categories: categories.length,
      products: products.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation' },
      { status: 500 }
    );
  }
}
