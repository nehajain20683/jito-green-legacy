// src/components/layout/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-white">

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logos/jito-logo.png" alt="JITO" width={48} height={48} className="w-12 h-12 object-contain"/>
              <div>
                <div className="font-display font-bold text-lg">JITO Green Legacy</div>
                <div className="text-sage-400 text-xs">A Family Tree Plantation Drive by Mumbai Zone</div>
              </div>
            </div>
            <p className="text-sage-400 text-sm leading-relaxed mb-4 max-w-sm">
              Creating India's largest community-led family plantation movement. Plant trees in the names of the women who shaped your life.
            </p>
            <div className="space-y-2">
              <a href="mailto:mumbaizoneJES@jito.org" className="flex items-center gap-2 text-sage-300 hover:text-white text-sm transition-colors">
                <Mail className="w-4 h-4 text-sage-500 flex-shrink-0"/>
                mumbaizoneJES@jito.org
              </a>
              <a href="tel:+919137741905" className="flex items-center gap-2 text-sage-300 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4 text-sage-500 flex-shrink-0"/>
                +91 91377 41905
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-sage-400 mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { href:'/campaigns',  label:'Sponsor Trees' },
                { href:'/about',      label:'About Us' },
                { href:'/impact',     label:'Impact Dashboard' },
                { href:'/contact',    label:'Contact Us' },
                { href:'/csr',        label:'Corporate Support' },
                { href:'/farmer/register', label:'Farmer Registration' },
              ].map(l=>(
                <li key={l.href}>
                  <Link href={l.href} className="text-sage-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-sage-400 mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {[
                { href:'/privacy-policy', label:'Privacy Policy' },
                { href:'/terms',          label:'Terms & Conditions' },
                { href:'/refund-policy',  label:'Refund Policy' },
              ].map(l=>(
                <li key={l.href}>
                  <Link href={l.href} className="text-sage-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-semibold text-sm uppercase tracking-widest text-sage-400 mb-4 mt-6">Tax Benefit</h3>
            <p className="text-sage-500 text-xs leading-relaxed">
              80G tax exemption under Income Tax Act, 1961.<br/>
              Receipt issued instantly on donation.
            </p>
          </div>
        </div>
      </div>

      {/* Mumbai Zone Logo + Divider */}
      <div className="border-t border-forest-900">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <Image src="/logos/mumbai-zone-logo.jpg" alt="JITO Mumbai Zone"
            width={200} height={80} className="mx-auto mb-4 h-16 w-auto object-contain"/>
          <p className="text-sage-500 text-xs">JITO Mumbai Zone · Environment & Sustainability Wing</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-forest-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sage-500 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} JITO Green Legacy. All rights reserved. · JITO Mumbai Zone
          </p>
          <a href="https://www.bnzgreen.io" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 group bg-white rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-gray-500 text-xs whitespace-nowrap">Powered by</span>
            <Image src="/logos/bnz-logo.png" alt="BNZ Green Technologies"
              width={64} height={32} className="h-8 w-auto object-contain"/>
            <span className="text-gray-600 text-xs font-semibold whitespace-nowrap">BNZ Green Technologies</span>
          </a>
        </div>
      </div>

    </footer>
  );
}
