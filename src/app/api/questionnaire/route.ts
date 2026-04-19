import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ questionnaire });
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

    const { interests, budget, preferredCategories } = await request.json();

    const questionnaire = await prisma.questionnaire.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        interests: JSON.stringify(interests || []),
        budget: budget || 'medium',
        preferredCategories: JSON.stringify(preferredCategories || []),
      },
      update: {
        interests: JSON.stringify(interests || []),
        budget: budget || 'medium',
        preferredCategories: JSON.stringify(preferredCategories || []),
      },
    });

    return NextResponse.json({ questionnaire });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
