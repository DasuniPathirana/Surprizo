import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { assignBoxItems } from '@/lib/boxAssignment';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.revealed) {
      const existingItems = JSON.parse(order.revealedItems || '[]');
      return NextResponse.json({
        items: existingItems,
        totalValue: existingItems.reduce((sum: number, i: { value: number }) => sum + i.value, 0),
        isPremium: existingItems.some((i: { tier: string }) => i.tier === 'PREMIUM'),
        alreadyRevealed: true,
      });
    }

    // Assign items based on box and user preferences
    const result = await assignBoxItems(order.boxId, user.id);

    // Update order with revealed items
    await prisma.order.update({
      where: { id },
      data: {
        revealedItems: JSON.stringify(result.items),
        revealed: true,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error revealing box:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
