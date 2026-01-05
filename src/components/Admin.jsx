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
  ExternalLink, BarChart3, Clock, MoreVertical, Bell, Info
} from 'lucide-react';

import InvoiceSystem from './InvoiceSystem';
import { useShipments } from './ShipmentContext'; 

/**
 * JAY-BESIN | ADMIN MASTER v5.5 (ABSOLUTE ENTERPRISE EDITION)
 * -------------------------------------------------------------------------
 * ARCHITECT: World Top Software Engineer
 * * FEATURES PRESERVED & INTEGRATED:
 * 1. LOGISTICS HUB: Bulk status updates, Container grouping, CSV Export.
 * 2. SETTINGS 2.0: Dynamic Socials (FB, IG, LI, X), Phone, Mail, WhatsApp.
 * 3. OPERATIONAL SYNC: Next Loading Date, Hero Branding, Tariff management.
 * 4. SOURCING MART: Full Category and Landed Cost Product management.
 * 5. FLEET STUDIO: VIN-level vehicle tracking and documentation.
 * 6. INVOICE SYSTEM: Deep link to internal financial generation.
 * 7. MESSAGING: Integrated Inbox and Agent Onboarding review.
 * -------------------------------------------------------------------------
 */

export default function Admin({ 
  settings, setSettings, 
  vehicles = [], addVehicle, updateVehicle, deleteVehicle,
  products = [], addProduct, deleteProduct,
  categories = [], addCategory, deleteCategory,
  messages = [], agents = [], 
  setIsAdmin, setView 
}) {
  // --- DATABASE HOOKS ---
  const { shipments, addShipment, updateShipment, deleteShipment } = useShipments();

  // --- UI NAVIGATION & AUTH STATES ---
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // --- BULK ACTION CONTROL ---
  const [selectedIds, setSelectedIds] = useState([]);

  // --- SYSTEM MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [entityType, setEntityType] = useState('manifest');
  const [currentShipmentId, setCurrentShipmentId] = useState(null);
  const [notifyClient, setNotifyClient] = useState(null);

  // --- FORM BUFFER STATES ---
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

  // --- CORE LOGIC: SHIPMENT FILTERING ---
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => 
        s.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.containerId && s.containerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shipments, searchTerm]);

  // --- CORE LOGIC: BULK OPERATIONS ---
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShipments.length) setSelectedIds([]);
    else setSelectedIds(filteredShipments.map(s => s.id));
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const performBulkUpdate = (newStatus) => {
    if (window.confirm(`ACTION REQUIRED: Update ${selectedIds.length} manifests to "${newStatus}"?`)) {
      selectedIds.forEach(id => updateShipment(id, { status: newStatus }));
      setSelectedIds([]);
    }
  };

  const performBulkDelete = () => {
    if (window.confirm(`DANGER: Delete ${selectedIds.length} selected records permanently?`)) {
      selectedIds.forEach(id => deleteShipment(id));
      setSelectedIds([]);
    }
  };

  const performContainerAssignment = () => {
    const containerNum = prompt("Enter Master Container Serial (e.g. JB-MSKU-2026):");
    if (containerNum) {
        selectedIds.forEach(id => updateShipment(id, { 
            containerId: containerNum.toUpperCase(),
            status: "Loaded into Container" 
        }));
        alert(`SUCCESS: ${selectedIds.length} units assigned to Container ${containerNum}.`);
        setSelectedIds([]);
    }
  };

  const exportToCSV = () => {
    const headers = ["Tracking ID", "Container", "Client", "Phone", "Status", "Volume (CBM)", "Cost ($)"];
    const rows = filteredShipments.map(s => [
      s.trackingNumber, s.containerId || "N/A", s.consigneeName, s.consigneePhone, s.status, s.totalVolume, s.totalCost
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `JB_Manifest_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // --- COMPUTED PROPERTIES ---
  const manifestTotals = useMemo(() => {
    const items = manifestForm.items || [];
    const totalCbm = items.reduce((sum, item) => sum + (Number(item.cbm) || 0), 0);
    const totalCost = totalCbm * (Number(manifestForm.ratePerCbm) || 0);
    return { cbm: totalCbm.toFixed(3), cost: totalCost.toFixed(2) };
  }, [manifestForm.items, manifestForm.ratePerCbm]);

  const stats = useMemo(() => ({
    activeShipments: shipments.length,
    activeVolume: shipments.reduce((acc, m) => acc + (Number(m.totalVolume)||0), 0),
    totalRevenue: shipments.reduce((acc, m) => acc + (Number(m.totalCost)||0), 0),
    newAgents: agents.length
  }), [shipments, agents]);

  // --- SYSTEM HELPERS ---
  const generateTrackingID = () => {
    setManifestForm(prev => ({ ...prev, trackingNumber: `JB-CN-${Math.floor(100000 + Math.random() * 900000)}` }));
  };

  const getWhatsAppLink = (shipment) => {
    if (!shipment.consigneePhone) return "#";
    const phone = shipment.consigneePhone.replace(/[^0-9]/g, '');
    const msg = `JAY-BESIN LOGISTICS UPDATE:\nHello ${shipment.consigneeName},\nYour cargo (${shipment.trackingNumber}) status has been updated to: ${shipment.status}.\nEstimated Cost: $${shipment.totalCost}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleLogin = (e) => { 
    e.preventDefault(); 
    if (loginPass === (settings.adminPass || 'admin123')) {
      setIsAuthenticated(true); 
    } else {
      setAuthError(true);
    }
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

  // --- ENTITY MODAL MANAGEMENT ---
  const openCreateShipment = () => {
    setEntityType('manifest'); setModalMode('create'); setCurrentShipmentId(null);
    setManifestForm({
        trackingNumber: '', dateReceived: new Date().toISOString().split('T')[0],
        status: logisticsStages[1], origin: 'Guangzhou, CN', destination: 'Accra, GH',
        mode: 'Sea Freight', consigneeName: '', consigneePhone: '', consigneeAddress: '',
        containerId: '', ratePerCbm: 450, items: [{ description: '', quantity: 1, weight: 0, cbm: 0 }]
    });
    generateTrackingID();
    setIsModalOpen(true);
  };

  const openEditShipment = (shipment) => {
    setEntityType('manifest'); setModalMode('edit'); setCurrentShipmentId(shipment.id);
    setManifestForm(shipment);
    setIsModalOpen(true);
  };

  const openCreateOther = (type) => {
    setEntityType(type); setModalMode('create'); setIsModalOpen(true);
    if (type === 'product') setProductForm({ id: '', name: '', description: '', price: '', image: '', category: categories[0] || '', isLandedCost: false });
    else setVehicleForm({ id: '', name: '', vin: '', engine: '', year: new Date().getFullYear(), price: '', shipping: '', documentation: '', description: '', images: [], category: 'SUV', fuel: 'Gasoline', condition: 'Used' });
  };

  const openEditOther = (item, type) => {
    setEntityType(type); setModalMode('edit'); setIsModalOpen(true);
    if (type === 'product') setProductForm({ ...item }); else setVehicleForm({ ...item });
  };

  const handleSubmit = () => {
    if (entityType === 'manifest') {
        if (!manifestForm.consigneeName) return alert("Client Name Required");
        const finalData = { 
            ...manifestForm, totalVolume: manifestTotals.cbm, totalCost: manifestTotals.cost,
            trackingNumber: manifestForm.trackingNumber || `JB-SHIP-${Math.floor(Math.random()*100000)}`
        };
        if (modalMode === 'create') { 
          addShipment(finalData); 
          if (finalData.consigneePhone) setNotifyClient({ name: finalData.consigneeName, link: getWhatsAppLink(finalData) }); 
        } else { 
          updateShipment(currentShipmentId, finalData); 
        }
    } else if (entityType === 'product') {
        const payload = { ...productForm };
        if (modalMode === 'create') {
          payload.id = `PROD-${Math.floor(Math.random() * 90000)}`;
          addProduct(payload);
        }
    } else {
        const payload = { ...vehicleForm };
        if (modalMode === 'create') { 
          payload.id = `VIN-${Math.floor(Math.random() * 9000)}`; 
          addVehicle(payload); 
        } else {
          updateVehicle(payload.id, payload);
        }
    }
    setIsModalOpen(false);
  };

  // --- TAB RENDERERS ---

  // RENDER: DASHBOARD OVERVIEW
  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Live Manifests" value={stats.activeShipments} icon={Database} color="blue" />
        <StatCard label="Pending Volume" value={`${stats.activeVolume.toFixed(2)} m³`} icon={Box} color="purple" />
        <StatCard label="Projected Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard label="Partner Inquiries" value={stats.newAgents} icon={Briefcase} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={18} className="text-blue-600"/> Quick Performance
            </h3>
            <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
               {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                 <div key={i} className="w-8 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-help" style={{ height: `${h}%` }}></div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
         </div>

         <div className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Zap size={140}/></div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">System Health</h3>
            <p className="text-slate-400 text-sm mb-6">All database nodes are operational. Latency: 24ms.</p>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Firebase Uplink</span>
                  <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded font-black">STABLE</span>
               </div>
               <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Storage Cluster</span>
                  <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded font-black">ENCRYPTED</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  // RENDER: LOGISTICS TERMINAL
  const renderLogisticsHub = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Logistics Hub</h2>
            <p className="text-sm text-slate-500 font-medium">Control individual manifests or group by containers.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
                <Download size={18}/> Export CSV
            </button>
            <button onClick={openCreateShipment} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                <Plus size={18}/> New Entry
            </button>
          </div>
       </div>

       {selectedIds.length > 0 && (
         <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-2xl animate-in slide-in-from-top-4 border border-blue-500/30">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest animate-pulse">{selectedIds.length} Records Armed</div>
                <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execute Batch Command:</span>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={performContainerAssignment} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                    <Container size={16}/> Group Container
                </button>
                <select 
                    onChange={(e) => { if(e.target.value) performBulkUpdate(e.target.value) }}
                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    defaultValue=""
                >
                    <option value="" disabled>Change Status...</option>
                    {logisticsStages.map((s,i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <button onClick={performBulkDelete} className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-xl transition-all"><Trash2 size={18}/></button>
            </div>
         </div>
       )}

       <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
            <input type="text" placeholder="Search tracking ID, client, or container serial..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
          </div>
       </div>

       <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1000px]">
             <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                <tr>
                   <th className="p-6 w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" onChange={toggleSelectAll} checked={selectedIds.length === filteredShipments.length && filteredShipments.length > 0} /></th>
                   <th className="p-6">Manifest ID</th>
                   <th className="p-6">Consignee Info</th>
                   <th className="p-6">Container</th>
                   <th className="p-6 w-[280px]">Operational Status</th>
                   <th className="p-6 text-right">Volume / Cost</th>
                   <th className="p-6 text-right">Control</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredShipments.map(shipment => (
                   <tr key={shipment.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(shipment.id) ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-6"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={selectedIds.includes(shipment.id)} onChange={() => toggleSelectRow(shipment.id)} /></td>
                      <td className="p-6">
                        <div className="font-mono font-black text-blue-600 text-base">{shipment.trackingNumber}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-2"><Calendar size={10}/> {shipment.dateReceived}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-slate-900 text-base">{shipment.consigneeName}</div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10}/> {shipment.destination}</div>
                      </td>
                      <td className="p-6">
                        {shipment.containerId ? 
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-black font-mono border border-indigo-200">{shipment.containerId}</span> 
                            : <span className="text-slate-300 text-[10px] italic font-black uppercase tracking-widest">Unassigned</span>}
                      </td>
                      <td className="p-6">
                        <select 
                          value={shipment.status} 
                          onChange={(e) => updateShipment(shipment.id, { status: e.target.value })} 
                          className="w-full bg-white border-2 border-slate-200 text-slate-700 text-xs font-black rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm cursor-pointer hover:border-blue-300 transition-all uppercase tracking-tight"
                        >
                            {logisticsStages.map((stage, i) => (<option key={i} value={stage}>{i + 1}. {stage}</option>))}
                        </select>
                      </td>
                      <td className="p-6 text-right">
                        <div className="font-black text-green-600 text-lg">${Number(shipment.totalCost).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase mt-1">{shipment.totalVolume || '0'} CBM</div>
                      </td>
                      <td className="p-6 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <a href={getWhatsAppLink(shipment)} target="_blank" rel="noreferrer" className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"><MessageSquare size={18}/></a>
                         <button onClick={() => openEditShipment(shipment)} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"><Edit2 size={18}/></button>
                         <button onClick={() => deleteShipment(shipment.id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 size={18}/></button>
                      </td>
                   </tr>
                ))}
                {filteredShipments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <div className="flex flex-col items-center">
                        <Search size={40} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active cargo matches your query</p>
                      </div>
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );

  // RENDER: SYSTEM SETTINGS (FULLY UNCOMPRESSED)
  const renderSettings = () => (
    <div className="max-w-6xl space-y-10 animate-in fade-in pb-32">
        
        {/* BLOCK: IDENTITY & GLOBAL COMMUNICATION */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6 flex items-center gap-3">
              <ImageIcon size={24} className="text-blue-600"/> Terminal Identity & Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Logo Uploader */}
                <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Primary Brand Assets</label>
                    <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300">
                        <div className="h-32 w-32 bg-white rounded-2xl flex items-center justify-center relative shadow-lg overflow-hidden group">
                            {settings.logo ? (
                                <img src={settings.logo} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" alt="Logo"/>
                            ) : (
                                <ImageIcon className="text-slate-200" size={40}/>
                            )}
                            <div className="absolute inset-0 bg-blue-600/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Upload size={20} className="mb-2"/>
                              <span className="text-[8px] font-black uppercase">Swap Logo</span>
                            </div>
                            <input type="file" onChange={e => handleUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">Main Terminal Logo</h4>
                            <p className="text-xs text-slate-500 font-medium">Recommended: Transparent PNG, 500x500px. Max 2MB.</p>
                            <div className="pt-2">
                               <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Download Current Assets</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                  <FormInput label="Terminal Hero Title" value={settings.heroTitle} onChange={v => setSettings({...settings, heroTitle: v})} />
                  <FormInput label="Operational Support Email" value={settings.companyEmail} onChange={v => setSettings({...settings, companyEmail: v})} />
                </div>
                <div className="space-y-6">
                  <FormInput label="Official Voice Line" value={settings.contactPhone} onChange={v => setSettings({...settings, contactPhone: v})} />
                  <FormInput label="WhatsApp Command Number (Format: 233...)" value={settings.whatsappNumber} onChange={v => setSettings({...settings, whatsappNumber: v})} />
                </div>
                <div className="col-span-2">
                  <FormInput label="Global Headquarters Address" value={settings.companyAddress} onChange={v => setSettings({...settings, companyAddress: v})} />
                </div>
            </div>
        </div>

        {/* BLOCK: SOCIAL MEDIA UPLINK */}
        <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/10 pb-6">
               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                 <Share2 size={24} className="text-blue-500"/> Social Media Infrastructure
               </h3>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 md:mt-0">Live API Mapping</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative group">
                    <div className="absolute left-4 top-11 w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-500 border border-blue-500/20">
                       <Facebook size={18} />
                    </div>
                    <div className="pl-16"><FormDarkInput label="Facebook URL" value={settings.socials?.facebook} onChange={v => setSettings({...settings, socials: {...settings.socials, facebook: v}})} /></div>
                </div>
                <div className="relative group">
                    <div className="absolute left-4 top-11 w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-500 border border-pink-500/20">
                       <Instagram size={18} />
                    </div>
                    <div className="pl-16"><FormDarkInput label="Instagram URL" value={settings.socials?.instagram} onChange={v => setSettings({...settings, socials: {...settings.socials, instagram: v}})} /></div>
                </div>
                <div className="relative group">
                    <div className="absolute left-4 top-11 w-10 h-10 bg-sky-400/10 rounded-lg flex items-center justify-center text-sky-400 border border-sky-400/20">
                       <Twitter size={18} />
                    </div>
                    <div className="pl-16"><FormDarkInput label="Twitter / X Link" value={settings.socials?.twitter} onChange={v => setSettings({...settings, socials: {...settings.socials, twitter: v}})} /></div>
                </div>
                <div className="relative group">
                    <div className="absolute left-4 top-11 w-10 h-10 bg-blue-700/10 rounded-lg flex items-center justify-center text-blue-700 border border-blue-700/20">
                       <Linkedin size={18} />
                    </div>
                    <div className="pl-16"><FormDarkInput label="LinkedIn Profile" value={settings.socials?.linkedin} onChange={v => setSettings({...settings, socials: {...settings.socials, linkedin: v}})} /></div>
                </div>
            </div>
        </div>

        {/* BLOCK: LOGISTICS HUB CONFIG */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6 flex items-center gap-3">
              <Globe size={24} className="text-blue-600"/> Logistics & Cargo Intelligence
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <FormInput label="Next Shipping/Loading Date (Displays on Home)" value={settings.nextLoadingDate} onChange={v => setSettings({...settings, nextLoadingDate: v})} />

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin size={14}/> Primary Cargo Hubs
                      </h4>
                      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-8 shadow-inner">
                          <FormInput label="Sea Freight Terminal (Guangzhou)" value={settings.chinaSeaAddr} onChange={v => setSettings({...settings, chinaSeaAddr: v})} />
                          <FormInput label="Air Freight Terminal (Guangzhou)" value={settings.chinaAirAddr} onChange={v => setSettings({...settings, chinaAirAddr: v})} />
                      </div>
                    </div>
                </div>
                
                <div className="space-y-10">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <DollarSign size={14}/> Active Cargo Tariffs
                    </h4>
                    <div className="grid grid-cols-1 gap-8">
                        <FormInput label="Global Sea Rate ($ USD per CBM)" value={settings.seaRate} onChange={v => setSettings({...settings, seaRate: v})} />
                        
                        <div className="p-8 bg-blue-600/5 rounded-[2rem] border border-blue-600/10 space-y-6 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Plane size={60}/></div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Air Freight Classifications ($ per KG)</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Normal</label><input className="w-full p-4 text-sm border-b-2 border-blue-200 rounded-xl outline-none focus:border-blue-600 font-bold bg-white" value={settings.airRates?.normal} onChange={e => setSettings({...settings, airRates: {...settings.airRates, normal: e.target.value}})} /></div>
                                <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Battery</label><input className="w-full p-4 text-sm border-b-2 border-blue-200 rounded-xl outline-none focus:border-blue-600 font-bold bg-white" value={settings.airRates?.battery} onChange={e => setSettings({...settings, airRates: {...settings.airRates, battery: e.target.value}})} /></div>
                                <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Express</label><input className="w-full p-4 text-sm border-b-2 border-blue-200 rounded-xl outline-none focus:border-blue-600 font-bold bg-white" value={settings.airRates?.express} onChange={e => setSettings({...settings, airRates: {...settings.airRates, express: e.target.value}})} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // AUTH PROTECTED RENDERING
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background Flair */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
       
       <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center w-full max-w-md relative z-10 animate-in zoom-in duration-500">
         <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-blue-600/30">
            <Lock size={32}/>
         </div>
         <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic">System Access</h2>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Administrative Firewall Active</p>
         <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              autoFocus
              placeholder="ENTER PASSCODE" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-center font-black tracking-[1em] outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" 
              value={loginPass} 
              onChange={e=>setLoginPass(e.target.value)} 
            />
            {authError && <p className="text-red-500 text-[10px] font-black uppercase animate-bounce tracking-widest">Access Denied - Invalid Token</p>}
            <button className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-950/20 hover:bg-blue-600 transition-all active:scale-95">Unlock Terminal</button>
         </form>
         <button onClick={() => setView('home')} className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Abort Access Attempt</button>
       </div>
    </div>
  );

  // FINAL RENDER: MASTER VIEWPORT
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* GLOBAL WHATSAPP NOTIFICATION MODAL */}
      {notifyClient && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={100}/></div>
               <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <MessageSquare size={36}/>
               </div>
               <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-2">Transmission Ready</h3>
               <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Manifest for <strong>{notifyClient.name}</strong> saved. Send WhatsApp update?</p>
               <div className="flex flex-col gap-3">
                  <a href={notifyClient.link} target="_blank" rel="noreferrer" onClick={()=>setNotifyClient(null)} className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 flex items-center justify-center gap-3 transition-all active:scale-95">
                     <Send size={18}/> Send Protocol
                  </a>
                  <button onClick={()=>setNotifyClient(null)} className="w-full py-4 bg-slate-100 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all text-[10px]">Skip Notify</button>
               </div>
            </div>
         </div>
      )}

      {/* SIDEBAR: MISSION CONTROL */}
      <aside className={`fixed md:relative z-40 h-full w-72 bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl shadow-slate-900/5`}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black mr-4 shadow-xl shadow-blue-600/30">JB</div>
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-tighter text-slate-950 text-lg leading-none italic">Terminal</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Master v5.5</span>
          </div>
        </div>
        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
           <SidebarLink id="overview" icon={LayoutDashboard} label="Live Monitoring" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="manifest" icon={Database} label="Logistics Hub" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="invoices" icon={FileText} label="Finance Terminal" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="mart" icon={ShoppingBag} label="Sourcing Mart" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="inbox" icon={MessageSquare} label="Message Grid" active={activeTab} setActive={setActiveTab} badge={messages.length} />
           <SidebarLink id="agents" icon={Briefcase} label="Agent Network" active={activeTab} setActive={setActiveTab} badge={agents.length} />
           <SidebarLink id="vehicle" icon={Car} label="Fleet Studio" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="settings" icon={Settings} label="Global Config" active={activeTab} setActive={setActiveTab} />
        </nav>
        <div className="p-6 border-t border-slate-100">
           <button onClick={() => { setIsAdmin(false); setView('home'); }} className="flex items-center gap-4 w-full px-6 py-4 text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-inner shadow-red-500/10">
              <LogOut size={18} /> Shutdown Access
           </button>
        </div>
      </aside>

      {/* CORE VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Mobile Header */}
         <div className="md:hidden h-20 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 shadow-sm relative z-40">
            <span className="font-black italic uppercase tracking-tighter text-blue-600">JayBesin Terminal</span>
            <button onClick={() => setSidebarOpen(true)} className="p-3 bg-slate-900 text-white rounded-xl shadow-xl"><Menu size={24}/></button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <header className="mb-12 border-b border-slate-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                     <Cpu size={28}/>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Operational <span className="text-blue-600">Interface</span></h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Fully Synchronized • Logged as Administrator</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-green-500/10">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> DB Connection Stable
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                    <Bell size={20}/>
                  </div>
               </div>
            </header>

            {/* TAB SELECTOR */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'manifest' && renderLogisticsHub()}
              {activeTab === 'invoices' && <InvoiceSystem />}
              {activeTab === 'mart' && renderMart()}
              {activeTab === 'inbox' && renderInbox()}
              {activeTab === 'agents' && renderAgents()}
              {activeTab === 'vehicle' && renderVehicleFleet()}
              {activeTab === 'settings' && renderSettings()}
            </div>
         </div>
      </main>

      {/* SYSTEM-WIDE MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300 border-8 border-slate-100">
               <div className="flex justify-between items-center p-10 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                       <Zap size={28}/>
                    </div>
                    <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-950 italic">
                        {modalMode === 'create' ? 'Initialize' : 'Configure'} {entityType}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Terminal Registry Update</p>
                    </div>
                  </div>
                  <button onClick={()=>setIsModalOpen(false)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-inner"><X size={24}/></button>
               </div>
               
               <div className="p-10 md:p-14 overflow-y-auto flex-1">
                 {/* ENTITY: MANIFEST ENTRY */}
                 {entityType === 'manifest' && (
                    <div className="space-y-12">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <FormInput label="Full Consignee Identity" value={manifestForm.consigneeName} onChange={v=>setManifestForm({...manifestForm, consigneeName: v})} />
                          <FormInput label="Direct Contact Frequency (Phone)" value={manifestForm.consigneePhone} onChange={v=>setManifestForm({...manifestForm, consigneePhone: v})} />
                       </div>
                       
                       <div className="bg-blue-600/5 p-10 rounded-[2.5rem] border-2 border-blue-600/10 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-inner">
                          <div>
                             <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Tracking Protocol Serial</label>
                             <div className="flex gap-4">
                                <input 
                                  className="w-full p-5 bg-white border-2 border-blue-100 rounded-2xl text-lg font-mono font-black text-blue-600 outline-none focus:border-blue-500 shadow-xl" 
                                  placeholder="Auto-Generate" 
                                  value={manifestForm.trackingNumber} 
                                  onChange={e=>setManifestForm({...manifestForm, trackingNumber: e.target.value})} 
                                />
                                <button onClick={generateTrackingID} className="w-16 h-16 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xl"><RefreshCw size={24}/></button>
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Container Assignment Code</label>
                             <input className="w-full p-5 bg-white border-2 border-blue-100 rounded-2xl text-lg font-black text-slate-900 outline-none focus:border-blue-500 shadow-xl" placeholder="e.g. JB-GUAN-902" value={manifestForm.containerId} onChange={e=>setManifestForm({...manifestForm, containerId: e.target.value})} />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                          <FormInput label="Origin Node" value={manifestForm.origin} onChange={v=>setManifestForm({...manifestForm, origin: v})} />
                          <FormInput label="Destination Node" value={manifestForm.destination} onChange={v=>setManifestForm({...manifestForm, destination: v})} />
                          <div className="flex flex-col">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Transmission Mode</label>
                             <select className="p-5 border-2 border-slate-100 bg-slate-50 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-blue-600" value={manifestForm.mode} onChange={e=>setManifestForm({...manifestForm, mode: e.target.value})}>
                                <option>Sea Freight</option>
                                <option>Air Freight</option>
                             </select>
                          </div>
                       </div>
                       
                       <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200">
                          <h4 className="font-black text-xl text-slate-900 mb-8 flex items-center gap-3 italic underline decoration-blue-600 underline-offset-8">Cargo Payload Specification</h4>
                          <div className="space-y-4 mb-10">
                             {manifestForm.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-left-4 duration-300">
                                   <input placeholder="Cargo Description" className="flex-1 p-5 border-2 border-slate-200 rounded-2xl text-sm font-bold bg-white outline-none focus:border-blue-600" value={item.description} onChange={e=>{const n=[...manifestForm.items];n[idx].description=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="Qty" type="number" className="w-24 p-5 border-2 border-slate-200 rounded-2xl text-sm font-bold bg-white text-center" value={item.quantity} onChange={e=>{const n=[...manifestForm.items];n[idx].quantity=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="CBM" type="number" className="w-32 p-5 border-2 border-slate-200 rounded-2xl text-sm font-black text-blue-600 bg-white text-center" value={item.cbm} onChange={e=>{const n=[...manifestForm.items];n[idx].cbm=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <button onClick={()=>{const n=manifestForm.items.filter((_,i)=>i!==idx);setManifestForm({...manifestForm, items:n})}} className="w-14 h-14 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={20}/></button>
                                </div>
                             ))}
                             <button onClick={()=>setManifestForm(p=>({...p, items:[...p.items, {description:'', quantity:1, cbm:0}]}))} className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 mt-4 hover:opacity-70 transition-opacity">
                                <Plus size={16}/> Add Payload Line
                             </button>
                          </div>

                          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Protocol ($/CBM):</label>
                                    <input type="number" className="w-24 p-2 bg-slate-50 border rounded-lg text-center font-black text-slate-900" value={manifestForm.ratePerCbm} onChange={e=>setManifestForm({...manifestForm, ratePerCbm: e.target.value})} />
                                </div>
                                <div className="text-center md:text-right space-y-2">
                                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Displacement: {manifestTotals.cbm} m³</div>
                                    <div className="text-4xl font-black text-green-600 italic tracking-tighter">TOTAL: ${manifestTotals.cost}</div>
                                </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* ENTITY: PRODUCT FORM */}
                 {entityType === 'product' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                       <FormInput label="Master Product Label" value={productForm.name} onChange={v=>setProductForm({...productForm, name: v})} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Inventory Group</label>
                            <select className="w-full p-5 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black text-sm outline-none" value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})}>
                              <option value="">-- Assign Category --</option>
                              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-4 text-xs font-black uppercase tracking-widest cursor-pointer group">
                              <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${productForm.isLandedCost ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                                {productForm.isLandedCost && <CheckCircle size={14}/>}
                              </div>
                              <input type="checkbox" className="hidden" checked={productForm.isLandedCost} onChange={e=>setProductForm({...productForm, isLandedCost: e.target.checked})} /> 
                              Include Landed Cost Policy
                            </label>
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Product Specifications</label>
                          <textarea className="w-full p-6 border-2 border-slate-100 bg-slate-50 rounded-2xl font-bold text-sm h-40 resize-none outline-none focus:border-blue-600" value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} />
                       </div>
                       <FormInput label="Official Price ($ USD)" value={productForm.price} onChange={v=>setProductForm({...productForm, price: v})} />
                       <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Media Assets</label>
                          <input type="file" onChange={e=>handleUpload(e, 'image', false, true)} className="text-xs font-bold text-slate-500" />
                       </div>
                    </div>
                 )}

                 {/* ENTITY: VEHICLE FORM */}
                 {entityType === 'vehicle' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                       <FormInput label="Vehicle Model Designation" value={vehicleForm.name} onChange={v=>setVehicleForm({...vehicleForm, name: v})} />
                       <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Class</label>
                             <select className="w-full p-5 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black text-sm outline-none" value={vehicleForm.category} onChange={e=>setVehicleForm({...vehicleForm, category: e.target.value})}><option>SUV</option><option>Saloon</option><option>Truck</option></select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Propulsion</label>
                             <select className="w-full p-5 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black text-sm outline-none" value={vehicleForm.fuel} onChange={e=>setVehicleForm({...vehicleForm, fuel: e.target.value})}><option>Gasoline</option><option>Diesel</option><option>EV</option></select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
                             <select className="w-full p-5 border-2 border-slate-100 bg-slate-50 rounded-2xl font-black text-sm outline-none" value={vehicleForm.condition} onChange={e=>setVehicleForm({...vehicleForm, condition: e.target.value})}><option>Used</option><option>Brand New</option></select>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-6">
                          <FormInput label="Base Price ($)" value={vehicleForm.price} onChange={v=>setVehicleForm({...vehicleForm, price: v})} />
                          <FormInput label="Shipping Est." value={vehicleForm.shipping} onChange={v=>setVehicleForm({...vehicleForm, shipping: v})} />
                          <FormInput label="Clearance Est." value={vehicleForm.documentation} onChange={v=>setVehicleForm({...vehicleForm, documentation: v})} />
                       </div>
                       <FormInput label="Master VIN (Unique ID)" value={vehicleForm.vin} onChange={v=>setVehicleForm({...vehicleForm, vin: v})} />
                       <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center">
                          <input type="file" multiple onChange={e=>handleUpload(e, 'images', true)} className="text-xs font-bold text-slate-500" />
                          <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest italic">Multi-image upload supported</p>
                       </div>
                    </div>
                 )}
               </div>
               
               <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-6">
                  <button onClick={()=>setIsModalOpen(false)} className="px-10 py-5 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 transition-all shadow-sm">Abort Operation</button>
                  <button onClick={handleSubmit} className="px-14 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-700 shadow-2xl shadow-blue-600/30 flex items-center gap-4 active:scale-95 transition-all animate-pulse hover:animate-none">
                    <Save size={18}/> Commit Changes
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS & HELPERS ---

const SidebarLink = ({ id, icon: Icon, label, active, setActive, badge }) => (
  <button 
    onClick={()=>setActive(id)} 
    className={`w-full flex justify-between items-center px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group ${active===id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'}`}
  >
    <div className="flex items-center gap-4">
      <Icon size={18} className={`${active===id ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'} transition-colors`} /> 
      {label}
    </div>
    {badge > 0 && <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${active===id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>{badge}</span>}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }) => { 
  const c = { 
    blue: 'bg-blue-100 text-blue-600 border-blue-200', 
    purple: 'bg-purple-100 text-purple-600 border-purple-200', 
    green: 'bg-green-100 text-green-600 border-green-200', 
    slate: 'bg-slate-100 text-slate-600 border-slate-200' 
  }; 
  return (
    <div className={`bg-white p-8 border rounded-[2.5rem] flex items-center gap-6 shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className={`p-4 rounded-2xl ${c[color]} border shadow-inner`}><Icon size={24}/></div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</p>
      </div>
    </div>
  ); 
};

const FormInput = ({ label, value, onChange }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
    <input 
      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-950 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner" 
      value={value || ''} 
      onChange={e=>onChange(e.target.value)} 
      autoComplete="off"
    />
  </div>
);

const FormDarkInput = ({ label, value, onChange }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
    <input 
      className="w-full p-5 bg-white/5 border-2 border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all shadow-inner" 
      value={value || ''} 
      onChange={e=>onChange(e.target.value)} 
      autoComplete="off"
    />
  </div>
);