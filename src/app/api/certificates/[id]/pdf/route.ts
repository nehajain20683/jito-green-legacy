export const runtime = 'nodejs';
// src/app/api/certificates/[id]/pdf/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCertificatePDF } from '@/lib/pdf';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const donation = await prisma.donation.findUnique({
    where: { id: params.id },
    include: { campaign: true, user: true },
  });
  if (!donation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Use the chapter stored at time of donation — no hardcoded fallback
  const chapter = (donation as any).donorChapter || 'JITO Mumbai Zone';

  const html = generateCertificatePDF({
    donorName:      donation.donorName,
    numberOfTrees:  donation.numberOfTrees,
    campaignName:   donation.campaign.name,
    dedicationName: donation.dedicationName || undefined,
    date:           donation.createdAt,
    receiptNumber:  donation.receiptNumber!,
    chapter,
  });

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="certificate-${donation.receiptNumber}.html"`,
    },
  });
}
