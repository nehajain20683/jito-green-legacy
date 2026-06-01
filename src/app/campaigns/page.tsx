// src/app/campaigns/page.tsx — Light theme with real photos
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CAMPAIGNS, CAMPAIGN_PACKAGES, INDIVIDUAL_TREE_PRICE, formatCurrency, NATURE_IMAGES } from '@/lib/utils';

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      {/* Hero banner */}
      <div className="relative h-64 mt-16">
        <Image src={NATURE_IMAGES.aerial} alt="Forest canopy" fill className="object-cover"/>
        <div className="absolute inset-0 bg-sage-900/70"/>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="text-sage-300 text-xs font-bold uppercase tracking-widest mb-3">JITO Green Legacy</div>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">Family Campaigns</h1>
          <p className="text-sage-200 max-w-lg">Sponsor trees in honour of the most important women in your life.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">

        {/* Campaign cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 campaign-grid">
          {CAMPAIGNS.map(c => (
            <div key={c.slug} className="group bg-white border border-sage-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-sage-100 transition-all hover:-translate-y-1">
              {/* Real photo with campaign heading overlay */}
              <div className="relative h-52 overflow-hidden">
                <Image src={c.image} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-white font-display text-xl font-bold leading-tight">{c.name}</h2>
                  <p className="text-white/75 text-xs mt-0.5">{c.subtitle}</p>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sage-600 text-xs leading-relaxed mb-4">{c.description}</p>

                {/* Package links */}
                <div className="space-y-2 mb-4">
                  {CAMPAIGN_PACKAGES.map(pkg => (
                    <Link key={pkg.id}
                      href={`/donate?campaign=${c.slug}&trees=${pkg.trees}&amount=${pkg.price}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-all hover:border-sage-400 hover:bg-sage-50 ${pkg.popular ? 'border-sage-400 bg-sage-50' : 'border-sage-100'}`}>
                      <span className="font-semibold text-sage-900">{pkg.trees} Trees</span>
                      <span className="text-sage-600 font-semibold">{formatCurrency(pkg.price)}</span>
                    </Link>
                  ))}
                </div>

                <Link href={`/donate?campaign=${c.slug}&trees=54&amount=27000`}
                  className="flex items-center justify-center gap-2 bg-sage-700 hover:bg-sage-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Sponsor Now <ArrowRight className="w-4 h-4"/>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Individual tree section */}
        <div className="relative rounded-3xl overflow-hidden mb-16">
          <div className="absolute inset-0">
            <Image src={NATURE_IMAGES.plantation} alt="Tree planting" fill className="object-cover"/>
            <div className="absolute inset-0 bg-sage-900/80"/>
          </div>
          <div className="relative z-10 p-10 md:p-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">Individual Tree Sponsorship</h2>
            <p className="text-sage-200 text-lg mb-8 max-w-xl mx-auto">
              Buy 1 tree or any custom quantity. Starting at <strong className="text-white">{formatCurrency(INDIVIDUAL_TREE_PRICE)}</strong> per tree.
              Includes geo-tagging, certificate, and 80G receipt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate?type=individual&trees=1&amount=500"
                className="inline-flex items-center gap-2 bg-white text-sage-800 font-bold px-8 py-4 rounded-xl hover:bg-sage-50 transition-all text-lg hover:scale-105">
                Buy 1 Tree — {formatCurrency(500)}
              </Link>
              <Link href="/donate?type=individual"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all text-lg">
                Custom Quantity
              </Link>
            </div>
          </div>
        </div>

        {/* Package comparison */}
        <div>
          <h2 className="font-display text-3xl text-sage-950 text-center mb-3">Package Comparison</h2>
          <p className="text-sage-500 text-center mb-10">All packages include geo-tagging, certificate, 80G receipt, and live tracking.</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 package-grid">
            {CAMPAIGN_PACKAGES.map(pkg => (
              <div key={pkg.id}
                className={`relative rounded-2xl border-2 p-6 text-center ${pkg.popular ? 'border-sage-600 bg-sage-800 shadow-xl' : 'bg-white border-sage-100 hover:border-sage-300 card-lift'}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className={`font-display text-5xl font-bold mb-1 ${pkg.popular ? 'text-sage-200' : 'text-sage-700'}`}>{pkg.trees}</div>
                <div className={`text-xs mb-3 font-semibold uppercase tracking-wide ${pkg.popular ? 'text-sage-400' : 'text-sage-400'}`}>{pkg.emoji} {pkg.badge} · {pkg.badgeEn}</div>
                <div className={`font-bold text-2xl mb-1 ${pkg.popular ? 'text-white' : 'text-sage-900'}`}>{formatCurrency(pkg.price)}</div>
                <div className={`text-xs mb-4 ${pkg.popular ? 'text-sage-400' : 'text-sage-400'}`}>{pkg.trees * 22}kg CO₂/year</div>
                <Link href="/campaigns"
                  className={`block text-sm font-bold py-2.5 rounded-xl transition-colors ${pkg.popular ? 'bg-sage-500 text-white hover:bg-sage-400' : 'bg-sage-700 text-white hover:bg-sage-800'}`}>
                  Choose Campaign
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
