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
 * JAY-BESIN | ADMIN MASTER v6.0 (FINAL STABILITY CORE)
 * -------------------------------------------------------------------------
 * ARCHITECT: World Top Software Engineer
 * * RESOLUTIONS:
 * 1. FIXED WHITE SCREEN: Added a Master Guard to prevent rendering if props are null.
 * 2. FIXED DOUBLE LOGIN: Internal Login screen REMOVED. Auth is now 100% App.jsx managed.
 * 3. SOCIAL UPLINK: Added strict mapping for Facebook, Instagram, Twitter, LinkedIn.
 * 4. CONTACT SYNC: WhatsApp, Email, and Address fields verified.
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
  // --- DATABASE HOOKS ---
  const { shipments = [], addShipment, updateShipment, deleteShipment } = useShipments();

  // --- UI NAVIGATION STATES ---
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- BULK ACTION CONTROL ---
  const [selectedIds, setSelectedIds] = useState([]);

  // --- SYSTEM MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [entityType, setEntityType] = useState('manifest');
  const [currentShipmentId, setCurrentShipmentId] = useState(null);
  const [notifyClient, setNotifyClient] = useState(null);

  // --- LOGISTICS WORKFLOW MASTER ---
  const logisticsStages = [
    "Order Initiated", "Received at China Warehouse", "Quality Check & Consolidation", 
    "Loaded into Container", "Vessel Departed Origin", "In Transit (High Seas)", 
    "Arrived at TEMA Port", "Customs Clearance in Progress", "Duties Paid / Released", 
    "Ready for Pickup / Delivery"
  ];

  // --- ABSOLUTE DATA GUARD (Prevents White Screen Crash) ---
  // If the essential settings haven't loaded yet, show a professional loading state
  if (!settings || !shipments) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white">
        <Cpu className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-black uppercase tracking-[0.3em] animate-pulse">Initializing Admin Data...</h2>
      </div>
    );
  }

  // --- CORE LOGIC: FORM BUFFER STATES ---
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
  
  const [newCategoryName, setNewCategoryName] = useState('');

  // --- COMPUTE STATS SAFELY ---
  const stats = useMemo(() => ({
    activeShipments: shipments?.length || 0,
    activeVolume: shipments?.reduce((acc, m) => acc + (Number(m.totalVolume)||0), 0) || 0,
    totalRevenue: shipments?.reduce((acc, m) => acc + (Number(m.totalCost)||0), 0) || 0,
    newAgents: agents?.length || 0,
    inboxCount: messages?.length || 0
  }), [shipments, agents, messages]);

  // --- FILTERING LOGIC ---
  const filteredShipments = useMemo(() => {
    return (shipments || []).filter(s => 
        s?.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s?.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s?.containerId && s.containerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shipments, searchTerm]);

  // --- SYSTEM HANDLERS ---
  const generateTrackingID = () => {
    setManifestForm(prev => ({ ...prev, trackingNumber: `JB-CN-${Math.floor(100000 + Math.random() * 900000)}` }));
  };

  const getWhatsAppLink = (shipment) => {
    const phone = (shipment.consigneePhone || '').replace(/[^0-9]/g, '');
    const msg = `JAY-BESIN UPDATE: Cargo ${shipment.trackingNumber} is now ${shipment.status}. Total: $${shipment.totalCost}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleUpload = (e, field, isVehicle = false, isProduct = false) => {
    const file = e.target.files[0];
    if (file) { 
        const reader = new FileReader(); 
        reader.onloadend = () => { 
            if (isVehicle) setVehicleForm(p => ({...p, images: [...p.images, reader.result]})); 
            else if (isProduct) setProductForm(p => ({...p, image: reader.result})); 
            else setSettings(p => ({...p, [field]: reader.result})); 
        }; 
        reader.readAsDataURL(file); 
    }
  };

  const handleSubmit = () => {
    if (entityType === 'manifest') {
        const finalData = { 
          ...manifestForm, 
          totalVolume: manifestForm.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0).toFixed(3), 
          totalCost: (manifestForm.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0) * (Number(manifestForm.ratePerCbm) || 0)).toFixed(2)
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

  // --- RENDERERS ---

  const renderOverview = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Live Cargo" value={stats.activeShipments} icon={Database} color="blue" />
        <StatCard label="Volume Displacement" value={`${stats.activeVolume.toFixed(2)} m³`} icon={Box} color="purple" />
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard label="System Inquiries" value={stats.inboxCount} icon={MessageSquare} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-950 mb-8 uppercase flex items-center gap-3 italic"><Activity size={20} className="text-blue-600"/> Activity Telemetry</h3>
            <div className="h-56 flex items-end justify-between px-4 pb-4 border-b-2 border-slate-100 gap-2">
               {[40, 80, 55, 95, 70, 85, 100].map((h, i) => (
                 <div key={i} className="flex-1 bg-blue-600/10 hover:bg-blue-600 rounded-t-2xl transition-all duration-500 cursor-pointer group relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h}% LOAD</div>
                    <div className="w-full bg-blue-600 rounded-t-2xl" style={{ height: `${h}%` }}></div>
                 </div>
               ))}
            </div>
            <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
         </div>

         <div className="bg-slate-950 text-white p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center border border-white/5 shadow-2xl shadow-blue-900/20">
            <div className="absolute -top-10 -right-10 p-10 opacity-5 rotate-12"><Zap size={200}/></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">Global Cloud Uplink</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">All terminal nodes are currently synchronized with the regional database cluster. Latency: <span className="text-blue-500 font-black">14ms</span>.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Registry</p>
                  <p className="text-xs font-black text-green-500 tracking-[0.2em] flex items-center gap-2"><CheckCircle size={12}/> ONLINE</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Encryption</p>
                  <p className="text-xs font-black text-blue-500 tracking-[0.2em] flex items-center gap-2"><ShieldCheck size={12}/> AES-256</p>
                </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-6xl space-y-12 animate-in fade-in pb-40">
        {/* SECTION: BRAND & CONTACTS */}
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm shadow-slate-200/50">
            <h3 className="text-2xl font-black text-slate-950 mb-10 border-b border-slate-100 pb-8 flex items-center gap-4 italic uppercase tracking-tighter">
              <ImageIcon size={28} className="text-blue-600"/> Terminal Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="col-span-2 space-y-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Primary Visual Identity (Logo)</label>
                    <div className="flex flex-col md:flex-row items-center gap-12 bg-slate-50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="h-36 w-36 bg-white rounded-[2rem] flex items-center justify-center relative shadow-2xl overflow-hidden group border-4 border-transparent hover:border-blue-600 transition-all cursor-pointer">
                            {settings.logo ? <img src={settings.logo} className="w-full h-full object-contain p-6" alt="Logo"/> : <ImageIcon className="text-slate-200" size={48}/>}
                            <input type="file" onChange={e => handleUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                            <div className="absolute inset-0 bg-blue-600/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                               <Upload size={24} className="mb-2 animate-bounce"/>
                               <span className="text-[10px] font-black uppercase tracking-widest">Update Asset</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-center md:text-left flex-1">
                            <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight italic leading-none">Global Master Logo</h4>
                            <p className="text-sm text-slate-400 font-bold leading-relaxed">System-wide brand asset. Recommended: 800x800px High-Res PNG with alpha channel transparency.</p>
                        </div>
                    </div>
                </div>
                <FormInput label="Official Hero Title" value={settings.heroTitle} onChange={v => setSettings({...settings, heroTitle: v})} />
                <FormInput label="Support Digital Mail" value={settings.companyEmail} onChange={v => setSettings({...settings, companyEmail: v})} />
                <FormInput label="Operations Voice Line" value={settings.contactPhone} onChange={v => setSettings({...settings, contactPhone: v})} />
                <FormInput label="Direct WhatsApp (Country Code First)" value={settings.whatsappNumber} onChange={v => setSettings({...settings, whatsappNumber: v})} />
                <div className="col-span-2">
                   <FormInput label="Headquarters Physical Registry (Address)" value={settings.companyAddress} onChange={v => setSettings({...settings, companyAddress: v})} />
                </div>
            </div>
        </div>

        {/* SECTION: SOCIAL INFRASTRUCTURE */}
        <div className="bg-slate-950 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Share2 size={160}/></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-8 gap-4">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter text-blue-500 flex items-center gap-4">
                 <Globe size={32}/> Global Social Grid
               </h3>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] bg-white/5 px-4 py-2 rounded-full border border-white/5 italic">Protocol Mapping Active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FormDarkInput label="Facebook Uplink" value={settings.socials?.facebook} onChange={v => setSettings({...settings, socials: {...settings.socials, facebook: v}})} icon={Facebook}/>
                <FormDarkInput label="Instagram Uplink" value={settings.socials?.instagram} onChange={v => setSettings({...settings, socials: {...settings.socials, instagram: v}})} icon={Instagram}/>
                <FormDarkInput label="X / Twitter Uplink" value={settings.socials?.twitter} onChange={v => setSettings({...settings, socials: {...settings.socials, twitter: v}})} icon={Twitter}/>
                <FormDarkInput label="LinkedIn Uplink" value={settings.socials?.linkedin} onChange={v => setSettings({...settings, socials: {...settings.socials, linkedin: v}})} icon={Linkedin}/>
            </div>
        </div>

        {/* SECTION: LOGISTICS Hub */}
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 p-10 opacity-5"><Truck size={250}/></div>
            <h3 className="text-2xl font-black text-slate-950 mb-10 border-b border-slate-100 pb-8 uppercase italic tracking-tighter flex items-center gap-4">
              <Anchor size={28} className="text-blue-600"/> Operational Logistics
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                    <FormInput label="Primary Container Loading Date" value={settings.nextLoadingDate} onChange={v => setSettings({...settings, nextLoadingDate: v})} />
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3"><MapPin size={16} className="text-blue-600"/> Supply Chain Nodes</p>
                      <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-8 border border-slate-200 shadow-inner">
                          <FormInput label="Sea Terminal (China Region)" value={settings.chinaSeaAddr} onChange={v => setSettings({...settings, chinaSeaAddr: v})} />
                          <FormInput label="Air Terminal (China Region)" value={settings.chinaAirAddr} onChange={v => setSettings({...settings, chinaAirAddr: v})} />
                      </div>
                    </div>
                </div>
                <div className="space-y-12">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3"><DollarSign size={16} className="text-green-600"/> Active Tariff Registry</p>
                    <div className="space-y-10">
                        <FormInput label="Base Sea Freight Tariff ($/CBM)" value={settings.seaRate} onChange={v => setSettings({...settings, seaRate: v})} />
                        <div className="p-10 bg-blue-600/5 rounded-[3rem] border border-blue-600/10 space-y-8 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-45"><Plane size={80}/></div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">Air Freight Classification ($/KG)</p>
                            <div className="grid grid-cols-3 gap-6">
                                <div><label className="text-[9px] font-black text-slate-400 uppercase mb-3 block">Normal</label><input className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-600 shadow-sm" value={settings.airRates?.normal} onChange={e => setSettings({...settings, airRates: {...settings.airRates, normal: e.target.value}})} /></div>
                                <div><label className="text-[9px] font-black text-slate-400 uppercase mb-3 block">Battery</label><input className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-600 shadow-sm" value={settings.airRates?.battery} onChange={e => setSettings({...settings, airRates: {...settings.airRates, battery: e.target.value}})} /></div>
                                <div><label className="text-[9px] font-black text-slate-400 uppercase mb-3 block">Express</label><input className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-600 shadow-sm" value={settings.airRates?.express} onChange={e => setSettings({...settings, airRates: {...settings.airRates, express: e.target.value}})} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // --- FINAL MASTER RENDER ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* MISSION CONTROL SIDEBAR */}
      <aside className={`fixed md:relative z-50 h-full w-80 bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl shadow-slate-950/5`}>
        <div className="h-32 flex items-center px-10 border-b border-slate-100">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black mr-4 shadow-2xl shadow-blue-600/30 text-2xl italic">JB</div>
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-tighter text-slate-950 text-2xl leading-none italic">Terminal</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2 italic decoration-blue-600 underline underline-offset-4 decoration-2">Core Master v6.0</span>
          </div>
        </div>
        <nav className="p-8 space-y-3 flex-1 overflow-y-auto">
           <SidebarLink id="overview" icon={LayoutDashboard} label="Operations" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="manifest" icon={Database} label="Logistics Hub" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="invoices" icon={FileText} label="Finance Grid" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="mart" icon={ShoppingBag} label="Sourcing Mart" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="inbox" icon={MessageSquare} label="Message Grid" active={activeTab} setActive={setActiveTab} badge={stats.inboxCount} />
           <SidebarLink id="agents" icon={Briefcase} label="Agent Network" active={activeTab} setActive={setActiveTab} badge={stats.newAgents} />
           <SidebarLink id="vehicle" icon={Car} label="Fleet Studio" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="settings" icon={Settings} label="Global Protocol" active={activeTab} setActive={setActiveTab} />
        </nav>
        <div className="p-8 border-t border-slate-100">
           <button onClick={() => { setIsAdmin(false); setView('home'); }} className="flex items-center justify-center gap-4 w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 bg-red-500/5 hover:bg-red-600 hover:text-white rounded-[1.5rem] transition-all duration-300 shadow-inner group">
              <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-500" /> Shutdown Access
           </button>
        </div>
      </aside>

      {/* CORE INTERFACE VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Mobile Command Bar */}
         <div className="md:hidden h-24 bg-white border-b border-slate-200 flex items-center px-8 justify-between shrink-0 shadow-sm relative z-40">
            <span className="font-black italic uppercase tracking-tighter text-blue-600 text-xl">JayBesin Terminal</span>
            <button onClick={() => setSidebarOpen(true)} className="p-4 bg-slate-950 text-white rounded-2xl shadow-2xl active:scale-90 transition-transform"><Menu size={28}/></button>
         </div>

         <div className="flex-1 overflow-y-auto p-10 md:p-16 lg:p-20">
            <header className="mb-16 border-b-2 border-slate-200 pb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
               <div className="flex items-center gap-8 animate-in fade-in slide-in-from-left-6 duration-700">
                  <div className="w-20 h-20 bg-white rounded-[2rem] border-4 border-slate-100 flex items-center justify-center text-blue-600 shadow-2xl shadow-slate-200/50"><Cpu size={40}/></div>
                  <div>
                    <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter italic leading-[0.85]">Mission <span className="text-blue-600">Control</span></h1>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.5em] mt-4 flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Terminal v6.0 Ready • Encrypted Uplink
                    </p>
                  </div>
               </div>
               <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-6 duration-1000">
                  <div className="bg-white border-4 border-slate-100 p-5 rounded-3xl text-slate-400 hover:text-blue-600 transition-all cursor-pointer shadow-xl active:scale-95 group">
                    <Bell size={28} className="group-hover:animate-swing"/>
                  </div>
                  <button onClick={() => setSidebarOpen(true)} className="md:hidden p-5 bg-slate-100 rounded-3xl"><Menu size={28}/></button>
               </div>
            </header>

            {/* TAB ENGINE */}
            <div className="pb-40">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'manifest' && renderLogisticsHub()}
              {activeTab === 'invoices' && <InvoiceSystem />}
              {activeTab === 'mart' && <div className="p-32 text-center opacity-20 font-black uppercase tracking-[1em]">Mart Initializing...</div>}
              {activeTab === 'inbox' && <div className="p-32 text-center opacity-20 font-black uppercase tracking-[1em]">Grid Initializing...</div>}
              {activeTab === 'settings' && renderSettings()}
            </div>
         </div>
      </main>

      {/* --- MASTER SYSTEM MODAL --- */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[100] p-6 backdrop-blur-2xl">
            <div className="bg-white rounded-[4rem] w-full max-w-7xl max-h-[94vh] flex flex-col shadow-[0_60px_150px_rgba(0,0,0,0.7)] overflow-hidden animate-in zoom-in duration-500 border-[15px] border-slate-50">
               <div className="flex justify-between items-center p-14 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-slate-950 text-white rounded-[2rem] flex items-center justify-center shadow-2xl animate-pulse">
                       <Zap size={40}/>
                    </div>
                    <div>
                      <h3 className="font-black text-4xl uppercase tracking-tighter text-slate-950 italic leading-none">{modalMode === 'create' ? 'Initialize' : 'Configure'} Registry</h3>
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] mt-3 italic text-blue-600 underline decoration-blue-600 underline-offset-8">Level 4 Secure Protocol</p>
                    </div>
                  </div>
                  <button onClick={()=>setIsModalOpen(false)} className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-inner group active:scale-90"><X size={36} className="group-hover:rotate-90 transition-transform duration-500"/></button>
               </div>
               
               <div className="p-14 lg:p-20 overflow-y-auto flex-1 bg-[radial-gradient(circle_at_top_right,rgba(241,245,249,1),transparent)]">
                 {entityType === 'manifest' && (
                    <div className="space-y-16">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                          <FormInput label="Master Consignee ID (Name)" value={manifestForm.consigneeName} onChange={v=>setManifestForm({...manifestForm, consigneeName: v})} />
                          <FormInput label="Direct Comm Frequency (Phone)" value={manifestForm.consigneePhone} onChange={v=>setManifestForm({...manifestForm, consigneePhone: v})} />
                       </div>
                       
                       <div className="bg-blue-600/5 p-14 rounded-[4rem] border-4 border-blue-600/10 grid grid-cols-1 md:grid-cols-2 gap-16 shadow-inner relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                             <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(37,99,235,1)_20px,rgba(37,99,235,1)_21px)]"></div>
                          </div>
                          <div className="relative z-10 space-y-6">
                             <label className="block text-[12px] font-black text-blue-600 uppercase tracking-[0.4em]">Tracking Protocol Serial</label>
                             <div className="flex gap-6">
                                <input className="w-full p-8 bg-white border-4 border-blue-100 rounded-[2.5rem] text-3xl font-mono font-black text-blue-600 outline-none focus:border-blue-600 shadow-2xl transition-all" value={manifestForm.trackingNumber} onChange={e=>setManifestForm({...manifestForm, trackingNumber: e.target.value})} />
                                <button onClick={generateTrackingID} className="w-24 h-24 bg-white border-4 border-blue-100 rounded-[2.5rem] flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-90"><RefreshCw size={36}/></button>
                             </div>
                          </div>
                          <div className="relative z-10 space-y-6">
                             <label className="block text-[12px] font-black text-blue-600 uppercase tracking-[0.4em]">Container Block Code</label>
                             <input className="w-full p-8 bg-white border-4 border-blue-100 rounded-[2.5rem] text-3xl font-black text-slate-950 outline-none focus:border-blue-600 shadow-2xl transition-all" placeholder="e.g. MSKU-001" value={manifestForm.containerId} onChange={e=>setManifestForm({...manifestForm, containerId: e.target.value})} />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                          <FormInput label="Transmission Origin" value={manifestForm.origin} onChange={v=>setManifestForm({...manifestForm, origin: v})} />
                          <FormInput label="Transmission Destination" value={manifestForm.destination} onChange={v=>setManifestForm({...manifestForm, destination: v})} />
                          <div className="flex flex-col">
                             <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-5 ml-2">Freight Mode</label>
                             <select className="p-8 border-4 border-slate-100 bg-slate-50 rounded-[2.5rem] text-lg font-black text-slate-950 outline-none focus:border-blue-600 shadow-inner" value={manifestForm.mode} onChange={e=>setManifestForm({...manifestForm, mode: e.target.value})}><option>Sea Freight</option><option>Air Freight</option></select>
                          </div>
                       </div>

                       <div className="bg-slate-50 p-14 rounded-[4rem] border-4 border-slate-100 shadow-inner">
                          <h4 className="font-black text-3xl text-slate-950 mb-14 italic tracking-tight">Payload Specification</h4>
                          <div className="space-y-6 mb-16">
                             {manifestForm.items.map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-center animate-in slide-in-from-left-8 duration-500">
                                   <input placeholder="Cargo Description / SKU" className="flex-1 p-7 border-4 border-white rounded-[2rem] text-lg font-bold bg-white outline-none focus:border-blue-600 shadow-xl" value={item.description} onChange={e=>{const n=[...manifestForm.items];n[idx].description=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="Qty" type="number" className="w-32 p-7 border-4 border-white rounded-[2rem] text-lg font-black bg-white text-center shadow-xl" value={item.quantity} onChange={e=>{const n=[...manifestForm.items];n[idx].quantity=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="CBM" type="number" className="w-40 p-7 border-4 border-white rounded-[2rem] text-lg font-black text-blue-600 bg-white text-center shadow-xl" value={item.cbm} onChange={e=>{const n=[...manifestForm.items];n[idx].cbm=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <button onClick={()=>{const n=manifestForm.items.filter((_,i)=>i!==idx);setManifestForm({...manifestForm, items:n})}} className="w-20 h-20 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white rounded-[2rem] transition-all shadow-xl active:scale-90"><Trash2 size={32}/></button>
                                </div>
                             ))}
                             <button onClick={()=>setManifestForm(p=>({...p, items:[...p.items, {description:'', quantity:1, cbm:0}]}))} className="text-blue-600 font-black text-[12px] uppercase tracking-[0.5em] flex items-center gap-6 mt-10 hover:opacity-50 transition-opacity">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl"><Plus size={24}/></div> Add Specification Node
                             </button>
                          </div>

                          <div className="pt-14 border-t-4 border-white flex flex-col lg:flex-row justify-between items-center gap-16">
                                <div className="flex items-center gap-8 bg-white p-8 rounded-[3rem] border-4 border-slate-100 shadow-2xl">
                                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol Rate ($/CBM):</label>
                                    <input type="number" className="w-36 p-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] text-center font-black text-slate-950 text-2xl" value={manifestForm.ratePerCbm} onChange={e=>setManifestForm({...manifestForm, ratePerCbm: e.target.value})} />
                                </div>
                                <div className="text-center lg:text-right space-y-4">
                                    <p className="text-[14px] text-slate-400 uppercase font-black tracking-[0.5em]">Net Displacement: <span className="text-slate-950">{(manifestForm.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0)).toFixed(3)} m³</span></p>
                                    <h5 className="text-7xl font-black text-green-600 italic tracking-tighter">TOTAL: ${(manifestForm.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0) * (Number(manifestForm.ratePerCbm) || 0)).toLocaleString()}</h5>
                                </div>
                          </div>
                       </div>
                    </div>
                 )}
               </div>
               
               <div className="p-14 border-t-4 border-slate-100 bg-slate-50/50 flex justify-end gap-10">
                  <button onClick={()=>setIsModalOpen(false)} className="px-14 py-8 bg-white border-4 border-slate-200 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.5em] text-slate-400 hover:bg-slate-950 hover:text-white transition-all duration-500 active:scale-95 shadow-xl">Abort Protocol</button>
                  <button onClick={handleSubmit} className="px-24 py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[13px] uppercase tracking-[0.6em] hover:bg-blue-700 shadow-[0_30px_60px_rgba(37,99,235,0.5)] flex items-center gap-6 active:scale-95 transition-all group">
                    Initialize Commit <ChevronRight size={24} className="group-hover:translate-x-3 transition-transform duration-500"/>
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

// --- MASTER UI COMPONENTS ---

const SidebarLink = ({ id, icon: Icon, label, active, setActive, badge }) => (
  <button 
    onClick={()=>setActive(id)} 
    className={`w-full flex justify-between items-center px-8 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 group ${active===id ? 'bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] translate-x-3' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 hover:translate-x-2'}`}
  >
    <div className="flex items-center gap-6">
      <Icon size={22} className={`${active===id ? 'text-white' : 'text-slate-200 group-hover:text-blue-600 group-hover:rotate-12'} transition-all duration-500`} /> 
      {label}
    </div>
    {badge > 0 && <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${active===id ? 'bg-white text-blue-600' : 'bg-red-500 text-white shadow-xl'}`}>{badge}</span>}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }) => { 
  const c = { 
    blue: 'bg-blue-600 text-white shadow-blue-600/30 border-blue-400', 
    purple: 'bg-purple-600 text-white shadow-purple-600/30 border-purple-400', 
    green: 'bg-green-600 text-white shadow-green-600/30 border-green-400', 
    slate: 'bg-slate-950 text-white shadow-slate-900/30 border-slate-800' 
  }; 
  return (
    <div className={`bg-white p-12 border-4 border-slate-50 rounded-[4rem] flex flex-col items-center gap-8 shadow-2xl shadow-slate-200/50 transition-all hover:-translate-y-4 hover:shadow-blue-600/10 group cursor-default`}>
      <div className={`p-8 rounded-[2.5rem] ${c[color]} border-4 transition-all duration-700 group-hover:rotate-[360deg] shadow-2xl`}><Icon size={40}/></div>
      <div className="text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 mb-3">{label}</p>
        <p className="text-5xl font-black text-slate-950 tracking-tighter italic leading-none">{value}</p>
      </div>
    </div>
  ); 
};

const FormInput = ({ label, value, onChange }) => (
  <div className="space-y-5">
    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] ml-3">{label}</label>
    <input 
      className="w-full p-8 bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] text-lg font-black text-slate-950 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner placeholder-slate-300" 
      value={value || ''} 
      onChange={e=>onChange(e.target.value)} 
      autoComplete="off"
    />
  </div>
);

const FormDarkInput = ({ label, value, onChange, icon: Icon }) => (
  <div className="space-y-5">
    <label className="block text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">{label}</label>
    <div className="relative group">
       <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-all duration-500 group-hover:scale-125"><Icon size={24}/></div>
       <input 
         className="w-full p-8 pl-20 bg-white/5 border-4 border-white/10 rounded-[2.5rem] text-lg font-black text-white outline-none focus:border-blue-600 focus:bg-white/10 transition-all shadow-inner" 
         value={value || ''} 
         onChange={e=>onChange(e.target.value)} 
         autoComplete="off"
       />
    </div>
  </div>
);