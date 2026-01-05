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
// Professional modular architecture: Each component handles its own specific UI logic.
import Navbar from './components/Navbar';
import Home from './components/Home';
import Admin from './components/Admin';
import Logistics from './components/Logistics';
import Shop from './components/Shop';
import VehicleSourcing from './components/VehicleSourcing';
import AgentOnboarding from './components/AgentOnboarding';
import Footer from './components/Footer'; 

// --- DATABASE CONNECTION & STATE MANAGEMENT ---
// Using ShipmentProvider to wrap the application for real-time Firebase Firestore data synchronization.
import { ShipmentProvider, useShipments } from './components/ShipmentContext';

/**
 * JAY-BESIN LOGISTICS | GLOBAL TERMINAL CORE v7.0
 * -------------------------------------------------------------------------
 * DEVELOPER: World Top Software Engineer
 * * UPDATES IN THIS VERSION:
 * - Dynamic Footer: Address, Socials, and Contact info linked to Admin Settings.
 * - Single Auth Flow: Removed double-prompt bug by cleaning up view triggers.
 * - Performance: Optimized scroll-to-top behavior for SPA navigation.
 * -------------------------------------------------------------------------
 */

// --- INTERNAL COMPONENT: SECURE ADMIN LOGIN ---
// High-fidelity security gateway for staff authentication.
const AdminLoginScreen = ({ settings, onLogin, setView }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Controlled delay to simulate secure encrypted handshake
    setTimeout(() => {
      // Pulls the current admin passcode from the database settings
      const correctPass = settings.adminPass || 'admin123';
      
      if (pass === correctPass) {
        onLogin();
      } else {
        setError(true);
        setIsAuthenticating(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Visual Identity: Atmospheric Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="bg-slate-900 p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-800/50 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/30 ring-8 ring-blue-600/5">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Staff Portal</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Authorized Access Only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              autoFocus
              placeholder="PASSCODE" 
              className={`w-full pl-14 pr-4 py-5 bg-slate-950 border rounded-2xl outline-none font-black text-center text-white tracking-[0.6em] transition-all duration-300 ${
                error 
                ? 'border-red-500 bg-red-500/5 ring-4 ring-red-500/10' 
                : 'border-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 group-hover:border-slate-700'
              }`}
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
            />
            {error && (
              <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 animate-pulse">
                Invalid Security Credential
              </p>
            )}
          </div>

          <button 
            disabled={isAuthenticating}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {isAuthenticating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Open Terminal <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={() => setView('home')} 
            className="w-full text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase mt-2 tracking-[0.3em] transition-colors py-2"
          >
            Cancel Authentication
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT CONTROLLER ---
function MainLayout() {
  // --- LOCAL UI STATE MANAGEMENT ---
  const [view, setView] = useState('home'); 
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [cart, setCart] = useState([]); 
  
  // --- GLOBAL CLOUD DATA (Hooked to ShipmentContext) ---
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

  // Dynamic cart badge calculation
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Smooth scroll reset on view transition
  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [view]);

  // Logout routine to clear session and return to home
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setView('home');
  };

  // --- INITIAL LOADING INTERFACE ---
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-[3px] border-slate-900 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute font-black text-[10px] tracking-tighter text-blue-500">JB</div>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.5em] mt-8 animate-pulse">
          JayBesin
        </h2>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-4">Uplink Established</p>
      </div>
    );
  }

  // --- VIEW: ADMIN DASHBOARD (Protected) ---
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

  // --- VIEW: STAFF LOGIN ---
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

  // --- PUBLIC INTERFACE ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* NAVBAR: The top-level menu. Admin links are handled via the Footer for security. */}
      <Navbar 
        setView={setView} 
        currentView={view} 
        settings={settings} 
        cartCount={cartCount} 
      />

      {/* DYNAMIC VIEWPORT */}
      <main className="flex-grow overflow-x-hidden">
        {view === 'home' && (
          <Home 
            setView={setView} 
            settings={settings} 
          />
        )}
        
        {view === 'logistics' && <Logistics />}
        
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
        
        {view === 'onboarding' && <AgentOnboarding setView={setView} />}
      </main>

      {/* --- MASTER DYNAMIC FOOTER --- */}
      {/* Passing the 'settings' prop here allows the Footer.jsx to dynamically 
          render Phone, Email, Address, and Social Links set in Admin.
      */}
      <Footer 
        setView={setView} 
        settings={settings} 
        theme="dark" 
      />
      
    </div>
  );
}

// --- ROOT WRAPPER ---
export default function App() {
  return (
    <ShipmentProvider>
      <MainLayout />
    </ShipmentProvider>
  );
}