'use client';
// src/app/certificate/page.tsx — fullscreen PDF viewer, auto-fit width
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Certificate natural dimensions (A4 landscape px at 96dpi)
const CERT_W = 1123;
const CERT_H = 794;

function CertificateViewer() {
  const params       = useSearchParams();
  const id           = params.get('id');
  const [scale, setScale]   = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [padTop, setPadTop] = useState(20);

  // Fit certificate width to 92% of viewport, recalc on resize
  const fitWidth = useCallback(() => {
    const vw = window.innerWidth;
    const s  = (vw * 0.92) / CERT_W;
    setScale(s);
    // Center vertically if certificate is shorter than viewport
    const toolbarH = 52;
    const footerH  = 28;
    const available = window.innerHeight - toolbarH - footerH;
    const certH     = CERT_H * s;
    setPadTop(certH < available ? Math.max(16, (available - certH) / 2) : 16);
  }, []);

  useEffect(() => {
    fitWidth();
    window.addEventListener('resize', fitWidth);
    return () => window.removeEventListener('resize', fitWidth);
  }, [fitWidth]);

  if (!id) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#3a3a3a', color:'white' }}>
      No certificate ID provided.
    </div>
  );

  const certUrl = `/api/certificates/${id}/pdf`;
  const scaledW = CERT_W * scale;
  const scaledH = CERT_H * scale;

  return (
    <div style={{ width:'100vw', height:'100vh', background:'#3a3a3a', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{ height:'52px', background:'#1a1a1a', color:'white', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.5)', zIndex:10 }}>

        {/* Left: title + zoom */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'13px', fontWeight:600 }}>🌳 Certificate Preview</span>
          <div style={{ display:'flex', alignItems:'center', gap:'2px', background:'#2a2a2a', borderRadius:'6px', padding:'3px 6px' }}>
            <button
              onClick={() => setScale(s => Math.max(0.2, parseFloat((s - 0.1).toFixed(2))))}
              title="Zoom out"
              style={{ background:'none', border:'none', color:'#bbb', cursor:'pointer', width:'24px', height:'24px', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px' }}>
              −
            </button>
            <span style={{ fontSize:'11px', color:'#999', minWidth:'38px', textAlign:'center' }}>
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2.5, parseFloat((s + 0.1).toFixed(2))))}
              title="Zoom in"
              style={{ background:'none', border:'none', color:'#bbb', cursor:'pointer', width:'24px', height:'24px', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px' }}>
              +
            </button>
          </div>
          <button
            onClick={fitWidth}
            title="Fit to screen width"
            style={{ background:'#2a2a2a', border:'none', color:'#bbb', cursor:'pointer', padding:'4px 10px', borderRadius:'6px', fontSize:'11px' }}>
            ⊡ Fit Width
          </button>
        </div>

        {/* Right: download + close */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <button
            onClick={() => {
              const w = window.open(certUrl, '_blank');
              if (w) w.onload = () => setTimeout(() => w.print(), 600);
            }}
            style={{ background:'#16a34a', border:'none', color:'white', cursor:'pointer', padding:'7px 16px', borderRadius:'7px', fontSize:'12px', fontWeight:600 }}>
            ⬇ Download PDF
          </button>
          <button
            onClick={() => window.history.back()}
            style={{ background:'#333', border:'none', color:'#aaa', cursor:'pointer', padding:'7px 10px', borderRadius:'7px', fontSize:'12px' }}>
            ✕
          </button>
        </div>
      </div>

      {/* ── Scrollable area: vertical scroll only ── */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:`${padTop}px`, paddingBottom:'20px' }}>

        {/* Scaled certificate container */}
        <div style={{ width:`${scaledW}px`, height:`${scaledH}px`, flexShrink:0, position:'relative', boxShadow:'0 10px 50px rgba(0,0,0,0.7)' }}>
          {/* iframe rendered at native size, scaled via CSS transform */}
          <iframe
            src={certUrl}
            onLoad={() => setLoaded(true)}
            scrolling="no"
            style={{
              width:  `${CERT_W}px`,
              height: `${CERT_H}px`,
              border: 'none',
              display: 'block',
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              // Prevent iframe from showing its own scrollbars
              overflow: 'hidden',
            }}
            title="Certificate"
          />
          {!loaded && (
            <div style={{ position:'absolute', inset:0, background:'#f8f6f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:'#888' }}>
              Loading certificate…
            </div>
          )}
        </div>

      </div>

      {/* ── Footer hint ── */}
      <div style={{ height:'28px', background:'#1a1a1a', color:'#555', fontSize:'10px', textAlign:'center', lineHeight:'28px', flexShrink:0 }}>
        Download PDF → Print → Paper: A4 · Orientation: Landscape · Margins: None
      </div>

    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#3a3a3a', color:'white' }}>
        Loading…
      </div>
    }>
      <CertificateViewer />
    </Suspense>
  );
}
