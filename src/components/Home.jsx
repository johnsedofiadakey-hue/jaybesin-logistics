import React, { useState, useMemo } from 'react';
import { 
  Copy, Ship, Plane, Calculator, Globe, 
  Search, Calendar, Smartphone, User, Check,
  ArrowRight, Zap, Package, Anchor, Truck,
  ShieldCheck, Cpu, MapPin, Activity,
  BarChart3, Box, Layers, Terminal, X,
  FileText, DollarSign, Clock, Container
} from 'lucide-react';

// --- [NEW] CONNECT TO THE LIVE DATABASE ---
import { useShipments } from './ShipmentContext';

/**
 * JAY-BESIN | HOME CORE v46.0 (FIXED & SYNCED)
 * -----------------------------------------------------------
 * - Design: Original "Command Center" layout preserved.
 * - Logic: Connected to ShipmentContext.
 * - Fix: Status Stages synchronized with Admin to prevent "stuck" progress.
 */

export default function Home({ settings, setView, theme }) {
  const [user, setUser] = useState({ name: '', phone: '' });
  const [calcMode, setCalcMode] = useState('sea');
  const [dims, setDims] = useState({ l: '', w: '', h: '', weight: '', category: 'normal' });
  const [copiedId, setCopiedId] = useState(null);
  
  // --- TRACKING STATE ---
  const [trackingId, setTrackingId] = useState('');
  const [trackedShipment, setTrackedShipment] = useState(null); 
  const [isTrackingOpen, setIsTrackingOpen] = useState(false); 

  // --- [NEW] GET REAL DATA ---
  const { shipments } = useShipments();

  // --- [CRITICAL FIX] MUST MATCH ADMIN EXACTLY ---
  const logisticsStages = [
    "Order Initiated", 
    "Received at China Warehouse", 
    "Quality Check & Consolidation", 
    "Loaded into Container", 
    "Vessel Departed Origin", 
    "In Transit (High Seas)", 
    "Arrived at TEMA Port", 
    "Customs Clearance in Progress", 
    "Duties Paid / Released", 
    "Ready for Pickup / Delivery"
  ];

  // --- 1. DYNAMIC CALCULATOR ENGINE ---
  const calculatedResult = useMemo(() => {
    if (calcMode === 'sea') {
      const cbm = (Number(dims.l) * Number(dims.w) * Number(dims.h)) / 1000000;
      const rate = settings.seaRate || 450;
      const total = (cbm || 0) * rate;
      return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      const rate = settings.airRates?.[dims.category] || settings.airRates?.normal || 12;
      const total = (Number(dims.weight) || 0) * rate;
      return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, [calcMode, dims, settings]);

  // --- 2. TRACKING HANDLER (FIXED) ---
  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    // Search the Real Database (Tracking ID, Client Name, or Container ID)
    const found = shipments.find(m => 
      m.trackingNumber.trim().toLowerCase() === trackingId.trim().toLowerCase() || 
      m.consigneeName.toLowerCase().includes(trackingId.toLowerCase()) ||
      (m.containerId && m.containerId.toLowerCase() === trackingId.trim().toLowerCase())
    );

    if (found) {
      // Fix: Convert String Status to Index for Progress Bar
      let stageIndex = logisticsStages.indexOf(found.status);
      if (stageIndex === -1) stageIndex = 1; // Default fallback

      setTrackedShipment({ ...found, statusStage: stageIndex });
      setIsTrackingOpen(true);
    } else {
      alert("🚫 Tracking ID not found in system. Please check and try again.");
      setTrackedShipment(null);
    }
  };

  // --- 3. WAREHOUSE ADDRESS COPIER ---
  const copyHubPackage = async (type) => {
    if (!user.name || !user.phone) {
      alert("⚠️ INITIALIZATION REQUIRED: Please enter your NAME and PHONE to generate your Shipping Mark.");
      return;
    }
    const address = type === 'sea' ? settings.chinaSeaAddr : settings.chinaAirAddr;
    const mark = `BESIN / ${user.name.toUpperCase()} / ${user.phone} / ${type.toUpperCase()}`;
    const payload = `${address}\nProcessing Mark: ${mark}`;
    
    try {
      await navigator.clipboard.writeText(payload);
      triggerSuccess(type);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = payload;
      textArea.style.position = "fixed"; textArea.style.left = "-9999px";
      document.body.appendChild(textArea); textArea.focus(); textArea.select();
      try { document.execCommand('copy'); triggerSuccess(type); } 
      catch (fError) { alert("Please manually copy the address below."); }
      document.body.removeChild(textArea);
    }
  };

  const triggerSuccess = (id) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* --- HERO: COMMAND CENTER --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center bg-slate-900 overflow-hidden pt-20">
        
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
           <img 
             src={settings.heroImage || "https://images.unsplash.com/photo-1494412574643-35d324688188?auto=format&fit=crop&q=80"} 
             className="w-full h-full object-cover opacity-30" 
             alt="Logistics Hub" 
           />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
           <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-3 px-3 py-1 border border-blue-500/30 bg-blue-900/10 backdrop-blur-sm mb-8 rounded">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                 <span className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Next Loading: {settings.nextLoadingDate || "TBA"}
                 </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] mb-8 uppercase tracking-tight">
                 {settings.heroTitle || "Global Sourcing."} <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                    Logistics.
                 </span>
              </h1>
              
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl font-medium border-l-2 border-blue-600 pl-6">
                 {settings.heroSubtitle || "The master node for Ghana-China logistics."}
              </p>

              {/* TRACKING MODULE */}
              <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-0 max-w-lg bg-white p-1 rounded-lg shadow-lg relative z-20">
                 <div className="flex-1 flex items-center px-4 bg-slate-50 border border-slate-200 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                    <Search className="text-slate-400" size={20} />
                    <input 
                      className="w-full p-4 bg-transparent outline-none font-bold text-sm text-slate-900 uppercase placeholder:text-slate-400"
                      placeholder="ENTER TRACKING ID..."
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                    />
                 </div>
                 <button 
                   type="submit"
                   className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest transition-all rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none"
                 >
                   Trace
                 </button>
              </form>
           </div>

           {/* Right: Live Rates Visualizer */}
           <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 relative overflow-hidden rounded-xl shadow-2xl">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Globe size={120}/></div>
                 <h3 className="text-white font-bold uppercase tracking-widest mb-6 border-b border-slate-700 pb-4 flex items-center gap-2">
                    <Activity size={16} className="text-green-400"/> Current Rates
                 </h3>
                 <div className="space-y-4">
                    <RateDisplay label="Sea Freight" value={`$${settings.seaRate || '0'}`} unit="/ CBM" color="green" />
                    <RateDisplay label="Air General" value={`$${settings.airRates?.normal || '0'}`} unit="/ KG" color="blue" />
                    <RateDisplay label="Air Battery" value={`$${settings.airRates?.battery || '0'}`} unit="/ KG" color="purple" />
                    <RateDisplay label="Air Express" value={`$${settings.airRates?.express || '0'}`} unit="/ KG" color="orange" />
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="absolute bottom-0 w-full bg-slate-950 border-t border-slate-800 py-4 hidden md:block">
           <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>System: ONLINE</span>
              <span className="flex items-center gap-2"><Cpu size={12}/> Encryption: AES-256</span>
              <span>Latency: 12ms</span>
           </div>
        </div>
      </section>

      {/* --- SHIPMENT PASSPORT MODAL (The Detailed View) --- */}
      {isTrackingOpen && trackedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             
             {/* Header */}
             <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                <div>
                   <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-xs font-bold px-2 py-0.5 rounded uppercase">Verified Shipment</span>
                      {trackedShipment.containerId && (
                        <span className="bg-indigo-500 text-xs font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <Container size={10}/> {trackedShipment.containerId}
                        </span>
                      )}
                   </div>
                   <h3 className="text-2xl font-black font-mono tracking-tight">{trackedShipment.trackingNumber}</h3>
                   <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                      <User size={14}/> {trackedShipment.consigneeName || trackedShipment.client}
                   </p>
                </div>
                <button onClick={() => setIsTrackingOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                   <X size={20} />
                </button>
             </div>

             {/* Progress Bar */}
             <div className="bg-slate-50 p-6 border-b border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                   <span>Origin</span>
                   <span>Destination</span>
                </div>
                <div className="relative h-2 bg-slate-200 rounded-full mb-4">
                   <div 
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${((trackedShipment.statusStage + 1) / logisticsStages.length) * 100}%` }}
                   ></div>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
                   <Activity className="text-blue-600" size={18} />
                   Current Status: <span className="text-blue-600">{logisticsStages[trackedShipment.statusStage]}</span>
                </div>
             </div>

             {/* Financials & Details Grid */}
             <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                         <Box size={18} />
                         <span className="text-xs font-bold uppercase">Total Volume</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                         {trackedShipment.totalVolume || trackedShipment.totalCbm || '0.00'} <span className="text-sm text-slate-500 font-sans">m³</span>
                      </div>
                   </div>
                   <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                         <DollarSign size={18} />
                         <span className="text-xs font-bold uppercase">Estimated Cost</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                         ${trackedShipment.totalCost || '0.00'}
                      </div>
                   </div>
                </div>

                {/* Items List */}
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText size={18}/> Cargo Manifest</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                         <tr>
                            <th className="p-3 border-b">Item Description</th>
                            <th className="p-3 border-b text-right">Qty</th>
                            <th className="p-3 border-b text-right">Vol</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {trackedShipment.items && trackedShipment.items.length > 0 ? (
                            trackedShipment.items.map((item, idx) => (
                               <tr key={idx}>
                                  <td className="p-3 font-medium text-slate-700">{item.description || item.desc}</td>
                                  <td className="p-3 text-right text-slate-500">{item.quantity || item.qty}</td>
                                  <td className="p-3 text-right font-mono text-xs">{Number(item.cbm).toFixed(4)}</td>
                               </tr>
                            ))
                         ) : (
                            <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">No item details available.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>

                {/* Footer Note */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 leading-relaxed border border-slate-200">
                   <strong>Note:</strong> Final shipping costs may vary slightly based on exchange rates or additional customs duties. Please contact support for final invoice.
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- SECTION 2: WAREHOUSE PASSPORT (Address Gen) --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
           <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Shipping Mark Generator</h2>
              <p className="text-slate-500 max-w-lg">
                 Generate your unique identification tag. Mandatory for all cargo sent to our China terminals.
              </p>
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
              <Terminal size={16} /> Secure Input Node
           </div>
        </div>

        {/* INPUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
           
           {/* Step 1: Input */}
           <div className="bg-slate-900 p-8 text-white h-full relative overflow-hidden group rounded-xl shadow-xl">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-bold rounded">1</div>
                    <span className="font-bold uppercase tracking-widest">Client Identity</span>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                       <div className="flex items-center bg-white/10 border border-white/20 p-3 rounded">
                          <User size={16} className="text-slate-400 mr-3"/>
                          <input 
                             onChange={e => setUser({...user, name: e.target.value.toUpperCase()})}
                             className="bg-transparent w-full outline-none text-sm font-mono uppercase text-white placeholder:text-slate-600"
                             placeholder="JOHN DOE"
                          />
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                       <div className="flex items-center bg-white/10 border border-white/20 p-3 rounded">
                          <Smartphone size={16} className="text-slate-400 mr-3"/>
                          <input 
                             onChange={e => setUser({...user, phone: e.target.value})}
                             className="bg-transparent w-full outline-none text-sm font-mono text-white placeholder:text-slate-600"
                             placeholder="+233..."
                          />
                       </div>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
                    * Ensure data accuracy. This mark links your cargo to your physical assets in our system.
                 </p>
              </div>
           </div>

           {/* Step 2: Output Cards (Using Admin Addresses) */}
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <HubCard 
                 type="sea" 
                 icon={Ship} 
                 addr={settings.chinaSeaAddr || "ADDRESS PENDING"} 
                 user={user}
                 onCopy={() => copyHubPackage('sea')}
                 isCopied={copiedId === 'sea'}
              />
              <HubCard 
                 type="air" 
                 icon={Plane} 
                 addr={settings.chinaAirAddr || "ADDRESS PENDING"} 
                 user={user}
                 onCopy={() => copyHubPackage('air')}
                 isCopied={copiedId === 'air'}
              />
           </div>
        </div>
      </section>

      {/* --- SECTION 3: CALCULATOR ENGINE --- */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         {/* BG Decor */}
         <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-900/10 skew-x-12"></div>

         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
            
            <div className="lg:col-span-5">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 text-white rounded-full text-[10px] font-bold uppercase mb-6">
                  <Calculator size={14} /> Estimate Cost
               </div>
               <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">Pricing Engine</h2>
               <div className="space-y-6 text-sm text-slate-400 font-medium">
                  <p>Calculate your estimated shipping costs instantly using live rates from the control center.</p>
                  <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6">
                     <div className="flex items-center gap-3">
                        <Check size={16} className="text-blue-500"/> <span>Includes Custom Clearance</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <Check size={16} className="text-blue-500"/> <span>Includes Duty & Taxes</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7 bg-white text-slate-900 p-8 md:p-12 shadow-2xl relative rounded-xl">
               <div className="flex border-b border-slate-200 mb-8">
                  <button onClick={() => setCalcMode('sea')} className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all ${calcMode === 'sea' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Ocean Freight</button>
                  <button onClick={() => setCalcMode('air')} className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all ${calcMode === 'air' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Air Freight</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     {calcMode === 'sea' ? (
                        <div className="grid grid-cols-3 gap-4">
                           {['L', 'W', 'H'].map(d => (
                              <div key={d}>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{d} (CM)</label>
                                 <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 outline-none font-mono font-bold focus:border-blue-600 rounded" placeholder="0" onChange={e => setDims({...dims, [d.toLowerCase()]: e.target.value})} />
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Weight (KG)</label>
                              <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 outline-none font-mono font-bold focus:border-blue-600 rounded" placeholder="0.00" onChange={e => setDims({...dims, weight: e.target.value})} />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Cargo Type</label>
                              <select className="w-full p-4 bg-slate-50 border border-slate-200 outline-none font-bold text-sm uppercase cursor-pointer rounded" onChange={e => setDims({...dims, category: e.target.value})}>
                                 <option value="normal">General Goods</option>
                                 <option value="battery">Sensitive / Battery</option>
                                 <option value="express">Express Priority</option>
                              </select>
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="bg-slate-900 text-white p-6 flex flex-col justify-between relative overflow-hidden rounded-lg">
                     <div className="relative z-10 text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Estimated Total</p>
                        <p className="text-4xl font-black font-mono tracking-tight">${calculatedResult}</p>
                        <p className="text-xs text-green-400 font-bold mt-1">USD</p>
                     </div>
                     <div className="absolute bottom-[-20px] left-[-20px] opacity-10"><DollarIcon /></div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- SECTION 4: CORE ADVANTAGES --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">System Capabilities</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={ShieldCheck} title="Secure Consolidation" desc="Advanced warehousing with 24/7 surveillance and itemized checking." />
            <FeatureCard icon={Zap} title="Rapid Clearance" desc="Direct customs uplink at Tema Port ensures minimal dwell time." />
            <FeatureCard icon={MapPin} title="End-to-End Visibility" desc="Track your cargo at every milestone from origin to final delivery." />
         </div>
      </section>

    </div>
  );
}

// --- SUB-COMPONENTS ---
const RateDisplay = ({ label, value, unit, color }) => {
   const colors = { green: 'text-green-400', blue: 'text-blue-400', purple: 'text-purple-400', orange: 'text-orange-400' };
   return (
      <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
         <span className="text-slate-400 font-medium">{label}</span>
         <span className={`font-mono font-bold ${colors[color]}`}>{value} <span className="text-xs text-slate-600">{unit}</span></span>
      </div>
   );
};

const HubCard = ({ type, icon: Icon, addr, user, onCopy, isCopied }) => (
   <div className="border border-slate-200 bg-white hover:border-blue-500 transition-all p-8 group relative overflow-hidden rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-lg"><Icon size={24} /></div>
            <div><h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">{type} Terminal</h3><p className="text-[10px] text-slate-400 font-bold uppercase">Status: Receiving</p></div>
         </div>
      </div>
      <div className="bg-slate-50 p-6 border border-slate-100 mb-6 font-mono text-xs text-slate-600 leading-relaxed uppercase rounded-lg">
         <p className="mb-4"><strong>ADD:</strong> {addr}</p>
         <div className="pt-4 border-t border-slate-200 text-blue-700 font-bold">MARK: {user.name ? `BESIN / ${user.name} / ${user.phone} / ${type.toUpperCase()}` : 'PENDING INPUT...'}</div>
      </div>
      <button onClick={onCopy} className={`w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-lg ${isCopied ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>{isCopied ? <><Check size={16}/> Address Copied</> : <><Copy size={16}/> Copy Address</>}</button>
   </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
   <div className="p-8 border border-slate-200 bg-white hover:shadow-xl transition-all group rounded-xl">
      <Icon size={40} className="text-slate-300 mb-6 group-hover:text-blue-600 transition-colors" />
      <h3 className="font-bold text-slate-900 uppercase mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
   </div>
);

const DollarIcon = () => (
   <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>
);