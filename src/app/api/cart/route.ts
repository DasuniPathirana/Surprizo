import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { box: true },
      orderBy: { boxId: 'asc' },
    });

    return NextResponse.json({ cartItems });
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

    const { boxId, quantity = 1 } = await request.json();

    const existing = await prisma.cartItem.findUnique({
      where: { userId_boxId: { userId: user.id, boxId } },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { box: true },
      });
      return NextResponse.json({ cartItem: updated });
    }

    const cartItem = await prisma.cartItem.create({
      data: { userId: user.id, boxId, quantity },
      include: { box: true },
    });

    return NextResponse.json({ cartItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('id');

    if (cartItemId) {
      await prisma.cartItem.delete({
        where: { id: cartItemId, userId: user.id },
      });
    } else {
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
