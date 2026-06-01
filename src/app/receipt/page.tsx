'use client';
// src/app/receipt/page.tsx
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, X } from 'lucide-react';

function ReceiptViewer() {
  const params  = useSearchParams();
  const id      = params.get('id');
  const [loaded, setLoaded] = useState(false);

  if (!id) return (
    <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
      No receipt ID provided.
    </div>
  );

  const receiptUrl = `/api/receipts/${id}/pdf`;

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col">
      <div className="no-print bg-gray-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-medium">🧾 Receipt Preview</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const w = window.open(receiptUrl, '_blank');
              if (w) w.onload = () => setTimeout(() => w.print(), 500);
            }}
            className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Download className="w-4 h-4"/> Download PDF
          </button>
          <button onClick={() => window.history.back()} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div style={{
          width: '794px',
          maxWidth: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <iframe
            src={receiptUrl}
            onLoad={() => setLoaded(true)}
            style={{ width: '794px', height: '1060px', border: 'none', display: 'block' }}
            title="Receipt"
          />
          {!loaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" style={{height:'1060px'}}>
              <div className="text-gray-500 text-sm">Loading receipt...</div>
            </div>
          )}
        </div>
      </div>

      <div className="no-print bg-gray-800 text-gray-400 text-xs text-center py-2 flex-shrink-0">
        Click "Download PDF" → Set Paper: A4, Orientation: Portrait, Margins: None
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-700 text-white">Loading...</div>
    }>
      <ReceiptViewer/>
    </Suspense>
  );
}
