import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: Record<string, unknown> = { active: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    const boxes = await prisma.mysteryBox.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ boxes });
  } catch (error) {
    console.error('Error fetching boxes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const box = await prisma.mysteryBox.create({
      data: {
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
        possibleItems: typeof data.possibleItems === 'string' ? data.possibleItems : JSON.stringify(data.possibleItems),
        guaranteedValue: parseFloat(data.guaranteedValue),
        premiumChance: parseInt(data.premiumChance) || 20,
        image: data.image || null,
        featured: data.featured || false,
        active: data.active !== false,
      },
    });

    return NextResponse.json({ box }, { status: 201 });
  } catch (error) {
    console.error('Error creating box:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
