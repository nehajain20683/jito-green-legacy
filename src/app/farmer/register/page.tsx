'use client';
// src/app/farmer/register/page.tsx — Mobile-first multi-step registration
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, ChevronRight, ChevronLeft, Leaf, MapPin, User, Building2, TreePine, FileText, Shield } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Verify Mobile',     icon: Shield },
  { id: 2, title: 'Personal Details',  icon: User },
  { id: 3, title: 'Bank Details',      icon: Building2 },
  { id: 4, title: 'Land Details',      icon: MapPin },
  { id: 5, title: 'Plantation Preference', icon: TreePine },
  { id: 6, title: 'Carbon Consent',    icon: Leaf },
];

const SPECIES_OPTIONS = ['Mango','Neem','Banyan','Peepal','Bamboo','Teak','Drumstick','Jamun','Guava','Jackfruit','Sapota','Arjun'];
const PLANTATION_TYPES = ['AGROFORESTRY','MIYAWAKI','NATIVE_FOREST','FRUIT_TREES','BAMBOO','MIXED_SPECIES'];
const LAND_TYPES = ['AGRICULTURAL','PRIVATE','WASTELAND','AGROFORESTRY','ORCHARD','COMMUNITY'];
const INDIAN_STATES = ['Maharashtra','Gujarat','Rajasthan','Madhya Pradesh','Uttar Pradesh','Karnataka','Tamil Nadu','Kerala','Andhra Pradesh','Telangana','West Bengal','Bihar','Odisha','Punjab','Haryana'];

const inputCls = "w-full border border-sage-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white";
const labelCls = "block text-sm font-medium text-sage-700 mb-1";

export default function FarmerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [landId, setLandId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  // Form state
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [personal, setPersonal] = useState({
    fullName: '', fatherName: '', dateOfBirth: '', gender: '',
    aadhaarNumber: '', panNumber: '', email: '', alternateMobile: '',
    village: '', taluka: '', district: '', state: '', pincode: '',
  });

  const [bank, setBank] = useState({
    bankAccountName: '', bankName: '', accountNumber: '', ifscCode: '',
  });

  const [land, setLand] = useState({
    surveyNumber: '', gutNumber: '', khataNumber: '',
    areaAcres: '', landType: '', gpsLatitude: '', gpsLongitude: '',
    village: '', taluka: '', district: '', state: '',
  });

  const [plantation, setPlantation] = useState({
    plantationPreference: '', speciesPreference: [] as string[],
    targetTreeCount: '', plantationStartDate: '',
  });

  const [carbonConsent, setCarbonConsent] = useState(false);

  // ── Step 1: OTP ──────────────────────────────────────────
  async function sendOTP() {
    if (!mobile || mobile.length < 10) { setError('Enter valid 10-digit mobile number'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/farmer/otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '+91' + mobile.replace(/^(\+91|91)/, '') }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) { setOtpSent(true); if (data.devOtp) setDevOtp(data.devOtp); }
    else setError(data.error || 'Failed to send OTP');
  }

  async function verifyOTP() {
    setLoading(true); setError('');
    const res = await fetch('/api/farmer/otp', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '+91' + mobile.replace(/^(\+91|91)/, ''), otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setVerified(true);
      setFarmerId(data.farmerId);
      localStorage.setItem('farmerToken', data.token);
      localStorage.setItem('farmerId', data.farmerId);
      setTimeout(() => setStep(2), 500);
    } else setError(data.error || 'Invalid OTP');
  }

  // ── Step 2-3: Save personal + bank ──────────────────────
  async function savePersonalAndBank() {
    setLoading(true); setError('');
    const res = await fetch('/api/farmer/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '+91' + mobile.replace(/^(\+91|91)/, ''),
        ...personal, ...bank,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) { setFarmerId(data.farmerId); setStep(4); }
    else setError(data.error || 'Failed to save');
  }

  // ── Step 4: Save land ────────────────────────────────────
  async function saveLand() {
    if (!farmerId) { setError('Session expired. Please refresh.'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/farmer/land', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmerId,
        ...land,
        areaAcres: land.areaAcres ? parseFloat(land.areaAcres) : undefined,
        gpsLatitude:  land.gpsLatitude  ? parseFloat(land.gpsLatitude)  : undefined,
        gpsLongitude: land.gpsLongitude ? parseFloat(land.gpsLongitude) : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) { setLandId(data.landId); setStep(5); }
    else setError(data.error || 'Failed to save land');
  }

  // ── Step 5-6: Save plantation + consent ─────────────────
  async function savePlantationAndConsent() {
    if (!carbonConsent) { setError('Please accept the carbon consent to proceed.'); return; }
    setLoading(true); setError('');
    // Update farmer with plantation prefs + consent
    await fetch('/api/farmer/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId, carbonConsent }),
    });
    // Update land with plantation prefs
    if (landId) {
      await fetch('/api/farmer/land', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          ...plantation,
          targetTreeCount: plantation.targetTreeCount ? parseInt(plantation.targetTreeCount) : undefined,
        }),
      });
    }
    setLoading(false);
    router.push('/farmer/dashboard?registered=1');
  }

  function toggleSpecies(s: string) {
    setPlantation(p => ({
      ...p,
      speciesPreference: p.speciesPreference.includes(s)
        ? p.speciesPreference.filter(x => x !== s)
        : [...p.speciesPreference, s],
    }));
  }

  function captureGPS() {
    if (!navigator.geolocation) { setError('GPS not supported on this device'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      setLand(l => ({
        ...l,
        gpsLatitude:  pos.coords.latitude.toFixed(6),
        gpsLongitude: pos.coords.longitude.toFixed(6),
      }));
    }, () => setError('Could not get GPS. Please enter manually.'));
  }

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Header */}
      <div className="bg-sage-800 text-white px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-sage-600 rounded-lg flex items-center justify-center">
          <Leaf className="w-5 h-5"/>
        </div>
        <div>
          <div className="font-bold text-sm">JITO Green Legacy</div>
          <div className="text-sage-300 text-xs">Farmer Registration</div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="bg-white border-b border-sage-100 px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {STEPS.map(s => (
            <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              s.id === step ? 'bg-sage-700 text-white' :
              s.id < step  ? 'bg-sage-100 text-sage-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {s.id < step ? <CheckCircle className="w-3 h-3"/> : <s.icon className="w-3 h-3"/>}
              {s.title}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        {/* ── STEP 1: Mobile Verification ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm">
            <h2 className="font-display text-2xl text-sage-950 mb-1">Welcome, Farmer</h2>
            <p className="text-sage-500 text-sm mb-6">Enter your mobile number to get started</p>

            {!otpSent ? (
              <>
                <label className={labelCls}>Mobile Number</label>
                <div className="flex gap-2 mb-4">
                  <span className="border border-sage-200 rounded-xl px-3 py-3 text-sm text-sage-600 bg-sage-50">+91</span>
                  <input type="tel" maxLength={10} placeholder="98765 43210"
                    value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))}
                    className={inputCls + " flex-1"}/>
                </div>
                <button onClick={sendOTP} disabled={loading}
                  className="w-full bg-sage-700 hover:bg-sage-800 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-5">
                  <div className="text-2xl mb-1">📱</div>
                  <p className="text-sage-700 font-medium">OTP sent to +91 {mobile}</p>
                  <p className="text-sage-500 text-xs mt-1">Valid for 10 minutes</p>
                  {devOtp && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-700 text-xs font-mono">
                      Dev OTP: {devOtp}
                    </div>
                  )}
                </div>
                <label className={labelCls}>Enter 6-digit OTP</label>
                <input type="number" maxLength={6} placeholder="• • • • • •"
                  value={otp} onChange={e => setOtp(e.target.value)}
                  className={inputCls + " text-center text-2xl tracking-widest mb-4"}/>

                {verified ? (
                  <div className="text-center text-sage-600 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500"/> Verified!
                  </div>
                ) : (
                  <>
                    <button onClick={verifyOTP} disabled={loading}
                      className="w-full bg-sage-700 hover:bg-sage-800 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 mb-3">
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button onClick={() => { setOtpSent(false); setOtp(''); setDevOtp(''); }}
                      className="w-full text-sage-600 text-sm hover:underline">
                      Change number
                    </button>
                    <button onClick={sendOTP} className="w-full text-sage-500 text-xs mt-1 hover:underline">
                      Resend OTP
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: Personal Details ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm space-y-4">
            <h2 className="font-display text-xl text-sage-950 mb-4">Personal Information</h2>
            {[
              { key:'fullName',   label:'Full Name *',     type:'text',  placeholder:'As per Aadhaar' },
              { key:'fatherName', label:"Father's Name",   type:'text',  placeholder:'Father full name' },
              { key:'dateOfBirth',label:'Date of Birth',   type:'date',  placeholder:'' },
              { key:'aadhaarNumber',label:'Aadhaar Number',type:'number',placeholder:'12-digit Aadhaar' },
              { key:'panNumber',  label:'PAN Number',      type:'text',  placeholder:'Optional' },
              { key:'email',      label:'Email',           type:'email', placeholder:'Optional' },
              { key:'alternateMobile',label:'Alternate Mobile',type:'tel',placeholder:'Optional' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(personal as any)[f.key]}
                  onChange={e => setPersonal(p => ({ ...p, [f.key]: e.target.value }))}
                  className={inputCls}/>
              </div>
            ))}
            <div>
              <label className={labelCls}>Gender</label>
              <select value={personal.gender} onChange={e => setPersonal(p=>({...p,gender:e.target.value}))} className={inputCls}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <h3 className="font-semibold text-sage-800 pt-2">Address</h3>
            {['village','taluka','district','pincode'].map(f => (
              <div key={f}>
                <label className={labelCls}>{f.charAt(0).toUpperCase()+f.slice(1)}</label>
                <input type="text" value={(personal as any)[f]}
                  onChange={e => setPersonal(p=>({...p,[f]:e.target.value}))} className={inputCls}/>
              </div>
            ))}
            <div>
              <label className={labelCls}>State</label>
              <select value={personal.state} onChange={e => setPersonal(p=>({...p,state:e.target.value}))} className={inputCls}>
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-sage-300 text-sage-700 font-semibold py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4 inline mr-1"/>Back
              </button>
              <button onClick={() => setStep(3)} disabled={!personal.fullName}
                className="flex-2 flex-grow bg-sage-700 hover:bg-sage-800 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                Next<ChevronRight className="w-4 h-4 inline ml-1"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Bank Details ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm space-y-4">
            <h2 className="font-display text-xl text-sage-950 mb-2">Bank Account Details</h2>
            <p className="text-sage-500 text-xs mb-4">For receiving plantation incentives and carbon revenue payments</p>
            {[
              { key:'bankAccountName',label:'Account Holder Name *',placeholder:'As per bank records' },
              { key:'bankName',       label:'Bank Name *',          placeholder:'e.g. State Bank of India' },
              { key:'accountNumber',  label:'Account Number *',     placeholder:'Bank account number' },
              { key:'ifscCode',       label:'IFSC Code *',          placeholder:'e.g. SBIN0001234' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  value={(bank as any)[f.key]}
                  onChange={e => setBank(b=>({...b,[f.key]:e.target.value}))}
                  className={inputCls}/>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="flex-1 border border-sage-300 text-sage-700 font-semibold py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4 inline mr-1"/>Back
              </button>
              <button onClick={savePersonalAndBank} disabled={loading}
                className="flex-grow bg-sage-700 hover:bg-sage-800 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {loading ? 'Saving...' : 'Save & Continue'}<ChevronRight className="w-4 h-4 inline ml-1"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Land Details ── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm space-y-4">
            <h2 className="font-display text-xl text-sage-950 mb-2">Land Details</h2>
            <p className="text-sage-500 text-xs mb-4">Register the land you wish to use for tree plantation</p>
            {[
              { key:'surveyNumber',label:'Survey Number',  placeholder:'Survey/Gat number' },
              { key:'gutNumber',   label:'Gut Number',     placeholder:'Gut number' },
              { key:'khataNumber', label:'Khata Number',   placeholder:'Khata/Patta number' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  value={(land as any)[f.key]}
                  onChange={e => setLand(l=>({...l,[f.key]:e.target.value}))} className={inputCls}/>
              </div>
            ))}
            <div>
              <label className={labelCls}>Area (Acres) *</label>
              <input type="number" step="0.01" placeholder="e.g. 2.5"
                value={land.areaAcres} onChange={e => setLand(l=>({...l,areaAcres:e.target.value}))} className={inputCls}/>
              {land.areaAcres && (
                <p className="text-sage-400 text-xs mt-1">= {(parseFloat(land.areaAcres)*0.404686).toFixed(3)} hectares</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Land Type</label>
              <select value={land.landType} onChange={e => setLand(l=>({...l,landType:e.target.value}))} className={inputCls}>
                <option value="">Select land type</option>
                {LAND_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            {/* GPS */}
            <div>
              <label className={labelCls}>GPS Location</label>
              <button onClick={captureGPS}
                className="w-full border-2 border-dashed border-sage-300 text-sage-600 py-3 rounded-xl text-sm font-medium hover:bg-sage-50 flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-4 h-4"/> Capture Current GPS Location
              </button>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="any" placeholder="Latitude"
                  value={land.gpsLatitude} onChange={e => setLand(l=>({...l,gpsLatitude:e.target.value}))} className={inputCls}/>
                <input type="number" step="any" placeholder="Longitude"
                  value={land.gpsLongitude} onChange={e => setLand(l=>({...l,gpsLongitude:e.target.value}))} className={inputCls}/>
              </div>
            </div>
            {['village','taluka','district'].map(f => (
              <div key={f}>
                <label className={labelCls}>{f.charAt(0).toUpperCase()+f.slice(1)}</label>
                <input type="text" value={(land as any)[f]}
                  onChange={e => setLand(l=>({...l,[f]:e.target.value}))} className={inputCls}/>
              </div>
            ))}
            <div>
              <label className={labelCls}>State</label>
              <select value={land.state} onChange={e => setLand(l=>({...l,state:e.target.value}))} className={inputCls}>
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(3)} className="flex-1 border border-sage-300 text-sage-700 font-semibold py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4 inline mr-1"/>Back
              </button>
              <button onClick={saveLand} disabled={loading || !land.areaAcres}
                className="flex-grow bg-sage-700 hover:bg-sage-800 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {loading ? 'Saving...' : 'Save Land'}<ChevronRight className="w-4 h-4 inline ml-1"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Plantation Preference ── */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm space-y-4">
            <h2 className="font-display text-xl text-sage-950 mb-2">Plantation Preference</h2>
            <div>
              <label className={labelCls}>Plantation Type</label>
              <select value={plantation.plantationPreference}
                onChange={e => setPlantation(p=>({...p,plantationPreference:e.target.value}))} className={inputCls}>
                <option value="">Select type</option>
                {PLANTATION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Preferred Species (select multiple)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SPECIES_OPTIONS.map(s => (
                  <button key={s} onClick={() => toggleSpecies(s)}
                    className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                      plantation.speciesPreference.includes(s)
                        ? 'bg-sage-700 text-white border-sage-700'
                        : 'border-sage-200 text-sage-600 hover:border-sage-400'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Number of Trees</label>
              <input type="number" placeholder="Estimated number of trees"
                value={plantation.targetTreeCount}
                onChange={e => setPlantation(p=>({...p,targetTreeCount:e.target.value}))} className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Preferred Start Date</label>
              <input type="date" value={plantation.plantationStartDate}
                onChange={e => setPlantation(p=>({...p,plantationStartDate:e.target.value}))} className={inputCls}/>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(4)} className="flex-1 border border-sage-300 text-sage-700 font-semibold py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4 inline mr-1"/>Back
              </button>
              <button onClick={() => setStep(6)}
                className="flex-grow bg-sage-700 hover:bg-sage-800 text-white font-bold py-3 rounded-xl">
                Next<ChevronRight className="w-4 h-4 inline ml-1"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Carbon Consent ── */}
        {step === 6 && (
          <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🌱</div>
              <h2 className="font-display text-xl text-sage-950 mb-1">Carbon Project Consent</h2>
              <p className="text-sage-500 text-sm">Please read and accept to complete registration</p>
            </div>
            <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 mb-5 text-sm text-sage-700 leading-relaxed">
              <p className="font-semibold text-sage-900 mb-2">Declaration of Participation</p>
              <p>
                I, the undersigned farmer, voluntarily participate in carbon sequestration and environmental
                projects conducted under <strong>JITO Green Legacy</strong> and authorize monitoring of project
                performance including geo-tagged photography, satellite monitoring, and periodic field verification.
              </p>
              <p className="mt-3">
                I understand that carbon credits generated from trees planted on my registered land will be
                managed under the JITO Green Legacy Carbon Rights Deed, with revenue shared as per the
                Farmer Benefit Sharing Policy.
              </p>
              <p className="mt-3">
                I confirm that all information provided during registration is true and correct to the
                best of my knowledge.
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input type="checkbox" checked={carbonConsent} onChange={e => setCarbonConsent(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-sage-700"/>
              <span className="text-sm text-sage-800 font-medium">
                ☑ I have read and agree to the above declaration and voluntarily participate in the JITO Green Legacy carbon and plantation programme.
              </span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setStep(5)} className="flex-1 border border-sage-300 text-sage-700 font-semibold py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4 inline mr-1"/>Back
              </button>
              <button onClick={savePlantationAndConsent} disabled={loading || !carbonConsent}
                className="flex-grow bg-sage-700 hover:bg-sage-800 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {loading ? 'Submitting...' : '✅ Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
