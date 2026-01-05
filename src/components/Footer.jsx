import React from 'react';
import { 
  Globe, Mail, Phone, MapPin, 
  Lock, ChevronRight, Ship,
  Facebook, Twitter, Linkedin, Instagram, ArrowUp,
  ShieldCheck, ExternalLink
} from 'lucide-react';

/**
 * JAY-BESIN | FOOTER CORE v40.0 (ULTIMATE SYNCHRONIZED EDITION)
 * -----------------------------------------------------------
 * STATUS: PRODUCTION READY
 * UPDATES: 
 * - Linked to live Firebase Settings (Address, Phone, Email, Socials)
 * - Restored Legal Protocol Routing (Terms/Privacy/Shipping)
 * - Added Admin Core "Gold Key" Access
 * - Enhanced Background Visual Effects
 */

const Footer = ({ setView, theme, settings = {} }) => {
  const currentYear = new Date().getFullYear();
  
  // High-reliability access to dynamic data from Admin
  const socials = settings.socials || {}; 

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 relative overflow-hidden font-sans mt-auto">
      
      {/* Decorative Top Border Glow */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-40"></div>
      
      {/* Structural Background Flair */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-24 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 border-b border-slate-900 pb-16">
          
          {/* COLUMN 1: BRAND IDENTITY & SOCIALS */}
          <div className="space-y-8">
            <div 
              onClick={() => setView('home')}
              className="flex items-center gap-4 cursor-pointer group"
            >
              {settings.logo ? (
                 <div className="h-12 w-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-2xl shadow-white/5">
                    <img src={settings.logo} alt="Jay-Besin Logo" className="w-full h-full object-contain" />
                 </div>
              ) : (
                 <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-500">
                   <Ship size={24} />
                 </div>
              )}
              
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-white leading-none">JAY-BESIN</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Global Logistics</p>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xs">
              {settings.heroSubtitle || "Building the future of industrial sourcing and global logistics through precision and integrity."}
            </p>
            
            {/* DYNAMIC SOCIAL UPLINK */}
            <div className="flex flex-wrap gap-4">
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300">
                  <Facebook size={18} />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white hover:border-sky-400 transition-all duration-300">
                  <Twitter size={18} />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white hover:border-blue-600 transition-all duration-300">
                  <Linkedin size={18} />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white hover:border-pink-500 transition-all duration-300">
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>

          {/* COLUMN 2: QUICK NAVIGATION */}
          <div>
            <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                { id: 'home', label: 'Dashboard Home' },
                { id: 'logistics', label: 'Cargo Tracking' },
                { id: 'shop', label: 'Sourcing Mart' },
                { id: 'vehicles', label: 'JB Auto Studio' },
                { id: 'onboarding', label: 'Partner Network' }
              ].map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => setView(link.id)}
                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-500 transition-all group font-bold"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: LEGAL PROTOCOLS */}
          <div>
            <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">Legal Terminal</h4>
            <ul className="space-y-4">
              {[
                { label: 'Terms of Service', view: 'terms' },
                { label: 'Privacy Protocol', view: 'privacy' },
                { label: 'Shipping Regulations', view: 'terms' },
                { label: 'Contact Support', view: 'contact' }
              ].map((item, i) => (
                <li key={i}>
                  <button 
                    onClick={() => setView(item.view)}
                    className="text-sm text-slate-400 hover:text-white transition-colors text-left font-bold flex items-center gap-2 group"
                  >
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-500" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: DYNAMIC CONTACT NODES */}
          <div>
            <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">Contact Nodes</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                   <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Headquarters</p>
                  <span className="text-sm text-slate-300 leading-relaxed font-bold">
                    {settings.companyAddress || "Cargo Village, KIA, Accra"}
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                   <Phone size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Support Line</p>
                  <span className="text-sm text-slate-300 font-bold">
                     {settings.contactPhone || "+233 55 306 5304"}
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                   <Mail size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Digital Mail</p>
                  <span className="text-sm text-slate-300 font-bold lowercase">
                     {settings.companyEmail || "support@jaybesin.com"}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* --- GLOBAL BOTTOM BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-slate-900/50">
          
          <div className="flex items-center gap-3">
            <ShieldCheck size={14} className="text-blue-600" />
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              © {currentYear} Jay-Besin Logistics Enterprise. All Systems Functional.
            </p>
          </div>

          <div className="flex items-center gap-8">
             <button onClick={handleScrollTop} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all group">
                Back to Top <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
             </button>

             {/* === THE GOLD ADMIN KEY (PROTECTED) === */}
             <button 
               onClick={() => setView('admin-login')}
               className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-yellow-600/40 hover:bg-yellow-900/5 transition-all duration-500 shadow-2xl"
               title="Administrator Access Protocol"
             >
               <Lock size={14} className="text-slate-700 group-hover:text-yellow-500 transition-colors" />
               <span className="text-[10px] font-black text-slate-700 group-hover:text-yellow-500 uppercase tracking-[0.4em] transition-colors">
                 Personnel Core
               </span>
             </button>
             {/* ====================================== */}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;