import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/categories/[id] - Get single category with products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updateData: Record<string, unknown> = {
      name: data.name,
      active: data.active !== false,
    };

    if (data.slug) updateData.slug = data.slug;
    if (data.description) updateData.description = data.description;
    if (data.image) updateData.image = data.image;
    if (data.icon) updateData.icon = data.icon;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const category = await db.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
