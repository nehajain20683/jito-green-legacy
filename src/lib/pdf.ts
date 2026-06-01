// src/lib/pdf.ts — JITO Green Legacy · Light Premium Theme · v3
import { JITO_LOGO_B64, ENV_LOGO_B64, MZ_LOGO_B64, BNZ_LOGO_B64 } from './logo-data';

// ─── Tier badge from tree count ───────────────────────────────────────────────
function getTierBadge(trees: number): { badge: string; emoji: string; badgeEn: string } {
  if (trees >= 108) return { badge: 'विरासत निर्माता', emoji: '💎', badgeEn: 'Diamond Legacy' };
  if (trees >= 54)  return { badge: 'समर्पित',         emoji: '🏆', badgeEn: 'Platinum Legacy' };
  if (trees >= 27)  return { badge: 'संकल्पी',          emoji: '🥇', badgeEn: 'Gold Legacy' };
  if (trees >= 11)  return { badge: 'प्रेरक',           emoji: '🥈', badgeEn: 'Silver Legacy' };
  return               { badge: 'प्रेरक',               emoji: '🌱', badgeEn: 'Tree Sponsor' };
}

// ─── Receipt PDF ────────────────────────────────────────────────────────────
export function generateReceiptPDF(data: {
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  donorPan?: string;
  amount: number;
  numberOfTrees: number;
  campaignName: string;
  paymentGatewayId?: string;
  date: Date;
}): string {
  const dateStr = data.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const tier    = getTierBadge(data.numberOfTrees);
  // Sizes: JITO=66px, ENV=60px (~90%), MZ=53px (~80%)
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',sans-serif;background:#fff;width:794px;margin:0 auto;color:#1a2e1a}
    .page{padding:40px}
    .border{border:3px solid #aecfa4;padding:32px;min-height:960px;position:relative;border-radius:4px}
    .inner-border{border:1px solid #d3e6cc;position:absolute;inset:10px;border-radius:2px;pointer-events:none}
    /* Header with both logos */
    .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #eaf2e6}
    .header-logos{display:flex;align-items:center;gap:12px}
    .logo-jito{width:66px;height:66px;object-fit:contain;background:transparent;flex-shrink:0}
    .logo-env{width:60px;height:60px;object-fit:contain;background:transparent;flex-shrink:0}
    .header-text{text-align:center;flex:1}
    .org-name{font-family:'EB Garamond',serif;font-size:22px;color:#264422;font-weight:600}
    .org-tag{font-size:12px;color:#448039;margin-top:3px}
    .receipt-title{text-align:center;font-family:'EB Garamond',serif;font-size:26px;color:#264422;font-style:italic;margin:14px 0 4px}
    .receipt-number{text-align:center;font-size:12px;color:#448039;margin-bottom:20px}
    .section{margin:14px 0}
    .section-title{font-size:10px;text-transform:uppercase;letter-spacing:2.5px;color:#448039;border-bottom:1px solid #eaf2e6;padding-bottom:4px;margin-bottom:10px;font-weight:600}
    .row{display:flex;margin:8px 0;font-size:13px}
    .label{width:180px;color:#448039}
    .value{flex:1;color:#264422;font-weight:600}
    .amount-box{background:#f6f9f4;border:2px solid #aecfa4;border-radius:10px;padding:18px;margin:18px 0;text-align:center}
    .amount-label{font-size:10px;color:#448039;text-transform:uppercase;letter-spacing:2px;font-weight:600}
    .amount-value{font-family:'EB Garamond',serif;font-size:40px;color:#264422;font-weight:700;margin:6px 0}
    .trees-badge{font-size:14px;color:#448039;font-weight:600}
    .tax-note{font-size:10px;color:#448039;text-align:center;margin:14px 0;font-style:italic;line-height:1.6}
    .footer-bar{border-top:1px solid #eaf2e6;padding-top:12px;margin-top:16px;display:flex;align-items:center;justify-content:space-between}
    .footer-text{text-align:center;font-size:10px;color:#448039;flex:1}
    .logo-mz{width:53px;height:auto;object-fit:contain}
    .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-family:'EB Garamond',serif;font-size:64px;color:rgba(68,128,57,.04);font-weight:900;text-transform:uppercase;pointer-events:none;white-space:nowrap}
  </style>
</head>
<body>
<div class="page">
  <div class="border">
    <div class="inner-border"></div>
    <div class="watermark">JITO GREEN LEGACY</div>
    <div class="header">
      <img src="${JITO_LOGO_B64}" class="logo-jito" alt="JITO"/>
      <div class="header-text">
        <div class="org-name">JITO Green Legacy</div>
        <div class="org-tag">A Family Tree Plantation Drive by Mumbai Zone and its Chapters</div>
      </div>
      <img src="${ENV_LOGO_B64}" class="logo-env" alt="JITO Environment &amp; Sustainability"/>
    </div>
    <div class="receipt-title">Official Donation Receipt</div>
    <div class="receipt-number">Receipt No: <strong>#${data.receiptNumber}</strong> &nbsp;|&nbsp; Date: ${dateStr}</div>
    <div class="section">
      <div class="section-title">Donor Information</div>
      <div class="row"><span class="label">Name</span><span class="value">${data.donorName}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${data.donorEmail}</span></div>
      ${data.donorPan ? `<div class="row"><span class="label">PAN</span><span class="value">${data.donorPan}</span></div>` : ''}
    </div>
    <div class="section">
      <div class="section-title">Donation Details</div>
      <div class="row"><span class="label">Campaign</span><span class="value">${data.campaignName}</span></div>
      <div class="row"><span class="label">Trees Sponsored</span><span class="value">${data.numberOfTrees} Trees ${tier.emoji}</span></div>
      <div class="row"><span class="label">Tier</span><span class="value">${tier.emoji} ${tier.badge} · ${tier.badgeEn}</span></div>
      <div class="row"><span class="label">CO₂ Removed/yr</span><span class="value">↓ ${(data.numberOfTrees * 22).toLocaleString('en-IN')} kg</span></div>
      ${data.paymentGatewayId ? `<div class="row"><span class="label">Transaction ID</span><span class="value">${data.paymentGatewayId}</span></div>` : ''}
      <div class="row"><span class="label">Payment Mode</span><span class="value">Online (Razorpay)</span></div>
    </div>
    <div class="amount-box">
      <div class="amount-label">Total Amount Donated</div>
      <div class="amount-value">₹${data.amount.toLocaleString('en-IN')}</div>
      <div class="trees-badge">${tier.emoji} ${tier.badge} · ${tier.badgeEn} · ${data.numberOfTrees} Trees · JITO Green Legacy</div>
    </div>
    <div class="tax-note">
      This receipt is issued as proof of donation and may be eligible for tax exemption under<br/>
      Section 80G of the Income Tax Act, 1961 · JITO Mumbai Zone · 80G Reg: [Registration Number]
    </div>
    <!-- Footer with Mumbai Zone logo centred -->
    <div class="footer-bar">
      <div class="footer-text">Authorised Signatory · JITO Green Legacy · Mumbai, Maharashtra, India<br/>This is a computer-generated receipt.</div>
      <div style="text-align:center;min-width:80px">
        <img src="${MZ_LOGO_B64}" class="logo-mz" alt="Mumbai Zone"/>
        <div style="font-size:9px;color:#448039;margin-top:2px">Mumbai Zone</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── Certificate PDF — v3: content shifted up, logos enlarged, Mumbai Zone seal ──
export function generateCertificatePDF(data: {
  donorName: string;
  numberOfTrees: number;
  campaignName: string;
  dedicationName?: string;
  date: Date;
  receiptNumber: string;
  chapter?: string;
}): string {
  const dateStr = data.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const co2     = data.numberOfTrees * 22;
  const tier    = getTierBadge(data.numberOfTrees);
  const chapter = data.chapter || 'Mumbai Zone';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&family=Cinzel:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

    html, body {
      width: 1123px;
      height: 794px;
      background: #fffef9;
      font-family: 'DM Sans', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: hidden;
    }

    .page {
      width: 1123px;
      height: 794px;
      background: #fffef9;
      position: relative;
      overflow: hidden;
    }

    /* Borders */
    .outer-border { position:absolute; inset:12px; border:2.5px solid #c9a84c; border-radius:2px; pointer-events:none; z-index:5; box-sizing:border-box; }
    .inner-border { position:absolute; inset:18px; border:1px solid rgba(201,168,76,0.35); border-radius:1px; pointer-events:none; z-index:5; }

    /* Corners */
    .corner { position:absolute; width:48px; height:48px; z-index:6; }
    .c-tl { top:26px;  left:26px;  border-top:2px solid #8a9e3a; border-left:2px solid #8a9e3a; }
    .c-tr { top:26px;  right:26px; border-top:2px solid #8a9e3a; border-right:2px solid #8a9e3a; }
    .c-bl { bottom:26px; left:26px;  border-bottom:2px solid #8a9e3a; border-left:2px solid #8a9e3a; }
    .c-br { bottom:26px; right:26px; border-bottom:2px solid #8a9e3a; border-right:2px solid #8a9e3a; }

    /* Watermark */
    .watermark {
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%);
      font-family:'Cinzel',serif; font-size:88px; color:rgba(138,158,58,0.04);
      font-weight:700; text-transform:uppercase; pointer-events:none;
      white-space:nowrap; letter-spacing:10px; z-index:1;
    }

    /* ── Absolutely positioned logos ── */
    .logo-jito {
      position:absolute; top:26px; left:36px;
      width:120px; height:96px;
      object-fit:contain; background:transparent; z-index:20;
    }
    .logo-env {
      position:absolute; top:26px; right:36px;
      width:108px; height:96px;   /* 90% of JITO */
      object-fit:contain; background:transparent; z-index:20;
    }

    /* Centre header text — sits between logos */
    .center-header {
      position:absolute; top:42px; left:174px; right:162px;
      text-align:center; z-index:20;
    }
    .org-eyebrow {
      font-family:'Cinzel',serif; font-size:13px; letter-spacing:4px;
      color:#8a9e3a; text-transform:uppercase; display:block; margin-bottom:4px;
    }
    .org-tagline {
      font-size:11.5px; color:#6a8050; letter-spacing:0.3px;
      font-family:'DM Sans',sans-serif;
    }

    /* ── Content — shifted up vs v2 ── */
    .content {
      position:absolute;
      /* Start below logos ~120px, stop above bottom border ~26px */
      top:140px; left:36px; right:36px; bottom:28px;
      display:flex; flex-direction:column; align-items:center;
      justify-content:space-between; text-align:center;
    }

    /* Gold divider */
    .gold-divider { display:flex; align-items:center; gap:8px; width:100%; justify-content:center; }
    .gold-line { flex:1; max-width:220px; height:1px; background:linear-gradient(to right,transparent,#c9a84c,transparent); }
    .gold-diamond { width:7px; height:7px; background:#c9a84c; transform:rotate(45deg); flex-shrink:0; }

    /* Certificate title — 2pt larger */
    .cert-title {
      font-family:'Cinzel',serif; font-size:32px;
      font-weight:700; color:#1a2e0a; letter-spacing:2px; line-height:1.1;
    }
    .cert-sub {
      font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:4px;
      text-transform:uppercase; color:#7a9e3a;
    }

    /* Certifies */
    .certifies-text { font-family:'Playfair Display',serif; font-size:16px; color:#5a7a3a; font-style:italic; }

    /* Donor name */
    .donor-name {
      font-family:'Playfair Display',serif; font-size:50px; font-weight:700;
      font-style:italic; color:#1a2e0a; line-height:1.05;
      border-bottom:2px solid #c9a84c; padding-bottom:6px;
      min-width:400px; display:inline-block;
    }

    /* Chapter */
    .chapter-line { font-family:'DM Sans',sans-serif; font-size:18px; font-weight:600; color:#7a9e3a; }

    /* Body text */
    .body-text { font-family:'Playfair Display',serif; font-size:16px; color:#3a5a2a; line-height:1.6; max-width:760px; }
    .text-highlight { color:#1a2e0a; font-weight:700; }
    .text-dedication { color:#7a9e3a; font-style:italic; font-size:17px; }

    /* Tier badge */
    .badge {
      display:inline-block; border:2px solid #c9a84c; border-radius:50px;
      padding:6px 28px; font-family:'Cinzel',serif; font-size:13px; letter-spacing:3px;
      text-transform:uppercase; color:#8a7020;
      background:linear-gradient(135deg,#fffef0 0%,#fdf8e1 100%);
      box-shadow:0 2px 10px rgba(201,168,76,0.2);
    }

    /* Impact */
    .impact-row { display:flex; gap:24px; justify-content:center; }
    .impact-item {
      text-align:center; padding:7px 18px;
      background:#f4f8f0; border:1px solid #d0e0c0; border-radius:10px; min-width:120px;
    }
    .impact-number { font-family:'Cinzel',serif; font-size:20px; font-weight:700; color:#264422; display:block; line-height:1.1; }
    .co2-arrow { color:#4a8a3a; font-size:20px; font-weight:900; margin-right:2px; }
    .impact-label { font-family:'DM Sans',sans-serif; font-size:9px; color:#7a9e3a; text-transform:uppercase; letter-spacing:1.5px; margin-top:2px; display:block; }

    /* Footer row */
    .cert-footer {
      width:100%; display:flex; justify-content:space-between; align-items:flex-end;
      border-top:1px solid #e0eccc; padding-top:8px;
    }
    .footer-item { text-align:center; min-width:110px; }
    .footer-label { font-family:'DM Sans',sans-serif; font-size:8px; color:#8a9e3a; text-transform:uppercase; letter-spacing:2px; display:block; margin-bottom:2px; }
    .footer-value { font-family:'DM Sans',sans-serif; font-size:10px; color:#264422; font-weight:600; }

    /* Left seal — geo tag */
    .seal-left { width:50px; height:50px; border:2px solid #c9a84c; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; margin:0 auto 4px; background:#fffef0; box-shadow:0 2px 8px rgba(201,168,76,.15); }

    /* Right seal — Mumbai Zone logo */
    .seal-mz { width:96px; height:auto; object-fit:contain; display:block; margin:0 auto 4px; }

    @media screen and (max-width:1200px) {
      html, body { width:100%; height:auto; overflow:auto; }
      .page { width:100%; height:auto; min-height:100vh; }
      .logo-jito { width:80px; height:64px; }
      .logo-env  { width:72px; height:64px; }
      .center-header { left:124px; right:116px; }
      .content { position:relative; top:auto; left:auto; right:auto; bottom:auto; padding:12px 24px 20px; }
      .donor-name { font-size:36px; min-width:auto; width:100%; }
      .cert-title { font-size:24px; }
      .impact-row { flex-wrap:wrap; gap:10px; }
    }

    @page { size: A4 landscape; margin: 0; }
    @media print {
      html, body { width:297mm; height:210mm; }
      .page { width:297mm; height:210mm; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Borders -->
  <div class="outer-border"></div>
  <div class="inner-border"></div>
  <!-- Corners -->
  <div class="corner c-tl"></div>
  <div class="corner c-tr"></div>
  <div class="corner c-bl"></div>
  <div class="corner c-br"></div>
  <!-- Watermark -->
  <div class="watermark">CERTIFIED</div>

  <!-- JITO Logo — top left, larger -->
  <img src="${JITO_LOGO_B64}" class="logo-jito" alt="JITO Logo"/>

  <!-- ENV Logo — top right, 90% of JITO -->
  <img src="${ENV_LOGO_B64}" class="logo-env" alt="JITO Environment &amp; Sustainability"/>

  <!-- Centre header text -->
  <div class="center-header">
    <span class="org-eyebrow">JITO Green Legacy</span>
    <div class="org-tagline">A Family Tree Plantation Drive by Mumbai Zone and its Chapters</div>
  </div>

  <!-- Main content shifted up -->
  <div class="content">

    <!-- Gold divider -->
    <div class="gold-divider">
      <div class="gold-line"></div>
      <div class="gold-diamond"></div>
      <div class="gold-line"></div>
    </div>

    <!-- Title (2pt larger) -->
    <div>
      <div class="cert-title">Certificate of Tree Sponsorship</div>
      <div class="cert-sub">Presented by JITO Mumbai Zone and its Chapters</div>
    </div>

    <!-- Small gold divider -->
    <div class="gold-divider" style="margin:0">
      <div class="gold-line" style="max-width:120px"></div>
      <div class="gold-diamond"></div>
      <div class="gold-line" style="max-width:120px"></div>
    </div>

    <!-- Donor info -->
    <div>
      <div class="certifies-text">This certificate is proudly presented to</div>
      <div class="donor-name">${data.donorName}</div>
      <div class="chapter-line" style="margin-top:5px">JITO Chapter: ${chapter}</div>
    </div>

    <!-- Body -->
    <div class="body-text">
      for generously sponsoring
      <span class="text-highlight">${data.numberOfTrees} ${data.numberOfTrees === 1 ? 'Tree' : 'Trees'}</span>
      under the <span class="text-highlight">${data.campaignName}</span>
      ${data.dedicationName ? `<br/>in loving honour of <span class="text-dedication">${data.dedicationName}</span>` : ''}
    </div>

    <!-- Tier badge — full tier name -->
    <div>
      <span class="badge">${tier.emoji} ${tier.badge} · ${tier.badgeEn} ${tier.emoji}</span>
    </div>

    <!-- Impact -->
    <div class="impact-row">
      <div class="impact-item">
        <span class="impact-number">${data.numberOfTrees}</span>
        <span class="impact-label">Trees Planted</span>
      </div>
      <div class="impact-item">
        <span class="impact-number"><span class="co2-arrow">↓</span>${co2.toLocaleString('en-IN')} kg</span>
        <span class="impact-label">CO₂ Removed / Year</span>
      </div>
      <div class="impact-item">
        <span class="impact-number">25+ yrs</span>
        <span class="impact-label">Lasting Impact</span>
      </div>
    </div>

    <!-- Footer row -->
    <div class="cert-footer">
      <!-- Left: Geo verified -->
      <div class="footer-item">
        <div class="seal-left">📍</div>
        <span class="footer-label">Verified Plantation</span>
        <span class="footer-value">Geo-tagged &amp; Monitored</span>
      </div>

      <!-- Centre: Date + Receipt -->
      <div class="footer-item" style="text-align:center">
        <span class="footer-label">Date of Issue</span>
        <span class="footer-value" style="display:block;margin-bottom:5px">${dateStr}</span>
        <span class="footer-label">Certificate No.</span>
        <span class="footer-value">#${data.receiptNumber}</span>
      </div>

      <!-- Right: Mumbai Zone logo -->
      <div class="footer-item">
        <img src="${MZ_LOGO_B64}" class="seal-mz" alt="Mumbai Zone"/>
        <span class="footer-label">Authorised By</span>
        <span class="footer-value">JITO Mumbai Zone</span>
      </div>
    </div>

  </div><!-- /content -->
</div><!-- /page -->
</body>
</html>`;
}
