import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.role === 'ADMIN';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = isAdmin ? {} : { userId: user.id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        box: { select: { name: true, category: true, image: true } },
        user: isAdmin ? { select: { name: true, email: true } } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { boxId, deliveryName, deliveryPhone, deliveryAddress, quantity = 1 } = await request.json();

    if (!boxId || !deliveryName || !deliveryPhone || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const box = await prisma.mysteryBox.findUnique({ where: { id: boxId } });
    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    const totalPrice = box.price * quantity;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        boxId,
        totalPrice,
        deliveryName,
        deliveryPhone,
        deliveryAddress,
      },
      include: { box: true },
    });

    // Clear this box from cart if it exists
    await prisma.cartItem.deleteMany({
      where: { userId: user.id, boxId },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
