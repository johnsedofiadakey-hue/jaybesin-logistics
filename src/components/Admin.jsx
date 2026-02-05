import React, { useState, useMemo, useEffect } from 'react';
import {
   LayoutDashboard, Database, Car, Settings, Search, Plus,
   Save, X, Menu, Trash2, Edit2, DollarSign,
   Package, Container, MessageSquare, Globe,
   ShoppingBag, Receipt, CheckSquare, Square,
   Upload, Image as ImageIcon, Send, Check, RefreshCw, AlertCircle, LogOut,
   FileText, Users
} from 'lucide-react';

// --- INTEGRATED MODULES ---
import InvoiceSystem from './InvoiceSystem';
import ManageUsers from './Admin/ManageUsers'; // New RBAC Module
import { useShipments, LOGISTICS_STAGES } from './ShipmentContext';
import { useAuth } from '../context/AuthContext'; // Auth Hook 

/**
 * JAY-BESIN | MASTER ADMIN HUB v306.1 (NETWORK OPTIMIZED)
 * -------------------------------------------------------------------------
 * DEVELOPER: World Top Software Engineer
 * * ENGINEERING STATUS:
 * 1. PERSISTENCE: Data Sanitization Layer Active (Prevents Cloud Errors).
 * 2. INTEGRATION: Full Connection to ShipmentContext & InvoiceSystem.
 * 3. UX: Mobile/Desktop Responsive Grid System.
 * -------------------------------------------------------------------------
 */

export default function Admin({
   setView = () => { }
}) {
   const shipmentContext = useShipments();
   const { logout, isSuperAdmin, currentUser } = useAuth(); // Access Control

   // Safe destructuring with default values to prevent crashes
   const {
      shipments = [],
      products = [],
      vehicles = [],
      categories = [],
      messages = [],
      settings = {},
      addShipment = () => { },
      updateShipment = () => { },
      deleteShipment = () => { },
      addProduct = () => { },
      deleteProduct = () => { },
      addVehicle = () => { },
      updateVehicle = () => { },
      deleteVehicle = () => { },
      addCategory = () => { },
      deleteCategory = () => { },
      setSettings = () => { }
   } = shipmentContext || {};

   // --- INTERFACE STATE ---
   const [activeTab, setActiveTab] = useState('overview');
   const [searchTerm, setSearchTerm] = useState('');
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [selectedIds, setSelectedIds] = useState([]);
   const [bulkStatus, setBulkStatus] = useState('');

   // --- SOURCING STATE ---
   const [currency, setCurrency] = useState('USD'); // Toggle USD/GHS

   // --- SETTINGS BUFFER (Local State) ---
   const [localSettings, setLocalSettings] = useState({
      logo: '', heroImg: '', heroTitle: '', heroSubtitle: '',
      companyEmail: '', contactPhone: '', whatsappNumber: '',
      companyAddress: '', seaRate: '', nextLoadingDate: '',
      chinaSeaAddr: '', chinaAirAddr: '',
      currencyRate: '15.8',
      airRates: { normal: '', battery: '', express: '' },
      socials: { facebook: '', instagram: '', twitter: '', linkedin: '' }
   });
   const [hasChanges, setHasChanges] = useState(false);

   // Sync Global Settings to Local Buffer on Load
   useEffect(() => {
      if (settings && Object.keys(settings).length > 0) {
         setLocalSettings(prev => ({
            ...prev,
            ...settings,
            airRates: { ...prev.airRates, ...(settings.airRates || {}) },
            socials: { ...prev.socials, ...(settings.socials || {}) }
         }));
      }
   }, [settings]);

   // --- FORM & MODAL STATE ---
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalMode, setModalMode] = useState('create');
   const [entityType, setEntityType] = useState('manifest');
   const [currentId, setCurrentId] = useState(null);
   const [notifyClient, setNotifyClient] = useState(null);
   const [newCategoryName, setNewCategoryName] = useState('');

   // --- DATA ENTRY BUFFERS ---
   const [manifestForm, setManifestForm] = useState({
      trackingNumber: '', dateReceived: '', status: 'Order Initiated',
      origin: 'China', destination: 'Ghana', mode: 'Sea Freight',
      consigneeName: '', consigneePhone: '', containerId: '',
      ratePerCbm: 450, shippingFee: 0, items: []
   });

   const [vehicleForm, setVehicleForm] = useState({
      name: '', vin: '', engine: '', year: '', price: '',
      shipping: '', documentation: '', description: '', images: [],
      category: 'SUV', fuel: 'Gasoline', condition: 'Brand New'
   });

   const [productForm, setProductForm] = useState({
      name: '', description: '', price: '', image: '', category: '', isLandedCost: false
   });

   // --- ANALYTICS ENGINE ---
   const safeNum = (val) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
   };

   const stats = useMemo(() => {
      return {
         activePackages: shipments.length,
         totalVolume: shipments.reduce((acc, curr) => acc + safeNum(curr?.totalVolume), 0),
         totalRevenue: shipments.reduce((acc, curr) => acc + safeNum(curr?.totalCost), 0),
         inboxCount: messages.length
      };
   }, [shipments, messages]);

   const filteredShipments = useMemo(() => {
      if (!searchTerm) return shipments;
      const q = searchTerm.toLowerCase().trim();
      return shipments.filter(ship =>
         (ship.trackingNumber || '').toLowerCase().includes(q) ||
         (ship.consigneeName || '').toLowerCase().includes(q) ||
         (ship.containerId || '').toLowerCase().includes(q)
      );
   }, [shipments, searchTerm]);

   // --- ACTION HANDLERS ---

   const handleSettingChange = (field, value) => {
      setHasChanges(true);
      setLocalSettings(prev => ({ ...prev, [field]: value }));
   };

   const handleNestedSettingChange = (parent, field, value) => {
      setHasChanges(true);
      setLocalSettings(prev => ({
         ...prev,
         [parent]: { ...prev[parent], [field]: value }
      }));
   };

   const openModal = (type, mode, data = null) => {
      setEntityType(type);
      setModalMode(mode);
      setIsModalOpen(true);

      if (mode === 'edit' && data) {
         if (type === 'manifest') setManifestForm({ ...data, items: data.items || [] });
         if (type === 'product') setProductForm(data);
         if (type === 'vehicle') setVehicleForm(data);
         setCurrentId(data.id);
      } else {
         setCurrentId(null);
         if (type === 'manifest') {
            generateTrackingID();
            setManifestForm({
               trackingNumber: `JB-CN-${Math.floor(100000 + Math.random() * 900000)}`,
               consigneeName: '', consigneePhone: '', containerId: '',
               ratePerCbm: 450, shippingFee: 0, status: LOGISTICS_STAGES[0],
               origin: 'Guangzhou, China', destination: 'Accra, Ghana',
               items: [{ description: '', quantity: 1, weight: 0, cbm: 0 }]
            });
         }
         if (type === 'product') {
            setProductForm({
               name: '', description: '', price: '', image: '', category: '', isLandedCost: false
            });
         }
         if (type === 'vehicle') {
            setVehicleForm({
               name: '', vin: '', engine: '', year: new Date().getFullYear(), price: '', shipping: '', documentation: '', description: '', images: [], category: 'SUV', fuel: 'Gasoline', condition: 'Brand New'
            });
         }
      }
   };

   const generateTrackingID = () => {
      setManifestForm(p => ({ ...p, trackingNumber: `JB-CN-${Math.floor(100000 + Math.random() * 900000)}` }));
   };

   const handleFileUpload = (e, field, mode) => {
      if (mode === 'vehicle') {
         const files = Array.from(e.target.files);
         files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
               setVehicleForm(p => ({ ...p, images: [...(p.images || []), reader.result] }));
            };
            reader.readAsDataURL(file);
         });
      } else {
         const file = e.target.files?.[0];
         if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
               if (mode === 'product') setProductForm(p => ({ ...p, image: reader.result }));
               else {
                  setLocalSettings(prev => ({ ...prev, [field]: reader.result }));
                  setHasChanges(true);
               }
            };
            reader.readAsDataURL(file);
         }
      }
   };

   const handleFormSubmit = async () => {
      try {
         if (entityType === 'manifest') {
            const cbmTotal = (manifestForm.items || []).reduce((sum, i) => sum + safeNum(i.cbm), 0);
            const finalTotal = (cbmTotal * safeNum(manifestForm.ratePerCbm)) + safeNum(manifestForm.shippingFee);

            // SANITIZATION: Defaulting undefined values to prevent Cloud Errors
            const finalData = {
               trackingNumber: manifestForm.trackingNumber || '',
               dateReceived: manifestForm.dateReceived || new Date().toISOString().split('T')[0],
               status: manifestForm.status || 'Order Initiated',
               origin: manifestForm.origin || 'China',
               destination: manifestForm.destination || 'Ghana',
               mode: manifestForm.mode || 'Sea Freight',
               consigneeName: manifestForm.consigneeName || 'Unknown Client',
               consigneePhone: manifestForm.consigneePhone || '',
               containerId: manifestForm.containerId || '',
               ratePerCbm: safeNum(manifestForm.ratePerCbm),
               shippingFee: safeNum(manifestForm.shippingFee),
               items: manifestForm.items || [],
               totalVolume: cbmTotal.toFixed(3),
               totalCost: finalTotal.toFixed(2)
            };

            if (modalMode === 'create') {
               await addShipment(finalData);
               const phone = String(finalData.consigneePhone || '').replace(/[^0-9]/g, '');
               if (phone) {
                  setNotifyClient({
                     name: finalData.consigneeName,
                     link: `https://wa.me/${phone}?text=Hello, your shipment ${finalData.trackingNumber} has been received. Status: ${finalData.status}. Total Due: $${finalData.totalCost}. Track at: jaybesin.com`
                  });
               }
            } else {
               await updateShipment(currentId, finalData);
            }
         }
         else if (entityType === 'product') {
            const cleanProduct = {
               name: productForm.name || 'Untitled',
               description: productForm.description || '',
               price: productForm.price || '0',
               image: productForm.image || '',
               category: productForm.category || 'Uncategorized',
               isLandedCost: !!productForm.isLandedCost
            };
            if (modalMode === 'create') {
               await addProduct(cleanProduct);
            } else {
               await deleteProduct(currentId);
               await addProduct(cleanProduct);
            }
         }
         else if (entityType === 'vehicle') {
            const cleanVehicle = {
               name: vehicleForm.name || '',
               vin: vehicleForm.vin || '',
               engine: vehicleForm.engine || '',
               year: vehicleForm.year || '',
               price: vehicleForm.price || '0',
               shipping: vehicleForm.shipping || '',
               documentation: vehicleForm.documentation || '',
               description: vehicleForm.description || '',
               images: vehicleForm.images || [],
               category: vehicleForm.category || 'SUV',
               fuel: vehicleForm.fuel || 'Gasoline',
               condition: vehicleForm.condition || 'Used'
            };
            if (modalMode === 'create') {
               await addVehicle(cleanVehicle);
            } else {
               await updateVehicle(currentId, cleanVehicle);
            }
         }
         setIsModalOpen(false);
      } catch (err) {
         console.error("Save failed:", err);
         alert(`CRITICAL ERROR: Cloud Save Failed.\nDetails: ${err.message}`);
      }
   };

   const getWhatsAppLink = (shipment) => {
      if (!shipment) return "";
      const phone = String(shipment.consigneePhone || '').replace(/[^0-9]/g, '');
      const msg = `Hello ${shipment.consigneeName}, update on shipment ${shipment.trackingNumber}. Current Status: ${shipment.status}. Total: $${shipment.totalCost}.`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
   };

   // --- CONTENT RENDERERS ---

   const renderContent = () => {
      switch (activeTab) {
         case 'overview': return (
            <div className="space-y-6 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Total Shipments" value={stats.activePackages} icon={Package} color="blue" />
                  <StatCard label="Total CBM" value={stats.totalVolume.toFixed(2)} icon={Container} color="slate" />
                  <StatCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
                  <StatCard label="Messages" value={stats.inboxCount} icon={MessageSquare} color="blue" />
               </div>

               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Globe size={24} /></div>
                     <div><h3 className="font-bold text-slate-900">System Status</h3><p className="text-xs text-slate-500">Global Synchronized Network</p></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100"><p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Database</p><p className="text-green-600 font-bold text-sm">Online</p></div>
                     <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100"><p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Sync Status</p><p className="text-blue-600 font-bold text-sm">Active</p></div>
                  </div>
               </div>
            </div>
         );

         case 'manifest': return (
            <div className="space-y-6 animate-in fade-in">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
                  <h2 className="text-xl font-bold text-slate-800">Shipment Manifest</h2>
                  <button onClick={() => openModal('manifest', 'create')} className="w-full md:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"><Plus size={16} /> New Entry</button>
               </div>

               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-4">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Search tracking ID or client..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                     </div>
                     {/* Bulk Actions - Stack on mobile */}
                     {selectedIds.length > 0 && (
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                           <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="bg-white border border-slate-300 rounded-lg text-xs font-bold px-3 py-2 outline-none">
                              <option value="">Update Status...</option>
                              {LOGISTICS_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <button onClick={async () => { for (const id of selectedIds) await updateShipment(id, { status: bulkStatus }); setSelectedIds([]); }} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold">Apply Bulk</button>
                        </div>
                     )}
                  </div>

                  {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
                  <div className="hidden md:block overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-xs tracking-wider">
                           <tr><th className="p-4 w-10"><Square size={16} /></th><th className="p-4">Tracking ID</th><th className="p-4">Client</th><th className="p-4">Status</th><th className="p-4 text-right">Fee</th><th className="p-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {filteredShipments.map(s => (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-4 text-center"><button onClick={() => setSelectedIds(p => p.includes(s.id) ? p.filter(i => i !== s.id) : [...p, s.id])}>{selectedIds.includes(s.id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} className="text-slate-300" />}</button></td>
                                 <td className="p-4 font-mono text-blue-600 font-bold">{s.trackingNumber}</td>
                                 <td className="p-4 font-bold text-slate-700">{s.consigneeName} <span className="text-xs text-slate-400 font-normal block">{s.containerId || 'No Container'}</span></td>
                                 <td className="p-4">
                                    <select value={s.status} onChange={e => updateShipment(s.id, { status: e.target.value })} className="bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold outline-none cursor-pointer hover:border-blue-500 text-slate-600">
                                       {LOGISTICS_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                                    </select>
                                 </td>
                                 <td className="p-4 text-right font-bold text-slate-900">${s.totalCost}</td>
                                 <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => setActiveTab('invoices')} className="text-slate-400 hover:text-purple-600 p-1.5 hover:bg-purple-50 rounded" title="Generate Invoice"><FileText size={16} /></button>
                                    <a href={getWhatsAppLink(s)} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700 p-1.5 hover:bg-green-50 rounded"><MessageSquare size={16} /></a>
                                    <button onClick={() => openModal('manifest', 'edit', s)} className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                    <button onClick={() => deleteShipment(s.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* MOBILE CARD VIEW (Shown ONLY on Mobile) */}
                  <div className="md:hidden bg-slate-50 p-4 space-y-4">
                     {filteredShipments.map(s => (
                        <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                           <div className="flex justify-between items-start">
                              <div>
                                 <span className="font-mono text-blue-600 font-bold text-lg">{s.trackingNumber}</span>
                                 <p className="font-bold text-slate-800 text-sm">{s.consigneeName}</p>
                              </div>
                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{s.status}</span>
                           </div>

                           <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                              <div><p className="text-slate-400 font-bold uppercase text-[10px]">Container</p><p>{s.containerId || 'N/A'}</p></div>
                              <div className="text-right"><p className="text-slate-400 font-bold uppercase text-[10px]">Total Cost</p><p className="text-green-600 font-bold text-sm">${s.totalCost}</p></div>
                           </div>

                           <div className="flex justify-between gap-2 pt-2">
                              <a href={getWhatsAppLink(s)} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg flex items-center justify-center"><MessageSquare size={18} /></a>
                              <button onClick={() => openModal('manifest', 'edit', s)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg flex items-center justify-center"><Edit2 size={18} /></button>
                              <button onClick={() => deleteShipment(s.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg flex items-center justify-center"><Trash2 size={18} /></button>
                           </div>
                        </div>
                     ))}
                     {filteredShipments.length === 0 && <p className="text-center text-slate-400 text-sm">No shipments found.</p>}
                  </div>

               </div>
            </div>
         );

         case 'mart': return (
            <div className="space-y-8 animate-in fade-in pb-20">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Category Hub</h3>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                     <input className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="New Category Name..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                     <button onClick={() => { if (newCategoryName.trim()) { addCategory(newCategoryName.toUpperCase()); setNewCategoryName(''); } }} className="bg-slate-900 text-white px-6 py-2 sm:py-0 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all">Add Node</button>
                  </div>
                  <div className="flex flex-wrap gap-2">{categories.map(c => <span key={c} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 flex items-center gap-2">{c} <button onClick={() => deleteCategory(c)} className="hover:text-red-500"><X size={12} /></button></span>)}</div>
               </div>

               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
                  <h2 className="text-xl font-bold text-slate-800">Inventory Management</h2>
                  <div className="flex gap-4 w-full sm:w-auto">
                     <button onClick={() => setCurrency(c => c === 'USD' ? 'GHS' : 'USD')} className="flex-1 sm:flex-none bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"><RefreshCw size={14} /> {currency}</button>
                     <button onClick={() => openModal('product', 'create')} className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md"><Plus size={16} /> Add Product</button>
                  </div>
               </div>
               {/* RESPONSIVE GRID: 1 col mobile, 2 col tablet, 4 col desktop */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map(p => (
                     <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                           {p.image && <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                           <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase">{p.category}</div>
                           <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openModal('product', 'edit', p)} className="bg-white p-1.5 rounded-lg text-blue-600 shadow-lg"><Edit2 size={14} /></button>
                           </div>
                        </div>
                        <div className="p-4">
                           <h4 className="font-bold text-slate-900 truncate mb-1">{p.name}</h4>
                           <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                              <span className="text-blue-600 font-bold">
                                 {currency === 'USD' ? `$${p.price}` : `₵${(parseFloat(p.price) * (parseFloat(settings.currencyRate) || 15.8)).toFixed(2)}`}
                              </span>
                              <button onClick={() => deleteProduct(p.id)} className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                           </div>
                        </div>
                     </div>
                  ))}
                  {products.length === 0 && <div className="col-span-full text-center py-12 text-slate-400 italic">No inventory detected in cloud.</div>}
               </div>
            </div>
         );

         case 'vehicle': return (
            <div className="space-y-6 animate-in fade-in pb-20">
               <div className="flex justify-between items-center pb-4 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-800">Vehicle Studio</h2><button onClick={() => openModal('vehicle', 'create')} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700"><Plus size={16} /> Add Vehicle</button></div>
               {/* RESPONSIVE GRID: 1 col mobile, 3 col desktop */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {vehicles.map(v => (
                     <div key={v.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                           {v.images?.[0] && <img src={v.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                           <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">{v.condition}</div>
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openModal('vehicle', 'edit', v)} className="bg-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"><Edit2 size={14} /> Edit Specifications</button>
                           </div>
                        </div>
                        <div className="p-4">
                           <h4 className="font-bold text-slate-900 truncate">{v.name}</h4>
                           <p className="text-xs text-slate-500 mb-3">{v.category} • {v.fuel}</p>
                           <div className="flex justify-between items-center pt-3 border-t border-slate-100"><span className="text-xs font-mono text-slate-400">VIN: {v.vin}</span><button onClick={() => deleteVehicle(v.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         );

         case 'invoices': return (
            <div className="w-full h-full animate-in fade-in">
               <InvoiceSystem />
            </div>
         );

         case 'inbox': return (
            <div className="space-y-4 animate-in fade-in pb-20">
               <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">Communication Hub</h2>
               {messages.map(m => (
                  <div key={m.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <div><h4 className="font-bold text-slate-900">{m.name}</h4><p className="text-xs text-slate-500">{m.email} • {m.phone}</p></div>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{m.subject}</span>
                     </div>
                     <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">"{m.message}"</p>
                     <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase">{m.createdAt}</p>
                  </div>
               ))}
               {messages.length === 0 && <div className="text-center py-12 text-slate-400">No signals detected.</div>}
            </div>
         );

         case 'users': return (
            <div className="animate-in fade-in pb-20">
               <ManageUsers />
            </div>
         );

         case 'settings':
            if (!isSuperAdmin) return <div className="p-8 text-center text-red-500">Access Denied. Super Admin Privilege Required.</div>;
            return (
               <div className="max-w-4xl space-y-8 pb-20 animate-in fade-in">
                  <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider border-b border-slate-100 pb-2">Terminal Identity</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500">Logo</label><div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center relative hover:border-blue-500 group">{localSettings.logo ? <img src={localSettings.logo} className="h-full object-contain p-4 group-hover:scale-110 transition-transform" /> : <span className="text-xs text-slate-400">Upload</span>}<input type="file" onChange={e => handleFileUpload(e, 'logo', 'settings')} className="absolute inset-0 opacity-0 cursor-pointer" /></div></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500">Hero Image</label><div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center relative hover:border-blue-500 group">{localSettings.heroImg ? <img src={localSettings.heroImg} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" /> : <span className="text-xs text-slate-400">Upload</span>}<input type="file" onChange={e => handleFileUpload(e, 'heroImg', 'settings')} className="absolute inset-0 opacity-0 cursor-pointer" /></div></div>
                        <FormInput label="Site Display Name" value={localSettings.heroTitle} onChange={v => handleSettingChange('heroTitle', v)} />
                        <FormInput label="Hero Tagline" value={localSettings.heroSubtitle} onChange={v => handleSettingChange('heroSubtitle', v)} />
                        <FormInput label="Support Email" value={localSettings.companyEmail} onChange={v => handleSettingChange('companyEmail', v)} />
                        <FormInput label="Support Phone" value={localSettings.contactPhone} onChange={v => handleSettingChange('contactPhone', v)} />
                        <FormInput label="WhatsApp Number" value={localSettings.whatsappNumber} onChange={v => handleSettingChange('whatsappNumber', v)} />
                        <FormInput label="Physical HQ Address" value={localSettings.companyAddress} onChange={v => handleSettingChange('companyAddress', v)} />
                     </div>
                  </div>
                  <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider border-b border-slate-100 pb-2">Logistics Parameters</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="Standard Sea Rate ($/CBM)" value={localSettings.seaRate} onChange={v => handleSettingChange('seaRate', v)} />
                        <FormInput label="Next Groupage Loading" value={localSettings.nextLoadingDate} onChange={v => handleSettingChange('nextLoadingDate', v)} />
                        <FormInput label="China Sea Warehouse Addr" value={localSettings.chinaSeaAddr} onChange={v => handleSettingChange('chinaSeaAddr', v)} />
                        <FormInput label="China Air Warehouse Addr" value={localSettings.chinaAirAddr} onChange={v => handleSettingChange('chinaAirAddr', v)} />
                        <FormInput label="Air Normal Rate ($/KG)" value={localSettings.airRates?.normal} onChange={v => handleNestedSettingChange('airRates', 'normal', v)} />
                        <FormInput label="Air Battery Rate ($/KG)" value={localSettings.airRates?.battery} onChange={v => handleNestedSettingChange('airRates', 'battery', v)} />
                        <FormInput label="Currency Rate (GHS/$)" value={localSettings.currencyRate} onChange={v => handleSettingChange('currencyRate', v)} />
                        <FormInput label="Admin Passcode" value={localSettings.adminPass} onChange={v => handleSettingChange('adminPass', v)} />
                     </div>
                  </div>
                  {hasChanges && (
                     <div className="fixed bottom-6 right-6 z-50 flex gap-4">
                        <button onClick={() => { setLocalSettings(settings); setHasChanges(false); }} className="bg-white text-slate-600 px-6 py-3 rounded-xl shadow-lg font-bold border border-slate-200 hover:bg-slate-50">Discard</button>
                        <button onClick={() => { setSettings(localSettings); setHasChanges(false); alert("Cloud Settings Synchronized."); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg font-bold hover:bg-blue-700 flex items-center gap-2 animate-bounce-short"><Save size={16} /> Push to Cloud</button>
                     </div>
                  )}
               </div>
            );
         default: return null;
      }
   };

   return (
      <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
         {/* MOBILE BACKDROP: Close sidebar when clicking outside */}
         {sidebarOpen && (
            <div
               className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-sm"
               onClick={() => setSidebarOpen(false)}
            />
         )}

         {/* SIDEBAR: Slide-in on Mobile, Fixed on Desktop */}
         <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl md:shadow-none`}>
            <div className="h-16 flex items-center px-6 border-b border-slate-800 justify-between md:justify-start bg-slate-950">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">JB</div>
                  <div className="font-semibold text-white tracking-tight">Jay-Besin</div>
               </div>
               {/* Close Button for Mobile */}
               <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                  <X size={20} />
               </button>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-4">Platform</div>
               <SidebarLink id="overview" icon={LayoutDashboard} label="Dashboard" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
               <SidebarLink id="manifest" icon={Database} label="Logistics Grid" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
               <SidebarLink id="invoices" icon={Receipt} label="Finance & Billing" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} />

               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-6">Extensions</div>
               <SidebarLink id="mart" icon={ShoppingBag} label="Sourcing" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
               <SidebarLink id="vehicle" icon={Car} label="Fleet Sales" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
               <SidebarLink id="inbox" icon={MessageSquare} label="Inbox" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} badge={stats.inboxCount} />

               {isSuperAdmin && (
                  <>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-6">Administration</div>
                     <SidebarLink id="users" icon={Users} label="User Management" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
                     <SidebarLink id="settings" icon={Settings} label="Global Settings" active={activeTab} setActive={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
                  </>
               )}
            </nav>
            <div className="p-4 border-t border-slate-800 bg-slate-950">
               <button onClick={() => { logout(); setView('home'); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                  <LogOut size={16} /> Sign Out
               </button>
            </div>
         </aside>

         <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative bg-slate-50">
            {/* MOBILE HEADER: Sticky, Frosted Glass, Native Feel */}
            <div className="md:hidden h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/60 flex items-center px-4 justify-between shrink-0 sticky top-0 z-20">
               <div className="flex items-center gap-3">
                  <button onClick={() => setSidebarOpen(true)} className="p-2.5 -ml-2 rounded-full text-slate-700 hover:bg-slate-100 active:scale-90 transition-all">
                     <Menu size={22} strokeWidth={2.5} />
                  </button>
                  <span className="font-bold text-slate-900 tracking-tight text-lg">Jay-Besin</span>
               </div>
               <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white shadow-sm">
                  {currentUser?.email?.[0].toUpperCase() || 'A'}
               </div>
            </div>

            {/* CONTENT AREA: Native scrolling momentum */}
            <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-8 overscroll-y-contain -webkit-overflow-scrolling-touch hide-scrollbar selection:bg-blue-100">
               {renderContent()}
            </div>
         </main>

         {/* MODAL SYSTEM */}
         {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-lg text-slate-900 capitalize">{modalMode} {entityType}</h3><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button></div>
                  <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                     {entityType === 'manifest' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormInput label="Customer Name" value={manifestForm.consigneeName} onChange={v => setManifestForm(p => ({ ...p, consigneeName: v }))} />
                              <FormInput label="Phone Number" value={manifestForm.consigneePhone} onChange={v => setManifestForm(p => ({ ...p, consigneePhone: v }))} />
                           </div>
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">Tracking Number</label><div className="flex gap-2"><input className="flex-1 p-2 border border-slate-300 rounded text-sm font-mono font-bold text-blue-600 outline-none" value={manifestForm.trackingNumber} onChange={e => setManifestForm(p => ({ ...p, trackingNumber: e.target.value }))} /><button onClick={generateTrackingID} className="p-2 bg-white border border-slate-300 rounded text-slate-500 hover:text-blue-600"><Check size={16} /></button></div></div>
                              <FormInput label="Container ID" value={manifestForm.containerId} onChange={v => setManifestForm(p => ({ ...p, containerId: v }))} />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormInput label="Rate ($/CBM)" value={manifestForm.ratePerCbm} onChange={v => setManifestForm(p => ({ ...p, ratePerCbm: v }))} />
                              <FormInput label="Extra Fees ($)" value={manifestForm.shippingFee} onChange={v => setManifestForm(p => ({ ...p, shippingFee: v }))} />
                           </div>
                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase">Itemized Cargo List</h4>
                              {(manifestForm.items || []).map((item, idx) => (
                                 <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2 pb-2 border-b border-slate-200 sm:border-0 last:border-0">
                                    <input placeholder="Item Description" className="flex-1 p-2 border border-slate-300 rounded text-sm outline-none" value={item.description} onChange={e => { const n = [...manifestForm.items]; n[idx].description = e.target.value; setManifestForm(p => ({ ...p, items: n })) }} />
                                    <div className="flex gap-2">
                                       <input placeholder="Qty" type="number" className="w-1/2 sm:w-20 p-2 border border-slate-300 rounded text-sm text-center outline-none" value={item.quantity} onChange={e => { const n = [...manifestForm.items]; n[idx].quantity = e.target.value; setManifestForm(p => ({ ...p, items: n })) }} />
                                       <input placeholder="CBM" type="number" className="w-1/2 sm:w-24 p-2 border border-slate-300 rounded text-sm text-center outline-none" value={item.cbm} onChange={e => { const n = [...manifestForm.items]; n[idx].cbm = e.target.value; setManifestForm(p => ({ ...p, items: n })) }} />
                                       <button onClick={() => { const n = manifestForm.items.filter((_, i) => i !== idx); setManifestForm(p => ({ ...p, items: n })) }} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                                    </div>
                                 </div>
                              ))}
                              <button onClick={() => setManifestForm(p => ({ ...p, items: [...(p.items || []), { description: '', quantity: 1, cbm: 0 }] }))} className="text-xs font-bold text-blue-600 hover:underline mt-2 flex items-center gap-1"><Plus size={12} /> Append Item</button>
                           </div>
                        </div>
                     )}
                     {entityType === 'product' && (
                        <div className="space-y-6">
                           <FormInput label="Inventory Name" value={productForm.name} onChange={v => setProductForm(p => ({ ...p, name: v }))} />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">Node Category</label><select className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}><option value="">Select Category...</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                              <FormInput label="Unit Price (USD)" value={productForm.price} onChange={v => setProductForm(p => ({ ...p, price: v }))} />
                           </div>
                           <div className="space-y-1"><label className="text-xs font-bold text-slate-500">Specifications</label><textarea className="w-full p-3 border border-slate-300 rounded-lg text-sm h-32 outline-none resize-none" placeholder="Provide full details for sourcing..." value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}></textarea></div>
                           <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                              {productForm.image ? <img src={productForm.image} className="h-32 mx-auto object-contain" /> : <div className="text-center"><Upload className="mx-auto text-slate-300 mb-2" size={24} /><p className="text-xs text-slate-500 font-bold">Import Image Node</p></div>}
                              <input type="file" onChange={e => handleFileUpload(e, 'image', 'product')} className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                        </div>
                     )}
                     {entityType === 'vehicle' && (
                        <div className="space-y-6">
                           <FormInput label="Vehicle Model Designation" value={vehicleForm.name} onChange={v => setVehicleForm(p => ({ ...p, name: v }))} />
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">Type</label><select className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none" value={vehicleForm.category} onChange={e => setVehicleForm(p => ({ ...p, category: e.target.value }))}><option>SUV</option><option>Saloon</option><option>Truck</option><option>Van</option></select></div>
                              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">Powertrain</label><select className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none" value={vehicleForm.fuel} onChange={e => setVehicleForm(p => ({ ...p, fuel: e.target.value }))}><option>Gasoline</option><option>Electric (EV)</option><option>Diesel</option><option>Hybrid</option></select></div>
                              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">State</label><select className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none" value={vehicleForm.condition} onChange={e => setVehicleForm(p => ({ ...p, condition: e.target.value }))}><option>Brand New</option><option>Used (Certified)</option></select></div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormInput label="Base Price ($)" value={vehicleForm.price} onChange={v => setVehicleForm(p => ({ ...p, price: v }))} />
                              <FormInput label="VIN Registry" value={vehicleForm.vin} onChange={v => setVehicleForm(p => ({ ...p, vin: v }))} />
                              <FormInput label="Manufacturing Year" value={vehicleForm.year} onChange={v => setVehicleForm(p => ({ ...p, year: v }))} />
                           </div>
                           <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                              {vehicleForm.images && vehicleForm.images.length > 0 ? (
                                 <div className="flex gap-2 overflow-x-auto p-2">
                                    {vehicleForm.images.map((img, i) => (
                                       <div key={i} className="relative shrink-0">
                                          <img src={img} className="h-20 w-32 object-cover rounded border border-slate-200 shadow-sm" />
                                          <button onClick={(e) => { e.preventDefault(); setVehicleForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) })) }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                                       </div>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="text-center"><ImageIcon className="mx-auto text-slate-300 mb-2" size={24} /><p className="text-xs text-slate-500 font-bold">Import Fleet Visuals (Multiple Allowed)</p></div>
                              )}
                              <input type="file" multiple onChange={e => handleFileUpload(e, 'images', 'vehicle')} className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                     <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors">Abort</button>
                     <button onClick={handleFormSubmit} className="px-8 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2"><Save size={14} /> Commit to Cloud</button>
                  </div>
               </div>
            </div>
         )}

         {/* SUCCESS NOTIFICATION */}
         {notifyClient && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in zoom-in">
               <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={24} /></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Record Finalized</h3>
                  <p className="text-sm text-slate-500 mb-6">Dispatch shipment update to client via WhatsApp?</p>
                  <div className="flex flex-col gap-2">
                     <a href={notifyClient.link} target="_blank" rel="noreferrer" onClick={() => setNotifyClient(null)} className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-green-700 flex items-center justify-center gap-2 transition-all"><Send size={16} /> Dispatch Signal</a>
                     <button onClick={() => setNotifyClient(null)} className="text-xs text-slate-400 hover:text-slate-600 py-2">Continue without alert</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

// --- SUB-COMPONENTS ---
const SidebarLink = ({ id, icon: Icon, label, active, setActive, badge }) => (
   <button onClick={() => setActive(id)} className={`w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <div className="flex items-center gap-3"><Icon size={18} /> {label}</div>
      {badge > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{badge}</span>}
   </button>
);

const StatCard = ({ label, value, icon: Icon, color }) => {
   const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', slate: 'bg-slate-50 text-slate-600', purple: 'bg-purple-50 text-purple-600' };
   return (
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
         <div className={`p-2 rounded-lg ${colors[color] || 'bg-slate-50'} mb-3 w-fit`}><Icon size={20} /></div>
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
         <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
   );
};

const FormInput = ({ label, value, onChange }) => (
   <div className="space-y-1 flex-1">
      <label className="text-xs font-bold text-slate-500">{label}</label>
      <input className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all bg-white" value={value || ''} onChange={e => onChange(e.target.value)} autoComplete="off" />
   </div>
);