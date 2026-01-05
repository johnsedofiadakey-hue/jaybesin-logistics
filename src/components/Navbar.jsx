import React, { useState } from 'react';
import { 
  Menu, X, Ship, Globe, Car, 
  Phone, Briefcase, Home, ShoppingBag, User 
} from 'lucide-react';

/**
 * JAY-BESIN | NAVBAR CORE v41.3 (STRICT MERGE)
 * -----------------------------------------------------------
 * STATUS: FINAL
 * FEATURES: 
 * - Original Design Preserved
 * - Logo Image Support Active
 * - Admin Access Added (User Icon)
 */

export default function Navbar({ setView, currentView, settings, cartCount = 0 }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- NAVIGATION CONFIGURATION ---
  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Sourcing Mart', icon: ShoppingBag }, 
    { id: 'logistics', label: 'Tracking', icon: Globe },
    { id: 'vehicles', label: 'Auto Studio', icon: Car },
    { id: 'onboarding', label: 'Agents', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  // Helper to handle navigation clicks
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
          {/* LOGO LOGIC: Use uploaded logo or fallback icon */}
          {settings.logo ? (
             <img 
               src={settings.logo} 
               alt="Logo" 
               className="h-10 w-auto object-contain" 
             />
          ) : (
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">
               <Ship size={20} />
             </div>
          )}
          
          {/* COMPANY NAME */}
          <div className="hidden md:block">
             <h1 className="font-black text-xl tracking-tighter text-slate-900 leading-none">
               {settings.heroTitle || 'JAY-BESIN'}
             </h1>
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
               Global Logistics
             </p>
          </div>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${
                currentView === link.id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <link.icon size={16} />
              {link.label}
              
              {/* LIVE CART BADGE */}
              {link.id === 'shop' && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          ))}

          {/* ADMIN ACCESS BUTTON (Added to Desktop) */}
          <button 
            onClick={() => handleNav('admin-login')}
            className="px-3 py-2 text-slate-400 hover:text-slate-900 transition-colors ml-2"
            title="Admin Login"
          >
            <User size={20} />
          </button>
        </div>

        {/* --- MOBILE TOGGLE BUTTON --- */}
        <button 
          className="md:hidden p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors relative"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          
          {/* Mobile Cart Indicator */}
          {cartCount > 0 && !isMobileOpen && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* --- MOBILE DRAWER --- */}
      {isMobileOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top-10 duration-200">
          <div className="p-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full p-4 rounded-xl flex items-center justify-between font-bold text-sm transition-all ${
                  currentView === link.id 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                   <link.icon size={20} />
                   {link.label}
                </div>
                
                {/* Mobile Badge */}
                {link.id === 'shop' && cartCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                    {cartCount} Items
                  </span>
                )}
              </button>
            ))}

            {/* ADMIN ACCESS BUTTON (Added to Mobile) */}
            <button
                onClick={() => handleNav('admin-login')}
                className="w-full p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm text-slate-400 hover:bg-slate-50 mt-4 border-t border-slate-100"
            >
                <User size={16} /> Staff Access
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}