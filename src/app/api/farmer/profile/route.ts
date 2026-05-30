export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const farmerId = params.get('farmerId');
  const mobile   = params.get('mobile');
  const where    = farmerId ? { id: farmerId } : mobile ? { mobile } : null;
  if (!where) return NextResponse.json({ error: 'farmerId or mobile required' }, { status: 400 });

  const farmer = await prisma.farmer.findUnique({
    where: where as any,
    include: {
      lands:         { include: { plantations: true, documents: true } },
      documents:     true,
      payments:      true,
      carbonCredits: true,
      inspections:   { include: { officer: { select: { name: true, mobile: true, designation: true } } } },
    },
  });
  if (!farmer) return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });

  // Calculate summary stats
  const totalLandAcres    = farmer.lands.reduce((s, l) => s + (l.areaAcres || 0), 0);
  const totalTreesPlanted = farmer.lands.reduce((s, l) => s + l.plantations.reduce((p, pl) => p + pl.treesPlanted, 0), 0);
  const totalTreesSurviving = farmer.lands.reduce((s, l) => s + l.plantations.reduce((p, pl) => p + pl.treesSurviving, 0), 0);
  const totalRevenue      = farmer.payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const totalCO2          = farmer.carbonCredits.reduce((s, c) => s + (c.creditsIssued || 0), 0);

  return NextResponse.json({ farmer, stats: { totalLandAcres, totalTreesPlanted, totalTreesSurviving, totalRevenue, totalCO2 } });
}

export async function PATCH(req: Request) {
  try {
    const { farmerId, ...data } = await req.json();
    const farmer = await prisma.farmer.update({ where: { id: farmerId }, data });
    return NextResponse.json({ success: true, farmer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
