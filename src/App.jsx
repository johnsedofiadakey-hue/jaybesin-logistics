import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Phone, MapPin, Mail, Clock } from 'lucide-react';

// --- COMPONENT IMPORTS ---
import Navbar from './components/Navbar';
import Home from './components/Home';
import Admin from './components/Admin';
import Logistics from './components/Logistics';
import Shop from './components/Shop';
import VehicleSourcing from './components/VehicleSourcing'; // [NEW] Real Auto Studio
import AgentOnboarding from './components/AgentOnboarding'; // [NEW] Real Agent Portal
import InvoiceSystem from './components/InvoiceSystem';

// --- DATABASE CONNECTION (The Brain) ---
import { ShipmentProvider, useShipments } from './components/ShipmentContext';

/**
 * JAY-BESIN | MAIN APP CORE v5.1 (FULL INTEGRATION)
 * -----------------------------------------------------------
 * - Data Source: ShipmentContext (Firebase Cloud).
 * - State: Local Cart & View Navigation.
 * - Integration: All modules (Auto, Shop, Agents, Tracking) active.
 */

// --- INTERNAL COMPONENT: ADMIN LOGIN SCREEN ---
const AdminLoginScreen = ({ settings, onLogin }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default password is 'admin123' if not set in settings
    if (pass === (settings.adminPass || 'admin123')) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm border border-slate-100 animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <LogIn size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Staff Portal</h2>
          <p className="text-sm text-slate-500 font-medium">Restricted Access</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              autoFocus
              placeholder="Enter Access Code" 
              className={`w-full p-4 bg-slate-50 border rounded-lg outline-none font-bold text-center text-slate-900 tracking-widest transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`}
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
            />
            {error && (
              <p className="text-xs text-red-500 font-bold mt-2 flex items-center justify-center gap-1 animate-pulse">
                <AlertCircle size={12}/> Invalid Credentials
              </p>
            )}
          </div>
          <button className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT CONTROLLER ---
function MainLayout() {
  // --- LOCAL UI STATE ---
  const [view, setView] = useState('home'); // 'home', 'logistics', 'shop', 'vehicles', 'admin', 'contact', 'onboarding'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [cart, setCart] = useState([]); // Cart is local to the user's session
  
  // --- CLOUD DATA (From ShipmentContext) ---
  const { 
    // Data Arrays
    shipments, products, vehicles, agents, messages,
    // Settings Object
    settings, setSettings, 
    // Write Functions
    addShipment, updateShipment, deleteShipment,
    addProduct, deleteProduct,
    addVehicle, updateVehicle, deleteVehicle,
    addCategory, deleteCategory,
    categories,
    // Loading State
    loading 
  } = useShipments();

  // --- HELPERS ---
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // --- 1. LOADING STATE ---
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">JB</div>
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest mt-6 animate-pulse">JayBesin Logistics</h2>
        <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest">Initializing Uplink...</p>
      </div>
    );
  }

  // --- 2. ADMIN LOGIN HANDLING ---
  if (view === 'admin-login') {
    return <AdminLoginScreen settings={settings} onLogin={() => { setIsAdminLoggedIn(true); setView('admin'); }} />;
  }

  // --- 3. ADMIN DASHBOARD VIEW ---
  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <Admin 
        // Navigation Control
        setIsAdmin={setIsAdminLoggedIn} 
        setView={setView}
        
        // Data & Setters (Live from Firebase)
        settings={settings} setSettings={setSettings}
        
        shipments={shipments} // Admin uses useShipments internally, but passing props is fine too if Admin expects them
        addShipment={addShipment} updateShipment={updateShipment} deleteShipment={deleteShipment}
        
        vehicles={vehicles} addVehicle={addVehicle} updateVehicle={updateVehicle} deleteVehicle={deleteVehicle}
        
        products={products} addProduct={addProduct} deleteProduct={deleteProduct}
        
        // Pass generic categories
        categories={categories || ['General', 'Electronics', 'Industrial']} 
        addCategory={addCategory} deleteCategory={deleteCategory}
        
        messages={messages || []} 
        agents={agents || []}
      />
    );
  }

  // --- 4. CUSTOMER VIEW (The Main Website) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* NAVBAR (Visible on all customer pages) */}
      <Navbar 
        setView={setView} 
        currentView={view} 
        settings={settings} 
        cartCount={cartCount} 
      />

      <main>
        {/* --- VIEW: HOME --- */}
        {view === 'home' && (
          <Home 
            setView={setView} 
            settings={settings} 
          />
        )}

        {/* --- VIEW: LOGISTICS TRACKING --- */}
        {view === 'logistics' && (
          <Logistics />
        )}

        {/* --- VIEW: SOURCING MART (SHOP) --- */}
        {view === 'shop' && (
          <Shop 
            products={products} 
            categories={settings.productCategories || ['Electronics', 'Home', 'Industrial']} 
            settings={settings}
            cart={cart} 
            setCart={setCart} 
          />
        )}

        {/* --- VIEW: VEHICLE SOURCING (AUTO STUDIO) --- */}
        {view === 'vehicles' && (
          <VehicleSourcing 
            vehicles={vehicles} 
            settings={settings}
            setView={setView}
          />
        )}

        {/* --- VIEW: AGENT ONBOARDING --- */}
        {view === 'onboarding' && (
          <AgentOnboarding setView={setView} />
        )}

        {/* --- VIEW: CONTACT US --- */}
        {view === 'contact' && (
           <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
              <div className="text-center mb-16">
                 <h1 className="text-5xl font-black uppercase text-slate-900 mb-4 tracking-tighter">Get in Touch</h1>
                 <p className="text-slate-500 max-w-xl mx-auto text-lg">
                    Ready to move cargo? Our team is standing by 24/7 to assist with your logistics needs.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {/* Card 1: HQ */}
                 <div className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
                       <MapPin size={28} />
                    </div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm mb-4">Headquarters</h3>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                       {settings.companyAddress || "Cargo Village\nKIA, Accra\nGhana"}
                    </p>
                 </div>

                 {/* Card 2: Phone */}
                 <div className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                    <div className="relative z-10 group-hover:text-white transition-colors">
                       <div className="w-14 h-14 bg-slate-900 text-white group-hover:bg-white group-hover:text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-colors">
                          <Phone size={28} />
                       </div>
                       <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Direct Line</h3>
                       <p className="font-black text-2xl">
                          {settings.contactPhone}
                       </p>
                       <p className="text-xs mt-2 opacity-60 uppercase tracking-widest">24/7 Support</p>
                    </div>
                 </div>

                 {/* Card 3: Email */}
                 <div className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
                       <Mail size={28} />
                    </div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm mb-4">Email Us</h3>
                    <p className="text-slate-600 font-medium">
                       {settings.companyEmail || "support@jaybesin.com"}
                    </p>
                    <p className="text-slate-600 font-medium mt-1">
                       accounts@jaybesin.com
                    </p>
                 </div>
              </div>
           </div>
        )}
      </main>

    </div>
  );
}

// --- ROOT EXPORT (WITH PROVIDER) ---
export default function App() {
  return (
    <ShipmentProvider>
      <MainLayout />
    </ShipmentProvider>
  );
}