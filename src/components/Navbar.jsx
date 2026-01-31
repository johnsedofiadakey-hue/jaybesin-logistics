import React, { useState } from 'react';
import { 
  Menu, X, Ship, Globe, Car, 
  Phone, Briefcase, Home, ShoppingBag 
} from 'lucide-react';

/**
 * JAY-BESIN | NAVBAR CORE v42.0 (CLEAN MISSION CONTROL)
 * -----------------------------------------------------------
 * STATUS: PRODUCTION READY
 * FEATURES: 
 * - Admin Link Removed: Prevents "Double Auth" bug; Access moved to Footer.
 * - Dynamic Branding: Pulls Logo and Title from Firebase Settings.
 * - Live Cart Logic: Real-time badge updates for Sourcing Mart.
 * - Responsive: Full Mobile Drawer with animations.
 */

export default function Navbar({ setView, currentView, settings, cartCount = 0 }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- NAVIGATION CONFIGURATION ---
  // We keep the primary customer-facing links only to ensure a clean UX.
  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Sourcing Mart', icon: ShoppingBag }, 
    { id: 'logistics', label: 'Tracking', icon: Globe },
    { id: 'vehicles', label: 'Auto Studio', icon: Car },
    { id: 'onboarding', label: 'Agents', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  // Helper to handle navigation clicks and close the mobile drawer
  const handleNav = (viewId) => {
    setView(viewId);
    setIsMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 h-20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* --- BRAND IDENTITY SECTION --- */}
        <div 
          onClick={() => handleNav('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* LOGO LOGIC: Renders uploaded image from Admin Settings or fallback icon */}
          {settings.logo ? (
             <img 
               src={settings.logo} 
               alt="Jay-Besin Logo" 
               className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105" 
             />
          ) : (
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">
               <Ship size={20} />
             </div>
          )}
          
          {/* COMPANY NAME: Pulled dynamically from the database */}
          <div className="hidden md:block">
             <h1 className="font-black text-xl tracking-tighter text-slate-900 leading-none">
               {settings.heroTitle || 'JAY-BESIN'}
             </h1>
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
               Global Logistics Enterprise
             </p>
          </div>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                currentView === link.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-y-[-1px]' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <link.icon size={16} />
              {link.label}
              
              {/* LIVE SHOPPING CART BADGE */}
              {link.id === 'shop' && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce font-black">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* --- MOBILE TOGGLE BUTTON --- */}
        <button 
          className="md:hidden p-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors relative active:scale-90"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          
          {/* Mobile Badge Indicator (Small dot) */}
          {cartCount > 0 && !isMobileOpen && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* --- MOBILE NAVIGATION DRAWER --- */}
      {isMobileOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top-5 duration-300 ease-out">
          <div className="p-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full p-5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all active:scale-[0.98] ${
                  currentView === link.id 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                   <link.icon size={22} className={currentView === link.id ? 'text-blue-400' : 'text-slate-400'} />
                   <span className="tracking-tight">{link.label}</span>
                </div>
                
                {/* Mobile Cart Counter */}
                {link.id === 'shop' && cartCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-black shadow-sm uppercase tracking-widest">
                    {cartCount} In Cart
                  </span>
                )}
              </button>
            ))}
            
            {/* Added extra padding at bottom of mobile menu */}
            <div className="py-2"></div>
          </div>
        </div>
      )}
    </nav>
  );
}