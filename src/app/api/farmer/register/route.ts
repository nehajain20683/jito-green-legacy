export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const schema = z.object({
  mobile:         z.string().min(10).max(13),
  fullName:       z.string().min(2),
  fatherName:     z.string().optional(),
  dateOfBirth:    z.string().optional(),
  gender:         z.enum(['MALE','FEMALE','OTHER']).optional(),
  aadhaarNumber:  z.string().optional(),
  panNumber:      z.string().optional(),
  email:          z.string().optional().transform(v => v === '' ? undefined : v),
  alternateMobile:z.string().optional(),
  village:        z.string().optional(),
  taluka:         z.string().optional(),
  district:       z.string().optional(),
  state:          z.string().optional(),
  pincode:        z.string().optional(),
  carbonConsent:  z.boolean().default(false),
  // Bank
  bankAccountName:z.string().optional(),
  bankName:       z.string().optional(),
  accountNumber:  z.string().optional(),
  ifscCode:       z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const existing = await prisma.farmer.findUnique({ where: { mobile: data.mobile } });

    if (existing && existing.fullName) {
      // Update existing pre-registered farmer
      const farmer = await prisma.farmer.update({
        where: { mobile: data.mobile },
        data: { ...data, gender: data.gender as any, status: 'DOCUMENTS_PENDING' },
      });
      await prisma.auditLog.create({ data: { farmerId: farmer.id, actorRole: 'FARMER', action: 'PROFILE_UPDATED' } });
      return NextResponse.json({ success: true, farmerId: farmer.id, status: farmer.status });
    }

    const farmer = await prisma.farmer.upsert({
      where: { mobile: data.mobile },
      update: { ...data, gender: data.gender as any, status: 'DOCUMENTS_PENDING' },
      create: { ...data, gender: data.gender as any, status: 'REGISTERED' },
    });

    await prisma.auditLog.create({
      data: { farmerId: farmer.id, actorRole: 'FARMER', action: 'REGISTERED', details: { mobile: data.mobile } }
    });

    return NextResponse.json({ success: true, farmerId: farmer.id, status: farmer.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
