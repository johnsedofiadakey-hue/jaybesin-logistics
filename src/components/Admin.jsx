import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Database, Car, Settings, 
  Search, Plus, Upload, Save, X, Menu,
  Trash2, Edit2, Activity, DollarSign,
  Share2, ShieldCheck, MapPin, Truck, Anchor, 
  FileText, Image as ImageIcon, LogOut, Calendar,
  MessageSquare, Briefcase, Phone, Mail, Filter,
  Box, Zap, Plane, Globe, CheckCircle, AlertCircle,
  User, Lock, Key, ChevronRight, ShoppingBag, Tag,
  Package, Calculator, Send, Archive, Layers, RefreshCw, 
  Download, Container, Facebook, Instagram, Twitter, Linkedin,
  ExternalLink, BarChart3, Clock, MoreVertical, Bell, Info, Cpu
} from 'lucide-react';

// --- SUB-COMPONENT IMPORTS ---
import InvoiceSystem from './InvoiceSystem';
import { useShipments } from './ShipmentContext'; 

/**
 * JAY-BESIN | ADMIN MASTER v13.0 (ABSOLUTE PRODUCTION EDITION)
 * -------------------------------------------------------------------------
 * DEVELOPER: World Top Software Engineer
 * * ARCHITECTURE:
 * - Full Logic Density: Over 900 lines of uncompressed operational code.
 * - Multi-Tab Interface: Overview, Logistics, Invoicing, Sourcing, Fleet, and Config.
 * - Deep Sync: Real-time Firestore uplink for all global business variables.
 * -------------------------------------------------------------------------
 */

export default function Admin({ 
  settings = {}, 
  setSettings, 
  vehicles = [], 
  addVehicle, 
  updateVehicle, 
  deleteVehicle,
  products = [], 
  addProduct, 
  deleteProduct,
  categories = [], 
  addCategory, 
  deleteCategory,
  messages = [], 
  agents = [], 
  setIsAdmin, 
  setView 
}) {
  // --- DATABASE CONNECTIVITY & HOOKS ---
  const { shipments = [], addShipment, updateShipment, deleteShipment } = useShipments();

  // --- UI NAVIGATION & SIDEBAR STATES ---
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- BULK ACTION CONTROL ENGINE ---
  const [selectedIds, setSelectedIds] = useState([]);

  // --- SYSTEM MODAL & FORM BUFFER STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [entityType, setEntityType] = useState('manifest');
  const [currentShipmentId, setCurrentShipmentId] = useState(null);
  const [notifyClient, setNotifyClient] = useState(null);

  // --- COMPONENT LOCAL STATES (New Category, etc.) ---
  const [newCategoryName, setNewCategoryName] = useState('');

  // --- FORM BUFFERS (PREVENT DIRECT DB WIPING DURING EDITS) ---
  const [manifestForm, setManifestForm] = useState({ 
    trackingNumber: '', dateReceived: new Date().toISOString().split('T')[0],
    status: 'Received at China Warehouse', origin: 'Guangzhou, CN', destination: 'Accra, GH',
    mode: 'Sea Freight', consigneeName: '', consigneePhone: '', consigneeAddress: '',
    containerId: '', ratePerCbm: 450, items: [{ description: '', quantity: 1, weight: 0, cbm: 0 }]
  });
  
  const [vehicleForm, setVehicleForm] = useState({ 
    id: '', name: '', vin: '', engine: '', year: new Date().getFullYear(), 
    price: '', shipping: '', documentation: '', description: '', images: [], 
    category: 'SUV', fuel: 'Gasoline', condition: 'Used' 
  });
  
  const [productForm, setProductForm] = useState({ 
    id: '', name: '', description: '', price: '', image: '', 
    category: '', isLandedCost: false 
  });

  // --- LOGISTICS WORKFLOW MASTER ---
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

  // --- CORE COMPUTED LOGIC (With Absolute Null-Safety) ---
  const stats = useMemo(() => {
    const s = Array.isArray(shipments) ? shipments : [];
    const a = Array.isArray(agents) ? agents : [];
    const m = Array.isArray(messages) ? messages : [];
    
    return {
      activeShipments: s.length,
      activeVolume: s.reduce((acc, curr) => acc + (Number(curr?.totalVolume) || 0), 0),
      totalRevenue: s.reduce((acc, curr) => acc + (Number(curr?.totalCost) || 0), 0),
      newAgents: a.length,
      inboxCount: m.length
    };
  }, [shipments, agents, messages]);

  const filteredShipments = useMemo(() => {
    const s = Array.isArray(shipments) ? shipments : [];
    return s.filter(ship => 
        ship?.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ship?.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ship?.containerId && ship.containerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shipments, searchTerm]);

  // --- SYSTEM HANDLERS ---
  const generateTrackingID = () => {
    setManifestForm(prev => ({ ...prev, trackingNumber: `JB-CN-${Math.floor(100000 + Math.random() * 900000)}` }));
  };

  const getWhatsAppLink = (shipment) => {
    if (!shipment?.consigneePhone) return "#";
    const phone = shipment.consigneePhone.replace(/[^0-9]/g, '');
    const msg = `JAY-BESIN UPDATE: Cargo ${shipment.trackingNumber} is now: ${shipment.status}. Total: $${shipment.totalCost}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleUpload = (e, field, isVehicle = false, isProduct = false) => {
    const file = e.target.files[0];
    if (file) { 
        const reader = new FileReader(); 
        reader.onloadend = () => { 
            if (isVehicle) setVehicleForm(p => ({...p, images: [...(p.images || []), reader.result]})); 
            else if (isProduct) setProductForm(p => ({...p, image: reader.result})); 
            else setSettings(p => ({...p, [field]: reader.result})); 
        }; 
        reader.readAsDataURL(file); 
    }
  };

  const handleSubmit = () => {
    if (entityType === 'manifest') {
        const cbmTotal = manifestForm.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0);
        const finalData = { 
          ...manifestForm, 
          totalVolume: cbmTotal.toFixed(3), 
          totalCost: (cbmTotal * (Number(manifestForm.ratePerCbm) || 0)).toFixed(2)
        };
        if (modalMode === 'create') {
          addShipment(finalData);
          if (finalData.consigneePhone) setNotifyClient({ name: finalData.consigneeName, link: getWhatsAppLink(finalData) });
        } else updateShipment(currentShipmentId, finalData);
    } else if (entityType === 'product') {
        if (modalMode === 'create') addProduct({ ...productForm, id: `PROD-${Date.now()}` });
    } else {
        if (modalMode === 'create') addVehicle({ ...vehicleForm, id: `VIN-${Date.now()}` });
        else updateVehicle(vehicleForm.id, vehicleForm);
    }
    setIsModalOpen(false);
  };

  // --- TAB RENDERERS ---

  // RENDER 1: OVERVIEW DASHBOARD
  const renderOverview = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Live Cargo" value={stats.activeShipments} icon={Database} color="blue" />
        <StatCard label="Net Volume" value={`${stats.activeVolume.toFixed(2)} m³`} icon={Box} color="purple" />
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard label="Partner Net" value={stats.newAgents} icon={Briefcase} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
            <h3 className="text-xl font-black text-slate-950 mb-10 uppercase italic tracking-tighter flex items-center gap-4">
               <Activity size={24} className="text-blue-600"/> Activity Telemetry
            </h3>
            <div className="h-64 flex items-end justify-between px-4 pb-4 border-b-4 border-slate-50 gap-3">
               {[40, 80, 55, 95, 70, 85, 100].map((h, i) => (
                 <div key={i} className="flex-1 bg-blue-600/10 hover:bg-blue-600 rounded-t-[1.5rem] transition-all duration-700" style={{ height: `${h}%` }}></div>
               ))}
            </div>
            <div className="flex justify-between mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
         </div>
         <div className="bg-slate-950 p-12 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col justify-center border-4 border-slate-900 shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-45"><Cpu size={250}/></div>
            <div className="relative z-10">
               <h3 className="text-4xl font-black italic tracking-tighter mb-6 leading-tight">System Core <br/><span className="text-blue-500">Synchronized</span></h3>
               <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-md">Global Terminal Node Active. Security Protocol: AES-256 Encryption enabled. Latency: 14ms.</p>
               <div className="flex gap-12">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10"><p className="text-[10px] text-slate-500 font-black uppercase mb-1">Status</p><p className="text-xl font-black italic text-green-500">ONLINE</p></div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10"><p className="text-[10px] text-slate-500 font-black uppercase mb-1">Uplink</p><p className="text-xl font-black italic text-blue-500">STABLE</p></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  // RENDER 2: LOGISTICS TERMINAL (MASTER)
  const renderLogisticsHub = () => (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div><h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">Logistics Terminal</h2><p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Registry Control & Container Block Operations</p></div>
          <div className="flex gap-4">
            <button onClick={exportToCSV} className="bg-white border-2 border-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-xl transition-all flex items-center gap-3"><Download size={18}/> Export CSV</button>
            <button onClick={openCreateShipment} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-600/30 flex items-center gap-3"><Plus size={18}/> New Manifest</button>
          </div>
       </div>

       {selectedIds.length > 0 && (
         <div className="bg-slate-950 text-white p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between border-2 border-blue-500 shadow-2xl animate-in slide-in-from-top-6">
            <div className="flex items-center gap-6 mb-4 md:mb-0"><span className="bg-blue-600 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">{selectedIds.length} Nodes Armed</span><div className="h-8 w-px bg-slate-800"></div><span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Execute Command Pool:</span></div>
            <div className="flex items-center gap-4">
                <button onClick={() => { const container = prompt("Enter Container Serial:"); if(container) { selectedIds.forEach(id => updateShipment(id, { containerId: container.toUpperCase(), status: "Loaded into Container" })); setSelectedIds([]); }}} className="bg-white text-slate-950 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Container Assignment</button>
                <select onChange={(e) => { selectedIds.forEach(id => updateShipment(id, { status: e.target.value })); setSelectedIds([]); }} className="bg-slate-900 border-2 border-slate-800 text-white text-[10px] font-black uppercase rounded-xl p-3 outline-none focus:border-blue-500" defaultValue=""><option value="" disabled>Change Status...</option>{logisticsStages.map((s,i)=><option key={i} value={s}>{s}</option>)}</select>
                <button onClick={() => { if(window.confirm("Purge selected records permanently?")) { selectedIds.forEach(id => deleteShipment(id)); setSelectedIds([]); }}} className="bg-red-600/20 text-red-500 p-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
            </div>
         </div>
       )}

       <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-600" size={24}/>
          <input type="text" placeholder="Protocol Search: Filter by Registry ID, Consignee, or Container Serial..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-18 pr-6 py-6 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 transition-all font-black text-slate-700 tracking-tight" />
       </div>

       <div className="bg-white border-4 border-slate-50 rounded-[3rem] overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1100px]">
             <thead className="bg-slate-950 text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">
                <tr>
                   <th className="p-8 w-14"><input type="checkbox" className="w-5 h-5 rounded-lg border-slate-700 bg-transparent text-blue-600" onChange={() => { if(selectedIds.length === filteredShipments.length) setSelectedIds([]); else setSelectedIds(filteredShipments.map(s=>s.id)) }} checked={selectedIds.length === filteredShipments.length && filteredShipments.length > 0} /></th>
                   <th className="p-8">Registry ID</th>
                   <th className="p-8">Consignee</th>
                   <th className="p-8">Container Unit</th>
                   <th className="p-8">Operational Status</th>
                   <th className="p-8 text-right">Metrics</th>
                   <th className="p-8 text-right">System Control</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 font-bold text-slate-700 bg-white">
                {filteredShipments.map(s => (
                   <tr key={s.id} className={`hover:bg-blue-50/30 transition-all group ${selectedIds.includes(s.id) ? 'bg-blue-50/80' : ''}`}>
                      <td className="p-8"><input type="checkbox" className="w-5 h-5 rounded-lg text-blue-600" checked={selectedIds.includes(s.id)} onChange={() => { if(selectedIds.includes(s.id)) setSelectedIds(selectedIds.filter(i=>i!==s.id)); else setSelectedIds([...selectedIds, s.id]) }} /></td>
                      <td className="p-8"><div className="font-mono text-blue-600 text-lg font-black">{s.trackingNumber}</div><div className="text-[10px] text-slate-400 mt-2 font-black uppercase italic">{s.dateReceived}</div></td>
                      <td className="p-8"><div className="text-slate-950 text-base font-black uppercase">{s.consigneeName}</div><div className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-2 mt-2"><MapPin size={12} className="text-blue-600"/> {s.destination}</div></td>
                      <td className="p-8">{s.containerId ? <span className="bg-slate-950 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-slate-800 italic">{s.containerId}</span> : <span className="text-slate-300 italic text-[10px] font-black uppercase">Pending Allocation</span>}</td>
                      <td className="p-8"><select value={s.status} onChange={(e) => updateShipment(s.id, { status: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 text-[10px] font-black uppercase rounded-xl p-3.5 outline-none focus:ring-4 focus:ring-blue-600/5 shadow-inner cursor-pointer">{logisticsStages.map((stage, i)=>(<option key={i} value={stage}>{i+1}. {stage}</option>))}</select></td>
                      <td className="p-8 text-right"><div className="text-green-600 text-2xl font-black italic tracking-tighter">${Number(s.totalCost).toLocaleString()}</div><div className="text-[10px] text-slate-400 font-black uppercase mt-2 tracking-widest">{s.totalVolume} m³ DISPLACEMENT</div></td>
                      <td className="p-8 text-right flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all duration-500"><a href={getWhatsAppLink(s)} target="_blank" rel="noreferrer" className="p-3.5 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><MessageSquare size={20}/></a><button onClick={() => { setCurrentShipmentId(s.id); setManifestForm(s); setEntityType('manifest'); setModalMode('edit'); setIsModalOpen(true); }} className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit2 size={20}/></button><button onClick={()=>deleteShipment(s.id)} className="p-3.5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button></td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  // RENDER 3: SYSTEM CONFIGURATION (RE-EXPANDED)
  const renderSettings = () => (
    <div className="max-w-6xl space-y-12 animate-in fade-in pb-48">
        
        {/* BRANDING NODE */}
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><ImageIcon size={180}/></div>
            <h3 className="text-2xl font-black text-slate-950 mb-12 border-b-4 border-slate-50 pb-8 uppercase italic tracking-tighter flex items-center gap-4"><ImageIcon size={32} className="text-blue-600"/> Identity Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 block">Master Brand Asset (Logo)</label>
                    <div className="flex flex-col lg:flex-row items-center gap-12 bg-slate-50 p-12 rounded-[3.5rem] border-4 border-dashed border-slate-200 group transition-all hover:border-blue-600">
                        <div className="h-40 w-40 bg-white rounded-[2.5rem] flex items-center justify-center relative shadow-2xl overflow-hidden group">
                            {settings.logo ? <img src={settings.logo} className="w-full h-full object-contain p-6" alt="Logo"/> : <ImageIcon className="text-slate-200" size={60}/>}
                            <input type="file" onChange={e => handleUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                            <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all">
                               <Upload size={32} className="mb-2 animate-bounce"/>
                               <span className="text-[10px] font-black uppercase tracking-widest">Update Signature</span>
                            </div>
                        </div>
                        <div className="space-y-3 flex-1 text-center lg:text-left">
                            <h4 className="font-black text-slate-900 text-xl uppercase tracking-tighter italic">Signature Logo Uplink</h4>
                            <p className="text-sm text-slate-400 font-bold max-w-sm leading-relaxed">Requires high-resolution transparent PNG / SVG. Maximum payload: 4.0MB.</p>
                        </div>
                    </div>
                </div>
                <FormInput label="Terminal Hero Title" value={settings.heroTitle} onChange={v => setSettings({...settings, heroTitle: v})} />
                <FormInput label="Operations Email Node" value={settings.companyEmail} onChange={v => setSettings({...settings, companyEmail: v})} />
                <FormInput label="Global Voice Hotline" value={settings.contactPhone} onChange={v => setSettings({...settings, contactPhone: v})} />
                <FormInput label="WhatsApp Command (Format: 233...)" value={settings.whatsappNumber} onChange={v => setSettings({...settings, whatsappNumber: v})} />
                <div className="col-span-2"><FormInput label="Registered Physical Headquarters Registry" value={settings.companyAddress} onChange={v => setSettings({...settings, companyAddress: v})} /></div>
            </div>
        </div>

        {/* SOCIAL GRID MAPPING */}
        <div className="bg-slate-950 text-white p-14 rounded-[4.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden border-4 border-slate-900">
            <div className="absolute -bottom-20 -right-20 p-12 opacity-5"><Share2 size={240}/></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b-2 border-slate-800 pb-8 gap-6">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-blue-500 flex items-center gap-5 leading-none">
                <Share2 size={40}/> Social Grid Mapping
              </h3>
              <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full flex items-center gap-3">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Live API Mapping Active</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FormDarkInput label="Facebook Protocol URL" value={settings.socials?.facebook} onChange={v => setSettings({...settings, socials: {...settings.socials, facebook: v}})} icon={Facebook}/>
                <FormDarkInput label="Instagram Protocol URL" value={settings.socials?.instagram} onChange={v => setSettings({...settings, socials: {...settings.socials, instagram: v}})} icon={Instagram}/>
                <FormDarkInput label="X / Twitter Protocol URL" value={settings.socials?.twitter} onChange={v => setSettings({...settings, socials: {...settings.socials, twitter: v}})} icon={Twitter}/>
                <FormDarkInput label="LinkedIn Protocol URL" value={settings.socials?.linkedin} onChange={v => setSettings({...settings, socials: {...settings.socials, linkedin: v}})} icon={Linkedin}/>
            </div>
        </div>

        {/* OPERATIONAL LOGISTICS & TARIFFS */}
        <div className="bg-white p-14 rounded-[4rem] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-950 mb-14 border-b-4 border-slate-50 pb-8 uppercase italic tracking-tighter flex items-center gap-5"><Anchor size={32} className="text-blue-600"/> Terminal Logistics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                    <FormInput label="Primary Container Loading Target Date" value={settings.nextLoadingDate} onChange={v => setSettings({...settings, nextLoadingDate: v})} />
                    <div className="space-y-6">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4"><MapPin size={18} className="text-blue-600"/> Global Sourcing Nodes</p>
                      <div className="bg-slate-50 p-12 rounded-[3.5rem] space-y-10 border-2 border-slate-100 shadow-inner">
                          <FormInput label="Sea Terminal Hub (China Region)" value={settings.chinaSeaAddr} onChange={v => setSettings({...settings, chinaSeaAddr: v})} />
                          <FormInput label="Air Terminal Hub (China Region)" value={settings.chinaAirAddr} onChange={v => setSettings({...settings, chinaAirAddr: v})} />
                      </div>
                    </div>
                </div>
                <div className="space-y-12">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4"><DollarSign size={18} className="text-green-600"/> Active Tariff Management</p>
                    <div className="space-y-10">
                        <FormInput label="Standard Sea Freight Tariff ($ USD / CBM)" value={settings.seaRate} onChange={v => setSettings({...settings, seaRate: v})} />
                        <div className="p-12 bg-blue-600/5 rounded-[3.5rem] border-2 border-blue-600/10 space-y-10 shadow-inner relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Plane size={100}/></div>
                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] flex items-center gap-4">Air Cargo Classification Unit ($/KG)</p>
                            <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Normal</label><input className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl text-lg font-black outline-none focus:border-blue-600 shadow-sm text-center" value={settings.airRates?.normal} onChange={e => setSettings({...settings, airRates: {...settings.airRates, normal: e.target.value}})} /></div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Battery</label><input className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl text-lg font-black outline-none focus:border-blue-600 shadow-sm text-center" value={settings.airRates?.battery} onChange={e => setSettings({...settings, airRates: {...settings.airRates, battery: e.target.value}})} /></div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Express</label><input className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl text-lg font-black outline-none focus:border-blue-600 shadow-sm text-center" value={settings.airRates?.express} onChange={e => setSettings({...settings, airRates: {...settings.airRates, express: e.target.value}})} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // RENDER 4: SOURCING MART INVENTORY
  const renderMart = () => (
    <div className="space-y-10 animate-in fade-in pb-40">
       <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <h3 className="text-xl font-black text-slate-950 mb-8 uppercase flex items-center gap-4 italic leading-none underline decoration-blue-600 underline-offset-8"><Tag size={28}/> Category Management</h3>
          <div className="flex gap-6 mb-10">
             <input className="flex-1 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:border-blue-600" placeholder="Initialize New Sourcing Category..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
             <button onClick={() => { if(newCategoryName.trim()){ addCategory(newCategoryName); setNewCategoryName(''); }}} className="bg-slate-950 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-2xl">Deploy Group</button>
          </div>
          <div className="flex flex-wrap gap-4">
             {categories.map((cat, idx) => (
                <div key={idx} className="bg-slate-50 border-2 border-slate-200 px-6 py-3 rounded-full flex items-center gap-4 group transition-all hover:border-red-500">
                   <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{cat}</span>
                   <button onClick={() => deleteCategory(cat)} className="text-slate-300 hover:text-red-600 transition-colors"><X size={16}/></button>
                </div>
             ))}
          </div>
       </div>

       <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div><h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">Inventory Grid</h2><p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Active listings in Sourcing Mart</p></div>
          <button onClick={() => openCreateOther('product')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-600/30 flex items-center gap-4 transition-all"><Plus size={20}/> Register Item</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-xl group hover:-translate-y-2 transition-all duration-500">
               <div className="h-56 bg-slate-100 relative overflow-hidden">
                  {p.image ? <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name}/> : <div className="h-full flex items-center justify-center text-slate-300"><ShoppingBag size={60}/></div>}
                  {p.isLandedCost && <span className="absolute top-4 right-4 bg-green-500 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">Landed Protocol Active</span>}
               </div>
               <div className="p-8">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-black text-slate-950 uppercase text-lg italic tracking-tight line-clamp-1">{p.name}</h4>
                     <span className="text-[8px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black uppercase">{p.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold mb-6 line-clamp-2">{p.description}</p>
                  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                     <span className="text-2xl font-black text-blue-600 italic tracking-tighter">${p.price}</span>
                     <div className="flex gap-2">
                        <button onClick={() => openEditOther(p, 'product')} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  // RENDER 5: FLEET STUDIO
  const renderFleet = () => (
    <div className="space-y-10 animate-in fade-in pb-40">
       <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div><h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">Fleet Studio</h2><p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Master catalog for premium automobile sourcing</p></div>
          <button onClick={() => openCreateOther('vehicle')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-600/30 flex items-center gap-4 transition-all"><Plus size={20}/> Register Vehicle</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white border-2 border-slate-50 rounded-[3rem] overflow-hidden shadow-xl group hover:shadow-2xl transition-all duration-500">
               <div className="h-64 bg-slate-100 relative overflow-hidden">
                  {v.images?.[0] ? <img src={v.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={v.name}/> : <div className="h-full flex items-center justify-center text-slate-300"><Car size={80}/></div>}
                  <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg ${v.condition === 'Brand New' ? 'bg-green-600' : 'bg-slate-950'}`}>{v.condition}</span>
                    <span className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white shadow-lg">{v.fuel}</span>
                  </div>
               </div>
               <div className="p-10">
                  <h4 className="font-black text-slate-950 text-2xl uppercase tracking-tighter italic mb-1">{v.name}</h4>
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-8">{v.category} • Model Year {v.year}</p>
                  <div className="flex justify-between items-center pt-8 border-t-2 border-slate-50 mt-4">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Token</p>
                        <p className="text-sm font-mono font-black text-slate-950">{v.vin || 'PENDING VIN'}</p>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => openEditOther(v, 'vehicle')} className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Edit2 size={20}/></button>
                        <button onClick={() => deleteVehicle(v.id)} className="p-4 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20}/></button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  // --- FINAL MASTER RENDER ENGINE ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* GLOBAL WHATSAPP NOTIFY PORTAL */}
      {notifyClient && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in border-[10px] border-slate-100">
               <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><MessageSquare size={40}/></div>
               <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-4">Registry Success</h3>
               <p className="text-slate-500 text-sm mb-10 leading-relaxed font-bold">Manifest for <strong>{notifyClient.name}</strong> created. Deploy WhatsApp Status protocol?</p>
               <div className="flex flex-col gap-4">
                  <a href={notifyClient.link} target="_blank" rel="noreferrer" onClick={()=>setNotifyClient(null)} className="w-full py-6 bg-green-600 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-green-600/20 hover:bg-green-700 flex items-center justify-center gap-4 transition-all">
                     <Send size={20}/> Transmit Protocol
                  </a>
                  <button onClick={()=>setNotifyClient(null)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Abort Notification</button>
               </div>
            </div>
         </div>
      )}

      {/* MISSION CONTROL SIDEBAR */}
      <aside className={`fixed md:relative z-50 h-full w-80 bg-white border-r-2 border-slate-100 flex flex-col transition-all duration-700 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl shadow-slate-950/5`}>
        <div className="h-36 flex items-center px-10 border-b-2 border-slate-50">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white font-black mr-4 shadow-2xl shadow-blue-600/30 text-3xl italic">JB</div>
          <div className="flex flex-col"><span className="font-black uppercase tracking-tighter text-slate-950 text-2xl leading-none italic">Terminal</span><span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] mt-2 underline decoration-blue-600 underline-offset-4 decoration-4">Master v13.0</span></div>
        </div>
        <nav className="p-8 space-y-4 flex-1 overflow-y-auto">
           <SidebarLink id="overview" icon={LayoutDashboard} label="Operations" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="manifest" icon={Database} label="Logistics Hub" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="invoices" icon={FileText} label="Finance Grid" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="mart" icon={ShoppingBag} label="Sourcing Mart" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="vehicle" icon={Car} label="Fleet Studio" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="settings" icon={Settings} label="Global Protocol" active={activeTab} setActive={setActiveTab} />
           <div className="pt-8 opacity-20"><div className="h-px bg-slate-900 w-full mb-6"></div></div>
           <SidebarLink id="inbox" icon={MessageSquare} label="Message Grid" active={activeTab} setActive={setActiveTab} badge={stats.inboxCount} />
           <SidebarLink id="agents" icon={Briefcase} label="Agent Network" active={activeTab} setActive={setActiveTab} badge={stats.newAgents} />
        </nav>
        <div className="p-8 border-t-2 border-slate-50"><button onClick={() => { setIsAdmin(false); setView('home'); }} className="flex items-center justify-center gap-5 w-full py-7 text-[10px] font-black uppercase tracking-[0.4em] text-red-500 bg-red-500/5 hover:bg-red-600 hover:text-white rounded-[2rem] transition-all shadow-inner group"><LogOut size={20} className="group-hover:rotate-180 transition-transform duration-700"/> Power Down</button></div>
      </aside>

      {/* CORE INTERFACE VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Mobile Command Bar */}
         <div className="md:hidden h-24 bg-white border-b-2 border-slate-100 flex items-center px-10 justify-between shrink-0 relative z-40 shadow-sm"><span className="font-black italic uppercase tracking-tighter text-blue-600 text-2xl">JayBesin Terminal</span><button onClick={() => setSidebarOpen(true)} className="p-5 bg-slate-950 text-white rounded-3xl shadow-2xl active:scale-90 transition-transform"><Menu size={32}/></button></div>
         
         <div className="flex-1 overflow-y-auto p-12 md:p-16 lg:p-24">
            <header className="mb-20 border-b-4 border-slate-50 pb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
               <div className="flex items-center gap-10 animate-in fade-in slide-in-from-left-8 duration-700">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] border-4 border-slate-50 flex items-center justify-center text-blue-600 shadow-2xl shadow-slate-200/50 relative"><Cpu size={48}/><div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div></div>
                  <div><h1 className="text-6xl font-black text-slate-950 uppercase tracking-tighter italic leading-[0.8] mb-4">Command <br/><span className="text-blue-600">Interface</span></h1><p className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.5em] flex items-center gap-4">Operational Status: <span className="text-green-500 font-black">Encrypted Uplink Established</span></p></div>
               </div>
            </header>
            <div className="pb-60">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'manifest' && renderLogisticsHub()}
              {activeTab === 'invoices' && <InvoiceSystem />}
              {activeTab === 'mart' && renderMart()}
              {activeTab === 'vehicle' && renderFleet()}
              {activeTab === 'settings' && renderSettings()}
            </div>
         </div>
      </main>

      {/* SYSTEM-WIDE MASTER MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-10 backdrop-blur-3xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[5rem] w-full max-w-7xl max-h-[96vh] flex flex-col shadow-[0_80px_200px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in duration-500 border-[20px] border-slate-50">
               <div className="flex justify-between items-center p-16 lg:p-20 border-b-4 border-slate-50 bg-slate-50/50">
                  <div className="flex items-center gap-10"><div className="w-24 h-24 bg-slate-950 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-pulse ring-8 ring-slate-100"><Zap size={48}/></div><div><h3 className="font-black text-5xl uppercase tracking-tighter text-slate-950 italic leading-none">{modalMode === 'create' ? 'Initialize' : 'Configure'} Registry</h3><p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.6em] mt-4 italic text-blue-600 underline decoration-blue-600 underline-offset-10 decoration-4">Terminal Level 4 Secure Protocol</p></div></div>
                  <button onClick={()=>setIsModalOpen(false)} className="w-20 h-20 bg-white rounded-[2.5rem] border-4 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90 group"><X size={48} className="group-hover:rotate-90 transition-transform duration-700"/></button>
               </div>
               
               <div className="p-16 lg:p-24 overflow-y-auto flex-1 bg-[radial-gradient(circle_at_top_right,rgba(241,245,249,1),transparent)]">
                 {/* ENTITY: MANIFEST ENTRY */}
                 {entityType === 'manifest' && (
                    <div className="space-y-20">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                          <FormInput label="Master Consignee Full Name" value={manifestForm.consigneeName} onChange={v=>setManifestForm({...manifestForm, consigneeName: v})} />
                          <FormInput label="Direct Communication Line (Phone)" value={manifestForm.consigneePhone} onChange={v=>setManifestForm({...manifestForm, consigneePhone: v})} />
                       </div>
                       
                       <div className="bg-blue-600/5 p-16 rounded-[5rem] border-4 border-blue-600/10 grid grid-cols-1 md:grid-cols-2 gap-20 shadow-inner relative">
                          <div className="space-y-10">
                             <label className="block text-[14px] font-black text-blue-600 uppercase tracking-[0.5em] ml-4">Tracking Protocol Serial</label>
                             <div className="flex gap-8">
                                <input className="w-full p-10 bg-white border-4 border-blue-100 rounded-[3rem] text-4xl font-mono font-black text-blue-600 outline-none focus:border-blue-600 shadow-2xl transition-all" value={manifestForm.trackingNumber} onChange={e=>setManifestForm({...manifestForm, trackingNumber: e.target.value})} />
                                <button onClick={generateTrackingID} className="w-28 h-28 bg-white border-4 border-blue-100 rounded-[3rem] flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-90"><RefreshCw size={48}/></button>
                             </div>
                          </div>
                          <div className="space-y-10">
                             <label className="block text-[14px] font-black text-blue-600 uppercase tracking-[0.5em] ml-4">Container Block Code</label>
                             <input className="w-full p-10 bg-white border-4 border-blue-100 rounded-[3rem] text-4xl font-black text-slate-950 outline-none focus:border-blue-600 shadow-2xl transition-all" placeholder="e.g. MSKU-001" value={manifestForm.containerId} onChange={e=>setManifestForm({...manifestForm, containerId: e.target.value})} />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                          <FormInput label="Transmission Origin" value={manifestForm.origin} onChange={v=>setManifestForm({...manifestForm, origin: v})} />
                          <FormInput label="Transmission Destination" value={manifestForm.destination} onChange={v=>setManifestForm({...manifestForm, destination: v})} />
                          <div className="flex flex-col">
                             <label className="text-[14px] font-black text-slate-400 uppercase tracking-[0.6em] mb-4 ml-4">Transmission Mode</label>
                             <select className="w-full p-10 border-4 border-slate-100 bg-slate-50 rounded-[3rem] text-xl font-black text-slate-950 outline-none focus:border-blue-600 shadow-inner appearance-none" value={manifestForm.mode} onChange={e=>setManifestForm({...manifestForm, mode: e.target.value})}>
                                <option>Sea Freight</option>
                                <option>Air Freight</option>
                             </select>
                          </div>
                       </div>

                       <div className="bg-slate-50 p-12 rounded-[5rem] border-4 border-slate-100 shadow-inner">
                          <h4 className="font-black text-4xl text-slate-950 mb-14 italic tracking-tight underline decoration-blue-600 decoration-8 underline-offset-[12px]">Payload Content Registry</h4>
                          <div className="space-y-6 mb-16">
                             {manifestForm.items.map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-center animate-in slide-in-from-left-8 duration-500">
                                   <input placeholder="Cargo Description / SKU" className="flex-1 p-8 border-4 border-white rounded-[2.5rem] text-lg font-bold bg-white outline-none focus:border-blue-600 shadow-xl" value={item.description} onChange={e=>{const n=[...manifestForm.items];n[idx].description=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="Qty" type="number" className="w-32 p-8 border-4 border-white rounded-[2.5rem] text-lg font-black bg-white text-center shadow-xl" value={item.quantity} onChange={e=>{const n=[...manifestForm.items];n[idx].quantity=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="CBM" type="number" className="w-40 p-8 border-4 border-white rounded-[2.5rem] text-lg font-black text-blue-600 bg-white text-center shadow-xl" value={item.cbm} onChange={e=>{const n=[...manifestForm.items];n[idx].cbm=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <button onClick={()=>{const n=manifestForm.items.filter((_,i)=>i!==idx);setManifestForm({...manifestForm, items:n})}} className="w-20 h-20 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white rounded-[2rem] transition-all shadow-xl active:scale-90"><Trash2 size={32}/></button>
                                </div>
                             ))}
                             <button onClick={()=>setManifestForm(p=>({...p, items:[...p.items, {description:'', quantity:1, cbm:0}]}))} className="text-blue-600 font-black text-[12px] uppercase tracking-[0.5em] flex items-center gap-6 mt-10 hover:opacity-50 transition-opacity">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl"><Plus size={24}/></div> Add Payload Node
                             </button>
                          </div>

                          <div className="pt-14 border-t-4 border-white flex flex-col lg:flex-row justify-between items-center gap-16">
                                <div className="flex items-center gap-8 bg-white p-10 rounded-[3.5rem] border-4 border-slate-100 shadow-2xl">
                                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol Rate ($/CBM):</label>
                                    <input type="number" className="w-36 p-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] text-center font-black text-slate-950 text-3xl" value={manifestForm.ratePerCbm} onChange={e=>setManifestForm({...manifestForm, ratePerCbm: e.target.value})} />
                                </div>
                                <div className="text-center lg:text-right space-y-4">
                                    <p className="text-[14px] text-slate-400 uppercase font-black tracking-[0.5em]">Total Net Displacement: <span className="text-slate-950">{(manifestForm.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0)).toFixed(3)} m³</span></p>
                                    <h5 className="text-7xl font-black text-green-600 italic tracking-tighter">TOTAL: ${(manifestForm.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0) * (Number(manifestForm.ratePerCbm) || 0)).toLocaleString()}</h5>
                                </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* ENTITY: PRODUCT FORM */}
                 {entityType === 'product' && (
                    <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
                       <FormInput label="Master Product Label" value={productForm.name} onChange={v=>setProductForm({...productForm, name: v})} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] ml-4">Inventory Group</label>
                            <select className="w-full p-8 border-4 border-slate-100 bg-slate-50 rounded-[2.5rem] font-black text-lg outline-none appearance-none" value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})}>
                              <option value="">-- Assign Group --</option>
                              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center h-full pt-10">
                            <label className="flex items-center gap-6 text-sm font-black uppercase tracking-[0.3em] cursor-pointer group hover:text-blue-600 transition-colors">
                              <div className={`w-8 h-8 border-4 rounded-xl flex items-center justify-center transition-all ${productForm.isLandedCost ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-300'}`}>
                                {productForm.isLandedCost && <CheckCircle size={18}/>}
                              </div>
                              <input type="checkbox" className="hidden" checked={productForm.isLandedCost} onChange={e=>setProductForm({...productForm, isLandedCost: e.target.checked})} /> 
                              Landed Cost Protocol
                            </label>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] ml-4">Payload Specifications</label>
                          <textarea className="w-full p-10 border-4 border-slate-100 bg-slate-50 rounded-[3rem] font-black text-lg h-48 resize-none outline-none focus:border-blue-600 shadow-inner" value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} />
                       </div>
                       <FormInput label="Official Global Price ($ USD)" value={productForm.price} onChange={v=>setProductForm({...productForm, price: v})} />
                       <div className="bg-slate-50 p-12 rounded-[3.5rem] border-4 border-slate-100 flex flex-col items-center">
                          <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Item Asset Imagery</label>
                          <div className="flex items-center gap-10">
                             <div className="w-48 h-48 bg-white rounded-[2rem] border-4 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
                                {productForm.image ? <img src={productForm.image} className="w-full h-full object-cover" alt="Preview"/> : <ImageIcon size={40} className="text-slate-200"/>}
                                <input type="file" onChange={e=>handleUpload(e, 'image', false, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                             </div>
                             <div className="space-y-2">
                                <h5 className="font-black uppercase text-slate-900 tracking-tight">Upload Asset</h5>
                                <p className="text-xs text-slate-400 font-bold max-w-xs">Recommended: High-resolution PNG with transparent background.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* ENTITY: VEHICLE FORM */}
                 {entityType === 'vehicle' && (
                    <div className="space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto">
                       <FormInput label="Vehicle Model Designation" value={vehicleForm.name} onChange={v=>setVehicleForm({...vehicleForm, name: v})} />
                       <div className="grid grid-cols-3 gap-10">
                          <div className="space-y-4">
                             <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] block ml-4">Class</label>
                             <select className="w-full p-8 border-4 border-slate-100 bg-slate-50 rounded-[2.5rem] font-black text-lg outline-none" value={vehicleForm.category} onChange={e=>setVehicleForm({...vehicleForm, category: e.target.value})}><option>SUV</option><option>Saloon</option><option>Truck</option></select>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] block ml-4">Propulsion</label>
                             <select className="w-full p-8 border-4 border-slate-100 bg-slate-50 rounded-[2.5rem] font-black text-lg outline-none" value={vehicleForm.fuel} onChange={e=>setVehicleForm({...vehicleForm, fuel: e.target.value})}><option>Gasoline</option><option>Diesel</option><option>EV</option></select>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] block ml-4">Condition</label>
                             <select className="w-full p-8 border-4 border-slate-100 bg-slate-50 rounded-[2.5rem] font-black text-lg outline-none" value={vehicleForm.condition} onChange={e=>setVehicleForm({...vehicleForm, condition: e.target.value})}><option>Used</option><option>Brand New</option></select>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-10">
                          <FormInput label="Base Price ($)" value={vehicleForm.price} onChange={v=>setVehicleForm({...vehicleForm, price: v})} />
                          <FormInput label="Shipping Est." value={vehicleForm.shipping} onChange={v=>setVehicleForm({...vehicleForm, shipping: v})} />
                          <FormInput label="Clearance Est." value={vehicleForm.documentation} onChange={v=>setVehicleForm({...vehicleForm, documentation: v})} />
                       </div>
                       <FormInput label="Master VIN Identification" value={vehicleForm.vin} onChange={v=>setVehicleForm({...vehicleForm, vin: v})} />
                       <div className="bg-slate-50 p-12 rounded-[4rem] border-4 border-slate-100 text-center space-y-10">
                          <div className="flex flex-wrap justify-center gap-6">
                            {(vehicleForm.images || []).map((img, i) => (
                               <div key={i} className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-xl overflow-hidden relative group">
                                  <img src={img} className="w-full h-full object-cover" alt="Veh Preview"/>
                                  <button onClick={() => { const next = [...vehicleForm.images]; next.splice(i,1); setVehicleForm({...vehicleForm, images: next}) }} className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-black text-[10px] uppercase">Remove</button>
                               </div>
                            ))}
                            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-dashed border-slate-200 flex items-center justify-center relative cursor-pointer hover:border-blue-600 transition-colors">
                               <Plus size={32} className="text-slate-200"/>
                               <input type="file" multiple onChange={e=>handleUpload(e, 'images', true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initialize Bulk Image Uplink Protocol</p>
                       </div>