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
  const colorGray100 = [241, 245, 249]; // Backgrounds

  // -- HELPER: TEXT WRAPPING --
  // Ensures text doesn't overflow by splitting it into lines
  const wrapText = (text, width) => doc.splitTextToSize(text || '', width);

  // 1. BRANDING HEADER (Top Left)
  let headerY = 20;
  
  if (settings.logoUrl) {
    try {
      // Keep logo proportional
      doc.addImage(settings.logoUrl, 'JPEG', 15, 15, 25, 25, undefined, 'FAST');
    } catch (e) {
      // Fallback Box
      doc.setFillColor(...colorBlue600);
      doc.roundedRect(15, 15, 20, 20, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("JB", 20, 28);
    }
  }

  // Company Details (Next to Logo)
  doc.setTextColor(...colorSlate900);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName.toUpperCase(), 45, 22);

  doc.setTextColor(...colorSlate500);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const addressLines = wrapText(settings.companyAddress, 80);
  doc.text(addressLines, 45, 28);
  doc.text(settings.companyEmail, 45, 28 + (addressLines.length * 4));
  doc.text(settings.companyPhone, 45, 33 + (addressLines.length * 4));

  // 2. DOCUMENT TITLE & STATUS (Top Right)
  doc.setTextColor(...colorSlate900);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(docType, pageWidth - 15, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(...colorSlate500);
  doc.setFont('helvetica', 'bold');
  doc.text(`REF: ${docData.trackingNumber || 'DRAFT'}`, pageWidth - 15, 32, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(new Date())}`, pageWidth - 15, 37, { align: 'right' });

  // 3. SEPARATOR LINE
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(15, 55, pageWidth - 15, 55);

  // 4. CLIENT & SHIPMENT GRID
  const gridY = 65;
  
  // -- COLUMN 1: CONSIGNEE (Billed To) --
  doc.setFontSize(8);
  doc.setTextColor(...colorBlue600);
  doc.setFont('helvetica', 'bold');
  doc.text("CONSIGNEE / BILLED TO", 15, gridY);

  doc.setFontSize(11);
  doc.setTextColor(...colorSlate900);
  doc.text(docData.consigneeName || 'Cash Customer', 15, gridY + 6);

  doc.setFontSize(9);
  doc.setTextColor(...colorSlate500);
  doc.setFont('helvetica', 'normal');
  doc.text(docData.consigneePhone || '', 15, gridY + 11);
  const clientAddress = wrapText(docData.consigneeAddress || 'N/A', 70);
  doc.text(clientAddress, 15, gridY + 16);

  // -- COLUMN 2: SHIPMENT DETAILS --
  const col2X = pageWidth / 2 + 10;
  doc.setFontSize(8);
  doc.setTextColor(...colorBlue600);
  doc.setFont('helvetica', 'bold');
  doc.text("SHIPMENT DETAILS", col2X, gridY);

  doc.setFontSize(9);
  doc.setTextColor(...colorSlate900);
  doc.setFont('helvetica', 'bold');
  
  // Data Rows
  let detailY = gridY + 6;
  const addDetail = (label, value) => {
    doc.setTextColor(...colorSlate500);
    doc.setFont('helvetica', 'normal');
    doc.text(label, col2X, detailY);
    doc.setTextColor(...colorSlate900);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageWidth - 15, detailY, { align: 'right' });
    detailY += 5;
  };

  addDetail("Origin Hub:", docData.origin || 'China');
  addDetail("Destination:", docData.destination || 'Ghana');
  addDetail("Mode:", docData.mode || 'Sea Freight');
  if(docData.containerId) addDetail("Container ID:", docData.containerId);

  // 5. TABLE ENGINE (JSPDF-AUTOTABLE)
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

  // Calculate Totals
  const subtotal = docData.items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0) * exchangeRate;
  const totalVol = docData.items.reduce((sum, item) => sum + (Number(item.cbm) || 0), 0);

  autoTable(doc, {
    startY: gridY + 40,
    head: [['Description / Item Reference', 'Qty', 'Vol (CBM)', `Total (${currency})`]],
    body: tableData,
    theme: 'plain', // Cleaner look, we add custom styles
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      textColor: colorSlate900,
      lineColor: [226, 232, 240], // Light gray borders
      lineWidth: { bottom: 0.1 }
    },
    headStyles: {
      fillColor: colorGray100,
      textColor: colorSlate500,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      lineWidth: { bottom: 0.5 } // Thicker bottom border for header
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' }
    },
    // Footer row for visual total
    foot: [[
        'TOTALS',
        docData.items.length,
        totalVol.toFixed(3),
        formatMoney(subtotal, currency)
    ]],
    footStyles: {
        fillColor: [255, 255, 255],
        textColor: colorBlue600,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'right',
        lineWidth: { top: 0.5 }
    }
  });

  // 6. TOTALS & BANKING SECTION
  const finalY = doc.lastAutoTable.finalY + 15;
  
  // Check if page break is needed
  if (finalY > pageHeight - 60) {
    doc.addPage();
    // Reset finalY for new page
  }

  // -- BANKING BOX (Styled Container) --
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 250, 250); // Very light gray
  doc.roundedRect(15, finalY, 100, 45, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(...colorBlue600);
  doc.setFont('helvetica', 'bold');
  doc.text("PAYMENT INSTRUCTIONS", 20, finalY + 8);

  doc.setFontSize(9);
  doc.setTextColor(...colorSlate900);
  doc.text(settings.bankName, 20, finalY + 16);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colorSlate500);
  doc.text("Account Name:", 20, finalY + 22);
  doc.setTextColor(...colorSlate900);
  doc.text(settings.accountName, 50, finalY + 22);

  doc.setTextColor(...colorSlate500);
  doc.text("Account No:", 20, finalY + 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colorSlate900);
  doc.text(settings.accountNumber, 50, finalY + 28);

  doc.setFontSize(8);
  doc.setTextColor(...colorSlate500);
  doc.setFont('helvetica', 'normal');
  doc.text("Please reference invoice number on payment.", 20, finalY + 38);


  // -- GRAND TOTAL (Right Side) --
  const totalY = finalY + 5;
  doc.setFontSize(10);
  doc.setTextColor(...colorSlate500);
  doc.text("Grand Total Due:", pageWidth - 15, totalY, { align: 'right' });

  doc.setFontSize(20);
  doc.setTextColor(...colorBlue600); // Brand Blue
  doc.setFont('helvetica', 'bold');
  doc.text(formatMoney(subtotal, currency), pageWidth - 15, totalY + 10, { align: 'right' });

  // 7. FOOTER (Bottom of every page usually, but here fixed at bottom of doc)
  const footerY = pageHeight - 20;
  
  // Line
  doc.setDrawColor(226, 232, 240);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(...colorSlate500);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.footerText, pageWidth / 2, footerY, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150); // Lighter gray
  const terms = wrapText(settings.termsAndConditions, pageWidth - 30);
  doc.text(terms, pageWidth / 2, footerY + 5, { align: 'center' });

  // 8. OUTPUT
  doc.save(`${docType.replace(/ /g, '_')}_${docData.trackingNumber || 'DRAFT'}.pdf`);
};

// --- 4. COMPONENT: SETTINGS PANEL ---
const SettingsPanel = ({ onBack }) => {
  const { invoiceSettings, saveSettings } = useContext(InvoiceContext);
  const [local, setLocal] = useState(invoiceSettings);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if(file){ 
      const reader = new FileReader(); 
      reader.onloadend = () => setLocal({...local, logoUrl: reader.result}); 
      reader.readAsDataURL(file); 
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl mx-auto h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50 font-black uppercase">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic"><Settings className="w-6 h-6 text-blue-600"/> Registry Config</h2>
        <div className="flex gap-4">
            <button onClick={onBack} className="px-6 py-2.5 text-slate-500 hover:bg-slate-200 rounded-xl transition-all">Abort</button>
            <button onClick={()=>{saveSettings(local); onBack();}} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">Push Changes</button>
        </div>
      </div>
      <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-12 uppercase font-bold">
        <div className="space-y-6">
            <h3 className="font-black text-blue-600 border-b-2 border-blue-100 pb-2 tracking-widest italic">Branding Node</h3>
            <div className="border-4 border-dashed h-32 rounded-2xl flex items-center justify-center relative bg-slate-50 group hover:border-blue-400 transition-all">
                {local.logoUrl ? <img src={local.logoUrl} className="h-full object-contain p-4" alt="Logo"/> : <span className="text-slate-400 text-xs italic">Upload Corporate Logo</span>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogo}/>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest ml-2">Official Name</label>
              <input className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-xl outline-none focus:border-blue-500" value={local.companyName} onChange={e=>setLocal({...local, companyName: e.target.value})}/>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest ml-2">HQ Address Node</label>
              <textarea className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-xl outline-none focus:border-blue-500" rows={3} value={local.companyAddress} onChange={e=>setLocal({...local, companyAddress: e.target.value})}/>
            </div>
        </div>
        <div className="space-y-6">
            <h3 className="font-black text-blue-600 border-b-2 border-blue-100 pb-2 tracking-widest italic">Finance & Protocol</h3>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest ml-2">Bank Details</label>
              <textarea className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-xl outline-none focus:border-blue-500" rows={3} value={local.bankName + '\n' + local.accountNumber} onChange={e=>setLocal({...local, bankName: e.target.value})}/>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest ml-2">Currency Exchange Rate (USD/GHS)</label>
              <input type="number" className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-xl outline-none focus:border-blue-500 font-mono" value={local.currencyRate} onChange={e=>setLocal({...local, currencyRate: e.target.value})}/>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest ml-2">Footer Protocol</label>
              <input className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-xl outline-none focus:border-blue-500" value={local.footerText} onChange={e=>setLocal({...local, footerText: e.target.value})}/>
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
                {isEditing ? <Save size={16}/> : <Edit size={16}/>}
                {isEditing ? "Finalize Preview" : "Edit Registry"}
            </button>

            <select value={docType} onChange={e=>setDocType(e.target.value)} className="bg-slate-50 border-2 border-slate-100 font-black text-xs rounded-xl px-4 py-2.5 outline-none focus:border-blue-500">
                <option>COMMERCIAL INVOICE</option>
                <option>BILL OF LADING</option>
                <option>PACKING LIST</option>
                <option>CONTAINER MANIFEST</option>
            </select>
            <button onClick={()=>setCurrency(c=>c==='USD'?'GHS':'USD')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg italic hover:bg-blue-600 transition-all"><RefreshCcw size={14}/> {currency}</button>
         </div>
         
         {/* --- UPDATED PRINT BUTTON (TRIGGERS PDF ENGINE) --- */}
         <button 
            onClick={() => generateOfficialPDF(docData, invoiceSettings, docType, currency)} 
            className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black text-sm shadow-xl hover:bg-blue-700 flex items-center gap-3 italic animate-pulse hover:animate-none"
         >
            <Printer size={20}/> PRINT OFFICIAL PDF
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50">
         <div className="bg-white max-w-[210mm] min-h-[297mm] mx-auto shadow-[0_40px_100px_rgba(0,0,0,0.1)] p-16 relative text-slate-900 border-[20px] border-white">
            
            {/* INVOICE HEADER */}
            <div className="flex justify-between items-start mb-16 border-b-8 border-slate-900 pb-10">
               <div className="flex gap-8">
                  {invoiceSettings.logoUrl ? (
                    <img src={invoiceSettings.logoUrl} className="h-24 w-auto object-contain" alt="Company Logo"/>
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
                      REF SERIAL: {isEditing ? <input value={docData.trackingNumber} onChange={e=>handleField('trackingNumber',e.target.value)} className="border-b-2 border-blue-200 outline-none w-32 text-right bg-blue-50" /> : <span className="text-slate-900 font-mono text-base italic">#{docData.trackingNumber}</span>}
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
                          <input placeholder="Client Identity" value={docData.consigneeName} onChange={e=>handleField('consigneeName',e.target.value)} className={inputClass} />
                          <input placeholder="Phone Frequency" value={docData.consigneePhone} onChange={e=>handleField('consigneePhone',e.target.value)} className={inputClass} />
                          <textarea placeholder="Physical Address" rows={2} value={docData.consigneeAddress} onChange={e=>handleField('consigneeAddress',e.target.value)} className={inputClass} />
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
                           {isEditing ? <input value={item.description} onChange={e=>handleItem(i,'description',e.target.value)} className={inputClass} placeholder="Cargo Designation..."/> : <div className="font-black text-slate-900 italic tracking-tight">{item.description || item.trackingNumber || 'General Cargo'}</div>}
                        </td>
                        <td className="py-5 text-right font-black italic">
                            {isEditing ? <input type="number" value={item.quantity} onChange={e=>handleItem(i,'quantity',e.target.value)} className="w-16 bg-blue-50 text-right p-1 rounded font-black outline-none border-b border-blue-200"/> : item.quantity || 1}
                        </td>
                        <td className="py-5 text-right font-mono text-slate-600 font-black">
                            {isEditing ? <input type="number" value={item.cbm} onChange={e=>handleItem(i,'cbm',e.target.value)} className="w-20 bg-blue-50 text-right p-1 rounded font-black outline-none border-b border-blue-200"/> : Number(item.cbm || 0).toFixed(3)}
                        </td>
                        {isEditing && (
                            <td className="py-5 text-right font-black italic text-blue-600">
                                <input type="number" value={item.rate} onChange={e=>handleItem(i,'rate',e.target.value)} className="w-20 bg-blue-50 text-right p-1 rounded font-black outline-none border-b border-blue-200"/>
                            </td>
                        )}
                        <td className="py-5 text-right font-black text-slate-950 italic text-base">
                           {formatMoney((Number(item.totalCost) || 0) * (currency==='GHS'?invoiceSettings.currencyRate:1), currency)}
                        </td>
                        {isEditing && (
                            <td className="py-5 text-center">
                                <button onClick={()=>removeItem(i)} className="text-red-400 hover:text-red-600 hover:scale-125 transition-all"><Trash2 size={18}/></button>
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
                        {formatMoney(subtotal * (currency==='GHS'?invoiceSettings.currencyRate:1), currency)}
                     </td>
                     {isEditing && <td></td>}
                  </tr>
               </tfoot>
            </table>

            {isEditing && (
                <button onClick={addItem} className="flex items-center gap-3 text-[11px] font-black text-blue-600 hover:text-blue-900 tracking-[0.3em] mb-12 bg-blue-50 px-6 py-3 rounded-2xl shadow-sm transition-all active:scale-95 italic border-2 border-blue-100">
                    <Plus size={18} strokeWidth={3}/> Append cargo node
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
                        <div className="absolute -top-10 right-4 opacity-10 rotate-[-15deg]"><PenTool size={60}/></div>
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
    <div className="min-h-screen bg-[#f8fafc] p-10 font-sans uppercase font-bold animate-in fade-in">
       {/* HEADER HUB */}
       <div className="flex justify-between items-center mb-12 border-b-4 border-slate-100 pb-8">
          <div>
             <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 italic tracking-tighter leading-none"><Receipt className="text-blue-600" size={40} strokeWidth={3}/> FINANCE GRID</h1>
             <p className="text-[10px] text-slate-400 font-black tracking-[0.5em] mt-3 ml-1">Commercial Registry & Protocol Billing Node</p>
          </div>
          <div className="flex gap-4">
            <button onClick={createManualInvoice} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-3 italic"><FilePlus size={20} strokeWidth={2.5}/> New Protocol Node</button>
            <button onClick={() => setView('settings')} className="bg-white border-2 border-slate-100 px-6 py-4 rounded-2xl font-black text-slate-600 text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all flex items-center gap-3"><Settings size={20}/> CONFIG Hub</button>
          </div>
       </div>

       {/* INTERFACE TABS */}
       <div className="flex gap-10 mb-8 border-b-2 border-slate-100">
          <button onClick={() => setActiveTab('all')} className={`pb-6 px-4 text-xs font-black tracking-[0.3em] transition-all relative ${activeTab === 'all' ? 'text-blue-600 italic' : 'text-slate-400'}`}>INDIVIDUAL UNITS {activeTab === 'all' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50"></div>}</button>
          <button onClick={() => setActiveTab('containers')} className={`pb-6 px-4 text-xs font-black tracking-[0.3em] transition-all relative ${activeTab === 'containers' ? 'text-blue-600 italic' : 'text-slate-400'}`}>CONTAINER MANIFESTS {activeTab === 'containers' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50"></div>}</button>
       </div>

       {/* REGISTRY DATA TABLE */}
       <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.05)] border-4 border-slate-50 overflow-hidden font-black">
          {activeTab === 'all' ? (
             <table className="w-full text-left text-xs uppercase">
                <thead className="bg-slate-50 text-slate-400 font-black tracking-widest border-b-2 border-slate-100">
                   <tr>
                      <th className="p-8 italic">Registry Tracking</th>
                      <th className="p-8 italic">Client Identity</th>
                      <th className="p-8 text-right italic">Valuation ($)</th>
                      <th className="p-8 text-right italic">Registry Node</th>
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50 font-black">
                   {shipments.map(s => (
                      <tr key={s.id} className="hover:bg-blue-50/50 transition-all group">
                         <td className="p-8 font-mono text-blue-600 font-black text-base italic leading-none">#{s.trackingNumber}</td>
                         <td className="p-8 font-black text-slate-800 text-sm italic">{s.consigneeName} <p className="text-[9px] text-slate-400 not-italic font-bold tracking-widest mt-1 uppercase leading-none">{s.consigneePhone}</p></td>
                         <td className="p-8 text-right font-black text-slate-950 text-lg italic leading-none tracking-tighter">${s.totalCost}</td>
                         <td className="p-8 text-right">
                            <button onClick={() => handleGenerate(s, 'invoice')} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl active:scale-90 transition-all italic leading-none flex items-center gap-2 ml-auto"><Plus size={14} strokeWidth={4}/> Open protocol</button>
                         </td>
                      </tr>
                   ))}
                   {shipments.length === 0 && <tr><td colSpan="4" className="p-32 text-center text-slate-200 font-black uppercase tracking-[1em] text-2xl italic leading-none">SCANNING REGISTRY...</td></tr>}
                </tbody>
             </table>
          ) : (
             <table className="w-full text-left text-xs uppercase">
                <thead className="bg-slate-50 text-slate-400 font-black tracking-widest border-b-2 border-slate-100">
                   <tr>
                      <th className="p-8 italic">Container Serial ID</th>
                      <th className="p-8 italic">Registry Unit Count</th>
                      <th className="p-8 text-right italic">Total Vol Hub</th>
                      <th className="p-8 text-right italic">Action Node</th>
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50 font-black font-black">
                   {containerGroups.map(c => (
                      <tr key={c.id} className="hover:bg-indigo-50/50 transition-all group">
                         <td className="p-8 flex items-center gap-4 font-mono font-black text-slate-900 text-base italic leading-none"><div className="w-10 h-10 bg-slate-950 text-blue-500 rounded-lg flex items-center justify-center shadow-lg"><Container size={20}/></div> {c.id}</td>
                         <td className="p-8 font-black text-slate-800 text-sm italic tracking-tighter leading-none">{c.count} NODES IN SYNC</td>
                         <td className="p-8 text-right font-black text-slate-950 text-lg italic leading-none tracking-tighter underline decoration-slate-200 underline-offset-8 decoration-4">{c.totalVol.toFixed(3)} m³</td>
                         <td className="p-8 text-right">
                            <button onClick={() => handleGenerate({ ...c, trackingNumber: c.id, consigneeName: 'CONTAINER MANIFEST Hub', consigneeAddress: 'Logistics Terminal Port' }, 'manifest')} className="bg-slate-950 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl active:scale-90 transition-all italic leading-none flex items-center gap-2 ml-auto"><Printer size={14} strokeWidth={4}/> Sync & Print</button>
                         </td>
                      </tr>
                   ))}
                   {containerGroups.length === 0 && <tr><td colSpan="4" className="p-32 text-center text-slate-200 font-black uppercase tracking-[1em] text-2xl italic leading-none">NO TAGS DETECTED...</td></tr>}
                </tbody>
             </table>
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