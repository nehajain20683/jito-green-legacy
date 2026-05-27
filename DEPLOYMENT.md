# JITO Green Legacy — Production Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier: 500MB, 2 projects)
- Razorpay account (live keys for production)
- Resend account (free tier: 3,000 emails/month)

---

## Step 1 — Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose region: **South Asia (Mumbai)** for best latency
3. Set a strong database password — save it securely

4. Get your connection strings:
   - Go to **Project Settings → Database → Connection string**
   - Copy **Transaction** mode URL (port 6543) → `DATABASE_URL`
   - Copy **Session** mode URL (port 5432) → `DIRECT_URL`

   They look like:
   ```
   DATABASE_URL:  postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   DIRECT_URL:    postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```

5. Run migrations against the direct connection:
   ```bash
   DIRECT_URL="your-direct-url" DATABASE_URL="your-direct-url" npx prisma migrate deploy
   ```
   Or set both in `.env.local` and run:
   ```bash
   npm run db:deploy
   ```

6. Seed the database:
   ```bash
   npm run db:seed
   ```

---

## Step 2 — Razorpay Setup

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Settings → API Keys → Generate Live Key**
3. Copy **Key ID** and **Key Secret**
4. **Settings → Webhooks → Add New Webhook**:
   - URL: `https://yourdomain.vercel.app/api/payment/webhook`
   - Events: ✓ `payment.captured` ✓ `payment.failed`
   - Secret: use the same `RAZORPAY_KEY_SECRET`

---

## Step 3 — Resend Setup

1. Go to [resend.com](https://resend.com) → Sign up
2. **Domains → Add Domain** → add `jitomumbai.org` → verify DNS records
3. **API Keys → Create API Key** → copy it
4. For testing without a verified domain, use `onboarding@resend.dev` as `FROM_EMAIL`

---

## Step 4 — Deploy to Vercel

### Option A: One-click via Vercel Dashboard (recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "JITO Green Legacy — initial production commit"
   git remote add origin https://github.com/YOUR_USERNAME/jito-green-legacy.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repo

3. Vercel auto-detects Next.js. In the **Environment Variables** section, add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Supabase transaction pooler URL |
   | `DIRECT_URL` | Supabase direct connection URL |
   | `NEXTAUTH_SECRET` | `openssl rand -hex 32` output |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` |
   | `RAZORPAY_KEY_ID` | `rzp_live_xxxx` |
   | `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_xxxx` (same as KEY_ID) |
   | `RESEND_API_KEY` | `re_xxxx` |
   | `FROM_EMAIL` | `greenlegacy@jitomumbai.org` |
   | `FROM_NAME` | `JITO Green Legacy` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Click **Deploy**

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Step 5 — Post-Deployment Checklist

### Run database migrations on production
```bash
# Set DIRECT_URL to your Supabase direct connection string locally
DIRECT_URL="postgresql://..." npx prisma migrate deploy
```

### Seed production database
```bash
DATABASE_URL="your-supabase-url" npm run db:seed
```

### Update environment variables after deployment
Once deployed, update these to your actual Vercel domain:
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
Then **redeploy** (Vercel Dashboard → Deployments → Redeploy).

### Custom Domain (optional)
1. Vercel Dashboard → Settings → Domains → Add domain
2. Update DNS records with your registrar
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your custom domain
4. Redeploy

### Razorpay Webhook
Update webhook URL to your actual domain:
```
https://yourdomain.com/api/payment/webhook
```

---

## Admin Access

After seeding, log in at `/auth/login`:
- **Email:** `admin@jitomumbai.org`
- **Password:** `admin@123`

⚠️ **Change this password immediately after first login in production.**

---

## Troubleshooting

### Build fails: "Environment variable not found"
→ Make sure all required env vars are set in Vercel Dashboard before deploying.

### Prisma: "Can't reach database server"
→ Check `DATABASE_URL` uses the **pgBouncer pooler** URL (port 6543), not direct (port 5432).
→ Ensure `?pgbouncer=true&connection_limit=1` is appended.

### Razorpay: "Failed to create order"
→ Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set correctly.
→ Ensure you're using **live keys** in production, **test keys** in development.

### Resend: Email not sending
→ Your `FROM_EMAIL` domain must be verified in Resend.
→ For testing, use `onboarding@resend.dev` as `FROM_EMAIL`.

### Images not loading
→ Unsplash images load via CDN — no changes needed.
→ Local images in `/public/` are served by Vercel automatically.

### NextAuth: "JWT secret not set"
→ `NEXTAUTH_SECRET` must be a random 32+ character string.
→ Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## Architecture on Vercel

```
Vercel Edge Network
    ↓
Next.js 14 (Serverless Functions)
    ↓
Supabase PostgreSQL (Connection Pooler → pgBouncer)
    ↓
Razorpay (Payment Gateway)
    ↓
Resend (Transactional Email)
```

Each API route runs as an isolated serverless function with a 30s timeout.
The Prisma client uses connection pooling via pgBouncer to handle cold starts efficiently.
