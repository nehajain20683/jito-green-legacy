// src/app/about/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const TEAM_APEX = [
  { name: 'Prithviraj Kothari', role: 'Chairman' },
  { name: 'Vijay Bhandari',     role: 'President' },
  { name: 'Lalit Kumar Dangi',  role: 'Secretary General' },
];

const TEAM_ENV = [
  { name: 'Sujit Bhatevara',  role: 'Director In-Charge' },
  { name: 'Anand Chordia',    role: 'Chairman' },
  { name: 'Gaurav Dak',       role: 'Chief Secretary' },
];

const TEAM_MUMBAI = [
  { name: 'Dr. Vinay Jain',  role: 'Chairman' },
  { name: 'CA Vijay Jain',   role: 'Chief Secretary' },
  { name: 'Tarachand Ganna', role: 'Vice Chairman' },
  { name: 'Pramod Mehta',    role: 'Treasurer' },
  { name: 'Dr. Neha Jain',   role: 'JES Zone Convenor' },
  { name: 'Yogesh Jain',     role: 'Youth Wing Zone Convenor' },
  { name: 'Ranjana Mehta',   role: 'Ladies Wing Zone Convenor' },
];

const CHAPTERS = [
  { name: 'JITO Ghatkopar Chapter',       members: [{ n:'Mahendra Chordia', r:'Chairman' },{ n:'Sunil Doshi', r:'Chief Secretary' },{ n:'Piyush Bafna', r:'JES Convenor' }] },
  { name: 'JITO Goregaon Chapter',        members: [{ n:'B.C. Bhalawat', r:'Chairman' },{ n:'Amol Shah', r:'Chief Secretary' },{ n:'CA Meena Shah', r:'JES Convenor' }] },
  { name: 'JITO Gowalia Tank Chapter',    members: [{ n:'Jayesh Bhansali', r:'Chairman' },{ n:'Mahendra Shah', r:'Chief Secretary' },{ n:'Manish Jain', r:'JES Convenor' }] },
  { name: 'JITO Juhu Chapter',            members: [{ n:'Kantilal Mehta', r:'Chairman' },{ n:'Sunita Parmar', r:'Chief Secretary' },{ n:'Meena Choudhary', r:'JES Convenor' }] },
  { name: 'JITO Kalyan/Dombivali Chapter',members: [{ n:'Basantilal Chaplot', r:'Chairman' },{ n:'Mahendra Sancheti', r:'Chief Secretary' }] },
  { name: 'JITO Midtown Chapter',         members: [{ n:'Suresh Jain', r:'Chairman' },{ n:'Mahendra Jain', r:'Chief Secretary' },{ n:'Mitesh Sonigra', r:'JES Convenor' }] },
  { name: 'JITO Mulund Chapter',          members: [{ n:'Rakesh Doshi', r:'Chairman' },{ n:'Prietesh Meisheri', r:'Chief Secretary' }] },
  { name: 'JITO Navi Mumbai Chapter',     members: [{ n:'Mahendra Chordia', r:'Chairman' },{ n:'Ronak Surana', r:'Chief Secretary' }] },
  { name: "JITO Queen's Necklace Chapter",members: [{ n:'Rakesh Jain', r:'Chairman' },{ n:'Sunderlal Bothra', r:'Chief Secretary' },{ n:'Niki Hingad', r:'JES Convenor' }] },
  { name: 'JITO Thane Chapter',           members: [{ n:'Mahavir Jain', r:'Chairman' },{ n:'Sandeep Kothari', r:'Chief Secretary' },{ n:'Deepak Parik', r:'JES Convenor' }] },
  { name: 'JITO Walkeshwar Chapter',      members: [{ n:'Shailesh Logani', r:'Chairman' },{ n:'Kush Nahata', r:'Chief Secretary' },{ n:'Priyanka Nahata', r:'JES Convenor' }] },
];

const TIMELINE = [
  { year: 'May 2026',  title: 'JES Team Formation',          desc: 'JITO Environment & Sustainability team assembled in Mumbai Zone under the leadership of Anand Chordia.' },
  { year: 'June 2026', title: 'JITO Green Legacy Launch',     desc: 'Official launch of JITO Green Legacy on World Environment Day, 5th June 2026, with a vision for 1 lakh trees.' },
  { year: 'June 2026', title: 'Phase 1 — Kalyan Plantation',  desc: 'First plantation drive of 10,000 trees initiated at Palghar district farms, covering 12.5 acres of verified land.' },
  { year: '2027',      title: 'Phase 2 Expansion',            desc: 'Expansion to additional districts across Maharashtra, onboarding more farmer partners.' },
  { year: '2028+',     title: 'Carbon Credit Programme',      desc: 'Launch of verified carbon credit programme under Verra VM0047 and Gold Standard frameworks.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar/>
      <div className="pt-16">

        {/* Hero */}
        <section className="bg-forest-950 text-white py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80')",backgroundSize:'cover',backgroundPosition:'center'}}/>
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-sage-400 text-sm tracking-widest uppercase mb-3 font-semibold">About Us</p>
            <h1 className="font-display text-4xl sm:text-5xl mb-4">JITO Green Legacy</h1>
            <p className="text-sage-300 text-lg">A long-term family-driven tree plantation movement by JITO Mumbai Zone</p>
          </div>
        </section>

        {/* About */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl text-forest-950 mb-4">About the Initiative</h2>
                <p className="text-sage-700 leading-relaxed mb-4">
                  JITO Green Legacy is a long-term, community-driven tree plantation initiative conceived by JITO Mumbai Zone's Environment & Sustainability wing. This is not a one-time event — it is a legacy programme designed to span generations.
                </p>
                <p className="text-sage-700 leading-relaxed mb-4">
                  Phase 1 begins with a family tree plantation drive, inviting every JITO member to plant trees in the names of the most important women in their lives — Dadi, Maa, Beti, and Poti. Each tree is geo-tagged, photographed, and monitored, creating a living, breathing memorial that grows alongside your family.
                </p>
                <p className="text-sage-700 leading-relaxed">
                  Beyond Phase 1, the programme is structured to support farmer livelihoods, build carbon credit portfolios under international standards, and create a measurable, auditable environmental legacy for Mumbai's Jain community.
                </p>
              </div>
              <div className="bg-sage-50 rounded-3xl p-8 border border-sage-100">
                <div className="space-y-4">
                  {[
                    { label:'Phase 1 Target', value:'10,000+ Trees' },
                    { label:'Plantation Sites', value:'Palghar District, MH' },
                    { label:'Land Area', value:'12.5 Acres Verified' },
                    { label:'Launch Date', value:'5th June 2026' },
                    { label:'Tax Benefit', value:'80G Eligible' },
                    { label:'Price per Tree', value:'₹500 only' },
                  ].map(s=>(
                    <div key={s.label} className="flex justify-between py-2 border-b border-sage-100 last:border-0">
                      <span className="text-sage-500 text-sm">{s.label}</span>
                      <span className="font-semibold text-forest-900 text-sm">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-forest-950 py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {[
              { title:'Our Mission', icon:'🎯', text:'To create family-driven environmental stewardship and support farmers through sustainable tree plantations, generating long-term ecological and economic value for communities across Maharashtra.' },
              { title:'Our Vision',  icon:'🌏', text:"To build India's largest community-led family plantation movement — where every JITO family has a living legacy of trees that will grow for generations, sequester carbon, and restore India's green cover." },
            ].map(mv=>(
              <div key={mv.title} className="bg-white/10 rounded-2xl p-8 border border-white/10">
                <div className="text-4xl mb-4">{mv.icon}</div>
                <h3 className="font-display text-2xl text-white mb-3">{mv.title}</h3>
                <p className="text-sage-300 leading-relaxed">{mv.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-4 bg-cream-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl text-forest-950 text-center mb-12">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-sage-200"/>
              <div className="space-y-8">
                {TIMELINE.map((t, i)=>(
                  <div key={i} className="flex gap-6 relative">
                    <div className="w-12 h-12 bg-sage-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 z-10">
                      {i+1}
                    </div>
                    <div className="bg-white rounded-2xl border border-sage-100 p-5 flex-1 shadow-sm">
                      <div className="text-sage-500 text-xs font-semibold uppercase tracking-wide mb-1">{t.year}</div>
                      <div className="font-display text-lg text-forest-950 mb-1">{t.title}</div>
                      <p className="text-sage-600 text-sm leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Image */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl text-forest-950 text-center mb-4">Our Team</h2>
            <p className="text-sage-500 text-center mb-10 max-w-2xl mx-auto">
              JITO Green Legacy is led by dedicated volunteers across JITO's Mumbai Zone and all Chapters, united by the mission to create a green legacy for future generations.
            </p>
            <div className="rounded-3xl overflow-hidden shadow-xl border border-sage-100">
              <Image src="/team.png" alt="Team JITO Green Legacy" width={1200} height={900} className="w-full h-auto" priority/>
            </div>
          </div>
        </section>

        {/* JITO Apex & Zone Teams */}
        <section className="py-16 px-4 bg-cream-50">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* Apex */}
            <div>
              <h3 className="font-display text-xl text-forest-950 text-center mb-2">Team JITO Apex</h3>
              <div className="w-16 h-0.5 bg-sage-400 mx-auto mb-6"/>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {TEAM_APEX.map(m=>(
                  <div key={m.name} className="bg-white rounded-2xl p-4 text-center border border-sage-100 shadow-sm">
                    <div className="font-bold text-forest-950 text-sm">{m.name}</div>
                    <div className="text-sage-500 text-xs mt-1">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Env Team */}
            <div>
              <h3 className="font-display text-xl text-forest-950 text-center mb-2">Team Anand JITO Environment & Sustainability</h3>
              <div className="w-16 h-0.5 bg-sage-400 mx-auto mb-6"/>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {TEAM_ENV.map(m=>(
                  <div key={m.name} className="bg-white rounded-2xl p-4 text-center border border-sage-100 shadow-sm">
                    <div className="font-bold text-forest-950 text-sm">{m.name}</div>
                    <div className="text-sage-500 text-xs mt-1">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mumbai Zone */}
            <div>
              <h3 className="font-display text-xl text-forest-950 text-center mb-2">Team JITO Mumbai Zone</h3>
              <div className="w-16 h-0.5 bg-sage-400 mx-auto mb-6"/>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {TEAM_MUMBAI.map(m=>(
                  <div key={m.name} className="bg-sage-50 rounded-2xl p-4 text-center border border-sage-100">
                    <div className="font-bold text-forest-950 text-sm">{m.name}</div>
                    <div className="text-sage-500 text-xs mt-1">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapters */}
            <div>
              <h3 className="font-display text-xl text-forest-950 text-center mb-2">All Chapters</h3>
              <div className="w-16 h-0.5 bg-sage-400 mx-auto mb-6"/>
              <div className="grid sm:grid-cols-2 gap-5">
                {CHAPTERS.map(ch=>(
                  <div key={ch.name} className="bg-white rounded-2xl p-5 border border-sage-100 shadow-sm">
                    <h4 className="font-semibold text-sage-700 text-sm mb-3">{ch.name}</h4>
                    <div className="flex flex-wrap gap-3">
                      {ch.members.map(m=>(
                        <div key={m.n} className="text-center">
                          <div className="font-bold text-forest-950 text-xs">{m.n}</div>
                          <div className="text-sage-400 text-[10px]">{m.r}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 px-4 bg-sage-700 text-center text-white">
          <h2 className="font-display text-3xl mb-3">Join the Movement</h2>
          <p className="text-sage-300 mb-6 max-w-xl mx-auto">Plant a tree today in the name of someone you love. Together, we build India's green legacy.</p>
          <Link href="/campaigns" className="inline-block bg-white text-sage-800 font-bold px-8 py-3.5 rounded-full hover:bg-sage-50 transition-colors">
            Sponsor Trees Now →
          </Link>
        </section>

      </div>
      <Footer/>
    </div>
  );
}
