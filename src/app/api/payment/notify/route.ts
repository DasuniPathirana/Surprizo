import { NextRequest, NextResponse } from 'next/server';
import { verifyPayHereNotification } from '@/lib/payhere';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params = {
      merchant_id: formData.get('merchant_id') as string,
      order_id: formData.get('order_id') as string,
      payhere_amount: formData.get('payhere_amount') as string,
      payhere_currency: formData.get('payhere_currency') as string,
      status_code: formData.get('status_code') as string,
      md5sig: formData.get('md5sig') as string,
    };

    const isValid = verifyPayHereNotification(params);

    if (!isValid) {
      console.error('PayHere notification verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Status code 2 = success
    if (params.status_code === '2') {
      await prisma.order.update({
        where: { id: params.order_id },
        data: {
          paymentStatus: 'COMPLETED',
          paymentId: formData.get('payment_id') as string,
        },
      });
    } else if (params.status_code === '-1' || params.status_code === '-2') {
      await prisma.order.update({
        where: { id: params.order_id },
        data: { paymentStatus: 'FAILED' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayHere notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
