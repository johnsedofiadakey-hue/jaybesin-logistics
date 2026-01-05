import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  ChevronRight 
} from 'lucide-react';

// --- COMPONENT IMPORTS ---
// We are importing the modular components to keep the architecture clean and professional.
import Navbar from './components/Navbar';
import Home from './components/Home';
import Admin from './components/Admin';
import Logistics from './components/Logistics';
import Shop from './components/Shop';
import VehicleSourcing from './components/VehicleSourcing';
import AgentOnboarding from './components/AgentOnboarding';
import Footer from './components/Footer'; 

// --- DATABASE CONNECTION & STATE MANAGEMENT ---
// This provider wraps the entire app to ensure real-time data flow from Firebase.
import { ShipmentProvider, useShipments } from './components/ShipmentContext';

/**
 * JAY-BESIN LOGISTICS | GLOBAL TERMINAL CORE v6.5
 * -------------------------------------------------------------------------
 * DEVELOPER: World Top Software Engineer
 * FEATURES: 
 * - Full Firebase Firestore Integration
 * - Secure Passcode-Protected Admin Portal (Hidden)
 * - Real-time Inventory & Shipment Tracking
 * - Premium Slate-950 "Mega Footer" Component Integration
 * - Responsive Multi-View Navigation System
 * -------------------------------------------------------------------------
 */

// --- INTERNAL COMPONENT: SECURE ADMIN LOGIN ---
// This screen handles the authentication for staff members.
const AdminLoginScreen = ({ settings, onLogin, setView }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Artificial delay to simulate high-level security check
    setTimeout(() => {
      const correctPass = settings.adminPass || 'admin123';
      
      if (pass === correctPass) {
        onLogin();
      } else {
        setError(true);
        setIsAuthenticating(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/30 ring-4 ring-blue-600/10">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">System Access</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              autoFocus
              placeholder="ENTER PASSCODE" 
              className={`w-full pl-12 pr-4 py-5 bg-slate-950 border rounded-xl outline-none font-black text-center text-white tracking-[0.5em] transition-all duration-300 ${
                error 
                ? 'border-red-500 bg-red-500/5 ring-4 ring-red-500/10' 
                : 'border-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 group-hover:border-slate-700'
              }`}
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
            />
            {error && (
              <p className="text-center text-red-500 text-xs font-black uppercase tracking-widest mt-3 animate-bounce">
                Access Denied - Invalid Code
              </p>
            )}
          </div>

          <button 
            disabled={isAuthenticating}
            className="w-full bg-blue-600 text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
          >
            {isAuthenticating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Authenticate <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={() => setView('home')} 
            className="w-full text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase mt-4 tracking-[0.3em] transition-colors"
          >
            Return to Public Terminal
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT CONTROLLER ---
function MainLayout() {
  // --- UI STATE ---
  const [view, setView] = useState('home'); 
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [cart, setCart] = useState([]); 
  
  // --- GLOBAL DATA ---
  const { 
    shipments, 
    products, 
    vehicles, 
    agents, 
    messages,
    settings, 
    setSettings, 
    addShipment, 
    updateShipment, 
    deleteShipment,
    addProduct, 
    deleteProduct,
    addVehicle, 
    updateVehicle, 
    deleteVehicle,
    addCategory, 
    deleteCategory,
    categories,
    loading 
  } = useShipments();

  // Calculation for the shopping cart badge
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Auto-scroll logic to ensure user starts at the top of new pages
  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [view]);

  // Handle Logout Logic
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setView('home');
  };

  // --- LOADING STATE RENDER ---
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-[3px] border-slate-800 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute font-black text-xs tracking-tighter text-blue-500">JB</div>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.4em] mt-8 animate-pulse text-white">
          JayBesin
        </h2>
        <div className="mt-4 flex flex-col items-center">
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Establishing Secure Connection</p>
           <div className="w-32 h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
              <div className="w-full h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]"></div>
           </div>
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW RENDER ---
  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <Admin 
        setIsAdmin={setIsAdminLoggedIn} 
        setView={setView}
        onLogout={handleLogout}
        settings={settings} 
        setSettings={setSettings}
        shipments={shipments} 
        addShipment={addShipment} 
        updateShipment={updateShipment} 
        deleteShipment={deleteShipment}
        vehicles={vehicles} 
        addVehicle={addVehicle} 
        updateVehicle={updateVehicle} 
        deleteVehicle={deleteVehicle}
        products={products} 
        addProduct={addProduct} 
        deleteProduct={deleteProduct}
        categories={categories || ['General', 'Electronics', 'Industrial']} 
        addCategory={addCategory} 
        deleteCategory={deleteCategory}
        messages={messages || []} 
        agents={agents || []}
      />
    );
  }

  // --- ADMIN LOGIN RENDER ---
  if (view === 'admin-login') {
    return (
      <AdminLoginScreen 
        settings={settings} 
        setView={setView} 
        onLogin={() => { 
          setIsAdminLoggedIn(true); 
          setView('admin'); 
        }} 
      />
    );
  }

  // --- PUBLIC INTERFACE RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* NAVBAR: The top navigation bar is shared across all public views */}
      <Navbar 
        setView={setView} 
        currentView={view} 
        settings={settings} 
        cartCount={cartCount} 
      />

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-grow">
        {view === 'home' && (
          <Home 
            setView={setView} 
            settings={settings} 
          />
        )}
        
        {view === 'logistics' && (
          <Logistics />
        )}
        
        {view === 'shop' && (
          <Shop 
            products={products} 
            settings={settings} 
            cart={cart} 
            setCart={setCart} 
          />
        )}
        
        {view === 'vehicles' && (
          <VehicleSourcing 
            vehicles={vehicles} 
            settings={settings} 
            setView={setView} 
          />
        )}
        
        {view === 'onboarding' && (
          <AgentOnboarding 
            setView={setView} 
          />
        )}
      </main>

      {/* --- MASTER FOOTER COMPONENT --- */}
      {/* We use your specific Footer.jsx component to ensure UI consistency */}
      <Footer 
        setView={setView} 
        settings={settings} 
        theme="dark" 
      />
      
    </div>
  );
}

// --- ROOT APPLICATION ENTRY ---
export default function App() {
  return (
    <ShipmentProvider>
      <MainLayout />
    </ShipmentProvider>
  );
}