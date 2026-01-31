import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LogIn, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  ChevronRight,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Terminal,
  Database,
  Cpu,
  Activity,
  Server,
  Zap,
  Shield,
  Layers,
  Search,
  Wifi
} from 'lucide-react';

/**
 * JAY-BESIN LOGISTICS | GLOBAL MASTER TERMINAL v15.3 (STABLE)
 * -------------------------------------------------------------------------
 * ENGINEERING STATUS: 
 * - LOGIC: Preserved Original Passcode Authentication (No Logic Changes).
 * - UI: Mobile-Optimized Login Screen (Responsive Padding/Text).
 * - EXPORT: Fixed Vite Export Default Issues.
 * -------------------------------------------------------------------------
 */

// --- CORE COMPONENT IMPORTS ---
import Navbar from '@/components/Navbar';
import Home from '@/components/Home';
import Admin from '@/components/Admin';
import Logistics from '@/components/Logistics';
import Shop from '@/components/Shop';
import VehicleSourcing from '@/components/VehicleSourcing';
import AgentOnboarding from '@/components/AgentOnboarding';
import Footer from '@/components/Footer'; 
import Contact from '@/components/Contact';
import Terms from '@/components/Terms';

// --- DATABASE INFRASTRUCTURE ---
import { ShipmentProvider, useShipments } from '@/components/ShipmentContext';

// --- INTERNAL COMPONENT: SECURE AUTHENTICATION GATEWAY ---
const AdminLoginScreen = ({ settings, onLogin, setView }) => {
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isProcessingHandshake, setIsProcessingHandshake] = useState(false);

  const handleAuthentication = (e) => {
    e.preventDefault();
    setIsProcessingHandshake(true);
    
    // Secure Handshake Protocol
    setTimeout(() => {
      // Fallback to 'admin123' if settings are not yet loaded
      const serverToken = settings?.adminPass || 'admin123';
      
      if (passcode === serverToken) {
        onLogin();
      } else {
        setLoginError(true);
        setIsProcessingHandshake(false);
        setPasscode('');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]"></div>
      </div>
      
      {/* Mobile Optimized Container: p-8 for mobile, p-12 for desktop */}
      <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10 font-bold uppercase">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          {/* Mobile Optimized Text: text-2xl for mobile, text-3xl for desktop */}
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-2 italic">Registry Login</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Master Node Access Required</p>
        </div>
        
        <form onSubmit={handleAuthentication} className="space-y-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Lock size={20} />
            </div>
            <input 
              type="password" 
              autoFocus
              placeholder="ENTER PASSCODE" 
              className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-center text-slate-900 text-xl tracking-[0.5em] transition-all ${
                loginError 
                ? 'border-red-500 bg-red-50' 
                : 'border-slate-100 focus:border-blue-600 focus:bg-white'
              }`}
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setLoginError(false); }}
            />
            {loginError && (
              <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 animate-bounce">
                Security Hash Denied
              </p>
            )}
          </div>

          <button 
            disabled={isProcessingHandshake}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isProcessingHandshake ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                AUTHENTICATE <ChevronRight size={20} />
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={() => setView('home')} 
            className="w-full text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all py-2"
          >
            Return to Public Node
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MASTER CONTROLLER COMPONENT ---
function MainLayout() {
  const [view, setView] = useState('home'); 
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [cart, setCart] = useState([]); 
  
  // Connect to Database Context
  const shipmentContext = useShipments();
  
  // Safe Destructuring with Fallbacks
  const { 
    shipments = [], 
    products = [], 
    vehicles = [], 
    agents = [], 
    messages = [],
    settings = {}, 
    setSettings = () => {}, 
    addShipment = () => {}, 
    updateShipment = () => {}, 
    deleteShipment = () => {},
    addProduct = () => {}, 
    deleteProduct = () => {}, 
    addVehicle = () => {}, 
    updateVehicle = () => {}, 
    deleteVehicle = () => {},
    addCategory = () => {}, 
    deleteCategory = () => {}, 
    categories = [], 
    loading = false 
  } = shipmentContext || {};

  // Memoize Cart Calculation
  const totalCartQuantity = useMemo(() => {
    return cart.reduce((total, item) => total + (item.qty || 1), 0);
  }, [cart]);

  // View Transition Effect
  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [view]);

  // Secure Logout Handler
  const executeLogoutProcedure = useCallback(() => {
    setIsAdminLoggedIn(false);
    setView('home');
  }, []);

  // System Loading State (Boot Sequence)
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-slate-900 font-sans relative overflow-hidden uppercase font-bold">
        <div className="relative flex flex-col items-center z-10 space-y-8">
          <div className="relative group">
            <div className="w-24 h-24 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-blue-600">JB</div>
          </div>
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-widest text-slate-900 italic">JayBesin</h2>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">
               <span>Establishing Node</span>
               <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
               <span>Terminal Sync</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Interface Router
  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <Admin 
        setIsAdmin={setIsAdminLoggedIn} 
        setView={setView} 
        onLogout={executeLogoutProcedure}
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
        categories={categories} 
        addCategory={addCategory} 
        deleteCategory={deleteCategory} 
        messages={messages} 
        agents={agents}
      />
    );
  }

  // Admin Authentication Gateway
  if (view === 'admin-login' || (view === 'admin' && !isAdminLoggedIn)) {
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

  // Public Interface Router
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white uppercase font-bold">
      <Navbar 
        setView={setView} 
        currentView={view} 
        settings={settings} 
        cartCount={totalCartQuantity} 
      />

      <main className="flex-grow overflow-x-hidden pt-16 font-bold uppercase">
        {view === 'home' && (
          <Home setView={setView} settings={settings} shipments={shipments} />
        )}
        {view === 'logistics' && (
          <Logistics shipments={shipments} settings={settings} setView={setView} />
        )}
        {view === 'shop' && (
          <Shop products={products} settings={settings} categories={categories} cart={cart} setCart={setCart} />
        )}
        {view === 'vehicles' && (
          <VehicleSourcing vehicles={vehicles} settings={settings} setView={setView} />
        )}
        {view === 'onboarding' && (
          <AgentOnboarding setView={setView} settings={settings} />
        )}
        {view === 'contact' && (
          <Contact settings={settings} setView={setView} />
        )}
        {view === 'terms' && (
          <Terms settings={settings} setView={setView} />
        )}
        {view === 'privacy' && (
          <Terms settings={settings} setView={setView} type="privacy" />
        )}
      </main>

      <Footer setView={setView} settings={settings} />
    </div>
  );
}

// --- MASTER PROJECT ENTRY POINT ---
// RESTRUCTURED: Defined first, then exported to ensure module visibility
function App() {
  return (
    <ShipmentProvider>
      <MainLayout />
    </ShipmentProvider>
  );
}

export default App;