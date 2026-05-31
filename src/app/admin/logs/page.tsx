// src/app/admin/logs/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED:             'bg-green-100 text-green-700',
  USER_DELETED:             'bg-red-100 text-red-700',
  USER_ACTIVATED:           'bg-teal-100 text-teal-700',
  USER_DEACTIVATED:         'bg-orange-100 text-orange-700',
  USER_LOCKED:              'bg-red-100 text-red-700',
  USER_UNLOCKED:            'bg-green-100 text-green-700',
  PASSWORD_RESET:           'bg-blue-100 text-blue-700',
  PASSWORD_RESET_COMPLETED: 'bg-blue-100 text-blue-700',
  ROLE_CHANGED:             'bg-purple-100 text-purple-700',
  FARMER_REGISTERED:        'bg-emerald-100 text-emerald-700',
  PROFILE_UPDATED:          'bg-gray-100 text-gray-600',
  LAND_ADDED:               'bg-lime-100 text-lime-700',
  DOCUMENT_UPLOADED:        'bg-cyan-100 text-cyan-700',
  STATUS_CHANGED:           'bg-amber-100 text-amber-700',
  REGISTERED:               'bg-emerald-100 text-emerald-700',
};

interface PageProps { searchParams: Record<string, string | undefined> }

export default async function ActivityLogsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) redirect('/');

  const page  = parseInt(searchParams.page || '1');
  const limit = 50;

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    skip:  (page - 1) * limit,
    take:  limit,
  });

  const total = await prisma.auditLog.count();
  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-sage-800 text-white px-6 py-4 flex items-center gap-3">
        <Link href="/admin/people" className="text-sage-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
        <span className="font-display text-lg">Activity Logs</span>
        <span className="text-sage-400 text-sm ml-auto">{total} total actions</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Time','Actor','Action','Record','Details'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}<br/>
                    {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-500">{log.actorRole || '—'}</div>
                    <div className="text-xs font-mono text-gray-400">{log.actorId?.slice(0,8) || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                    {log.farmerId?.slice(0,8) || log.actorId?.slice(0,8) || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No activity yet</td></tr>
              )}
            </tbody>
          </table>

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-500">{total} records</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/logs?page=${page-1}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">← Prev</Link>
                )}
                <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {pages}</span>
                {page < pages && (
                  <Link href={`/admin/logs?page=${page+1}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">Next →</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
