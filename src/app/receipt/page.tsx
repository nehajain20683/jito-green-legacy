'use client';
// src/app/receipt/page.tsx
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, X } from 'lucide-react';

function ReceiptViewer() {
  const params = useSearchParams();
  const id     = params.get('id');
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setUrl(`/api/receipts/${id}/pdf`);
    setLoading(false);
  }, [id]);

  if (!id) return <div className="flex items-center justify-center h-screen">No receipt ID provided.</div>;

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="text-sm font-medium">🧾 Receipt Preview</div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Download className="w-4 h-4"/> Download PDF
          </button>
          <button onClick={() => window.close()}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg">
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>
      <div className="pt-14 px-4 pb-4 flex justify-center">
        {loading ? (
          <div className="text-white mt-20">Loading receipt...</div>
        ) : (
          <iframe src={url} style={{width:'794px',maxWidth:'100%',height:'1050px',border:'none',borderRadius:'4px',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}} title="Receipt"/>
        )}
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          iframe { position: fixed !important; top: 0; left: 0; width: 100vw !important; height: 100vh !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-800 text-white">Loading...</div>}>
      <ReceiptViewer/>
    </Suspense>
  );
}
