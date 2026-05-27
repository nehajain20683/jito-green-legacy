export const runtime = 'nodejs';
// src/app/api/csr-inquiry/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  // In production: save to DB and send email
  console.log('CSR Inquiry received:', body);
  return NextResponse.json({ success: true });
}
