import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Navigation,
  Activity,
  Container,
  RefreshCw,
  Zap,
  Ship,
  ShieldCheck,
  Box
} from 'lucide-react';

// --- MASTER DATA BRIDGE ---
import { useShipments, LOGISTICS_STAGES } from './ShipmentContext';

/**
 * JAY-BESIN | ENTERPRISE TRACKING TERMINAL v20.0
 * -------------------------------------------------------------------------
 * DEVELOPER: World Top Software Engineer
 * * ENGINEERING AUDIT:
 * 1. FIXED CRASH: Implemented local 'calculateProgress' logic to prevent undefined function errors.
 * 2. STABILITY: Added ID-based dependency tracking for live updates.
 * 3. UI: Professional SaaS Scale (Clean, Bold, Slate/Blue).
 * -------------------------------------------------------------------------
 */

export default function Logistics() {
  // --- SYSTEM HOOKS ---
  // Safe destructuring with default array to prevent map errors
  const { shipments = [] } = useShipments();
  
  // --- UI STATE ---
  const [trackInput, setTrackInput] = useState('');
  const [foundPackage, setFoundPackage] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // --- INTERNAL HELPER: PROGRESS CALCULATOR (CRASH FIX) ---
  // This ensures the progress bar creates a visual percentage without crashing
  const calculateProgress = (status) => {
    if (!status) return 0;
    const index = LOGISTICS_STAGES.indexOf(status);
    if (index === -1) return 5; // Default small progress if status unknown
    // Calculate percentage based on total stages
    return Math.round(((index + 1) / LOGISTICS_STAGES.length) * 100);
  };

  // --- LIVE SYNC ENGINE ---
  // Syncs results with the latest database state safely
  useEffect(() => {
    if (foundPackage && shipments.length > 0) {
      const refreshedData = shipments.find(s => s.id === foundPackage.id);
      if (refreshedData) {
        setFoundPackage(refreshedData);
      }
    }
    // Only re-run if the shipments list changes or the specific package ID changes
  }, [shipments, foundPackage?.id]);

  // --- SEARCH PROTOCOL ---
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const cleanInput = trackInput.trim().toLowerCase();
    
    if (!cleanInput) return;

    setIsSearching(true);
    
    // Artificial delay for UX smoothing
    setTimeout(() => {
      try {
        const result = (shipments || []).find(s => 
          (s.trackingNumber && String(s.trackingNumber).toLowerCase().trim() === cleanInput) ||
          (s.consigneeName && s.consigneeName.toLowerCase().includes(cleanInput))
        );

        setFoundPackage(result || null);
        setHasSearched(true);
      } catch (err) {
        console.error("Search Logic Failure:", err);
        setFoundPackage(null);
      } finally {
        setIsSearching(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 uppercase font-bold">
      
      {/* SECTION: SEARCH HEADER */}
      <div className="bg-white border-b border-slate-200 pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
           <Navigation size={400} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-6 border border-blue-100">
             <Zap size={14} fill="currentColor" /> REGISTRY ACTIVE: {shipments.length} NODES
          </div>
          <h1 className="text-5xl font-black text-slate-950 mb-4 tracking-tight leading-none">Global Tracking Terminal</h1>
          <p className="text-slate-400 text-sm tracking-[0.3em] font-bold mb-12 uppercase">Precision Telemetry for China-Ghana Trade Nodes</p>
          
          <form onSubmit={handleTrackSubmit} className="max-w-2xl mx-auto">
            <div className="flex items-center p-2 bg-slate-100 border border-slate-200 rounded-2xl shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-500">
              <div className="flex-grow flex items-center pl-4">
                <Search className="text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Enter Tracking ID (e.g. JB-CN-100203)" 
                  className="w-full bg-transparent border-none outline-none text-slate-900 font-bold text-lg px-4 py-3 placeholder-slate-400 uppercase tracking-widest"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                />
              </div>
              <button 
                disabled={isSearching}
                type="submit"
                className="bg-slate-950 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? <RefreshCw className="animate-spin" size={16} /> : "Query Node"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION: DATA VIEWPORT */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        
        {!hasSearched ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-1000">
             <InfoTile icon={Package} title="Registry Search" desc="Access the China Hub registry using your unique ID." />
             <InfoTile icon={Ship} title="Fleet Telemetry" desc="Real-time coordinates from our vessel tracking system." />
             <InfoTile icon={ShieldCheck} title="Data Integrity" desc="Direct encrypted link to the JayBesin Master Terminal." />
          </div>
        ) : foundPackage ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
            
            {/* SUMMARY CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-lg">
                     <Box size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 tracking-[0.3em] font-black leading-none mb-2 uppercase">Telemetery Node ID</p>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tighter leading-none">#{foundPackage?.trackingNumber}</h2>
                  </div>
               </div>
               <div className="flex items-center gap-4 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/20">
                  <Activity size={18} className="animate-pulse" />
                  <span className="text-sm font-black uppercase tracking-widest">{foundPackage?.status || "Analyzing"}</span>
               </div>
            </div>

            {/* STATUS TILES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <StatusTile label="Origin Hub" value={foundPackage?.origin} icon={MapPin} />
               <StatusTile label="Destination" value={foundPackage?.destination} icon={Navigation} />
               <StatusTile label="Container Block" value={foundPackage?.containerId} icon={Container} />
               <StatusTile label="Registry Date" value={foundPackage?.dateReceived} icon={Calendar} />
            </div>

            {/* PROGRESS ENGINE */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-sm font-black text-slate-950 tracking-widest uppercase">Registry Progress Nodes</h3>
                  <div className="text-[10px] text-slate-400 font-black border border-slate-100 px-3 py-1 rounded-lg uppercase">Cloud Sync Active</div>
               </div>

               {/* PROGRESS BAR */}
               <div className="relative mb-16 h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-[2000ms] ease-in-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    style={{ width: `${calculateProgress(foundPackage?.status)}%` }}
                  >
                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]"></div>
                  </div>
               </div>

               {/* STATUS STEPS */}
               <div className="grid grid-cols-1 gap-3">
                  {LOGISTICS_STAGES.map((stage, idx) => {
                    const statusIndex = LOGISTICS_STAGES.indexOf(foundPackage?.status);
                    const isCompleted = statusIndex >= idx;
                    const isCurrent = foundPackage?.status === stage;

                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-6 p-4 rounded-2xl transition-all duration-500 border-2 ${
                          isCurrent 
                          ? 'bg-white border-blue-600 shadow-md translate-x-2' 
                          : isCompleted 
                            ? 'bg-slate-50 border-slate-100 opacity-80' 
                            : 'bg-white border-transparent opacity-30 grayscale'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCurrent 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-100 text-slate-300'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={20} strokeWidth={3} /> : <div className="w-2 h-2 bg-slate-200 rounded-full"></div>}
                        </div>
                        
                        <div className="flex-grow">
                          <p className={`text-sm font-black tracking-tight uppercase ${isCurrent ? 'text-slate-950' : 'text-slate-500'}`}>
                            {stage}
                          </p>
                        </div>
                        
                        {isCurrent && (
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                             <span className="text-[9px] text-blue-600 font-black tracking-widest uppercase">Current Node</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="bg-slate-950 rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-8 border border-slate-800 shadow-2xl">
               <div className="flex items-center gap-6 text-white">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Navigation size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight uppercase">Support Coordination</h4>
                    <p className="text-slate-400 text-xs font-bold tracking-widest mt-1 uppercase">Direct communication with logistics nodes</p>
                  </div>
               </div>
               <button className="bg-white text-slate-950 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95">
                  Contact Terminal
               </button>
            </div>

          </div>
        ) : (
          /* STABILIZED ERROR STATE */
          <div className="bg-white p-20 rounded-[3rem] border border-red-100 shadow-sm text-center font-bold">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
               <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-950 mb-4 uppercase">Node Identification Failure</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-10 leading-relaxed uppercase font-bold tracking-wide">
               Terminal unable to locate node: <span className="text-red-500 font-black">{trackInput}</span>. 
               Please verify the serial node number from your documentation.
            </p>
            <button 
              onClick={() => { setHasSearched(false); setTrackInput(''); }} 
              className="bg-slate-950 text-white px-10 py-4 rounded-xl font-black text-xs tracking-widest hover:bg-red-500 transition-all shadow-lg active:scale-95"
            >
              Reset Search Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- REFINED UI ATOMS ---

const InfoTile = ({ icon: Icon, title, desc }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all group">
    <div className="w-12 h-12 bg-slate-50 text-slate-950 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-black text-slate-950 mb-3 tracking-tight uppercase leading-none">{title}</h3>
    <p className="text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-wider">{desc}</p>
  </div>
);

const StatusTile = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="w-10 h-10 bg-slate-50 text-blue-600 rounded-xl flex items-center justify-center border border-slate-100">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-1 leading-none">{label}</p>
      <p className="text-[13px] font-black text-slate-950 tracking-tight uppercase leading-none">{value || 'N/A'}</p>
    </div>
  </div>
);