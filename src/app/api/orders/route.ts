import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders - List all orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Calculate total
    let total = 0;
    const orderItems = await Promise.all(
      data.items.map(async (item: { productId: string; quantity: number }) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new Error(`Produit ${item.productId} non trouvé`);
        total += product.price * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const order = await db.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        total,
        notes: data.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
