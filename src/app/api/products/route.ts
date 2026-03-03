import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products - List all products with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: Record<string, unknown> = { active: true };

    if (category) {
      where.categoryId = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
      }
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product (admin only)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const product = await db.product.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        price: parseFloat(data.price),
        oldPrice: data.oldPrice ? parseFloat(data.oldPrice) : null,
        image: data.image,
        images: data.images,
        stock: parseInt(data.stock) || 0,
        sku: data.sku,
        categoryId: data.categoryId,
        featured: data.featured || false,
        active: data.active !== false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
