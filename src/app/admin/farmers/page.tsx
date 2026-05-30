// src/app/admin/farmers/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  REGISTERED:           'bg-blue-100 text-blue-700',
  DOCUMENTS_PENDING:    'bg-amber-100 text-amber-700',
  DOCUMENTS_VERIFIED:   'bg-teal-100 text-teal-700',
  INSPECTION_PENDING:   'bg-orange-100 text-orange-700',
  INSPECTION_COMPLETED: 'bg-cyan-100 text-cyan-700',
  APPROVED:             'bg-green-100 text-green-700',
  ACTIVE:               'bg-emerald-100 text-emerald-700',
  SUSPENDED:            'bg-red-100 text-red-700',
};

interface PageProps { searchParams: Record<string, string | undefined> }

export default async function AdminFarmersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/');

  const status = searchParams.status;
  const search = searchParams.search;
  const where: any = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { fullName: { contains: search, mode: 'insensitive' } },
    { mobile: { contains: search } },
  ];

  const [farmers, totalFarmers, totalLand, statusCounts] = await Promise.all([
    prisma.farmer.findMany({
      where,
      include: {
        lands:  { select: { id: true, areaAcres: true, verified: true } },
        _count: { select: { lands: true, plantations: true, documents: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.farmer.count(),
    prisma.land.aggregate({ _sum: { areaAcres: true } }),
    prisma.farmer.groupBy({ by: ['status'], _count: true }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-sage-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sage-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
          <span className="font-display text-lg">Farmer Management</span>
        </div>
        <Link href="/admin" className="text-sage-400 hover:text-white text-sm">← Admin</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Farmers',  value: totalFarmers },
            { label: 'Total Land',     value: `${(totalLand._sum.areaAcres || 0).toFixed(1)} ac` },
            { label: 'Approved',       value: statusCounts.find(s => s.status === 'APPROVED')?._count || 0 },
            { label: 'Pending Review', value: statusCounts.find(s => s.status === 'DOCUMENTS_PENDING')?._count || 0 },
          ].map(s => (
            <div key={s.label} className="bg-white border rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Link href="/admin/farmers" className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!status ? 'bg-sage-700 text-white' : 'bg-white border text-gray-600'}`}>
            All ({totalFarmers})
          </Link>
          {statusCounts.map(sc => (
            <Link key={sc.status} href={`/admin/farmers?status=${sc.status}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status === sc.status ? 'bg-sage-700 text-white' : `${STATUS_COLORS[sc.status] || 'bg-white border text-gray-600'}`}`}>
              {sc.status.replace(/_/g,' ')} ({sc._count})
            </Link>
          ))}
        </div>

        {/* Search */}
        <form className="flex gap-3 mb-6">
          <input name="search" defaultValue={search} placeholder="Search by name or mobile..."
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"/>
          {status && <input type="hidden" name="status" value={status}/>}
          <button type="submit" className="bg-sage-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Search</button>
        </form>

        {/* Farmers table */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {['Farmer','Mobile','District','Land','Status','Documents','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {farmers.map(f => (
                  <tr key={f.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{f.fullName}</div>
                      <div className="text-gray-400 text-xs">{f.village || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.mobile}</td>
                    <td className="px-4 py-3 text-gray-600">{f.district || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400"/>
                        <span>{f._count.lands} parcel{f._count.lands !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {f.lands.reduce((s, l) => s + (l.areaAcres || 0), 0).toFixed(1)} ac total
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[f.status] || 'bg-gray-100 text-gray-700'}`}>
                        {f.status.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${f._count.documents > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {f._count.documents} docs
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/farmers/${f.id}`}
                          className="text-xs text-sage-600 hover:text-sage-800 font-medium hover:underline">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {farmers.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No farmers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
