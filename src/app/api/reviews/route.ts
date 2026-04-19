import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boxId = searchParams.get('boxId');

    const where: Record<string, unknown> = { approved: true };
    if (boxId) where.boxId = boxId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true } },
        box: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reviews });
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

    const { boxId, orderId, rating, comment } = await request.json();

    if (!boxId || !orderId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check order belongs to user
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
    }

    // Check no existing review
    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) {
      return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        boxId,
        orderId,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
