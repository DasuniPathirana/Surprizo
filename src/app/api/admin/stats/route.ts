import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalOrders, totalRevenue, activeUsers, popularBoxes, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.groupBy({
        by: ['boxId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          box: { select: { name: true, category: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Get box names for popular boxes
    const boxIds = popularBoxes.map(b => b.boxId);
    const boxes = await prisma.mysteryBox.findMany({
      where: { id: { in: boxIds } },
      select: { id: true, name: true, category: true },
    });

    const popularBoxesWithNames = popularBoxes.map(pb => ({
      ...pb,
      box: boxes.find(b => b.id === pb.boxId),
    }));

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        activeUsers,
        popularBoxes: popularBoxesWithNames,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
