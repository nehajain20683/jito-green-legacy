// src/app/admin/farmers/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, MapPin, FileText, TreePine, CreditCard, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string,string> = {
  REGISTERED:           'bg-blue-100 text-blue-700',
  DOCUMENTS_PENDING:    'bg-amber-100 text-amber-700',
  DOCUMENTS_VERIFIED:   'bg-teal-100 text-teal-700',
  INSPECTION_PENDING:   'bg-orange-100 text-orange-700',
  INSPECTION_COMPLETED: 'bg-cyan-100 text-cyan-700',
  APPROVED:             'bg-green-100 text-green-700',
  ACTIVE:               'bg-emerald-100 text-emerald-700',
  SUSPENDED:            'bg-red-100 text-red-700',
};

const DOC_STATUS: Record<string,string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default async function FarmerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) redirect('/');

  const farmer = await prisma.farmer.findUnique({
    where: { id: params.id },
    include: {
      lands:         { include: { plantations: true, documents: true } },
      documents:     { orderBy: { createdAt: 'desc' } },
      payments:      { orderBy: { createdAt: 'desc' } },
      carbonCredits: true,
      inspections:   { include: { officer: { select: { name: true, mobile: true } } }, orderBy: { createdAt: 'desc' } },
      auditLogs:     { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!farmer) redirect('/admin/farmers');

  const totalLandAcres  = farmer.lands.reduce((s,l) => s + (l.areaAcres||0), 0);
  const totalTreesPlanted = farmer.lands.reduce((s,l) => s + l.plantations.reduce((p,pl) => p + pl.treesPlanted, 0), 0);
  const totalRevenue    = farmer.payments.filter(p=>p.status==='COMPLETED').reduce((s,p)=>s+p.amount,0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-sage-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/farmers" className="text-sage-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Link>
          <div>
            <div className="font-bold">{farmer.fullName}</div>
            <div className="text-sage-400 text-xs">{farmer.mobile} · ID: {farmer.id.slice(0,12)}...</div>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[farmer.status]||'bg-gray-100 text-gray-700'}`}>
          {farmer.status.replace(/_/g,' ')}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:'Total Land',     value:`${totalLandAcres.toFixed(1)} ac`,                     color:'bg-blue-50 text-blue-700' },
            { label:'Trees Planted',  value:totalTreesPlanted,                                     color:'bg-green-50 text-green-700' },
            { label:'Documents',      value:farmer.documents.length,                               color:'bg-amber-50 text-amber-700' },
            { label:'Revenue Earned', value:`₹${totalRevenue.toLocaleString('en-IN')}`,            color:'bg-purple-50 text-purple-700' },
          ].map(s=>(
            <div key={s.label} className={`${s.color} rounded-xl p-4 border border-current/10`}>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs mt-0.5 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">

          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-sage-100 rounded-lg flex items-center justify-center text-xs">👤</span>
              Personal Information
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                ['Farmer ID',       farmer.id.slice(0,16)+'...'],
                ['Full Name',       farmer.fullName],
                ["Father's Name",   farmer.fatherName || '—'],
                ['Date of Birth',   farmer.dateOfBirth ? new Date(farmer.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                ['Gender',          farmer.gender || '—'],
                ['Aadhaar',         farmer.aadhaarNumber ? '••••••••'+farmer.aadhaarNumber.slice(-4) : '—'],
                ['PAN',             farmer.panNumber || '—'],
                ['Mobile',          farmer.mobile],
                ['Alternate Mobile',farmer.alternateMobile || '—'],
                ['Email',           farmer.email || '—'],
                ['Registered',      new Date(farmer.createdAt).toLocaleDateString('en-IN')],
                ['Last Login',      farmer.lastLoginAt ? new Date(farmer.lastLoginAt).toLocaleString('en-IN') : 'Never'],
              ].map(([label, value]) => (
                <div key={label as string} className="flex gap-3">
                  <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sage-500"/>
              Geographic Information
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                ['Village',  farmer.village  || '—'],
                ['Taluka',   farmer.taluka   || '—'],
                ['District', farmer.district || '—'],
                ['State',    farmer.state    || '—'],
                ['Country',  'India'],
                ['Pincode',  farmer.pincode  || '—'],
              ].map(([label,value]) => (
                <div key={label as string} className="flex gap-3">
                  <span className="text-gray-400 w-24 flex-shrink-0">{label}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Bank Details */}
            <h3 className="font-semibold text-gray-900 mt-5 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sage-500"/>
              Bank Account
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                ['Account Name', farmer.bankAccountName || '—'],
                ['Bank',         farmer.bankName        || '—'],
                ['Account No.',  farmer.accountNumber   ? '••••'+farmer.accountNumber.slice(-4) : '—'],
                ['IFSC',         farmer.ifscCode        || '—'],
              ].map(([label,value]) => (
                <div key={label as string} className="flex gap-3">
                  <span className="text-gray-400 w-24 flex-shrink-0">{label}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Land Parcels */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sage-500"/>
            Land Information ({farmer.lands.length} parcels · {totalLandAcres.toFixed(2)} acres total)
          </h3>
          {farmer.lands.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    {['Parcel ID','Survey No.','Area (ac)','Type','District','GPS','Status','Trees'].map(h=>(
                      <th key={h} className="px-3 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {farmer.lands.map(land=>(
                    <tr key={land.id} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs text-gray-400">{land.id.slice(0,8)}</td>
                      <td className="px-3 py-2">{land.surveyNumber||'—'}</td>
                      <td className="px-3 py-2 font-semibold">{land.areaAcres?.toFixed(2)||'—'}</td>
                      <td className="px-3 py-2 text-gray-500">{land.landType?.replace(/_/g,' ')||'—'}</td>
                      <td className="px-3 py-2">{land.district||'—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-400">
                        {land.gpsLatitude ? `${land.gpsLatitude.toFixed(4)}, ${land.gpsLongitude?.toFixed(4)}` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${land.verified?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
                          {land.verified?'Verified':'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {land.plantations.reduce((s,p)=>s+p.treesPlanted,0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No land parcels registered</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sage-500"/>
            Documents ({farmer.documents.length})
          </h3>
          {farmer.documents.length > 0 ? (
            <div className="space-y-2">
              {farmer.documents.map(doc=>(
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400"/>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.docType.replace(/_/g,' ')}</div>
                      <div className="text-xs text-gray-400">{doc.fileName || 'Document'} · {new Date(doc.createdAt).toLocaleDateString('en-IN')}</div>
                      {doc.rejectionReason && <div className="text-xs text-red-600">Reason: {doc.rejectionReason}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${DOC_STATUS[doc.status]||'bg-gray-100 text-gray-600'}`}>
                      {doc.status}
                    </span>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-sage-600 hover:underline font-medium">
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No documents uploaded</p>
          )}
        </div>

        {/* Payments */}
        {farmer.payments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sage-500"/>
              Payment Records
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    {['Date','Type','Amount','Status','UTR'].map(h=>(
                      <th key={h} className="px-3 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {farmer.payments.map(p=>(
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2 text-gray-500">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-3 py-2">{p.paymentType.replace(/_/g,' ')}</td>
                      <td className="px-3 py-2 font-semibold">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status==='COMPLETED'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400 font-mono text-xs">{p.utrNumber||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit History */}
        {farmer.auditLogs.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sage-500"/>
              Audit History
            </h3>
            <div className="space-y-2">
              {farmer.auditLogs.map(log=>(
                <div key={log.id} className="flex items-start justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {log.action.replace(/_/g,' ')}
                    </span>
                    {log.actorRole && <span className="text-xs text-gray-400">by {log.actorRole}</span>}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { status:'APPROVED',   label:'✅ Approve Farmer',   color:'bg-green-600 hover:bg-green-700 text-white' },
              { status:'ACTIVE',     label:'🌱 Set Active',       color:'bg-emerald-600 hover:bg-emerald-700 text-white' },
              { status:'SUSPENDED',  label:'⛔ Suspend',          color:'bg-red-600 hover:bg-red-700 text-white' },
              { status:'DOCUMENTS_VERIFIED', label:'📋 Verify Docs', color:'bg-blue-600 hover:bg-blue-700 text-white' },
            ].map(a=>(
              <form key={a.status} action={`/api/admin/farmers`} method="POST">
                <input type="hidden" name="farmerId" value={farmer.id}/>
                <input type="hidden" name="status"   value={a.status}/>
                <Link href={`/api/admin/farmers?farmerId=${farmer.id}&status=${a.status}&_method=PATCH`}
                  className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold ${a.color} transition-colors`}>
                  {a.label}
                </Link>
              </form>
            ))}
            <Link href={`/admin/farmers`} className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
              ← Back to List
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
