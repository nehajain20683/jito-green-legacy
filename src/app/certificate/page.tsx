'use client';
// src/app/certificate/page.tsx
// Opens the certificate HTML in a properly styled page
// User clicks "Download PDF" → browser prints landscape A4 PDF
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';

function CertificateViewer() {
  const params    = useSearchParams();
  const id        = params.get('id');
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // Auto-calculate scale to fit viewport
  useEffect(() => {
    function calcScale() {
      const vw = window.innerWidth - 48;
      const vh = window.innerHeight - 80;
      const scaleW = vw / 1123;
      const scaleH = vh / 794;
      setScale(Math.min(scaleW, scaleH, 1));
    }
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  if (!id) return (
    <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
      No certificate ID provided.
    </div>
  );

  const certUrl = `/api/certificates/${id}/pdf`;

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col">

      {/* Toolbar */}
      <div className="no-print bg-gray-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">🌳 Certificate Preview</span>
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1">
            <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-1 hover:text-white text-gray-400">
              <ZoomOut className="w-3.5 h-3.5"/>
            </button>
            <span className="text-xs text-gray-300 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(1, s + 0.1))} className="p-1 hover:text-white text-gray-400">
              <ZoomIn className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Open cert in new tab then print
              const w = window.open(certUrl, '_blank');
              if (w) {
                w.onload = () => {
                  w.document.title = 'Certificate';
                  setTimeout(() => w.print(), 500);
                };
              }
            }}
            className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Download className="w-4 h-4"/> Download PDF
          </button>
          <a href={certUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg">
            Open Raw
          </a>
          <button onClick={() => window.history.back()} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Certificate display */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div style={{
          width: `${1123 * scale}px`,
          height: `${794 * scale}px`,
          flexShrink: 0,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <iframe
            src={certUrl}
            onLoad={() => setLoaded(true)}
            style={{
              width: '1123px',
              height: '794px',
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              display: 'block',
            }}
            title="Certificate"
          />
          {!loaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-500 text-sm">Loading certificate...</div>
            </div>
          )}
        </div>
      </div>

      {/* Print instructions */}
      <div className="no-print bg-gray-800 text-gray-400 text-xs text-center py-2 flex-shrink-0">
        Click "Download PDF" → In the print dialog, set Paper: A4, Orientation: Landscape, Margins: None
      </div>

    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-700 text-white">
        Loading...
      </div>
    }>
      <CertificateViewer/>
    </Suspense>
  );
}
