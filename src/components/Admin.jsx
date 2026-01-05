import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Database, Car, Settings, 
  Search, Plus, Upload, Save, X, Menu,
  Trash2, Edit2, Activity, DollarSign,
  Share2, ShieldCheck, MapPin, Truck, Anchor, 
  FileText, Image as ImageIcon, LogOut, Calendar,
  MessageSquare, Briefcase, Phone, Mail, Filter,
  Box, Zap, Plane, Globe, CheckCircle, AlertCircle,
  User, Lock, Key, ChevronRight, ShoppingBag, Tag,
  Package, Calculator, Send, Archive, Layers, RefreshCw, Download, Container
} from 'lucide-react';

import InvoiceSystem from './InvoiceSystem';
import { useShipments } from './ShipmentContext'; 

/**
 * JAY-BESIN | ADMIN MASTER v4.1 (FIXED SETTINGS)
 * -----------------------------------------------------------
 * - Settings: Added "Next Loading Date" input back.
 * - Logic: Full Container & Bulk Update logic preserved.
 */

export default function Admin({ 
  settings, setSettings, 
  vehicles = [], addVehicle, updateVehicle, deleteVehicle,
  products = [], addProduct, deleteProduct,
  categories = [], addCategory, deleteCategory,
  messages = [], agents = [], 
  setIsAdmin, setView 
}) {
  const { shipments, addShipment, updateShipment, deleteShipment } = useShipments();

  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // --- BULK ACTION STATE ---
  const [selectedIds, setSelectedIds] = useState([]);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [entityType, setEntityType] = useState('manifest');
  const [currentShipmentId, setCurrentShipmentId] = useState(null);
  const [notifyClient, setNotifyClient] = useState(null);

  // --- FORM STATES ---
  const [manifestForm, setManifestForm] = useState({ 
    trackingNumber: '', dateReceived: new Date().toISOString().split('T')[0],
    status: 'Received at China Warehouse', origin: 'Guangzhou, CN', destination: 'Accra, GH',
    mode: 'Sea Freight', consigneeName: '', consigneePhone: '', consigneeAddress: '',
    containerId: '', ratePerCbm: 450, items: [{ description: '', quantity: 1, weight: 0, cbm: 0 }]
  });
  
  const [vehicleForm, setVehicleForm] = useState({ id: '', name: '', vin: '', engine: '', year: new Date().getFullYear(), price: '', shipping: '', documentation: '', description: '', images: [], category: 'SUV', fuel: 'Gasoline', condition: 'Used' });
  const [productForm, setProductForm] = useState({ id: '', name: '', description: '', price: '', image: '', category: '', isLandedCost: false });
  const [newCategoryName, setNewCategoryName] = useState('');

  const logisticsStages = [
    "Order Initiated", "Received at China Warehouse", "Quality Check & Consolidation", 
    "Loaded into Container", "Vessel Departed Origin", "In Transit (High Seas)", 
    "Arrived at TEMA Port", "Customs Clearance in Progress", "Duties Paid / Released", 
    "Ready for Pickup / Delivery"
  ];

  // --- FILTERING LOGIC ---
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => 
        s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.containerId && s.containerId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shipments, searchTerm]);

  // --- BULK ACTIONS ---
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShipments.length) setSelectedIds([]);
    else setSelectedIds(filteredShipments.map(s => s.id));
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const performBulkUpdate = (newStatus) => {
    if (window.confirm(`Update ${selectedIds.length} shipments to "${newStatus}"?`)) {
      selectedIds.forEach(id => updateShipment(id, { status: newStatus }));
      setSelectedIds([]);
    }
  };

  const performBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} shipments?`)) {
      selectedIds.forEach(id => deleteShipment(id));
      setSelectedIds([]);
    }
  };

  const performContainerAssignment = () => {
    const containerNum = prompt("Enter Container Number to Group Items (e.g. MSKU-9821):");
    if (containerNum) {
        selectedIds.forEach(id => updateShipment(id, { 
            containerId: containerNum.toUpperCase(),
            status: "Loaded into Container" 
        }));
        alert(`${selectedIds.length} items assigned to Container ${containerNum}.`);
        setSelectedIds([]);
    }
  };

  const exportToCSV = () => {
    const headers = ["Tracking ID", "Container", "Client", "Phone", "Status", "Volume (CBM)", "Cost ($)"];
    const rows = filteredShipments.map(s => [
      s.trackingNumber, s.containerId || "N/A", s.consigneeName, s.consigneePhone, s.status, s.totalVolume, s.totalCost
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "manifest_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  // --- HELPERS ---
  const manifestTotals = useMemo(() => {
    const items = manifestForm.items || [];
    const totalCbm = items.reduce((sum, item) => sum + (Number(item.cbm) || 0), 0);
    const totalCost = totalCbm * (Number(manifestForm.ratePerCbm) || 0);
    return { cbm: totalCbm.toFixed(3), cost: totalCost.toFixed(2) };
  }, [manifestForm.items, manifestForm.ratePerCbm]);

  const stats = useMemo(() => ({
    activeShipments: shipments.length,
    activeVolume: shipments.reduce((acc, m) => acc + (Number(m.totalVolume)||0), 0),
    totalRevenue: shipments.reduce((acc, m) => acc + (Number(m.totalCost)||0), 0)
  }), [shipments]);

  const generateTrackingID = () => {
    setManifestForm(prev => ({ ...prev, trackingNumber: `JB-CN-${Math.floor(100000 + Math.random() * 900000)}` }));
  };

  const getWhatsAppLink = (shipment) => {
    if (!shipment.consigneePhone) return "#";
    const phone = shipment.consigneePhone.replace(/[^0-9]/g, '');
    const msg = `Hello ${shipment.consigneeName}, Update on Cargo ${shipment.trackingNumber}: Status is now '${shipment.status}'. Total Due: $${shipment.totalCost}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleLogin = (e) => { e.preventDefault(); if (loginPass === (settings.adminPass || 'admin123')) setIsAuthenticated(true); else setAuthError(true); };
  
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

  // --- MODAL HANDLERS ---
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
            trackingNumber: manifestForm.trackingNumber || `JB-AUTO-${Math.floor(Math.random()*100000)}`
        };
        if (modalMode === 'create') { addShipment(finalData); if (finalData.consigneePhone) setNotifyClient({ name: finalData.consigneeName, link: getWhatsAppLink(finalData) }); } 
        else { updateShipment(currentShipmentId, finalData); }
    } else if (entityType === 'product') {
        const payload = { ...productForm };
        if (modalMode === 'create') payload.id = `PROD-${Math.floor(Math.random() * 90000)}`;
        if (modalMode === 'create') addProduct(payload);
    } else {
        const payload = { ...vehicleForm };
        if (modalMode === 'create') { payload.id = `VIN-${Math.floor(Math.random() * 9000)}`; addVehicle(payload); }
        else updateVehicle(payload.id, payload);
    }
    setIsModalOpen(false);
  };

  // --- RENDERERS ---
  
  // 1. LOGISTICS HUB (Manifest + Containers)
  const renderLogisticsHub = () => (
    <div className="space-y-6 animate-in fade-in">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Logistics Hub</h2>
            <p className="text-sm text-slate-500">Master Control: Individual Goods & Container Lists.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="bg-white border text-slate-600 px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-slate-50">
                <Download size={18}/> Export CSV
            </button>
            <button onClick={openCreateShipment} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all">
                <Plus size={18}/> New Shipment
            </button>
          </div>
       </div>

       {/* BULK ACTION BAR */}
       {selectedIds.length > 0 && (
         <div className="bg-slate-800 text-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-2 md:mb-0">
                <div className="bg-blue-500 text-xs font-bold px-2 py-1 rounded">{selectedIds.length} Selected</div>
                <span className="text-sm font-medium text-slate-300">Choose action:</span>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <button onClick={performContainerAssignment} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                    <Container size={16}/> Load to Container
                </button>
                <div className="h-6 w-px bg-slate-600 mx-2"></div>
                <select 
                    onChange={(e) => { if(e.target.value) performBulkUpdate(e.target.value) }}
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    defaultValue=""
                >
                    <option value="" disabled>Update Status To...</option>
                    {logisticsStages.map((s,i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <button onClick={performBulkDelete} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors ml-2"><Trash2 size={16}/></button>
            </div>
         </div>
       )}

       {/* SEARCH */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
            <input type="text" placeholder="Search by Tracking, Client, or Container ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
       </div>

       {/* DATA TABLE */}
       <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
             <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                   <th className="p-4 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === filteredShipments.length && filteredShipments.length > 0} /></th>
                   <th className="p-4">Tracking ID</th>
                   <th className="p-4">Client</th>
                   <th className="p-4">Container ID</th>
                   <th className="p-4 w-[250px]">Status (Live)</th>
                   <th className="p-4 text-right">Financials</th>
                   <th className="p-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredShipments.map(shipment => (
                   <tr key={shipment.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(shipment.id) ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-4"><input type="checkbox" checked={selectedIds.includes(shipment.id)} onChange={() => toggleSelectRow(shipment.id)} /></td>
                      <td className="p-4"><div className="font-mono font-bold text-blue-600 text-base">{shipment.trackingNumber}</div><div className="text-[10px] text-slate-400">{shipment.dateReceived}</div></td>
                      <td className="p-4 font-bold text-slate-700">{shipment.consigneeName}<div className="text-xs font-normal text-slate-400">{shipment.destination}</div></td>
                      <td className="p-4">
                        {shipment.containerId ? 
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold font-mono">{shipment.containerId}</span> 
                            : <span className="text-slate-300 text-xs italic">-</span>}
                      </td>
                      <td className="p-4">
                        <select value={shipment.status} onChange={(e) => updateShipment(shipment.id, { status: e.target.value })} className="w-full bg-white border border-blue-200 text-slate-700 text-xs font-bold rounded p-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer hover:border-blue-400">
                            {logisticsStages.map((stage, i) => (<option key={i} value={stage}>{i + 1}. {stage}</option>))}
                        </select>
                      </td>
                      <td className="p-4 text-right"><div className="font-bold text-green-600">${shipment.totalCost || '0.00'}</div><div className="text-[10px] text-slate-400">{shipment.totalVolume || '0'} m³</div></td>
                      <td className="p-4 text-right flex justify-end gap-2">
                         <a href={getWhatsAppLink(shipment)} target="_blank" rel="noreferrer" className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"><MessageSquare size={16}/></a>
                         <button onClick={() => openEditShipment(shipment)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"><Edit2 size={16}/></button>
                         <button onClick={() => deleteShipment(shipment.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"><Trash2 size={16}/></button>
                      </td>
                   </tr>
                ))}
                {filteredShipments.length === 0 && (<tr><td colSpan="7" className="p-12 text-center text-gray-400">No shipments found.</td></tr>)}
             </tbody>
          </table>
       </div>
    </div>
  );

  // 2. SETTINGS PANEL (Fixed with "Next Loading Date")
  const renderSettings = () => (
    <div className="max-w-5xl space-y-8 animate-in fade-in">
        
        {/* BLOCK 1: BRANDING */}
        <div className="bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2"><ImageIcon size={18}/> Brand Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Uploader */}
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">Company Logo (Displayed on Home)</label>
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 relative overflow-hidden group hover:border-blue-500 transition-colors">
                            {settings.logo ? (
                                <img src={settings.logo} className="w-full h-full object-contain p-2" alt="Logo"/>
                            ) : (
                                <ImageIcon className="text-slate-300" size={32}/>
                            )}
                            <input type="file" onChange={e => handleUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                        <div className="text-sm text-slate-500">
                            <p className="font-bold text-slate-700">Upload your logo</p>
                            <p className="text-xs">PNG, JPG or SVG. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                <FormInput label="Hero Title" value={settings.heroTitle} onChange={v => setSettings({...settings, heroTitle: v})} />
                <FormInput label="Official Phone" value={settings.contactPhone} onChange={v => setSettings({...settings, contactPhone: v})} />
                <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Hero Image</label><input type="file" onChange={e => handleUpload(e, 'heroImage')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>
            </div>
        </div>

        {/* BLOCK 2: LOGISTICS CONFIG */}
        <div className="bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2"><Globe size={18}/> Logistics Configuration</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {/* [FIXED] NEXT LOADING DATE ADDED HERE */}
                    <FormInput 
                        label="Next Loading Date (Displayed on Home)" 
                        value={settings.nextLoadingDate} 
                        onChange={v => setSettings({...settings, nextLoadingDate: v})} 
                    />

                    <h4 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2 mt-4"><MapPin size={14}/> Warehouse Addresses</h4>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                        <FormInput label="China Sea Warehouse Address" value={settings.chinaSeaAddr} onChange={v => setSettings({...settings, chinaSeaAddr: v})} />
                        <FormInput label="China Air Warehouse Address" value={settings.chinaAirAddr} onChange={v => setSettings({...settings, chinaAirAddr: v})} />
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2"><DollarSign size={14}/> Shipping Rates</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><FormInput label="Sea Freight Rate ($/CBM)" value={settings.seaRate} onChange={v => setSettings({...settings, seaRate: v})} /></div>
                        <div className="p-4 bg-blue-50 rounded-lg col-span-2 border border-blue-100 grid gap-4">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Air Freight Tiers ($/KG)</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div><label className="text-[10px] font-bold text-slate-500">Normal</label><input className="w-full p-2 text-sm border rounded" value={settings.airRates?.normal} onChange={e => setSettings({...settings, airRates: {...settings.airRates, normal: e.target.value}})} /></div>
                                <div><label className="text-[10px] font-bold text-slate-500">Battery</label><input className="w-full p-2 text-sm border rounded" value={settings.airRates?.battery} onChange={e => setSettings({...settings, airRates: {...settings.airRates, battery: e.target.value}})} /></div>
                                <div><label className="text-[10px] font-bold text-slate-500">Express</label><input className="w-full p-2 text-sm border rounded" value={settings.airRates?.express} onChange={e => setSettings({...settings, airRates: {...settings.airRates, express: e.target.value}})} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // Other Renderers (Mart, Vehicles, Inbox, Agents)
  const renderMart = () => (<div className="space-y-8 animate-in fade-in"><div className="bg-white p-6 border border-slate-200 rounded-lg"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Tag size={18}/> Manage Categories</h3><div className="flex gap-2 mb-4"><input className="border rounded-lg px-4 py-2 text-sm w-full max-w-xs outline-none focus:border-blue-600" placeholder="New Category Name..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} /><button onClick={() => {if(newCategoryName.trim()){addCategory(newCategoryName);setNewCategoryName('')}}} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">Add</button></div><div className="flex flex-wrap gap-2">{categories.map((cat, idx) => (<div key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-slate-200">{cat}<button onClick={() => deleteCategory(cat)} className="hover:text-red-600 transition-colors"><X size={12}/></button></div>))}</div></div><div><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4"><h2 className="text-xl font-bold text-slate-900">Product Inventory</h2><button onClick={()=>openCreateOther('product')} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"><Plus size={16}/> Add Product</button></div><div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">{products.map(p => (<div key={p.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm group"><div className="h-40 bg-slate-100 relative overflow-hidden">{p.image ? <img src={p.image} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-300"><ShoppingBag size={32}/></div>}{p.isLandedCost && <span className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-bold uppercase px-2 py-1 rounded">Landed Cost</span>}</div><div className="p-4"><div className="flex justify-between items-start"><h4 className="font-bold text-slate-900 truncate flex-1">{p.name}</h4><span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold ml-2">{p.category}</span></div><p className="text-xs text-slate-500 mb-2 truncate">{p.description}</p><div className="flex justify-between items-center mt-2"><span className="font-bold text-blue-600">${p.price}</span><div className="flex gap-1"><button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14}/></button></div></div></div></div>))}</div></div></div>);
  const renderVehicleFleet = () => (<div className="space-y-6 animate-in fade-in"><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><h2 className="text-xl font-bold text-slate-900">Vehicle Inventory</h2><button onClick={()=>openCreateOther('vehicle')} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"><Plus size={16}/> Add Vehicle</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{vehicles.map(v => (<div key={v.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm group hover:shadow-md transition-all"><div className="h-48 bg-slate-100 relative">{v.images[0] ? <img src={v.images[0]} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-300"><Car size={32}/></div>}<div className="absolute top-2 right-2 flex flex-col gap-1 items-end"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase text-white ${v.condition === 'Brand New' ? 'bg-green-600' : 'bg-slate-800'}`}>{v.condition}</span><span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-600 text-white">{v.fuel}</span></div></div><div className="p-4"><h4 className="font-bold text-slate-900 line-clamp-1">{v.name}</h4><p className="text-xs text-slate-500 uppercase">{v.category} • {v.year}</p><div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2"><span className="text-[10px] font-mono text-slate-400">{v.vin || 'NO VIN'}</span><div className="flex gap-1"><button onClick={()=>openEditOther(v, 'vehicle')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Edit2 size={14}/></button><button onClick={()=>deleteVehicle(v.id)} className="p-1.5 hover:bg-slate-100 rounded text-red-600"><Trash2 size={14}/></button></div></div></div></div>))}</div></div>);
  const renderInbox = () => (<div className="space-y-6 animate-in fade-in"><div className="flex justify-between items-center border-b border-slate-200 pb-4"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-3"><MessageSquare size={20} className="text-blue-600"/> Message Inbox</h2><span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{messages.length}</span></div>{messages.length === 0 ? <p className="text-slate-400 text-center py-10">No messages found.</p> : (<div className="grid gap-4">{messages.map((msg) => (<div key={msg.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"><div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold"><User size={20}/></div><div><h4 className="font-bold text-slate-900">{msg.name}</h4><p className="text-xs text-slate-500">{msg.email}</p></div></div><div className="text-right"><span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase block mb-1">{msg.subject}</span><span className="text-[10px] text-slate-400">{msg.date}</span></div></div><div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">{msg.message}</div></div>))}</div>)}</div>);
  const renderAgents = () => (<div className="space-y-6 animate-in fade-in"><div className="flex justify-between items-center border-b border-slate-200 pb-4"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-3"><Briefcase size={20} className="text-purple-600"/> Agent Applications</h2></div><div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm overflow-x-auto"><table className="w-full text-left text-sm min-w-[600px]"><thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]"><tr><th className="p-4">Applicant</th><th className="p-4">Location</th><th className="p-4">Focus</th><th className="p-4">Volume</th><th className="p-4">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{agents.map(a => (<tr key={a.id} className="hover:bg-slate-50"><td className="p-4"><div className="font-bold text-slate-900">{a.name}</div><div className="text-xs text-slate-500">{a.email}</div></td><td className="p-4 text-slate-600">{a.city}</td><td className="p-4"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{a.focus}</span></td><td className="p-4 font-mono font-bold">{a.volume} CBM</td><td className="p-4 text-xs text-slate-400">{a.date}</td></tr>))}</tbody></table></div></div>);

  // --- MAIN LAYOUT ---
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
       <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-full max-w-sm">
         <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
         <h2 className="text-2xl font-bold mb-6">Admin Access</h2>
         <form onSubmit={handleLogin}><input type="password" placeholder="Passcode" className="w-full border p-3 rounded mb-4 text-center" value={loginPass} onChange={e=>setLoginPass(e.target.value)} /><button className="w-full bg-slate-900 text-white py-3 rounded font-bold">Unlock</button></form>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      
      {/* WHATSAPP POPUP */}
      {notifyClient && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><MessageSquare size={32}/></div>
               <h3 className="text-xl font-bold mb-2">Update Saved!</h3>
               <p className="text-slate-500 text-sm mb-6">Notify <strong>{notifyClient.name}</strong> via WhatsApp?</p>
               <div className="flex gap-3"><button onClick={()=>setNotifyClient(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200">Skip</button><a href={notifyClient.link} target="_blank" rel="noreferrer" onClick={()=>setNotifyClient(null)} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"><Send size={16}/> Send</a></div>
            </div>
         </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-30 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100"><div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-black mr-3">JB</div><span className="font-bold">ADMIN v4.1</span></div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
           <SidebarLink id="overview" icon={LayoutDashboard} label="Overview" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="manifest" icon={Database} label="Logistics Hub" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="invoices" icon={FileText} label="Invoicing" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="mart" icon={ShoppingBag} label="Sourcing Mart" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="inbox" icon={MessageSquare} label="Inbox" active={activeTab} setActive={setActiveTab} badge={messages.length} />
           <SidebarLink id="agents" icon={Briefcase} label="Agents" active={activeTab} setActive={setActiveTab} badge={agents.length} />
           <SidebarLink id="vehicle" icon={Car} label="Fleet" active={activeTab} setActive={setActiveTab} />
           <SidebarLink id="settings" icon={Settings} label="Settings" active={activeTab} setActive={setActiveTab} />
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto"><button onClick={() => { setIsAdmin(false); setView('home'); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={16} /> Sign Out</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
         <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0"><span className="font-bold">DASHBOARD</span><button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-100 rounded"><Menu size={20}/></button></div>
         <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'overview' && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4"><StatCard label="Active Shipments" value={stats.activeShipments} icon={Database} color="blue" /><StatCard label="Volume" value={`${stats.activeVolume.toFixed(2)} CBM`} icon={Box} color="purple" /><StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} color="green" /><StatCard label="New Agents" value={stats.newAgents} icon={Briefcase} color="slate" /></div>)}
            {activeTab === 'manifest' && renderLogisticsHub()}
            {activeTab === 'invoices' && <InvoiceSystem />}
            {activeTab === 'mart' && renderMart()}
            {activeTab === 'inbox' && renderInbox()}
            {activeTab === 'agents' && renderAgents()}
            {activeTab === 'vehicle' && renderVehicleFleet()}
            {activeTab === 'settings' && renderSettings()}
         </div>
      </main>

      {/* UNIFIED MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-200">
               <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-xl capitalize flex items-center gap-2">{modalMode === 'create' ? <Plus className="w-5 h-5"/> : <Edit className="w-5 h-5"/>} {modalMode} {entityType}</h3>
                  <button onClick={()=>setIsModalOpen(false)} className="hover:text-red-500"><X size={20}/></button>
               </div>
               
               <div className="p-6 md:p-8 overflow-y-auto flex-1">
                 {/* MANIFEST FORM */}
                 {entityType === 'manifest' && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2"><FormInput label="Client Name" value={manifestForm.consigneeName} onChange={v=>setManifestForm({...manifestForm, consigneeName: v})} /></div>
                          <FormInput label="Phone" value={manifestForm.consigneePhone} onChange={v=>setManifestForm({...manifestForm, consigneePhone: v})} />
                       </div>
                       <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label className="block text-xs font-bold text-blue-800 mb-1">Tracking Number</label>
                             <div className="flex gap-2">
                                <input className="w-full p-2 border border-blue-200 rounded text-sm font-mono font-bold text-blue-700 bg-white" 
                                    placeholder="Leave blank to Auto-Generate"
                                    value={manifestForm.trackingNumber} 
                                    onChange={e=>setManifestForm({...manifestForm, trackingNumber: e.target.value})} />
                                <button onClick={generateTrackingID} className="p-2 bg-white border rounded hover:bg-blue-100 text-blue-600" title="Auto-Generate"><RefreshCw size={16}/></button>
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-blue-800 mb-1">Container ID (Optional)</label>
                             <input 
                                className="w-full p-2 border border-blue-200 rounded text-sm font-bold text-blue-700 bg-white placeholder-blue-300" 
                                placeholder="e.g. MSKU-9821"
                                value={manifestForm.containerId} 
                                onChange={e=>setManifestForm({...manifestForm, containerId: e.target.value})} 
                             />
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FormInput label="Origin" value={manifestForm.origin} onChange={v=>setManifestForm({...manifestForm, origin: v})} /><FormInput label="Destination" value={manifestForm.destination} onChange={v=>setManifestForm({...manifestForm, destination: v})} /><div className="flex flex-col"><label className="text-xs font-bold text-slate-500 mb-1">Mode</label><select className="border p-2 rounded text-sm" value={manifestForm.mode} onChange={e=>setManifestForm({...manifestForm, mode: e.target.value})}><option>Sea Freight</option><option>Air Freight</option></select></div></div>
                       
                       <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Cargo Items & Costs</h4>
                          <div className="space-y-3 mb-6">
                             {manifestForm.items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                   <input placeholder="Item Description" className="flex-1 border p-2 rounded text-sm" value={item.description} onChange={e=>{const n=[...manifestForm.items];n[idx].description=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="Qty" type="number" className="w-20 border p-2 rounded text-sm" value={item.quantity} onChange={e=>{const n=[...manifestForm.items];n[idx].quantity=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <input placeholder="CBM" type="number" className="w-24 border p-2 rounded text-sm font-bold text-blue-600" value={item.cbm} onChange={e=>{const n=[...manifestForm.items];n[idx].cbm=e.target.value;setManifestForm({...manifestForm, items:n})}} />
                                   <button onClick={()=>{const n=manifestForm.items.filter((_,i)=>i!==idx);setManifestForm({...manifestForm, items:n})}} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                </div>
                             ))}
                             <button onClick={()=>setManifestForm(p=>({...p, items:[...p.items, {description:'', quantity:1, cbm:0}]}))} className="text-blue-600 font-bold text-xs flex items-center gap-1 mt-2 hover:underline"><Plus size={14}/> Add Item Line</button>
                          </div>

                          <div className="border-t border-slate-200 pt-4 flex justify-between items-center bg-white p-4 rounded border">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-slate-500">Rate ($/CBM):</label>
                                    <input type="number" className="w-24 p-1 border rounded text-right font-bold text-slate-700" value={manifestForm.ratePerCbm} onChange={e=>setManifestForm({...manifestForm, ratePerCbm: e.target.value})} />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Total Volume: {manifestTotals.cbm} m³</div>
                                    <div className="text-xl font-black text-green-600">Total: ${manifestTotals.cost}</div>
                                </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* PRODUCT FORM */}
                 {entityType === 'product' && (
                    <div className="space-y-4">
                       <FormInput label="Product Name" value={productForm.name} onChange={v=>setProductForm({...productForm, name: v})} />
                       <div><label className="block text-xs font-bold text-slate-500 mb-1">Category</label><select className="w-full border p-2 rounded-lg text-sm" value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})}><option value="">-- Select --</option>{categories.map((c, i) => <option key={i} value={c}>{c}</option>)}</select></div>
                       <div><label className="block text-xs font-bold text-slate-500 mb-1">Description</label><textarea className="w-full border p-3 rounded-lg text-sm" rows={3} value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} /></div>
                       <div className="grid grid-cols-2 gap-4"><FormInput label="Price (USD)" value={productForm.price} onChange={v=>setProductForm({...productForm, price: v})} /><div className="flex items-center h-full pt-4"><label className="flex items-center gap-2 text-sm font-bold cursor-pointer"><input type="checkbox" checked={productForm.isLandedCost} onChange={e=>setProductForm({...productForm, isLandedCost: e.target.checked})} /> Landed Cost</label></div></div>
                       <input type="file" onChange={e=>handleUpload(e, 'image', false, true)} />
                    </div>
                 )}

                 {/* VEHICLE FORM */}
                 {entityType === 'vehicle' && (
                    <div className="space-y-4">
                       <FormInput label="Vehicle Name" value={vehicleForm.name} onChange={v=>setVehicleForm({...vehicleForm, name: v})} />
                       <div className="grid grid-cols-3 gap-2"><select className="border p-2 rounded text-sm" value={vehicleForm.category} onChange={e=>setVehicleForm({...vehicleForm, category: e.target.value})}><option>SUV</option><option>Saloon</option><option>Truck</option></select><select className="border p-2 rounded text-sm" value={vehicleForm.fuel} onChange={e=>setVehicleForm({...vehicleForm, fuel: e.target.value})}><option>Gasoline</option><option>Diesel</option><option>EV</option></select><select className="border p-2 rounded text-sm" value={vehicleForm.condition} onChange={e=>setVehicleForm({...vehicleForm, condition: e.target.value})}><option>Used</option><option>Brand New</option></select></div>
                       <div className="grid grid-cols-3 gap-2"><FormInput label="Price ($)" value={vehicleForm.price} onChange={v=>setVehicleForm({...vehicleForm, price: v})} /><FormInput label="Shipping" value={vehicleForm.shipping} onChange={v=>setVehicleForm({...vehicleForm, shipping: v})} /><FormInput label="Docs" value={vehicleForm.documentation} onChange={v=>setVehicleForm({...vehicleForm, documentation: v})} /></div>
                       <FormInput label="VIN" value={vehicleForm.vin} onChange={v=>setVehicleForm({...vehicleForm, vin: v})} />
                       <input type="file" onChange={e=>handleUpload(e, 'images', true)} />
                    </div>
                 )}
               </div>
               
               <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button onClick={()=>setIsModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 rounded font-bold text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
                  <button onClick={handleSubmit} className="px-8 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 shadow-lg flex items-center gap-2"><Save size={16}/> Save Changes</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

// Helpers
const SidebarLink = ({ id, icon: Icon, label, active, setActive, badge }) => (<button onClick={()=>setActive(id)} className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-sm font-bold transition-all ${active===id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><div className="flex items-center gap-3"><Icon size={18}/> {label}</div>{badge > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}</button>);
const StatCard = ({ label, value, icon: Icon, color }) => { const c = { blue: 'bg-blue-100 text-blue-600', purple: 'bg-purple-100 text-purple-600', green: 'bg-green-100 text-green-600', slate: 'bg-slate-100 text-slate-600' }; return <div className="bg-white p-6 border rounded-lg flex items-center gap-4 shadow-sm"><div className={`p-3 rounded-lg ${c[color]}`}><Icon size={24}/></div><div><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="text-2xl font-black">{value}</p></div></div>; };
const FormInput = ({ label, value, onChange }) => (<div><label className="block text-xs font-bold text-slate-500 mb-1">{label}</label><input className="w-full p-2 border rounded-lg text-sm outline-none focus:border-blue-600 transition-all" value={value || ''} onChange={e=>onChange(e.target.value)} /></div>);