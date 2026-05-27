export const runtime = 'nodejs';
// src/app/api/campaigns/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { campaigns: [], error: error.message },
      { status: 500 }
    );
  }
}
