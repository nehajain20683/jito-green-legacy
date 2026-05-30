export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params   = new URL(req.url).searchParams;
  const status   = params.get('status');
  const district = params.get('district');
  const search   = params.get('search');
  const page     = parseInt(params.get('page') || '1');
  const limit    = 20;

  const where: any = {};
  if (status)   where.status   = status;
  if (district) where.district = district;
  if (search)   where.OR = [
    { fullName: { contains: search, mode: 'insensitive' } },
    { mobile:   { contains: search } },
    { aadhaarNumber: { contains: search } },
  ];

  const [farmers, total] = await Promise.all([
    prisma.farmer.findMany({
      where,
      include: {
        lands:       { select: { id: true, areaAcres: true, district: true, verified: true } },
        documents:   { select: { docType: true, status: true } },
        inspections: { select: { status: true, inspectedAt: true } },
        _count:      { select: { lands: true, plantations: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.farmer.count({ where }),
  ]);

  return NextResponse.json({ farmers, total, page, pages: Math.ceil(total / limit) });
}

// PATCH — approve / update farmer status
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { farmerId, status, assignedOfficerId } = await req.json();
  const farmer = await prisma.farmer.update({
    where: { id: farmerId },
    data:  { status: status as any, assignedOfficerId },
  });

  await prisma.auditLog.create({
    data: {
      farmerId,
      actorId:   (session.user as any).id,
      actorRole: 'ADMIN',
      action:    'STATUS_CHANGED',
      details:   { newStatus: status },
    },
  });

  return NextResponse.json({ success: true, farmer });
}
