import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updateData: Record<string, unknown> = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      stock: parseInt(data.stock) || 0,
      featured: data.featured || false,
      active: data.active !== false,
    };

    if (data.slug) updateData.slug = data.slug;
    if (data.oldPrice) updateData.oldPrice = parseFloat(data.oldPrice);
    if (data.image) updateData.image = data.image;
    if (data.images) updateData.images = data.images;
    if (data.sku) updateData.sku = data.sku;
    if (data.categoryId) updateData.categoryId = data.categoryId;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
