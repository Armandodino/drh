import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        image: data.image,
        icon: data.icon,
        active: data.active !== false,
        sortOrder: data.sortOrder || 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
