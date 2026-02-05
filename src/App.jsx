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
 * JAY-BESIN LOGISTICS | GLOBAL MASTER TERMINAL v16.0 (RBAC ENABLED)
 * -------------------------------------------------------------------------
 * ENGINEERING STATUS: 
 * - LOGIC: Migrated to Firebase Auth (RBAC).
 * - UI: Mobile-Optimized Login Screen.
 * - SECURITY: Roles Enforced (Super Admin, Admin, Viewer).
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
import Login from '@/components/Login';

// --- DATABASE INFRASTRUCTURE ---
import { ShipmentProvider, useShipments } from '@/components/ShipmentContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// --- MASTER CONTROLLER COMPONENT ---
function MainLayout() {
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);

  // Connect to Database Context
  const shipmentContext = useShipments();
  const { currentUser } = useAuth(); // Listen to Auth State

  // Safe Destructuring with Fallbacks
  const {
    shipments = [],
    products = [],
    vehicles = [],
    agents = [],
    messages = [],
    settings = {},
    setSettings = () => { },
    addShipment = () => { },
    updateShipment = () => { },
    deleteShipment = () => { },
    addProduct = () => { },
    deleteProduct = () => { },
    addVehicle = () => { },
    updateVehicle = () => { },
    deleteVehicle = () => { },
    addCategory = () => { },
    deleteCategory = () => { },
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

  // --- SIMPLE ROUTER (URL SYNC) ---
  // Allow direct access to /admin or /shop via URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      setView('admin'); // Will trigger login check automatically
    } else if (path.includes('/shop')) {
      setView('shop');
    }
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
  // SECURED: Only renders if currentUser exists.
  if (view === 'admin' && currentUser) {
    return (
      <Admin
        setView={setView}
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
  // If attempting to access 'admin' or 'admin-login' without auth
  if (view === 'admin-login' || (view === 'admin' && !currentUser)) {
    return (
      <Login
        onSuccess={() => setView('admin')}
        setView={setView}
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
function App() {
  return (
    <AuthProvider>
      <ShipmentProvider>
        <MainLayout />
      </ShipmentProvider>
    </AuthProvider>
  );
}

export default App;