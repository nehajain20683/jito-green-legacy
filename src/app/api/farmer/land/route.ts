export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const schema = z.object({
  farmerId:            z.string(),
  surveyNumber:        z.string().optional(),
  gutNumber:           z.string().optional(),
  khataNumber:         z.string().optional(),
  areaAcres:           z.number().optional(),
  landType:            z.string().optional(),
  gpsLatitude:         z.number().optional(),
  gpsLongitude:        z.number().optional(),
  polygonGeoJson:      z.any().optional(),
  village:             z.string().optional(),
  taluka:              z.string().optional(),
  district:            z.string().optional(),
  state:               z.string().optional(),
  plantationPreference:z.string().optional(),
  speciesPreference:   z.array(z.string()).optional(),
  targetTreeCount:     z.number().optional(),
  plantationStartDate: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const land = await prisma.land.create({
      data: {
        farmerId:            data.farmerId,
        surveyNumber:        data.surveyNumber,
        gutNumber:           data.gutNumber,
        khataNumber:         data.khataNumber,
        areaAcres:           data.areaAcres,
        areaHectares:        data.areaAcres ? data.areaAcres * 0.404686 : undefined,
        landType:            data.landType as any,
        gpsLatitude:         data.gpsLatitude,
        gpsLongitude:        data.gpsLongitude,
        polygonGeoJson:      data.polygonGeoJson,
        village:             data.village,
        taluka:              data.taluka,
        district:            data.district,
        state:               data.state,
        plantationPreference:data.plantationPreference as any,
        speciesPreference:   data.speciesPreference || [],
        targetTreeCount:     data.targetTreeCount,
        plantationStartDate: data.plantationStartDate ? new Date(data.plantationStartDate) : undefined,
      },
    });
    await prisma.farmer.update({
      where: { id: data.farmerId },
      data:  { status: 'DOCUMENTS_PENDING' },
    });
    await prisma.auditLog.create({
      data: { farmerId: data.farmerId, actorRole: 'FARMER', action: 'LAND_ADDED', details: { landId: land.id } }
    });
    return NextResponse.json({ success: true, landId: land.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const farmerId = new URL(req.url).searchParams.get('farmerId');
  if (!farmerId) return NextResponse.json({ error: 'farmerId required' }, { status: 400 });
  const lands = await prisma.land.findMany({
    where: { farmerId },
    include: { documents: true, plantations: true, inspections: true },
  });
  return NextResponse.json({ lands });
}
