export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params   = new URL(req.url).searchParams;
  const page     = parseInt(params.get('page') || '1');
  const limit    = 50;
  const actorId  = params.get('actorId')  || undefined;
  const farmerId = params.get('farmerId') || undefined;
  const action   = params.get('action')   || undefined;

  const where: any = {};
  if (actorId)  where.actorId  = actorId;
  if (farmerId) where.farmerId = farmerId;
  if (action)   where.action   = { contains: action, mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
