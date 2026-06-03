// src/lib/email.ts — JITO Green Legacy · Resend integration
// Attaches real PDF files (receipt + certificate) generated via puppeteer
import { Resend } from 'resend';
import { generateReceiptPDF, generateCertificatePDF } from './pdf';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.FROM_EMAIL
  ? `${process.env.FROM_NAME || 'JITO Green Legacy'} <${process.env.FROM_EMAIL}>`
  : 'JITO Green Legacy <onboarding@resend.dev>';

interface DonationEmailData {
  donorName: string;
  donorEmail: string;
  amount: number;
  numberOfTrees: number;
  campaignName: string;
  receiptNumber: string;
  dedicationName?: string;
  donationId: string;
  donorPan?: string;
  paymentGatewayId?: string;
  donationDate: Date;
  chapter?: string;
}

// Convert HTML to PDF buffer using puppeteer, fall back to HTML if unavailable
async function generatePdfBuffer(html: string, landscape: boolean): Promise<Buffer | null> {
  try {
    const { htmlToPdfBuffer } = await import('./generate-pdf');
    return await htmlToPdfBuffer(html, landscape);
  } catch (e) {
    console.warn('PDF generation failed, falling back to HTML attachment:', e);
    return null;
  }
}

export async function sendDonationConfirmationEmail(data: DonationEmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return false;
  }

  try {
    const receiptHtml     = generateReceiptPDF({
      receiptNumber:    data.receiptNumber,
      donorName:        data.donorName,
      donorEmail:       data.donorEmail,
      donorPan:         data.donorPan,
      amount:           data.amount,
      numberOfTrees:    data.numberOfTrees,
      campaignName:     data.campaignName,
      paymentGatewayId: data.paymentGatewayId,
      date:             data.donationDate,
    });

    const certificateHtml = generateCertificatePDF({
      donorName:      data.donorName,
      numberOfTrees:  data.numberOfTrees,
      campaignName:   data.campaignName,
      dedicationName: data.dedicationName,
      date:           data.donationDate,
      receiptNumber:  data.receiptNumber,
      chapter:        data.chapter || 'Mumbai Zone',
    });

    // Try to generate real PDFs; fall back to HTML if puppeteer unavailable
    const [receiptPdf, certPdf] = await Promise.all([
      generatePdfBuffer(receiptHtml,     false),  // portrait
      generatePdfBuffer(certificateHtml, true),   // landscape
    ]);

    const attachments = receiptPdf && certPdf
      ? [
          {
            filename: `receipt-${data.receiptNumber}.pdf`,
            content:  receiptPdf.toString('base64'),
          },
          {
            filename: `certificate-${data.receiptNumber}.pdf`,
            content:  certPdf.toString('base64'),
          },
        ]
      : [
          // Fallback: attach as HTML with clear note
          {
            filename: `receipt-${data.receiptNumber}.html`,
            content:  Buffer.from(receiptHtml, 'utf-8').toString('base64'),
          },
          {
            filename: `certificate-${data.receiptNumber}.html`,
            content:  Buffer.from(certificateHtml, 'utf-8').toString('base64'),
          },
        ];

    const isPdf  = receiptPdf !== null;
    const co2    = data.numberOfTrees * 22;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Georgia, serif; background: #f6f9f4; margin: 0; padding: 0; }
    .wrap { max-width: 600px; margin: 32px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: linear-gradient(135deg, #264422 0%, #376631 100%); padding: 40px 36px; text-align: center; }
    .badge { display: inline-block; background: rgba(174,207,164,0.2); border: 1px solid rgba(174,207,164,0.4); color: #aecfa4; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin-bottom: 14px; font-family: sans-serif; }
    .header h1 { color: #f6f9f4; font-size: 26px; margin: 0 0 5px; }
    .header p { color: #aecfa4; font-size: 12px; margin: 0; font-family: sans-serif; letter-spacing: 1px; }
    .body { padding: 36px; }
    .greeting { font-size: 18px; color: #264422; margin-bottom: 14px; }
    .lead { color: #448039; line-height: 1.7; font-size: 15px; margin-bottom: 20px; }
    .dedication { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; text-align: center; font-size: 14px; color: #92400e; margin-bottom: 20px; }
    .receipt-box { background: #f6f9f4; border: 2px solid #aecfa4; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .receipt-box h3 { margin: 0 0 14px; color: #264422; font-size: 15px; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #eaf2e6; font-family: sans-serif; font-size: 13px; }
    .row:last-child { border-bottom: none; font-weight: bold; font-size: 16px; color: #376631; padding-top: 12px; }
    .label { color: #448039; }
    .value { color: #264422; font-weight: 600; }
    .impact { background: #264422; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .impact-num { font-size: 42px; font-weight: bold; color: #7db870; font-family: Georgia, serif; }
    .impact-label { font-size: 12px; color: #aecfa4; font-family: sans-serif; margin-top: 4px; }
    .attach-box { background: #eaf2e6; border-radius: 10px; padding: 14px 16px; font-family: sans-serif; font-size: 13px; color: #376631; margin: 16px 0; border-left: 4px solid #448039; }
    .attach-box strong { color: #264422; }
    .pdf-badge { display: inline-block; background: #dc2626; color: white; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-family: sans-serif; letter-spacing: 1px; vertical-align: middle; }
    .cta { text-align: center; margin: 24px 0; }
    .btn { display: inline-block; background: #448039; color: white; padding: 12px 26px; border-radius: 8px; text-decoration: none; font-size: 14px; font-family: sans-serif; font-weight: 600; margin: 5px; }
    .tax-note { font-size: 11px; color: #448039; background: #f6f9f4; border-radius: 8px; padding: 12px; font-family: sans-serif; line-height: 1.6; }
    .footer { background: #f6f9f4; padding: 20px 36px; text-align: center; border-top: 1px solid #eaf2e6; font-family: sans-serif; font-size: 11px; color: #448039; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="badge">JITO Mumbai Zone</div>
      <h1>🌳 JITO Green Legacy</h1>
      <p>A Family Tree Plantation Drive by Mumbai Zone</p>
    </div>
    <div class="body">
      <p class="greeting">Dear ${data.donorName},</p>
      <p class="lead">
        Thank you for your generous contribution to the <strong>${data.campaignName}</strong> campaign.
        Your trees will be planted at our verified plantation sites and geo-tagged for live tracking.
      </p>

      ${data.dedicationName ? `<div class="dedication">🌺 This donation is dedicated to <strong>${data.dedicationName}</strong></div>` : ''}

      <div class="receipt-box">
        <h3>Donation Summary</h3>
        <div class="row"><span class="label">Receipt No.</span><span class="value">#${data.receiptNumber}</span></div>
        <div class="row"><span class="label">Campaign</span><span class="value">${data.campaignName}</span></div>
        <div class="row"><span class="label">Trees Sponsored</span><span class="value">${data.numberOfTrees} Trees 🌳</span></div>
        ${data.paymentGatewayId ? `<div class="row"><span class="label">Transaction ID</span><span class="value">${data.paymentGatewayId}</span></div>` : ''}
        <div class="row"><span class="label">Amount Paid</span><span class="value">₹${data.amount.toLocaleString('en-IN')}</span></div>
      </div>

      <div class="impact">
        <div class="impact-num">↓${co2}kg</div>
        <div class="impact-label">Estimated CO₂ absorbed per year by your trees</div>
      </div>

      <div class="attach-box">
        📎 <strong>Documents attached to this email:</strong><br/><br/>
        <span class="pdf-badge">PDF</span> <strong>receipt-${data.receiptNumber}.pdf</strong> — Official Donation Receipt<br/>
        <span class="pdf-badge">PDF</span> <strong>certificate-${data.receiptNumber}.pdf</strong> — Tree Sponsorship Certificate
        ${!isPdf ? '<br/><br/><em style="font-size:12px;color:#888">Note: PDF generation is initialising. If files appear as .html, open in browser and use Ctrl+P → Save as PDF.</em>' : ''}
      </div>

      <div class="cta">
        <a href="${appUrl}/certificate?id=${data.donationId}" class="btn">View Certificate Online</a>
      </div>

      <div class="tax-note">
        📋 This donation may be eligible for tax exemption under Section 80G of the Income Tax Act, 1961.
        Please retain this email and attachments as proof of donation · JITO Mumbai Zone · mumbaizoneJES@jito.org
      </div>
    </div>
    <div class="footer">
      <strong>JITO Green Legacy</strong> · A Family Tree Plantation Drive by Mumbai Zone<br/>
      mumbaizoneJES@jito.org · +91 91377 41905 · Mumbai, Maharashtra, India<br/><br/>
      This is an automated message. Please do not reply directly.
    </div>
  </div>
</body>
</html>`;

    const { data: result, error } = await resend.emails.send({
      from:        FROM,
      to:          [data.donorEmail],
      subject:     `🌳 Thank You! Receipt #${data.receiptNumber} — JITO Green Legacy`,
      html:        emailHtml,
      attachments,
    });

    if (error) { console.error('Resend error:', error); return false; }
    console.log(`Email sent: ${result?.id} | Attachments: ${isPdf ? 'PDF ✓' : 'HTML fallback'}`);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}
