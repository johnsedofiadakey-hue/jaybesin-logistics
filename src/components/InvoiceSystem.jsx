import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import {
   Printer, Settings, RefreshCcw, Palette, Image as ImageIcon,
   FileText, Box, Ship, ArrowLeft, Truck, User, Edit, Save, Plus, Trash2,
   CreditCard, CheckCircle, FilePlus, Container, Layers, PenTool, Search,
   Download, Receipt, DollarSign, Clock, AlertCircle
} from 'lucide-react';

// --- PDF ENGINE DEPENDENCIES ---
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- CONNECT TO THE MASTER REGISTRY ---
import { useShipments } from './ShipmentContext';

/**
 * JAY-BESIN | INVOICE CORE v5.3 (PRO PDF UPGRADE)
 * -----------------------------------------------------------
 * DEVELOPER: World Top Software Engineer
 * FEATURES:
 * - PDF ENGINE: Upgraded to High-End SaaS Layout
 * - Commercial Invoices & Bills of Lading
 * - Automated Container Manifest Generator
 * - Multi-Currency Node (USD/GHS)
 * - Branding: JayBesin Logistics
 * -----------------------------------------------------------
 */

// --- 1. SETTINGS REGISTRY ---
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
   footerText: "Thank you for shipping with JayBesin Logistics. Powered by Nexus Solutions.",
};

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
   const [invoiceSettings, setInvoiceSettings] = useState(DEFAULT_SETTINGS);

   useEffect(() => {
      const saved = localStorage.getItem('jaybesin_invoice_config_v5');
      if (saved) {
         try {
            setInvoiceSettings(JSON.parse(saved));
         } catch (e) {
            console.error("Registry Sync Error:", e);
         }
      }
   }, []);

   const saveSettings = (newSettings) => {
      setInvoiceSettings(newSettings);
      localStorage.setItem('jaybesin_invoice_config_v5', JSON.stringify(newSettings));
   };

   return (
      <InvoiceContext.Provider value={{ invoiceSettings, saveSettings }}>
         {children}
      </InvoiceContext.Provider>
   );
};

// --- 2. UTILITY NODES ---
const formatMoney = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' });

// --- 3. PDF GENERATION ENGINE (PRO SAAS UPGRADE) ---
const generateOfficialPDF = (docData, settings, docType, currency) => {
   const doc = new jsPDF();
   const pageWidth = doc.internal.pageSize.width;
   const pageHeight = doc.internal.pageSize.height;

   // -- PALETTE DEFINITION --
   const colorSlate900 = [15, 23, 42];  // Dark text
   const colorSlate500 = [100, 116, 139]; // Subtitles
   const colorBlue600 = [37, 99, 235];  // Accents

   // -- HELPER: TEXT WRAPPING --
   const wrapText = (text, width) => doc.splitTextToSize(text || '', width);

   // 1. HEADER SECTION
   let headerY = 20;

   // -- Logo (Left) --
   if (settings.logoUrl) {
      try {
         doc.addImage(settings.logoUrl, 'JPEG', 15, 15, 30, 30, undefined, 'FAST');
      } catch (e) {
         // Clean Fallback
         doc.setFillColor(...colorBlue600);
         doc.rect(15, 15, 10, 10, 'F');
      }
   }

   // -- Company info (Left, under logo or next to it? Let's go Left aligned below logo for cleanliness or Right aligned?)
   // Standard SaaS: Logo Left, Company Info Right

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(20);
   doc.setTextColor(...colorSlate900);
   doc.text(docType, pageWidth - 15, 22, { align: 'right' });

   doc.setFontSize(10);
   doc.setTextColor(...colorSlate500);
   doc.setFont('helvetica', 'normal');
   doc.text(`Reference #${docData.trackingNumber || 'DRAFT'}`, pageWidth - 15, 28, { align: 'right' });
   doc.text(`Date: ${formatDate(new Date())}`, pageWidth - 15, 33, { align: 'right' });

   // Company Details (Left, below Logo)
   const companyY = 50;
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(...colorSlate900);
   doc.text(settings.companyName, 15, companyY);

   doc.setFontSize(9);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(...colorSlate500);
   const addressLines = wrapText(settings.companyAddress, 80);
   doc.text(addressLines, 15, companyY + 6);
   doc.text(settings.companyEmail, 15, companyY + 6 + (addressLines.length * 4));
   doc.text(settings.companyPhone, 15, companyY + 11 + (addressLines.length * 4));

   // -- BILL TO (Right Side, aligned with Company Info) --
   doc.setFontSize(9);
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(...colorSlate500);
   doc.text("BILL TO", pageWidth - 15, companyY, { align: 'right' });

   doc.setFontSize(11);
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(...colorSlate900);
   doc.text(docData.consigneeName || 'Cash Customer', pageWidth - 15, companyY + 6, { align: 'right' });

   doc.setFontSize(9);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(...colorSlate500);
   doc.text(docData.consigneePhone || '', pageWidth - 15, companyY + 11, { align: 'right' });
   const clientAddress = doc.splitTextToSize(docData.consigneeAddress || '', 80);
   doc.text(clientAddress, pageWidth - 15, companyY + 16, { align: 'right' });

   // 2. SHIPMENT META GRID (Gray Bar)
   const metaY = companyY + 30;
   doc.setFillColor(248, 250, 252); // Slate 50
   doc.setDrawColor(226, 232, 240); // Slate 200
   doc.roundedRect(15, metaY, pageWidth - 30, 18, 2, 2, 'FD');

   const addMeta = (label, value, x) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorSlate500);
      doc.text(label.toUpperCase(), x, metaY + 6);

      doc.setFontSize(9);
      doc.setTextColor(...colorSlate900);
      doc.text(value, x, metaY + 12);
   };

   addMeta("Origin", docData.origin || '-', 20);
   addMeta("Destination", docData.destination || '-', 60);
   addMeta("Mode", docData.mode || '-', 100);
   addMeta("Container ID", docData.containerId || 'N/A', 140);


   // 3. TABLE ENGINE
   const exchangeRate = currency === 'GHS' ? Number(settings.currencyRate) : 1;
   const tableData = docData.items.map(item => {
      const cost = (Number(item.totalCost) || 0) * exchangeRate;
      return [
         item.description || item.trackingNumber || 'General Cargo',
         item.quantity || 1,
         Number(item.cbm || 0).toFixed(3),
         formatMoney(cost, currency)
      ];
   });

   const subtotal = docData.items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0) * exchangeRate;
   const totalVol = docData.items.reduce((sum, item) => sum + (Number(item.cbm) || 0), 0);

   autoTable(doc, {
      startY: metaY + 25,
      head: [['Description', 'Qty', 'Vol (CBM)', `Amount (${currency})`]],
      body: tableData,
      theme: 'grid',
      styles: {
         font: 'helvetica',
         fontSize: 9,
         textColor: colorSlate900,
         lineColor: [226, 232, 240],
         lineWidth: 0.1,
         cellPadding: 4
      },
      headStyles: {
         fillColor: [255, 255, 255],
         textColor: colorSlate500,
         fontStyle: 'bold',
         lineColor: [226, 232, 240],
         lineWidth: { bottom: 0.5, top: 0, left: 0, right: 0 } // Only bottom border
      },
      columnStyles: {
         0: { cellWidth: 'auto' },
         1: { halign: 'center', cellWidth: 20 },
         2: { halign: 'right', cellWidth: 30 },
         3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' }
      },
      foot: [[
         'Total',
         docData.items.length,
         totalVol.toFixed(3),
         formatMoney(subtotal, currency)
      ]],
      footStyles: {
         fillColor: [248, 250, 252],
         textColor: colorSlate900,
         fontStyle: 'bold',
         halign: 'right'
      }
   });

   // 4. FOOTER & BANKING (Bottom)
   const finalY = doc.lastAutoTable.finalY + 15;
   const footerY = pageHeight - 50;

   // Use the greater of natural flow or fixed bottom
   const bankY = finalY > footerY ? finalY : footerY;

   // Bank Details (Left)
   doc.setFontSize(9);
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(...colorSlate900);
   doc.text("Payment Details", 15, bankY);

   doc.setFontSize(9);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(...colorSlate500);
   doc.text(settings.bankName, 15, bankY + 6);
   doc.text(`Account Name: ${settings.accountName}`, 15, bankY + 11);
   doc.text(`Account No: ${settings.accountNumber}`, 15, bankY + 16);

   // Totals Area (Right)
   doc.setFontSize(10);
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(...colorSlate500);
   doc.text("Total Due", pageWidth - 15, bankY, { align: 'right' });

   doc.setFontSize(16);
   doc.setTextColor(...colorBlue600);
   doc.text(formatMoney(subtotal, currency), pageWidth - 15, bankY + 8, { align: 'right' });

   // Legal/Terms (Bottom)
   doc.setFontSize(8);
   doc.setTextColor(150, 150, 150);
   const terms = wrapText(settings.termsAndConditions, pageWidth - 30);
   doc.text(terms, 15, pageHeight - 15);
   doc.text(settings.footerText, 15, pageHeight - 10);

   doc.save(`${docType.replace(/ /g, '_')}_${docData.trackingNumber || 'DRAFT'}.pdf`);
};

// --- 4. COMPONENT: SETTINGS PANEL ---
// --- 4. COMPONENT: SETTINGS PANEL ---
const SettingsPanel = ({ onBack }) => {
   const { invoiceSettings, saveSettings } = useContext(InvoiceContext);
   const [local, setLocal] = useState(invoiceSettings);

   const handleLogo = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => setLocal({ ...local, logoUrl: reader.result });
         reader.readAsDataURL(file);
      }
   };

   return (
      <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-auto">
         {/* Header */}
         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Settings className="w-5 h-5" /></div>
               Registry Configuration
            </h2>
            <div className="flex gap-3">
               <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-all">Cancel</button>
               <button onClick={() => { saveSettings(local); onBack(); }} className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-slate-800 active:scale-95 transition-all">Save Changes</button>
            </div>
         </div>

         {/* Content */}
         <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Branding Section */}
            <div className="space-y-6">
               <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Business Identity</h3>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Corporate Logo</label>
                  <div className="border border-dashed border-slate-300 h-32 rounded-lg flex items-center justify-center relative bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                     {local.logoUrl ? <img src={local.logoUrl} className="h-full object-contain p-2" alt="Logo" /> : <span className="text-slate-400 text-xs">Click to Upload Logo</span>}
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogo} />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Official Company Name</label>
                  <input className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={local.companyName} onChange={e => setLocal({ ...local, companyName: e.target.value })} />
               </div>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">HQ Address & Contacts</label>
                  <textarea className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]" value={local.companyAddress} onChange={e => setLocal({ ...local, companyAddress: e.target.value })} />
               </div>
               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Email Address</label>
                  <input className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500" value={local.companyEmail} onChange={e => setLocal({ ...local, companyEmail: e.target.value })} />
               </div>
               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Phone Number</label>
                  <input className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500" value={local.companyPhone} onChange={e => setLocal({ ...local, companyPhone: e.target.value })} />
               </div>
            </div>

            {/* Finance Section */}
            <div className="space-y-6">
               <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Financial Protocol</h3>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Bank Name</label>
                  <input
                     className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                     value={local.bankName}
                     onChange={e => setLocal({ ...local, bankName: e.target.value })}
                     placeholder="e.g. Ecobank Ghana"
                  />
               </div>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Account Name</label>
                  <input
                     className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                     value={local.accountName}
                     onChange={e => setLocal({ ...local, accountName: e.target.value })}
                     placeholder="e.g. JayBesin Logistics Ltd"
                  />
               </div>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Account Number</label>
                  <input
                     className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 font-mono"
                     value={local.accountNumber}
                     onChange={e => setLocal({ ...local, accountNumber: e.target.value })}
                     placeholder="e.g. 1441000..."
                  />
               </div>

               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Exchange Rate (USD to GHS)</label>
                  <div className="flex items-center gap-2">
                     <span className="text-slate-400 text-sm font-bold min-w-[30px]">$1 =</span>
                     <input type="number" className="w-full border border-slate-200 p-2 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500" value={local.currencyRate} onChange={e => setLocal({ ...local, currencyRate: e.target.value })} />
                     <span className="text-slate-400 text-sm font-bold">GHS</span>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Footer Text</label>
                  <input className="w-full border border-slate-200 p-2.5 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500" value={local.footerText} onChange={e => setLocal({ ...local, footerText: e.target.value })} />
               </div>

               <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-500">Terms & Conditions</label>
                  <textarea className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-500 outline-none focus:border-blue-500 min-h-[80px]" value={local.termsAndConditions} onChange={e => setLocal({ ...local, termsAndConditions: e.target.value })} />
               </div>
            </div>
         </div>
      </div>
   );
};

// --- 5. COMPONENT: MASTER DOCUMENT EDITOR ---
const InvoiceEditor = ({ data, mode = "invoice", onBack }) => {
   const { invoiceSettings } = useContext(InvoiceContext);
   const [isEditing, setIsEditing] = useState(mode === 'manual');
   const [docType, setDocType] = useState(mode === 'manifest' ? 'CONTAINER MANIFEST' : 'COMMERCIAL INVOICE');
   const [currency, setCurrency] = useState('USD');
   const [docData, setDocData] = useState({ ...data, items: data.items || [] });

   const handleField = (field, val) => setDocData(p => ({ ...p, [field]: val }));

   const handleItem = (idx, field, val) => {
      const newItems = [...docData.items];
      newItems[idx][field] = val;
      if (field === 'cbm' || field === 'rate') {
         newItems[idx].totalCost = (Number(newItems[idx].cbm || 0) * Number(newItems[idx].rate || 0)).toFixed(2);
      }
      setDocData(p => ({ ...p, items: newItems }));
   };

   const addItem = () => setDocData(p => ({ ...p, items: [...p.items, { description: '', quantity: 1, cbm: 0, rate: 0, totalCost: 0 }] }));
   const removeItem = (idx) => setDocData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

   // Calculate Subtotal for Display
   const subtotal = docData.items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
   const totalVol = docData.items.reduce((sum, item) => sum + (Number(item.cbm) || Number(item.totalVolume) || 0), 0);

   const inputClass = "bg-blue-50 border-b-2 border-blue-200 outline-none px-2 w-full focus:bg-white transition-all rounded-t-lg py-1";

   return (
      <div className="flex flex-col h-screen bg-slate-100">

         <div className="bg-white p-6 border-b flex justify-between items-center shadow-md sticky top-0 z-50 uppercase font-black">
            <div className="flex items-center gap-6">
               <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all"><ArrowLeft size={20} /> Back</button>
               <div className="h-8 w-px bg-slate-200"></div>

               <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${isEditing ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'}`}
               >
                  {isEditing ? <Save size={16} /> : <Edit size={16} />}
                  {isEditing ? "Finalize Preview" : "Edit Registry"}
               </button>

               <select value={docType} onChange={e => setDocType(e.target.value)} className="bg-slate-50 border-2 border-slate-100 font-black text-xs rounded-xl px-4 py-2.5 outline-none focus:border-blue-500">
                  <option>COMMERCIAL INVOICE</option>
                  <option>BILL OF LADING</option>
                  <option>PACKING LIST</option>
                  <option>CONTAINER MANIFEST</option>
               </select>
               <button onClick={() => setCurrency(c => c === 'USD' ? 'GHS' : 'USD')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg italic hover:bg-blue-600 transition-all"><RefreshCcw size={14} /> {currency}</button>
            </div>

            {/* --- UPDATED PRINT BUTTON (TRIGGERS PDF ENGINE) --- */}
            <button
               onClick={() => generateOfficialPDF(docData, invoiceSettings, docType, currency)}
               className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black text-sm shadow-xl hover:bg-blue-700 flex items-center gap-3 italic animate-pulse hover:animate-none"
            >
               <Printer size={20} /> PRINT OFFICIAL PDF
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50">
            <div className="bg-white max-w-[210mm] min-h-[297mm] mx-auto shadow-[0_40px_100px_rgba(0,0,0,0.1)] p-16 relative text-slate-900 border-[20px] border-white">

               {/* INVOICE HEADER */}
               <div className="flex justify-between items-start mb-16 border-b-8 border-slate-900 pb-10">
                  <div className="flex gap-8">
                     {invoiceSettings.logoUrl ? (
                        <img src={invoiceSettings.logoUrl} className="h-24 w-auto object-contain" alt="Company Logo" />
                     ) : (
                        <div className="h-24 w-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-black italic shadow-2xl">JB</div>
                     )}
                     <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic leading-none">{invoiceSettings.companyName}</h1>
                        <div className="text-xs text-slate-500 whitespace-pre-line mt-4 font-bold tracking-widest">{invoiceSettings.companyAddress}</div>
                        <div className="text-xs text-slate-500 font-bold tracking-widest mt-1">{invoiceSettings.companyPhone}</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{docType}</h2>
                     <div className="mt-6 text-slate-400 text-[10px] font-black tracking-[0.3em]">
                        REF SERIAL: {isEditing ? <input value={docData.trackingNumber} onChange={e => handleField('trackingNumber', e.target.value)} className="border-b-2 border-blue-200 outline-none w-32 text-right bg-blue-50" /> : <span className="text-slate-900 font-mono text-base italic">#{docData.trackingNumber}</span>}
                     </div>
                     <p className="text-slate-900 text-xs font-black mt-2 italic">DATE: {formatDate(new Date())}</p>
                  </div>
               </div>

               {/* CONSIGNEE / SHIPMENT INFO */}
               <div className="grid grid-cols-2 gap-16 mb-16 uppercase">
                  <div>
                     <h3 className="text-[10px] font-black text-blue-600 tracking-[0.4em] mb-4 underline decoration-blue-100 decoration-4 underline-offset-8 italic">Consignee node</h3>
                     {isEditing ? (
                        <div className="space-y-4">
                           <input placeholder="Client Identity" value={docData.consigneeName} onChange={e => handleField('consigneeName', e.target.value)} className={inputClass} />
                           <input placeholder="Phone Frequency" value={docData.consigneePhone} onChange={e => handleField('consigneePhone', e.target.value)} className={inputClass} />
                           <textarea placeholder="Physical Address" rows={2} value={docData.consigneeAddress} onChange={e => handleField('consigneeAddress', e.target.value)} className={inputClass} />
                        </div>
                     ) : (
                        <div className="space-y-1">
                           <div className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none mb-2">{docData.consigneeName || "PENDING CLIENT"}</div>
                           <div className="text-sm text-slate-600 font-bold tracking-widest">{docData.consigneePhone}</div>
                           <div className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">{docData.consigneeAddress || "Registry Address Required"}</div>
                        </div>
                     )}
                  </div>
                  <div className="text-right bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 shadow-inner">
                     <h3 className="text-[10px] font-black text-slate-400 tracking-[0.4em] mb-4 italic">Registry Telemetry</h3>
                     <div className="space-y-3 text-xs font-black">
                        <p className="flex justify-between">ORIGIN: <span className="text-slate-900 italic underline decoration-blue-200 decoration-2">{docData.origin || 'CHINA HUB'}</span></p>
                        <p className="flex justify-between">TARGET: <span className="text-slate-900 italic underline decoration-blue-200 decoration-2">{docData.destination || 'GHANA TERMINAL'}</span></p>
                        <p className="flex justify-between">MODE: <span className="text-slate-900 italic underline decoration-blue-200 decoration-2">{docData.mode || 'SEA FREIGHT'}</span></p>
                        {docData.containerId && <p className="flex justify-between">CONTAINER: <span className="font-mono text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 italic shadow-sm">{docData.containerId}</span></p>}
                     </div>
                  </div>
               </div>

               {/* DATA TABLE (HTML PREVIEW ONLY) */}
               <table className="w-full mb-12 uppercase font-bold">
                  <thead className="border-b-[6px] border-slate-900">
                     <tr className="text-left text-[11px] font-black tracking-widest text-slate-500">
                        <th className="py-4 italic">Cargo Description / Node Ref</th>
                        <th className="py-4 text-right italic">Qty</th>
                        <th className="py-4 text-right italic">Vol (CBM)</th>
                        {isEditing && <th className="py-4 text-right italic">Rate ($)</th>}
                        <th className="py-4 text-right italic">Net ({currency})</th>
                        {isEditing && <th className="py-4 w-10"></th>}
                     </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100 text-sm">
                     {docData.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                           <td className="py-5">
                              {isEditing ? <input value={item.description} onChange={e => handleItem(i, 'description', e.target.value)} className={inputClass} placeholder="Cargo Designation..." /> : <div className="font-black text-slate-900 italic tracking-tight">{item.description || item.trackingNumber || 'General Cargo'}</div>}
                           </td>
                           <td className="py-5 text-right font-black italic">
                              {isEditing ? <input type="number" value={item.quantity} onChange={e => handleItem(i, 'quantity', e.target.value)} className="w-16 bg-blue-50 text-right p-1 rounded font-black outline-none border-b border-blue-200" /> : item.quantity || 1}
                           </td>
                           <td className="py-5 text-right font-mono text-slate-600 font-black">
                              {isEditing ? <input type="number" value={item.cbm} onChange={e => handleItem(i, 'cbm', e.target.value)} className="w-20 bg-blue-50 text-right p-1 rounded font-black outline-none border-b border-blue-200" /> : Number(item.cbm || 0).toFixed(3)}
                           </td>
                           {isEditing && (
                              <td className="py-5 text-right font-black italic text-blue-600">
                                 <input type="number" value={item.rate} onChange={e => handleItem(i, 'rate', e.target.value)} className="w-20 bg-blue-50 text-right p-1 rounded font-black outline-none border-b border-blue-200" />
                              </td>
                           )}
                           <td className="py-5 text-right font-black text-slate-950 italic text-base">
                              {formatMoney((Number(item.totalCost) || 0) * (currency === 'GHS' ? invoiceSettings.currencyRate : 1), currency)}
                           </td>
                           {isEditing && (
                              <td className="py-5 text-center">
                                 <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 hover:scale-125 transition-all"><Trash2 size={18} /></button>
                              </td>
                           )}
                        </tr>
                     ))}
                  </tbody>
                  <tfoot className="border-t-[8px] border-slate-900">
                     <tr className="bg-slate-50">
                        <td className="py-6 font-black text-slate-900 italic tracking-tighter text-xl uppercase">Total Valuation</td>
                        <td className="py-6 text-right font-black italic">{docData.items.length} Nodes</td>
                        <td className="py-6 text-right font-black italic text-slate-600 underline decoration-slate-200 underline-offset-8">{totalVol.toFixed(3)} m³</td>
                        {isEditing && <td></td>}
                        <td className="py-6 text-right font-black text-3xl italic tracking-tighter text-blue-600">
                           {formatMoney(subtotal * (currency === 'GHS' ? invoiceSettings.currencyRate : 1), currency)}
                        </td>
                        {isEditing && <td></td>}
                     </tr>
                  </tfoot>
               </table>

               {isEditing && (
                  <button onClick={addItem} className="flex items-center gap-3 text-[11px] font-black text-blue-600 hover:text-blue-900 tracking-[0.3em] mb-12 bg-blue-50 px-6 py-3 rounded-2xl shadow-sm transition-all active:scale-95 italic border-2 border-blue-100">
                     <Plus size={18} strokeWidth={3} /> Append cargo node
                  </button>
               )}

               {/* BANKING & FOOTER PROTOCOL */}
               <div className="mt-auto pt-10 border-t-2 border-slate-100 italic">
                  <div className="grid grid-cols-2 gap-12">
                     <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 shadow-inner">
                        <h4 className="text-[10px] font-black text-slate-400 tracking-[0.5em] mb-4 uppercase leading-none italic">Banking Node Protocol</h4>
                        <p className="text-sm font-black text-slate-900 italic">{invoiceSettings.bankName}</p>
                        <p className="text-xs text-slate-600 font-bold tracking-widest mt-1 uppercase">{invoiceSettings.accountName}</p>
                        <p className="text-xs font-mono text-slate-500 font-black mt-2 bg-white px-3 py-1 rounded-lg w-fit border border-slate-100 shadow-sm">{invoiceSettings.accountNumber}</p>
                     </div>
                     <div className="text-right flex flex-col justify-end">
                        <h4 className="text-[10px] font-black text-slate-400 tracking-[0.5em] mb-6 uppercase leading-none italic">Authorized frequency</h4>
                        <div className="h-20 border-b-4 border-slate-900 w-64 ml-auto mb-4 relative">
                           <div className="absolute -top-10 right-4 opacity-10 rotate-[-15deg]"><PenTool size={60} /></div>
                        </div>
                        <p className="text-xs text-slate-900 font-black italic tracking-widest leading-none">For {invoiceSettings.companyName}</p>
                     </div>
                  </div>
                  <div className="text-center mt-16 border-t-4 border-slate-900 pt-8 uppercase">
                     <p className="text-[10px] font-black text-slate-900 tracking-[0.2em]">{invoiceSettings.footerText}</p>
                     <p className="text-[9px] text-slate-400 font-bold mt-2 leading-relaxed opacity-60 tracking-widest">{invoiceSettings.termsAndConditions}</p>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

// --- 6. MASTER OPERATIONS DASHBOARD ---
const OperationsDashboard = () => {
   const [view, setView] = useState('list');
   const [activeTab, setActiveTab] = useState('all');
   const [selectedData, setSelectedData] = useState(null);
   const [docMode, setDocMode] = useState('invoice');
   const { shipments } = useShipments();

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
         origin: 'China Hub', destination: 'Ghana Terminal', mode: 'Sea Freight',
         items: [{ description: '', quantity: 1, cbm: 0, rate: 0, totalCost: 0 }]
      });
      setDocMode('manual');
      setView('editor');
   };

   if (view === 'settings') return <SettingsPanel onBack={() => setView('list')} />;
   if (view === 'editor') return <InvoiceEditor data={selectedData} mode={docMode} onBack={() => setView('list')} />;

   return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
         {/* HEADER HUB */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="bg-white p-2 border border-slate-200 rounded-lg text-blue-600 shadow-sm"><Receipt size={24} /></div>
                  Finance & Invoicing
               </h1>
               <p className="text-sm text-slate-500 mt-1 ml-1">Manage invoices, manifests, and billing protocols.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button onClick={createManualInvoice} className="flex-1 md:flex-none bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><FilePlus size={18} /> New Invoice</button>
               <button onClick={() => setView('settings')} className="flex-1 md:flex-none bg-white border border-slate-200 px-5 py-2.5 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-2"><Settings size={18} /> Configuration</button>
            </div>
         </div>

         {/* INTERFACE TABS */}
         <div className="flex gap-1 mb-6 border-b border-slate-200">
            <button onClick={() => setActiveTab('all')} className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Individual Shipments</button>
            <button onClick={() => setActiveTab('containers')} className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'containers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Container Manifests</button>
         </div>

         {/* REGISTRY DATA TABLE */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {activeTab === 'all' ? (
               <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                           <tr>
                              <th className="p-4 w-32">Tracking ID</th>
                              <th className="p-4">Client Details</th>
                              <th className="p-4 text-right">Total Cost</th>
                              <th className="p-4 text-right w-32">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {shipments.map(s => (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="p-4 font-mono text-blue-600 font-medium">{s.trackingNumber}</td>
                                 <td className="p-4">
                                    <div className="font-medium text-slate-900">{s.consigneeName}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{s.consigneePhone}</div>
                                 </td>
                                 <td className="p-4 text-right font-medium text-slate-900">${s.totalCost}</td>
                                 <td className="p-4 text-right">
                                    <button onClick={() => handleGenerate(s, 'invoice')} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-1.5 ml-auto shadow-sm"><Plus size={14} /> Create</button>
                                 </td>
                              </tr>
                           ))}
                           {shipments.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">No shipments found in registry.</td></tr>}
                        </tbody>
                     </table>
                  </div>

                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden p-4 space-y-4 bg-slate-50">
                     {shipments.map(s => (
                        <div key={s.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                           <div className="flex justify-between items-start">
                              <div>
                                 <span className="font-mono text-blue-600 font-bold text-sm">#{s.trackingNumber}</span>
                                 <h4 className="font-bold text-slate-900">{s.consigneeName}</h4>
                              </div>
                              <span className="font-bold text-slate-900">${s.totalCost}</span>
                           </div>
                           <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <span className="text-xs text-slate-400">{s.consigneePhone}</span>
                              <button onClick={() => handleGenerate(s, 'invoice')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"><Plus size={14} /> Invoice</button>
                           </div>
                        </div>
                     ))}
                     {shipments.length === 0 && <div className="p-8 text-center text-slate-400 text-sm italic">No shipments found.</div>}
                  </div>
               </>
            ) : (
               <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                           <tr>
                              <th className="p-4">Container ID</th>
                              <th className="p-4">Units</th>
                              <th className="p-4 text-right">Total Volume</th>
                              <th className="p-4 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {containerGroups.map(c => (
                              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-4 flex items-center gap-3 font-mono font-medium text-slate-900">
                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center"><Container size={16} /></div>
                                    {c.id}
                                 </td>
                                 <td className="p-4 text-slate-600">{c.count} items</td>
                                 <td className="p-4 text-right font-medium text-slate-900">{c.totalVol.toFixed(3)} m³</td>
                                 <td className="p-4 text-right">
                                    <button onClick={() => handleGenerate({ ...c, trackingNumber: c.id, consigneeName: 'Container Manifest', consigneeAddress: 'Logistics Terminal Port' }, 'manifest')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-700 transition-all flex items-center gap-2 ml-auto shadow-sm"><Printer size={14} /> Print Manifest</button>
                                 </td>
                              </tr>
                           ))}
                           {containerGroups.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">No containers active.</td></tr>}
                        </tbody>
                     </table>
                  </div>

                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden p-4 space-y-4 bg-slate-50">
                     {containerGroups.map(c => (
                        <div key={c.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Container size={20} /></div>
                              <div>
                                 <span className="font-mono text-slate-900 font-bold block">{c.id}</span>
                                 <span className="text-xs text-slate-500">{c.count} Items</span>
                              </div>
                              <div className="ml-auto text-right">
                                 <span className="block font-bold text-slate-900">{c.totalVol.toFixed(3)} m³</span>
                                 <span className="text-[10px] text-slate-400 uppercase font-bold">Volume</span>
                              </div>
                           </div>
                           <button onClick={() => handleGenerate({ ...c, trackingNumber: c.id, consigneeName: 'Container Manifest', consigneeAddress: 'Logistics Terminal Port' }, 'manifest')} className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"><Printer size={16} /> Print Manifest</button>
                        </div>
                     ))}
                     {containerGroups.length === 0 && <div className="p-8 text-center text-slate-400 text-sm italic">No containers active.</div>}
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

// --- 7. FINAL STABILIZED EXPORT ---
export default function InvoiceSystem() {
   return (
      <InvoiceProvider>
         <OperationsDashboard />
      </InvoiceProvider>
   );
}