import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { 
  Printer, Settings, RefreshCcw, Palette, Image as ImageIcon, 
  FileText, Box, Ship, ArrowLeft, Truck, User, Edit, Save, Plus, Trash2, 
  CreditCard, CheckCircle, FilePlus, Container, Layers, PenTool
} from 'lucide-react';

// --- CONNECT TO THE BRAIN ---
import { useShipments } from './ShipmentContext'; 

/**
 * JAY-BESIN | INVOICE CORE v4.3 (BRANDING UPDATE)
 * -----------------------------------------------------------
 * - Branding: JayBesin Logistics (Default).
 * - Powered By: Nexus Solutions (Footer).
 */

// --- 1. PRINT STYLES ---
const PrintStyles = () => (
  <style>{`
    @media print {
      body * { visibility: hidden; }
      #printable-doc-area, #printable-doc-area * { visibility: visible; }
      #printable-doc-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
      @page { size: A4; margin: 20mm; }
      .no-print { display: none !important; }
      input, textarea { border: none !important; background: transparent !important; resize: none; }
    }
  `}</style>
);

// --- 2. SETTINGS CONTEXT ---
const DEFAULT_SETTINGS = {
  companyName: "JayBesin Logistics",
  companyAddress: "Cargo Village, KIA, Accra, Ghana", 
  companyEmail: "accounts@jaybesin.com",
  companyPhone: "+233 24 412 3456",
  primaryColor: "#2563eb", 
  secondaryColor: "#1e293b",
  logoUrl: null,
  currencyRate: 15.8, 
  defaultTaxRate: 0, 
  bankName: "Ecobank Ghana",
  accountName: "JayBesin Logistics Ltd",
  accountNumber: "1441000123456",
  termsAndConditions: "Freight charges must be paid in full before cargo release.",
  footerText: "Thank you for shipping with JayBesin Logistics. Powered by Nexus Solutions.", // UPDATED
};

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
  const [invoiceSettings, setInvoiceSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('stormglide_invoice_config_v4');
    if (saved) { try { setInvoiceSettings(JSON.parse(saved)); } catch (e) { console.error(e); } }
  }, []);

  const saveSettings = (newSettings) => {
    setInvoiceSettings(newSettings);
    localStorage.setItem('stormglide_invoice_config_v4', JSON.stringify(newSettings));
  };

  return (
    <InvoiceContext.Provider value={{ invoiceSettings, saveSettings }}>
      {children}
    </InvoiceContext.Provider>
  );
};

// --- 3. UTILS ---
const formatMoney = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });

// --- 4. COMPONENT: SETTINGS PANEL ---
const SettingsPanel = ({ onBack }) => {
  const { invoiceSettings, saveSettings } = useContext(InvoiceContext);
  const [local, setLocal] = useState(invoiceSettings);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if(file){ const reader=new FileReader(); reader.onloadend=()=>setLocal({...local, logoUrl: reader.result}); reader.readAsDataURL(file); }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto h-[85vh] flex flex-col">
      <div className="p-6 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Settings className="w-5 h-5"/> Document Configuration</h2>
        <div className="flex gap-2">
            <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={()=>{saveSettings(local); onBack();}} className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">Save Config</button>
        </div>
      </div>
      <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="font-bold text-blue-600 border-b pb-2">Branding</h3>
            <div className="border-2 border-dashed h-24 rounded-lg flex items-center justify-center relative bg-gray-50">
                {local.logoUrl ? <img src={local.logoUrl} className="h-full object-contain"/> : <span className="text-gray-400 text-xs">Upload Logo</span>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogo}/>
            </div>
            <div><label className="block text-xs font-bold text-gray-500">Company Name</label><input className="w-full border p-2 rounded" value={local.companyName} onChange={e=>setLocal({...local, companyName: e.target.value})}/></div>
            <div><label className="block text-xs font-bold text-gray-500">Address / Phone</label><textarea className="w-full border p-2 rounded" rows={3} value={local.companyAddress} onChange={e=>setLocal({...local, companyAddress: e.target.value})}/></div>
        </div>
        <div className="space-y-4">
            <h3 className="font-bold text-blue-600 border-b pb-2">Banking & Terms</h3>
            <div><label className="block text-xs font-bold text-gray-500">Bank Details</label><textarea className="w-full border p-2 rounded" rows={3} value={local.bankName + '\n' + local.accountNumber} onChange={e=>setLocal({...local, bankName: e.target.value})}/></div>
            <div><label className="block text-xs font-bold text-gray-500">Terms & Conditions</label><textarea className="w-full border p-2 rounded" rows={2} value={local.termsAndConditions} onChange={e=>setLocal({...local, termsAndConditions: e.target.value})}/></div>
            <div><label className="block text-xs font-bold text-gray-500">Footer Text</label><input className="w-full border p-2 rounded" value={local.footerText} onChange={e=>setLocal({...local, footerText: e.target.value})}/></div>
        </div>
      </div>
    </div>
  );
};

// --- 5. COMPONENT: INVOICE EDITOR (HYBRID MODE) ---
const InvoiceEditor = ({ data, mode = "invoice", onBack }) => {
  const { invoiceSettings } = useContext(InvoiceContext);
  
  // State for Editing
  const [isEditing, setIsEditing] = useState(mode === 'manual'); // Auto-edit if manual mode
  const [docType, setDocType] = useState(mode === 'manifest' ? 'CONTAINER MANIFEST' : 'COMMERCIAL INVOICE');
  const [currency, setCurrency] = useState('USD');
  
  // Document Data State
  const [docData, setDocData] = useState({
      ...data,
      items: data.items || [] // Ensure items array exists
  });

  // Actions
  const handleField = (field, val) => setDocData(p => ({ ...p, [field]: val }));
  
  const handleItem = (idx, field, val) => {
      const newItems = [...docData.items];
      newItems[idx][field] = val;
      // Auto-calc total cost for item if rate/cbm changes
      if (field === 'cbm' || field === 'rate') {
          newItems[idx].totalCost = (Number(newItems[idx].cbm || 0) * Number(newItems[idx].rate || 0)).toFixed(2);
      }
      setDocData(p => ({ ...p, items: newItems }));
  };

  const addItem = () => setDocData(p => ({ ...p, items: [...p.items, { description: '', quantity: 1, cbm: 0, rate: 0, totalCost: 0 }] }));
  const removeItem = (idx) => setDocData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  // Calculate Totals
  const subtotal = docData.items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const totalVol = docData.items.reduce((sum, item) => sum + (Number(item.cbm) || Number(item.totalVolume) || 0), 0);

  // Styles
  const inputClass = "bg-blue-50/50 border-b border-blue-200 outline-none px-1 w-full text-inherit font-inherit focus:bg-white transition-colors";

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <PrintStyles />
      
      {/* TOOLBAR */}
      <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm no-print sticky top-0 z-20">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg"><ArrowLeft className="w-4 h-4" /> Back</button>
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${isEditing ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
                {isEditing ? <Save size={16}/> : <Edit size={16}/>}
                {isEditing ? "Save Preview" : "Edit Mode"}
            </button>

            <select value={docType} onChange={e=>setDocType(e.target.value)} className="bg-gray-100 border-none font-bold text-sm rounded px-3 py-2">
                <option>COMMERCIAL INVOICE</option>
                <option>BILL OF LADING</option>
                <option>PACKING LIST</option>
                <option>CONTAINER MANIFEST</option>
            </select>
            <button onClick={()=>setCurrency(c=>c==='USD'?'GHS':'USD')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded text-xs font-bold hover:bg-gray-100"><RefreshCcw size={12}/> {currency}</button>
         </div>
         <button onClick={()=>window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700 flex items-center gap-2"><Printer size={16}/> Print</button>
      </div>

      {/* DOCUMENT PREVIEW */}
      <div className="flex-1 overflow-y-auto p-8">
         <div id="printable-doc-area" className="bg-white max-w-[210mm] min-h-[297mm] mx-auto shadow-2xl p-12 relative text-slate-800">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
               <div className="flex gap-6">
                  {invoiceSettings.logoUrl && <img src={invoiceSettings.logoUrl} className="h-20 w-auto object-contain"/>}
                  <div>
                     <h1 className="text-xl font-bold uppercase tracking-wide text-blue-900">{invoiceSettings.companyName}</h1>
                     <div className="text-sm text-gray-500 whitespace-pre-line mt-1">{invoiceSettings.companyAddress}</div>
                     <div className="text-sm text-gray-500">{invoiceSettings.companyPhone}</div>
                  </div>
               </div>
               <div className="text-right">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">{docType}</h2>
                  <div className="mt-2 text-gray-500 text-sm">
                      Ref #: {isEditing ? <input value={docData.trackingNumber} onChange={e=>handleField('trackingNumber',e.target.value)} className={`${inputClass} w-32 text-right`} /> : <span className="font-mono font-bold text-gray-800">{docData.trackingNumber}</span>}
                  </div>
                  <p className="text-gray-500 text-sm font-bold mt-1">Date: {formatDate(new Date())}</p>
               </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="flex justify-between mb-12 border-b pb-8">
               <div className="w-1/2 pr-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Consignee</h3>
                  {isEditing ? (
                      <div className="space-y-1">
                          <input placeholder="Client Name" value={docData.consigneeName} onChange={e=>handleField('consigneeName',e.target.value)} className={`${inputClass} font-bold text-lg`} />
                          <input placeholder="Phone" value={docData.consigneePhone} onChange={e=>handleField('consigneePhone',e.target.value)} className={inputClass} />
                          <textarea placeholder="Address" rows={2} value={docData.consigneeAddress} onChange={e=>handleField('consigneeAddress',e.target.value)} className={inputClass} />
                      </div>
                  ) : (
                      <>
                        <div className="text-lg font-bold text-gray-900">{docData.consigneeName || "Unknown Client"}</div>
                        <div className="text-sm text-gray-600">{docData.consigneePhone}</div>
                        <div className="text-sm text-gray-600 mt-1 max-w-xs">{docData.consigneeAddress || "Address on file"}</div>
                      </>
                  )}
               </div>
               <div className="w-1/2 text-right pl-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shipment Details</h3>
                  <div className="space-y-1 text-sm">
                     <p><span className="text-gray-500">Origin:</span> <span className="font-bold">{docData.origin || 'China'}</span></p>
                     <p><span className="text-gray-500">Destination:</span> <span className="font-bold">{docData.destination || 'Ghana'}</span></p>
                     <p><span className="text-gray-500">Mode:</span> <span className="font-bold">{docData.mode || 'Sea Freight'}</span></p>
                     {docData.containerId && <p><span className="text-gray-500">Container:</span> <span className="font-mono font-bold bg-gray-100 px-1">{docData.containerId}</span></p>}
                  </div>
               </div>
            </div>

            {/* Table */}
            <table className="w-full mb-8">
               <thead className="border-b-2 border-gray-900">
                  <tr className="text-left text-xs font-bold uppercase text-gray-600">
                     <th className="py-3">Description / Tracking Ref</th>
                     <th className="py-3 text-right">Qty</th>
                     <th className="py-3 text-right">Volume (CBM)</th>
                     {isEditing && <th className="py-3 text-right">Rate ($)</th>}
                     <th className="py-3 text-right">Amount ({currency})</th>
                     {isEditing && <th className="py-3 w-8 no-print"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 text-sm">
                  {docData.items.map((item, i) => (
                     <tr key={i}>
                        <td className="py-4">
                           {isEditing ? <input value={item.description} onChange={e=>handleItem(i,'description',e.target.value)} className={inputClass} placeholder="Item Description"/> : <div className="font-bold text-gray-800">{item.description || item.trackingNumber}</div>}
                        </td>
                        <td className="py-4 text-right">
                            {isEditing ? <input type="number" value={item.quantity} onChange={e=>handleItem(i,'quantity',e.target.value)} className={`${inputClass} text-right w-16`}/> : item.quantity || 1}
                        </td>
                        <td className="py-4 text-right font-mono text-gray-600">
                            {isEditing ? <input type="number" value={item.cbm} onChange={e=>handleItem(i,'cbm',e.target.value)} className={`${inputClass} text-right w-20`}/> : Number(item.cbm || 0).toFixed(3)}
                        </td>
                        {isEditing && (
                            <td className="py-4 text-right">
                                <input type="number" value={item.rate} onChange={e=>handleItem(i,'rate',e.target.value)} className={`${inputClass} text-right w-20`}/>
                            </td>
                        )}
                        <td className="py-4 text-right font-bold">
                           {formatMoney((Number(item.totalCost) || 0) * (currency==='GHS'?invoiceSettings.currencyRate:1), currency)}
                        </td>
                        {isEditing && (
                            <td className="py-4 text-center no-print">
                                <button onClick={()=>removeItem(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                            </td>
                        )}
                     </tr>
                  ))}
               </tbody>
               <tfoot className="border-t-2 border-gray-900">
                  <tr>
                     <td className="py-4 font-bold text-gray-900 uppercase">Totals</td>
                     <td className="py-4 text-right font-bold">{docData.items.length} Items</td>
                     <td className="py-4 text-right font-bold">{totalVol.toFixed(3)}</td>
                     {isEditing && <td></td>}
                     <td className="py-4 text-right font-black text-lg">
                        {formatMoney(subtotal * (currency==='GHS'?invoiceSettings.currencyRate:1), currency)}
                     </td>
                     {isEditing && <td></td>}
                  </tr>
               </tfoot>
            </table>

            {isEditing && (
                <button onClick={addItem} className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider mb-8 no-print">
                    <Plus className="w-4 h-4" /> Add Line Item
                </button>
            )}

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-gray-200">
               <div className="grid grid-cols-2 gap-8">
                  <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Bank Details</h4>
                     <p className="text-sm font-bold text-gray-800">{invoiceSettings.bankName}</p>
                     <p className="text-sm text-gray-600">{invoiceSettings.accountName}</p>
                     <p className="text-sm font-mono text-gray-600">{invoiceSettings.accountNumber}</p>
                  </div>
                  <div className="text-right">
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Authorized Signature</h4>
                     <div className="h-12 border-b border-gray-300 w-48 ml-auto mb-2"></div>
                     <p className="text-xs text-gray-500">For {invoiceSettings.companyName}</p>
                  </div>
               </div>
               <div className="text-center mt-12 text-xs text-gray-400">
                  <p>{invoiceSettings.footerText}</p>
                  <p className="opacity-50 mt-1">{invoiceSettings.termsAndConditions}</p>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

// --- 6. MAIN DASHBOARD ---
const OperationsDashboard = () => {
  const [view, setView] = useState('list'); // 'list' | 'editor' | 'settings'
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'containers'
  const [selectedData, setSelectedData] = useState(null);
  const [docMode, setDocMode] = useState('invoice'); // 'invoice' | 'manual' | 'manifest'

  const { shipments } = useShipments();

  // Group Shipments by Container
  const containerGroups = useMemo(() => {
    const groups = {};
    shipments.forEach(s => {
        if (!s.containerId) return;
        if (!groups[s.containerId]) groups[s.containerId] = { id: s.containerId, items: [], totalVol: 0, totalCost: 0, count: 0 };
        groups[s.containerId].items.push(s);
        groups[s.containerId].totalVol += Number(s.totalVolume || 0);
        groups[s.containerId].totalCost += Number(s.totalCost || 0);
        groups[s.containerId].count += 1;
    });
    return Object.values(groups);
  }, [shipments]);

  const handleGenerate = (data, mode) => {
    setSelectedData(data);
    setDocMode(mode);
    setView('editor');
  };

  const createManualInvoice = () => {
      setSelectedData({
          trackingNumber: `MAN-${Date.now().toString().slice(-6)}`,
          consigneeName: '', consigneePhone: '', consigneeAddress: '',
          origin: 'China', destination: 'Ghana', mode: 'Sea Freight',
          items: [{ description: '', quantity: 1, cbm: 0, rate: 0, totalCost: 0 }]
      });
      setDocMode('manual');
      setView('editor');
  };

  if (view === 'settings') return <SettingsPanel onBack={() => setView('list')} />;
  if (view === 'editor') return <InvoiceEditor data={selectedData} mode={docMode} onBack={() => setView('list')} />;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
       {/* Header */}
       <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><FileText className="text-blue-600"/> Smart Invoicing</h1>
             <p className="text-gray-500">Commercial Invoices, Bills of Lading & Container Manifests.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={createManualInvoice} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 flex items-center gap-2"><FilePlus size={18}/> New General Invoice</button>
            <button onClick={() => setView('settings')} className="bg-white border px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-2"><Settings size={18}/> Settings</button>
          </div>
       </div>

       {/* Tabs */}
       <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('all')} className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>Individual Shipments</button>
          <button onClick={() => setActiveTab('containers')} className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'containers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>Container Manifests</button>
       </div>

       {/* Content */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === 'all' ? (
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                   <tr>
                      <th className="p-4">Tracking</th>
                      <th className="p-4">Client</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {shipments.map(s => (
                      <tr key={s.id} className="hover:bg-blue-50/50">
                         <td className="p-4 font-mono text-blue-600 font-bold">{s.trackingNumber}</td>
                         <td className="p-4 font-bold text-gray-700">{s.consigneeName}</td>
                         <td className="p-4 text-right font-bold text-green-600">${s.totalCost}</td>
                         <td className="p-4 text-right">
                            <button onClick={() => handleGenerate(s, 'invoice')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700">Generate Invoice</button>
                         </td>
                      </tr>
                   ))}
                   {shipments.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-gray-400">No shipments found.</td></tr>}
                </tbody>
             </table>
          ) : (
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                   <tr>
                      <th className="p-4">Container ID</th>
                      <th className="p-4">Shipment Count</th>
                      <th className="p-4 text-right">Total Volume</th>
                      <th className="p-4 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {containerGroups.map(c => (
                      <tr key={c.id} className="hover:bg-blue-50/50">
                         <td className="p-4 flex items-center gap-2 font-mono font-bold text-indigo-600"><Container size={16}/> {c.id}</td>
                         <td className="p-4 font-bold text-gray-700">{c.count} Shipments</td>
                         <td className="p-4 text-right font-mono">{c.totalVol.toFixed(3)} m³</td>
                         <td className="p-4 text-right">
                            <button onClick={() => handleGenerate({ ...c, trackingNumber: c.id, consigneeName: 'CONTAINER MANIFEST', consigneeAddress: 'Port of Tema' }, 'manifest')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">Print Manifest</button>
                         </td>
                      </tr>
                   ))}
                   {containerGroups.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-gray-400">No container groups found. Assign Container IDs in Logistics Hub.</td></tr>}
                </tbody>
             </table>
          )}
       </div>
    </div>
  );
};

// --- 7. FINAL EXPORT ---
export default function InvoiceSystem() {
  return (
    <InvoiceProvider>
      <OperationsDashboard />
    </InvoiceProvider>
  );
}