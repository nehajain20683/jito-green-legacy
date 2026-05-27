// src/components/layout/Footer.tsx — Light theme
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BRAND } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="bg-sage-900 text-sage-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-sage-700 flex items-center justify-center">
                <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
                  <ellipse cx="18" cy="13" rx="9" ry="8" fill="#a7d99e"/>
                  <ellipse cx="13" cy="16" rx="6" ry="5" fill="#7db870"/>
                  <ellipse cx="23" cy="16" rx="6" ry="5" fill="#5a9e4e"/>
                  <ellipse cx="18" cy="10" rx="7" ry="6.5" fill="#c8e8c3"/>
                  <rect x="16.5" y="21" width="3" height="9" rx="1.5" fill="#92613a"/>
                </svg>
              </div>
              <div>
                <div className="font-display text-lg text-white font-bold">{BRAND.name}</div>
                <div className="text-xs text-sage-400">{BRAND.tagline}</div>
              </div>
            </div>
            <p className="text-sage-400 text-sm leading-relaxed max-w-xs">
              Every tree planted is a promise kept to nature and a living gift to the generations that follow.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-sage-400">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-sage-500 flex-shrink-0"/> greenlegacy@jitomumbai.org</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-sage-500 flex-shrink-0"/> +91 98765 43210</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sage-500 flex-shrink-0"/> Mumbai, Maharashtra, India</div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Campaigns</h4>
            <ul className="space-y-2.5 text-sm text-sage-400">
              {['dadi','maa','beti','poti'].map(s => (
                <li key={s}><Link href={`/campaigns/${s}`} className="hover:text-sage-200 transition-colors capitalize">Ek Ped {s.charAt(0).toUpperCase()+s.slice(1)} Ke Naam</Link></li>
              ))}
              <li><Link href="/donate?type=individual" className="hover:text-sage-200 transition-colors">Individual Tree Sponsorship</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2.5 text-sm text-sage-400">
              <li><Link href="/campaigns" className="hover:text-sage-200 transition-colors">Sponsor Trees</Link></li>
              <li><Link href="/impact" className="hover:text-sage-200 transition-colors">Impact Dashboard</Link></li>
              <li><Link href="/csr" className="hover:text-sage-200 transition-colors">Corporate Support</Link></li>
              <li><Link href="/dashboard" className="hover:text-sage-200 transition-colors">My Dashboard</Link></li>
              <li><Link href="/auth/login" className="hover:text-sage-200 transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sage-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-sage-500">
          <p>© {new Date().getFullYear()} {BRAND.name} · {BRAND.org}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-sage-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-sage-300">Terms of Service</Link>
            <Link href="/refund" className="hover:text-sage-300">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
