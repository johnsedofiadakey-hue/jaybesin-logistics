import React from 'react';
import { 
  Globe, Mail, Phone, MapPin, 
  Lock, ChevronRight, Ship,
  Facebook, Twitter, Linkedin, Instagram, ArrowUp
} from 'lucide-react';

/**
 * JAY-BESIN | FOOTER CORE v38.0 (MASTER EDITION)
 * -----------------------------------------------------------
 * STATUS: FULLY SYNCHRONIZED WITH ADMIN
 * FEATURES: 
 * - Dynamic Contact Info (Phone, Email, Address from Admin)
 * - Dynamic Social Links (Only shows active links)
 * - Dynamic Brand Logo
 * - Gold Key Admin Access
 */

const Footer = ({ setView, theme, settings = {} }) => {
  const currentYear = new Date().getFullYear();
  
  // Safe Access to Socials to prevent crashes
  const socials = settings.socials || {}; 

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-20 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 border-b border-slate-800 pb-12">
          
          {/* COLUMN 1: BRAND NODE */}
          <div className="space-y-6">
            <div 
              onClick={() => setView('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {settings.logo ? (
                 <div className="h-10 w-10 bg-white rounded-lg p-1 flex items-center justify-center">
                    <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                 </div>
              ) : (
                 <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                   <Ship size={20} />
                 </div>
              )}
              
              <div>
                <h3 className="text-xl font-black tracking-tighter text-white leading-none">JAY-BESIN</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Logistics</p>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xs">
              {settings.heroSubtitle || "The premier node for industrial sourcing and logistics. Precision. Speed. Integrity."}
            </p>
            
            {/* DYNAMIC SOCIAL LINKS */}
            <div className="flex gap-3">
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all">
                  <Facebook size={16} />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 transition-all">
                  <Twitter size={16} />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white hover:border-blue-600 transition-all">
                  <Linkedin size={16} />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white hover:border-pink-500 transition-all">
                  <Instagram size={16} />
                </a>
              )}
            </div>
          </div>

          {/* COLUMN 2: NAVIGATION */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[
                { id: 'home', label: 'Home' },
                { id: 'logistics', label: 'Tracking' },
                { id: 'vehicles', label: 'JB Autos' },
                { id: 'onboarding', label: 'Partner Network' },
                { id: 'contact', label: 'Contact Us' }
              ].map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => setView(link.id)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-all group font-medium"
                  >
                    <ChevronRight size={12} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: LEGAL */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Legal Protocols</h4>
            <ul className="space-y-3">
              {['Terms of Service', 'Privacy Policy', 'Shipping Policy'].map((item, i) => (
                <li key={i}>
                  <button 
                    onClick={() => setView('terms')}
                    className="text-sm text-slate-400 hover:text-white transition-colors text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: DYNAMIC CONTACT INFO */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Contact Nodes</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <MapPin size={16} />
                </div>
                <span className="text-sm text-slate-300 leading-relaxed font-medium">
                  {settings.contactAddress || "Accra, Ghana"}
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <Phone size={16} />
                </div>
                <span className="text-sm text-slate-300 font-medium">
                   {settings.contactPhone || "+233 24 000 0000"}
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <Mail size={16} />
                </div>
                <span className="text-sm text-slate-300 font-medium">
                   {settings.contactEmail || "ops@jaybesin.com"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center md:text-left">
            © {currentYear} Jay-Besin Logistics. System Online.
          </p>

          <div className="flex items-center gap-6">
             <button onClick={handleScrollTop} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                Back to Top <ArrowUp size={12}/>
             </button>

             {/* === THE GOLD ADMIN KEY === */}
             <button 
               onClick={() => setView('admin-login')}
               className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 hover:border-yellow-600/50 hover:bg-yellow-900/10 transition-all duration-300"
               title="Administrator Access Protocol"
             >
               <Lock size={12} className="text-slate-600 group-hover:text-yellow-500 transition-colors" />
               <span className="text-[9px] font-black text-slate-600 group-hover:text-yellow-500 uppercase tracking-widest transition-colors">
                 Admin Core
               </span>
             </button>
             {/* ========================== */}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;