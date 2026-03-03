import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/seed - Initialize database with sample data
export async function POST() {
  try {
    // Check if already seeded
    const existingCategories = await db.category.count();
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
