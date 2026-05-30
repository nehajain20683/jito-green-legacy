export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const schema = z.object({
  farmerId:            z.string(),
  landId:              z.string().optional(),
  officerId:           z.string(),
  scheduledDate:       z.string().optional(),
  inspectedAt:         z.string().optional(),
  gpsLatitude:         z.number().optional(),
  gpsLongitude:        z.number().optional(),
  ownershipVerified:   z.boolean().default(false),
  boundaryVerified:    z.boolean().default(false),
  farmerMetPersonally: z.boolean().default(false),
  plantationFeasible:  z.boolean().default(false),
  waterSourceAvailable:z.boolean().default(false),
  notes:               z.string().optional(),
  photos:              z.array(z.string()).optional(),
  status:              z.enum(['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']).default('SCHEDULED'),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const inspection = await prisma.siteInspection.create({
      data: {
        farmerId:            data.farmerId,
        landId:              data.landId,
        officerId:           data.officerId,
        scheduledDate:       data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        inspectedAt:         data.inspectedAt ? new Date(data.inspectedAt) : undefined,
        gpsLatitude:         data.gpsLatitude,
        gpsLongitude:        data.gpsLongitude,
        ownershipVerified:   data.ownershipVerified,
        boundaryVerified:    data.boundaryVerified,
        farmerMetPersonally: data.farmerMetPersonally,
        plantationFeasible:  data.plantationFeasible,
        waterSourceAvailable:data.waterSourceAvailable,
        notes:               data.notes,
        photos:              data.photos || [],
        status:              data.status as any,
      },
    });

    if (data.status === 'COMPLETED') {
      await prisma.farmer.update({
        where: { id: data.farmerId },
        data:  { status: 'INSPECTION_COMPLETED' },
      });
    } else {
      await prisma.farmer.update({
        where: { id: data.farmerId },
        data:  { status: 'INSPECTION_PENDING' },
      });
    }

    await prisma.auditLog.create({
      data: { farmerId: data.farmerId, actorId: data.officerId, actorRole: 'FIELD_OFFICER', action: 'INSPECTION_' + data.status }
    });

    return NextResponse.json({ success: true, inspectionId: inspection.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const params    = new URL(req.url).searchParams;
  const farmerId  = params.get('farmerId');
  const officerId = params.get('officerId');
  const where: any = {};
  if (farmerId)  where.farmerId  = farmerId;
  if (officerId) where.officerId = officerId;

  const inspections = await prisma.siteInspection.findMany({
    where,
    include: {
      farmer:  { select: { fullName: true, mobile: true, village: true, district: true } },
      officer: { select: { name: true, mobile: true } },
      land:    { select: { surveyNumber: true, areaAcres: true, district: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ inspections });
}
