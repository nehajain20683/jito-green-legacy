export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const ADMIN_ROLES = ['ADMIN','SUPER_ADMIN'];

async function requireAdmin(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !ADMIN_ROLES.includes((session.user as any).role))
    throw new Error('Unauthorized');
  return session.user as any;
}

// GET — list users
export async function GET(req: Request) {
  try {
    const actor = await requireAdmin(req);
    const params  = new URL(req.url).searchParams;
    const search  = params.get('search') || '';
    const role    = params.get('role')   || '';
    const status  = params.get('status') || '';
    const page    = parseInt(params.get('page') || '1');
    const limit   = 20;

    const where: any = { deletedAt: null };
    if (search) where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { email:  { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
    ];
    if (role)   where.role     = role;
    if (status === 'active')   where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'locked')   where.isLocked = true;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, mobile: true,
          role: true, isActive: true, isLocked: true,
          lastLoginAt: true, createdAt: true,
          _count: { select: { donations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

// POST — create user
export async function POST(req: Request) {
  try {
    const actor = await requireAdmin(req);
    const body  = await req.json();
    const { name, email, mobile, password, role } = body;

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });

    const existing = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (existing)
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await prisma.user.create({
      data: { name, email, mobile, password: hashed, role: role || 'DONOR', isActive: true },
    });

    await prisma.auditLog.create({
      data: { actorId: actor.id, actorRole: actor.role, action: 'USER_CREATED',
              details: { userId: user.id, email, role } }
    }).catch(() => {});

    return NextResponse.json({ success: true, userId: user.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// PATCH — edit user / toggle status / reset password
export async function PATCH(req: Request) {
  try {
    const actor  = await requireAdmin(req);
    const body   = await req.json();
    const { userId, action, ...data } = body;

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    let updateData: any = {};
    let auditAction = 'USER_UPDATED';

    if (action === 'toggle_active') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      updateData = { isActive: !user?.isActive };
      auditAction = updateData.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    } else if (action === 'toggle_lock') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      updateData = { isLocked: !user?.isLocked, loginAttempts: 0 };
      auditAction = updateData.isLocked ? 'USER_LOCKED' : 'USER_UNLOCKED';
    } else if (action === 'reset_password') {
      if (!data.newPassword) return NextResponse.json({ error: 'newPassword required' }, { status: 400 });
      updateData = { password: await bcrypt.hash(data.newPassword, 12), loginAttempts: 0, isLocked: false };
      auditAction = 'PASSWORD_RESET';
    } else if (action === 'change_role') {
      updateData = { role: data.role };
      auditAction = 'ROLE_CHANGED';
    } else {
      // General update
      if (data.name)   updateData.name   = data.name;
      if (data.email)  updateData.email  = data.email;
      if (data.mobile) updateData.mobile = data.mobile;
      if (data.role)   updateData.role   = data.role;
    }

    const user = await prisma.user.update({ where: { id: userId }, data: updateData });
    await prisma.auditLog.create({
      data: { actorId: actor.id, actorRole: actor.role, action: auditAction,
              details: { userId, ...updateData } }
    }).catch(() => {});

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE — soft delete user
export async function DELETE(req: Request) {
  try {
    const actor  = await requireAdmin(req);
    const { userId, reason } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    // Prevent deleting super admins unless actor is super admin
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (target?.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN')
      return NextResponse.json({ error: 'Cannot delete Super Admin' }, { status: 403 });

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), deletedById: actor.id, deleteReason: reason || 'Deleted by admin', isActive: false },
    });

    await prisma.auditLog.create({
      data: { actorId: actor.id, actorRole: actor.role, action: 'USER_DELETED',
              details: { userId, reason } }
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
