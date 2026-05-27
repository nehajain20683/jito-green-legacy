'use client';
// src/app/admin/page.tsx
import { redirect } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { TreePine, Users, DollarSign, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/');

  const [donationStats, userCount, recentDonations] = await Promise.all([
    prisma.donation.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true, numberOfTrees: true },
      _count: { id: true },
    }),
    prisma.user.count(),
    prisma.donation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { campaign: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-forest-950 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TreePine className="w-6 h-6 text-forest-400" />
          <span className="font-display text-lg">Admin Panel</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-forest-400">
          <Link href="/admin/donations" className="hover:text-white">Donations</Link>
          <Link href="/" className="hover:text-white">← Site</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-white flex items-center gap-1 text-red-400 hover:text-red-300">Sign Out</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-gray-900 mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: 'Total Revenue', value: formatCurrency(donationStats._sum.amount || 0), bg: 'bg-green-500' },
            { icon: TreePine, label: 'Trees Pledged', value: (donationStats._sum.numberOfTrees || 0).toLocaleString(), bg: 'bg-emerald-500' },
            { icon: Users, label: 'Total Users', value: userCount.toLocaleString(), bg: 'bg-blue-500' },
            { icon: TrendingUp, label: 'Donations', value: donationStats._count.id.toLocaleString(), bg: 'bg-purple-500' },
          ].map(({ icon: Icon, label, value, bg }) => (
            <div key={label} className="bg-white rounded-xl border p-5">
              <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Donations</h2>
            <Link href="/admin/donations" className="text-sm text-forest-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {['Receipt', 'Donor', 'Campaign', 'Trees', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDonations.map(d => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{d.receiptNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.donorName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.campaign.name}</td>
                    <td className="px-4 py-3"><span className="bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full text-xs font-bold">{d.numberOfTrees}</span></td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(d.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        d.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        d.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}`}>
                        {d.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
