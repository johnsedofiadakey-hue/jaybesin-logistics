import React, { useState, useEffect } from 'react';
import { 
  LogIn, AlertCircle, Phone, MapPin, Mail, Clock, 
  ShieldCheck, Facebook, Twitter, Instagram, Linkedin, ArrowRight 
} from 'lucide-react';

// --- COMPONENT IMPORTS ---
import Navbar from './components/Navbar';
import Home from './components/Home';
import Admin from './components/Admin';
import Logistics from './components/Logistics';
import Shop from './components/Shop';
import VehicleSourcing from './components/VehicleSourcing';
import AgentOnboarding from './components/AgentOnboarding';

// --- DATABASE CONNECTION ---
import { ShipmentProvider, useShipments } from './components/ShipmentContext';

/**
 * JAY-BESIN | PREMIUM TERMINAL v6.0
 * -----------------------------------------------------------
 * - UI: Restored "Mega Footer" (Blue-Black Slate 950 Theme)
 * - Navigation: Admin link removed from Navbar, moved to Footer
 * - Layout: Full Terms/Conditions/Quick Links directory included
 */

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
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Access</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Personnel Only</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            autoFocus
            placeholder="Passcode" 
            className={`w-full p-4 bg-slate-800 border rounded-lg outline-none font-bold text-center text-white tracking-widest ${error ? 'border-red-500' : 'border-slate-700 focus:border-blue-600'}`}
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(false); }}
          />
          <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-blue-700 transition-all">Authenticate</button>
          <button type="button" onClick={() => setView('home')} className="w-full text-slate-500 text-[10px] font-black uppercase mt-4 tracking-widest">Return to Terminal</button>
        </form>
      </div>
    </div>
  );
};

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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-black uppercase tracking-widest mt-6 animate-pulse">JayBesin</h2>
      </div>
    );
  }

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

  if (view === 'admin-login') {
    return <AdminLoginScreen settings={settings} setView={setView} onLogin={() => { setIsAdminLoggedIn(true); setView('admin'); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* NAVBAR (Admin Link Removed) */}
      <Navbar setView={setView} currentView={view} settings={settings} cartCount={cartCount} />

      <main className="flex-grow">
        {view === 'home' && <Home setView={setView} settings={settings} />}
        {view === 'logistics' && <Logistics />}
        {view === 'shop' && <Shop products={products} settings={settings} cart={cart} setCart={setCart} />}
        {view === 'vehicles' && <VehicleSourcing vehicles={vehicles} settings={settings} setView={setView} />}
        {view === 'onboarding' && <AgentOnboarding setView={setView} />}
      </main>

      {/* --- RESTORED BLUE-BLACK MEGA FOOTER --- */}
      <footer className="bg-slate-950 text-white pt-20 pb-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            
            {/* Column 1: Brand & Bio */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm">JB</div>
                <span className="text-xl font-black uppercase tracking-tighter">Jay-Besin</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Premium logistics and global sourcing solutions. We bridge the gap between markets with efficiency, transparency, and world-class service.
              </p>
              <div className="flex gap-4">
                <div className="p-2 bg-slate-900 rounded-lg hover:text-blue-500 cursor-pointer transition-colors"><Facebook size={18}/></div>
                <div className="p-2 bg-slate-900 rounded-lg hover:text-blue-500 cursor-pointer transition-colors"><Twitter size={18}/></div>
                <div className="p-2 bg-slate-900 rounded-lg hover:text-blue-500 cursor-pointer transition-colors"><Instagram size={18}/></div>
                <div className="p-2 bg-slate-900 rounded-lg hover:text-blue-500 cursor-pointer transition-colors"><Linkedin size={18}/></div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-8">Navigation</h4>
              <ul className="space-y-4">
                {['Home', 'Logistics', 'Shop', 'Vehicles', 'Onboarding'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => setView(item.toLowerCase())}
                      className="text-slate-400 hover:text-white flex items-center gap-2 group transition-all text-sm font-bold"
                    >
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"/>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal & Support */}
            <div>
              <h4 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-8">Legal Terminal</h4>
              <ul className="space-y-4">
                {['Terms of Service', 'Privacy Policy', 'Shipping Policy', 'Refund Policy', 'Staff Access'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => item === 'Staff Access' ? setView('admin-login') : null}
                      className="text-slate-400 hover:text-white text-sm font-bold transition-all"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact Directory */}
            <div>
              <h4 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-8">Contact Directory</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="text-blue-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {settings.companyAddress || "Cargo Village\nKIA, Accra, Ghana"}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Phone className="text-blue-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-slate-300 font-black tracking-tight">
                    {settings.contactPhone || "+233 55 306 5304"}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Mail className="text-blue-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-slate-300 font-medium">
                    {settings.companyEmail || "support@jaybesin.com"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              © 2026 JAY-BESIN LOGISTICS ENTERPRISE
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Global Sourcing Terminal v6.0</span>
              {/* Discrete Admin Node */}
              <button onClick={() => setView('admin-login')} className="w-2 h-2 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors"></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ShipmentProvider>
      <MainLayout />
    </ShipmentProvider>
  );
}