export const runtime = 'nodejs';
// src/app/api/admin/export-csv/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const donations = await prisma.donation.findMany({
    include: { campaign: true },
    orderBy: { createdAt: 'desc' },
  });

  const headers = ['Receipt No','Date','Donor Name','Email','Mobile','PAN','Campaign','Trees','Amount','Status','Transaction ID','Dedication Name'];
  const rows = donations.map(d => [
    d.receiptNumber, new Date(d.createdAt).toLocaleDateString('en-IN'),
    d.donorName, d.donorEmail, d.donorMobile || '', d.donorPan || '',
    d.campaign.name, d.numberOfTrees, d.amount, d.paymentStatus,
    d.paymentGatewayId || '', d.dedicationName || '',
  ]);

  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="donations-${Date.now()}.csv"`,
    },
  });
}
