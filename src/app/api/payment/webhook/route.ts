export const runtime = 'nodejs';
// src/app/api/payment/webhook/route.ts
import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  const isValid = verifyWebhookSignature(body, signature);
  if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const orderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;

    if (orderId) {
      await prisma.donation.updateMany({
        where: { paymentOrderId: orderId, paymentStatus: 'PENDING' },
        data: { paymentStatus: 'COMPLETED', paymentGatewayId: paymentId },
      });
    }
  }

  if (event.event === 'payment.failed') {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await prisma.donation.updateMany({
        where: { paymentOrderId: orderId },
        data: { paymentStatus: 'FAILED' },
      });
    }
  }

  return NextResponse.json({ received: true });
}
