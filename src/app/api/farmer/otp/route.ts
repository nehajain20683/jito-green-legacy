export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function hashOTP(otp: string) { return crypto.createHash('sha256').update(otp).digest('hex'); }

async function sendSMS(mobile: string, otp: string): Promise<boolean> {
  // Strip country code for MSG91 (needs 10-digit)
  const phone = mobile.replace(/^\+91/, '').replace(/^91/, '');

  // ── MSG91 ──────────────────────────────────────────────
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    try {
      const res = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': process.env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile:      `91${phone}`,
          otp,
        }),
      });
      const data = await res.json();
      console.log('MSG91 response:', data);
      return data.type === 'success';
    } catch (e) {
      console.error('MSG91 error:', e);
    }
  }

  // ── Twilio (fallback) ──────────────────────────────────
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            To:   `+91${phone}`,
            From: process.env.TWILIO_PHONE_NUMBER || '',
            Body: `Your JITO Green Legacy OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
          }),
        }
      );
      const data = await res.json();
      console.log('Twilio response:', data.sid);
      return !!data.sid;
    } catch (e) {
      console.error('Twilio error:', e);
    }
  }

  // ── Development fallback — log OTP ────────────────────
  console.log(`[DEV] OTP for ${mobile}: ${otp}`);
  return false;
}

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

    const smsSent = await sendSMS(mobile, otp);
    const isDevMode = !process.env.MSG91_AUTH_KEY && !process.env.TWILIO_ACCOUNT_SID;

    return NextResponse.json({
      success: true,
      smsSent,
      message: smsSent
        ? `OTP sent to ${mobile}`
        : isDevMode
          ? 'Dev mode: OTP shown below'
          : 'SMS failed — please try again',
      // Only show OTP in dev mode (no SMS provider configured)
      devOtp: isDevMode ? otp : undefined,
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
      return NextResponse.json({ error: 'No OTP requested. Please request a new OTP.' }, { status: 400 });
    if (new Date() > farmer.otpExpiry)
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    if (farmer.otpHash !== hashOTP(otp))
      return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });

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
