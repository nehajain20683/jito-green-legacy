'use client';
// src/app/certificate/page.tsx
// Opens certificate in a print-ready full-screen view
// User can Ctrl+P → Save as PDF for proper PDF output
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Printer, X } from 'lucide-react';

function CertificateViewer() {
  const params     = useSearchParams();
  const id         = params.get('id');
  const autoPrint  = params.get('print') === '1';
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setUrl(`/api/certificates/${id}/pdf`);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (autoPrint && url) {
      setTimeout(() => window.print(), 1200);
    }
  }, [autoPrint, url]);

  if (!id) return <div className="flex items-center justify-center h-screen">No certificate ID provided.</div>;

  return (
    <div className="min-h-screen bg-gray-800">

      {/* Toolbar — hidden when printing */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="text-sm font-medium">🌳 Certificate Preview</div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4"/>
            Download PDF
          </button>
          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg">
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Certificate iframe */}
      <div className="pt-14 px-4 pb-4 flex justify-center items-start min-h-screen">
        {loading ? (
          <div className="text-white mt-20">Loading certificate...</div>
        ) : (
          <iframe
            src={url}
            className="cert-iframe"
            style={{
              width: '1123px',
              maxWidth: '100%',
              height: '794px',
              border: 'none',
              borderRadius: '4px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              transform: 'scale(var(--cert-scale, 1))',
              transformOrigin: 'top center',
            }}
            title="Certificate"
          />
        )}
      </div>

      <style>{`
        @media screen {
          .cert-iframe {
            --cert-scale: min(1, calc((100vw - 32px) / 1123px));
            transform: scale(var(--cert-scale));
            transform-origin: top center;
            display: block;
            margin: 0 auto;
          }
        }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          .cert-iframe {
            position: fixed !important;
            top: 0; left: 0;
            width: 100vw !important;
            height: 100vh !important;
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          html, body { width: 297mm; height: 210mm; }
        }
      `}</style>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-800 text-white">Loading...</div>}>
      <CertificateViewer/>
    </Suspense>
  );
}
