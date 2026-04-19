import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const box = await prisma.mysteryBox.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { approved: true },
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        boxItems: {
          include: { item: true },
        },
      },
    });

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json({ box });
  } catch (error) {
    console.error('Error fetching box:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const box = await prisma.mysteryBox.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.description && { description: data.description }),
        ...(data.possibleItems && {
          possibleItems: typeof data.possibleItems === 'string' ? data.possibleItems : JSON.stringify(data.possibleItems),
        }),
        ...(data.guaranteedValue !== undefined && { guaranteedValue: parseFloat(data.guaranteedValue) }),
        ...(data.premiumChance !== undefined && { premiumChance: parseInt(data.premiumChance) }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    return NextResponse.json({ box });
  } catch (error) {
    console.error('Error updating box:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.mysteryBox.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting box:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
