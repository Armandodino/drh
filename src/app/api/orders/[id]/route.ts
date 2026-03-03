import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.whatsappSent !== undefined) updateData.whatsappSent = data.whatsappSent;

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
