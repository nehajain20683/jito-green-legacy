export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function hashOTP(otp: string) { return crypto.createHash('sha256').update(otp).digest('hex'); }

// POST — send OTP
export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();
    if (!mobile) return NextResponse.json({ error: 'Mobile required' }, { status: 400 });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.farmer.upsert({
      where:  { mobile },
      update: { otpHash: hashOTP(otp), otpExpiry: expiry },
      create: { mobile, fullName: 'Pending', otpHash: hashOTP(otp), otpExpiry: expiry },
    });

    // TODO: Send via MSG91 / Twilio in production
    console.log(`OTP for ${mobile}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your mobile number',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT — verify OTP
export async function PUT(req: Request) {
  try {
    const { mobile, otp } = await req.json();
    const farmer = await prisma.farmer.findUnique({ where: { mobile } });

    if (!farmer?.otpHash || !farmer?.otpExpiry)
      return NextResponse.json({ error: 'No OTP requested' }, { status: 400 });
    if (new Date() > farmer.otpExpiry)
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    if (farmer.otpHash !== hashOTP(otp))
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });

    await prisma.farmer.update({ where: { mobile }, data: { otpHash: null, otpExpiry: null } });

    const token = Buffer.from(JSON.stringify({
      farmerId: farmer.id, mobile, role: 'FARMER',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })).toString('base64');

    const isProfileComplete = farmer.fullName !== 'Pending' && farmer.fullName !== '';

    return NextResponse.json({ success: true, token, farmerId: farmer.id, isProfileComplete });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
