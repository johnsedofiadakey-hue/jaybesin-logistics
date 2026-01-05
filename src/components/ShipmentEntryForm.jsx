import React, { useState, useEffect } from 'react';
import { 
  Package, Save, Plus, Trash2, RefreshCw, X 
} from 'lucide-react';

// 1. Import the Database Connection
import { useShipments } from './ShipmentContext';

export default function ShipmentEntryForm({ onCancel, onSaveSuccess }) {
  // 2. Get the "Add" function from the database
  const { addShipment } = useShipments();

  const [formData, setFormData] = useState({
    trackingNumber: '',
    dateReceived: new Date().toISOString().split('T')[0],
    status: 'Received at Warehouse',
    origin: 'Guangzhou, CN',
    destination: 'Accra, GH',
    mode: 'Sea Freight',
    consigneeName: '',
    consigneePhone: '',
    consigneeAddress: '',
    items: [{ description: '', quantity: 1, weight: 0, cbm: 0, trackingRef: '' }]
  });

  // Auto-Generate Tracking ID
  const generateTrackingID = () => {
    const prefix = "SG"; 
    const originCode = formData.origin.includes('Guangzhou') ? "CN" : "GEN";
    const random = Math.floor(100000 + Math.random() * 900000);
    const newId = `${prefix}-${originCode}-${random}`;
    setFormData(prev => ({ ...prev, trackingNumber: newId }));
  };

  useEffect(() => {
    if (!formData.trackingNumber) generateTrackingID();
  }, []);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, weight: 0, cbm: 0 }] }));
  
  const removeItem = (index) => {
    if (formData.items.length === 1) return; 
    setFormData(prev => ({ ...prev, items: formData.items.filter((_, i) => i !== index) }));
  };

  const totalCBM = formData.items.reduce((acc, item) => acc + Number(item.cbm || 0), 0).toFixed(3);
  const totalQty = formData.items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  // --- THE FIX: SENDING DATA TO CONTEXT ---
  const handleSubmit = () => {
    if (!formData.consigneeName) return alert("Please enter Consignee Name");
    
    // 1. Add to Database
    addShipment(formData);
    
    // 2. Trigger Success (Close Modal)
    if (onSaveSuccess) onSaveSuccess();
  };

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
      
      {/* HEADER */}
      <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600"/> New Shipment Entry
          </h2>
          <p className="text-gray-500 text-sm mt-1">Log incoming cargo details.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
             <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-md flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Shipment
             </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto">
        {/* LEFT COL: INFO */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="text-xs font-bold text-blue-800 uppercase mb-1">Tracking Number</label>
                <div className="flex gap-2">
                    <input value={formData.trackingNumber} readOnly className="w-full font-mono font-bold text-lg text-blue-900 bg-white border border-blue-200 rounded px-2"/>
                    <button onClick={generateTrackingID} className="p-2 bg-white rounded border border-blue-200 hover:bg-blue-100 text-blue-600"><RefreshCw className="w-4 h-4"/></button>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-gray-500 text-sm mb-3 border-b pb-1">Client Info</h3>
                <div className="space-y-3">
                    <div><label className={labelClass}>Client Name</label><input value={formData.consigneeName} onChange={(e) => handleChange('consigneeName', e.target.value)} className={inputClass} placeholder="e.g. John Doe"/></div>
                    <div><label className={labelClass}>Address</label><textarea rows={2} value={formData.consigneeAddress} onChange={(e) => handleChange('consigneeAddress', e.target.value)} className={inputClass} placeholder="Destination Address"/></div>
                </div>
            </div>
             <div>
                <h3 className="font-bold text-gray-500 text-sm mb-3 border-b pb-1">Route</h3>
                <div className="grid grid-cols-2 gap-2">
                     <div><label className={labelClass}>Origin</label><input value={formData.origin} onChange={(e) => handleChange('origin', e.target.value)} className={inputClass} /></div>
                     <div><label className={labelClass}>Dest</label><input value={formData.destination} onChange={(e) => handleChange('destination', e.target.value)} className={inputClass} /></div>
                </div>
            </div>
        </div>

        {/* RIGHT COL: MANIFEST */}
        <div className="lg:col-span-2">
            <h3 className="font-bold text-gray-500 text-sm mb-3 border-b pb-1">Cargo Manifest</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 bg-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-4 text-right">Vol (CBM)</div>
                    <div className="col-span-1"></div>
                </div>
                <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                    {formData.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5"><input value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Item Name"/></div>
                            <div className="col-span-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="w-full p-2 border rounded text-sm text-right"/></div>
                            <div className="col-span-4"><input type="number" step="0.001" value={item.cbm} onChange={(e) => handleItemChange(idx, 'cbm', e.target.value)} className="w-full p-2 border border-blue-300 bg-blue-50 rounded text-sm text-right font-bold"/></div>
                            <div className="col-span-1 flex justify-center"><button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button></div>
                        </div>
                    ))}
                    <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4"/> Add Item</button>
                </div>
                <div className="p-4 bg-gray-100 border-t flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Qty: {totalQty}</span>
                    <span className="font-bold text-blue-600 text-lg">Total Volume: {totalCBM} m³</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}