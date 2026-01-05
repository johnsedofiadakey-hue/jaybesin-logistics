import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Phone, MapPin, Mail, Clock, ShieldCheck } from 'lucide-react';

// --- COMPONENT IMPORTS ---
import Navbar from './components/Navbar';
import Home from './components/Home';
import Admin from './components/Admin';
import Logistics from './components/Logistics';
import Shop from './components/Shop';
import VehicleSourcing from './components/VehicleSourcing';
import AgentOnboarding from './components/AgentOnboarding';
import InvoiceSystem from './components/InvoiceSystem';

// --- DATABASE CONNECTION (The Brain) ---
import { ShipmentProvider, useShipments } from './components/ShipmentContext';

/**
 * JAY-BESIN | MASTER CORE v5.5 (FINAL MERGE)
 * -----------------------------------------------------------
 * - UI: Original Customer View + Fixed Global Footer.
 * - Admin: Hidden Login + Live Cloud Sync.
 * - Components: Full Integration of Shop, Auto, and Agents.
 */

// --- INTERNAL COMPONENT: ADMIN LOGIN SCREEN ---
const AdminLoginScreen = ({ settings, onLogin, setView }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pass === (settings.adminPass || 'admin123')) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-800 animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Access</h2>
          <p className="text-sm text-slate-500">Personnel Only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              autoFocus
              placeholder="Enter Passcode" 
              className={`w-full p-4 bg-slate-800 border rounded-lg outline-none font-bold text-center text-white tracking-widest transition-all ${error ? 'border-red-500' : 'border-slate-700 focus:border-blue-600'}`}
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
            />
            {error && <p className="text-xs text-red-500 font-bold mt-2 text-center">Invalid Credentials</p>}
          </div>
          <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
            Authenticate
          </button>
          <button type="button" onClick={() => setView('home')} className="w-full text-slate-500 text-xs font-bold uppercase mt-4">Cancel</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT CONTROLLER ---
function MainLayout() {
  const [view, setView] = useState('home'); 
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [cart, setCart] = useState([]); 
  
  const { 
    shipments, products, vehicles, agents, messages,
    settings, setSettings, 
    addShipment, updateShipment, deleteShipment,
    addProduct, deleteProduct,
    addVehicle, updateVehicle, deleteVehicle,
    addCategory, deleteCategory,
    categories,
    loading 
  } = useShipments();

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-black uppercase tracking-widest mt-6 animate-pulse">JayBesin</h2>
      </div>
    );
  }

  // --- 1. ADMIN DASHBOARD VIEW ---
  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <Admin 
        setIsAdmin={setIsAdminLoggedIn} setView={setView}
        settings={settings} setSettings={setSettings}
        shipments={shipments} addShipment={addShipment} updateShipment={updateShipment} deleteShipment={deleteShipment}
        vehicles={vehicles} addVehicle={addVehicle} updateVehicle={updateVehicle} deleteVehicle={deleteVehicle}
        products={products} addProduct={addProduct} deleteProduct={deleteProduct}
        categories={categories || ['General', 'Electronics', 'Industrial']} 
        addCategory={addCategory} deleteCategory={deleteCategory}
        messages={messages || []} agents={agents || []}
      />
    );
  }

  // --- 2. ADMIN LOGIN HANDLING ---
  if (view === 'admin-login') {
    return <AdminLoginScreen settings={settings} setView={setView} onLogin={() => { setIsAdminLoggedIn(true); setView('admin'); }} />;
  }

  // --- 3. CUSTOMER FACING LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      <Navbar setView={setView} currentView={view} settings={settings} cartCount={cartCount} />

      <main>
        {view === 'home' && <Home setView={setView} settings={settings} />}
        {view === 'logistics' && <Logistics />}
        {view === 'shop' && <Shop products={products} settings={settings} cart={cart} setCart={setCart} />}
        {view === 'vehicles' && <VehicleSourcing vehicles={vehicles} settings={settings} setView={setView} />}
        {view === 'onboarding' && <AgentOnboarding setView={setView} />}

        {/* --- GLOBAL FOOTER DIRECTORY (Restored & Merged) --- */}
        <footer className="bg-white border-t border-slate-200 pt-20 pb-10 px-6 mt-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              
              {/* HQ Card */}
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <MapPin size={24} />
                </div>
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Headquarters</h3>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                  {settings.companyAddress || "Cargo Village\nKIA, Accra\nGhana"}
                </p>
              </div>

              {/* Phone Card */}
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Phone size={24} />
                </div>
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Direct Line</h3>
                <p className="font-black text-2xl text-blue-600">{settings.contactPhone || "+233 55 306 5304"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available 24/7 for Logistics Support</p>
              </div>

              {/* Email Card */}
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Email Us</h3>
                <p className="text-lg font-bold text-slate-900">{settings.companyEmail || "support@jaybesin.com"}</p>
                <p className="text-slate-500 text-sm">accounts@jaybesin.com</p>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                    © 2026 JAY-BESIN LOGISTICS ENTERPRISE
                  </p>
               </div>
               
               {/* Hidden Access Node */}
               <div className="flex items-center gap-6">
                  <button onClick={() => setView('admin-login')} className="w-1.5 h-1.5 bg-slate-100 rounded-full hover:bg-blue-600 transition-colors"></button>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Global Terminal v5.5</p>
               </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// --- ROOT EXPORT ---
export default function App() {
  return (
    <ShipmentProvider>
      <MainLayout />
    </ShipmentProvider>
  );
}