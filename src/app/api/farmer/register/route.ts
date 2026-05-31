export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const schema = z.object({
  mobile:          z.string().min(10).max(13),
  fullName:        z.string().min(2),
  fatherName:      z.string().optional(),
  dateOfBirth:     z.string().optional(),
  gender:          z.enum(['MALE','FEMALE','OTHER']).optional(),
  aadhaarNumber:   z.string().optional(),
  panNumber:       z.string().optional(),
  email:           z.string().optional().transform(v => v === '' ? undefined : v),
  alternateMobile: z.string().optional(),
  village:         z.string().optional(),
  taluka:          z.string().optional(),
  district:        z.string().optional(),
  state:           z.string().optional(),
  pincode:         z.string().optional(),
  carbonConsent:   z.boolean().default(false),
  bankAccountName: z.string().optional(),
  bankName:        z.string().optional(),
  accountNumber:   z.string().optional(),
  ifscCode:        z.string().optional(),
});

// Convert empty strings to undefined, and parse dateOfBirth properly
function sanitize(data: any) {
  const clean: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === null) {
      clean[key] = undefined;
    } else {
      clean[key] = value;
    }
  }
  // Always convert dateOfBirth to a proper Date or undefined
  if (clean.dateOfBirth) {
    const parsed = new Date(clean.dateOfBirth);
    clean.dateOfBirth = isNaN(parsed.getTime()) ? undefined : parsed;
  } else {
    clean.dateOfBirth = undefined;
  }
  return clean;
}

export async function POST(req: Request) {
  try {
    const raw  = await req.json();
    const data = schema.parse(raw);
    const safe = sanitize(data);

    const saveData = {
      fullName:        safe.fullName,
      fatherName:      safe.fatherName,
      dateOfBirth:     safe.dateOfBirth,
      gender:          safe.gender,
      aadhaarNumber:   safe.aadhaarNumber,
      panNumber:       safe.panNumber,
      email:           safe.email,
      alternateMobile: safe.alternateMobile,
      village:         safe.village,
      taluka:          safe.taluka,
      district:        safe.district,
      state:           safe.state,
      pincode:         safe.pincode,
      carbonConsent:   safe.carbonConsent,
      bankAccountName: safe.bankAccountName,
      bankName:        safe.bankName,
      accountNumber:   safe.accountNumber,
      ifscCode:        safe.ifscCode,
    };

    const farmer = await prisma.farmer.upsert({
      where:  { mobile: data.mobile },
      update: { ...saveData, status: 'DOCUMENTS_PENDING' },
      create: { ...saveData, mobile: data.mobile, status: 'REGISTERED' },
    });

    await prisma.auditLog.create({
      data: { farmerId: farmer.id, actorRole: 'FARMER', action: 'PROFILE_UPDATED' }
    }).catch(() => {}); // non-critical

    return NextResponse.json({ success: true, farmerId: farmer.id, status: farmer.status });
  } catch (e: any) {
    console.error('Farmer register error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
