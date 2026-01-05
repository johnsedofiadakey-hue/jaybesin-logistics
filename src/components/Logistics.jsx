import React, { useState, useEffect } from 'react';
import { 
  Search, Package, Activity, Clock, MapPin, 
  AlertCircle, ArrowRight, Globe, Anchor, 
  Scan, Crosshair, Database, DollarSign, MessageCircle, Container
} from 'lucide-react';

// CONNECT TO THE DATABASE
import { useShipments } from './ShipmentContext';

export default function Logistics({ globalSearchTerm }) {
  const [trackId, setTrackId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // GET LIVE DATA
  const { shipments } = useShipments();

  // --- STAGES (MUST MATCH ADMIN EXACTLY) ---
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

  // --- AUTO-SEARCH FROM HOME PAGE ---
  useEffect(() => { 
    if (globalSearchTerm) { 
        setTrackId(globalSearchTerm); 
        performSearch(globalSearchTerm); 
    } 
  }, [globalSearchTerm]);

  const performSearch = (id) => {
    if (!id) return;
    setIsScanning(true);
    setHasSearched(true);
    setSearchResult(null);
    
    // Simulate a brief network scan for effect, then find data
    setTimeout(() => {
      const found = shipments.find(s => 
        s.trackingNumber.trim().toLowerCase() === id.trim().toLowerCase() ||
        s.consigneeName.toLowerCase().includes(id.toLowerCase()) ||
        (s.containerId && s.containerId.toLowerCase() === id.trim().toLowerCase())
      );
      setSearchResult(found || null);
      setIsScanning(false);
    }, 800);
  };

  const getStageIndex = (status) => {
      const idx = logisticsStages.indexOf(status);
      return idx === -1 ? 1 : idx; // Default to 'Received' if status mismatch
  };

  const getSupportLink = (result) => { 
      const msg = `Hello, I am inquiring about shipment ${result.trackingNumber} (${result.consigneeName}).`;
      return `https://wa.me/233553065304?text=${encodeURIComponent(msg)}`; 
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans text-slate-900 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-slate-200 pb-8">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                 <Activity size={12} className="text-green-400 animate-pulse" /> Live Telemetry
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
                 Global <span className="text-blue-600">Cargo Tracking</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium max-w-xl">
                 Real-time visibility. Enter <strong>Tracking ID</strong> (e.g. JB-CN-8392), <strong>Container ID</strong>, or Client Name.
              </p>
           </div>
        </div>

        {/* TRACKING INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* SCANNER INPUT */}
           <div className="lg:col-span-4 sticky top-24 z-20">
              <div className="bg-white p-8 shadow-xl border-t-4 border-blue-600 relative overflow-hidden">
                 <div className="relative z-10">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Crosshair size={14} className="text-blue-600"/> Shipment Identifier
                    </label>
                    <div className="relative mb-6">
                       <input 
                         value={trackId}
                         onChange={(e) => setTrackId(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && performSearch(trackId)}
                         placeholder="ID / Name / Container..."
                         className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 text-lg font-mono font-bold text-slate-900 outline-none focus:border-blue-600 transition-all uppercase"
                       />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                    <button 
                      onClick={() => performSearch(trackId)}
                      disabled={isScanning}
                      className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                       {isScanning ? <><Scan className="animate-spin" size={16}/> Scanning...</> : <><ArrowRight size={16}/> Track Cargo</>}
                    </button>
                 </div>
              </div>
           </div>

           {/* RESULTS DISPLAY */}
           <div className="lg:col-span-8 min-h-[500px]">
              {isScanning ? (
                 <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white/50 animate-pulse p-12 text-center">
                    <Globe size={64} className="text-blue-600 mb-6 animate-spin-slow" />
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Establishing Uplink...</h3>
                 </div>
              ) : !hasSearched ? (
                 <div className="h-full flex flex-col items-center justify-center border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                       <Package size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Ready to Track</h3>
                    <p className="text-slate-500 max-w-sm mt-2">Enter your ID to locate your cargo on the live manifest.</p>
                 </div>
              ) : !searchResult ? (
                 <div className="h-full flex flex-col items-center justify-center border-l-4 border-red-500 bg-white p-12 shadow-sm">
                    <AlertCircle size={48} className="text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 uppercase">Manifest Not Found</h3>
                    <p className="text-slate-500 mt-2">No shipment found for <strong>"{trackId}"</strong>.</p>
                 </div>
              ) : (
                 <div className="bg-white shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* RESULT HEADER */}
                    <div className="bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-start gap-6 relative overflow-hidden">
                       <div className="relative z-10">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                             <h2 className="text-3xl md:text-4xl font-black font-mono tracking-tight">{searchResult.trackingNumber}</h2>
                             
                             {/* MODE BADGE */}
                             <span className="bg-blue-600 text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded">{searchResult.mode}</span>
                             
                             {/* CONTAINER ID BADGE */}
                             {searchResult.containerId && (
                                <span className="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest flex items-center gap-1 rounded">
                                    <Container size={12} /> {searchResult.containerId}
                                </span>
                             )}
                          </div>
                          <p className="text-slate-400 font-mono text-sm uppercase">Consignee: <span className="text-white font-bold">{searchResult.consigneeName}</span></p>
                       </div>
                       
                       <div className="relative z-10 text-right">
                          <a href={getSupportLink(searchResult)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all">
                             <MessageCircle size={16}/> Support
                          </a>
                       </div>
                       <Anchor className="absolute right-[-20px] bottom-[-20px] text-white opacity-5 rotate-[-15deg]" size={200} />
                    </div>

                    {/* METRICS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-slate-50/50">
                       <MetricBox label="Origin" value={searchResult.origin} icon={Globe} />
                       <MetricBox label="Destination" value={searchResult.destination} icon={MapPin} />
                       <MetricBox label="Volume" value={`${searchResult.items?.reduce((a,i)=>a+Number(i.cbm||0),0).toFixed(3)} m³`} icon={Database} />
                       <MetricBox 
                            label="Total Fee" 
                            value={`$${searchResult.totalCost || '0.00'}`} 
                            icon={DollarSign} 
                            highlight 
                       />
                    </div>

                    {/* TIMELINE */}
                    <div className="p-8 md:p-12">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                          <Clock size={14}/> Operational Timeline
                       </h3>
                       
                       <div className="relative space-y-0 pl-4 border-l-2 border-slate-100 ml-3">
                          {logisticsStages.map((stage, index) => {
                             const currentStageIndex = getStageIndex(searchResult.status);
                             const isCompleted = index <= currentStageIndex;
                             const isCurrent = index === currentStageIndex;
                             
                             return (
                                <div key={index} className="relative pb-10 last:pb-0">
                                   <div className={`absolute -left-[25px] top-0 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center transition-all duration-500 ${
                                      isCurrent ? 'bg-blue-600 scale-125 shadow-lg shadow-blue-500/30' : 
                                      isCompleted ? 'bg-slate-900' : 'bg-slate-200'
                                   }`}>
                                      {isCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                   </div>

                                   <div className={`pl-6 transition-all duration-500 ${isCurrent ? 'opacity-100 translate-x-2' : isCompleted ? 'opacity-80' : 'opacity-30 blur-[0.5px]'}`}>
                                      <h4 className={`text-sm font-bold uppercase tracking-wide ${isCurrent ? 'text-blue-600' : 'text-slate-900'}`}>
                                         {stage}
                                      </h4>
                                      {isCurrent && (
                                         <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                                            Current Stage
                                         </div>
                                      )}
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>

                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT ---
const MetricBox = ({ label, value, icon: Icon, highlight }) => (
  <div className="p-6 border-r border-slate-100 last:border-0 hover:bg-white transition-colors group">
     <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={highlight ? "text-blue-600" : "text-slate-400"} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
     </div>
     <p className={`font-bold text-sm md:text-base truncate ${highlight ? "text-blue-600" : "text-slate-900"}`}>
        {value}
     </p>
  </div>
);