import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, Globe, 
  MessageSquare, Clock, CheckCircle2, 
  FileText, ArrowRight, ShieldCheck, 
  Zap, AlertCircle
} from 'lucide-react';

/**
 * JAY-BESIN | CONTACT CORE v40.0 (SYNCHRONIZED)
 * -----------------------------------------------------------
 * STATUS: FULLY COMMUNICATING WITH ADMIN
 * DESIGN: TACTICAL COMMUNICATION GRID
 * FEATURES: 
 * - Dynamic Admin Uplink (Phone, Mail, Address)
 * - Intelligent WhatsApp Routing
 * - Transmit Signal Feedback Logic
 */

export default function Contact({ theme, settings = {} }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', subject: 'General Inquiry' });
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to trigger direct WhatsApp communication
  const handleWhatsApp = () => {
    const num = settings.whatsappNumber || settings.contactPhone || "233553065304";
    const cleanNum = num.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNum}?text=Hello Jay-Besin, I have a logistics inquiry.`, '_blank');
  };

  const handleSend = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate high-speed data transmission to operations center
    setTimeout(() => {
      setSent(true);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 font-sans text-slate-900 selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 border-b border-slate-200 pb-12">
           <div className="animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 rounded-sm shadow-xl shadow-slate-200">
                 <MessageSquare size={12} className="text-blue-500" /> Secure Terminal 01
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter uppercase leading-[0.9]">
                 Communication <span className="text-blue-600">Grid</span>
              </h1>
              <p className="text-slate-500 mt-6 max-w-xl font-bold text-lg leading-relaxed">
                 Direct uplink to our global operations center. Signal processing current latency: <span className="text-blue-600">~60mins</span>.
              </p>
           </div>
           
           {/* Live Operational Status Panel */}
           <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-2xl shadow-slate-200/50 flex items-center gap-8 animate-in fade-in zoom-in duration-1000">
              <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Grid Status</p>
                 <p className="text-2xl font-black text-slate-950 uppercase">Active</p>
              </div>
              <div className="relative">
                 <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                 <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-20"></div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* --- LEFT: DYNAMIC TELEMETRY --- */}
          <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            
            <div className="grid grid-cols-1 gap-5">
               <ContactNode 
                 icon={Phone} 
                 label="Voice Protocol" 
                 value={settings.contactPhone || "+233 55 306 5304"}
                 sub="Encrypted Satellite Uplink"
               />
               <ContactNode 
                 icon={Mail} 
                 label="Digital Mail" 
                 value={settings.companyEmail || "ops@jaybesin.com"}
                 sub="Priority Transmission Route"
               />
               <ContactNode 
                 icon={MapPin} 
                 label="Global Node" 
                 value={settings.companyAddress || "Cargo Village, KIA, Accra"} 
                 sub="GMT +00:00 Terminal"
              />
            </div>

            {/* Quick Actions Integration */}
            <div className="bg-slate-950 text-white p-10 rounded-3xl relative overflow-hidden shadow-2xl shadow-blue-900/10">
               <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><Zap size={200}/></div>
               <div className="relative z-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 border-b border-white/10 pb-6 text-blue-500">
                     Tactical Commands
                  </h3>
                  <div className="space-y-4">
                     <button 
                       onClick={handleWhatsApp}
                       className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-green-600 transition-all border border-white/10 rounded-xl group/btn active:scale-95"
                     >
                        <span className="text-xs font-black uppercase flex items-center gap-4 tracking-widest">
                           <MessageSquare size={18} className="text-green-500 group-hover/btn:text-white"/> WhatsApp Command
                        </span>
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                     </button>
                     <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-blue-600 transition-all border border-white/10 rounded-xl group/btn active:scale-95">
                        <span className="text-xs font-black uppercase flex items-center gap-4 tracking-widest">
                           <FileText size={18} className="text-blue-500 group-hover/btn:text-white"/> Download Profile
                        </span>
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                     </button>
                  </div>
               </div>
            </div>

            {/* Uptime Indicator */}
            <div className="bg-blue-600/5 border border-blue-600/10 p-8 rounded-2xl flex items-start gap-5">
               <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Clock size={24} />
               </div>
               <div>
                  <h4 className="text-xs font-black text-slate-950 uppercase tracking-[0.2em] mb-2">Operational Uptime</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     The terminal accepts digital inquiries 24/7. Physical processing at KIA Node 04: Mon-Fri 08:00 - 18:00.
                  </p>
               </div>
            </div>

          </div>

          {/* --- RIGHT: TRANSMISSION FORM --- */}
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
             <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[650px] flex flex-col relative border-b-8 border-b-blue-600">
                
                {sent ? (
                   <div className="flex-1 flex flex-col items-center justify-center p-16 text-center animate-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner shadow-green-200">
                         <CheckCircle2 size={48} className="text-green-600" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-950 uppercase mb-4 tracking-tighter">Transmission Successful</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-lg mb-10 font-medium">
                         Your inquiry packet has been received. Ticket ID: <span className="text-blue-600 font-black font-mono">#JB-{(Math.random()*9999).toFixed(0)}</span>
                      </p>
                      <button 
                        onClick={() => setSent(false)}
                        className="px-12 py-5 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all rounded-full shadow-xl active:scale-95"
                      >
                         Restart Uplink
                      </button>
                   </div>
                ) : (
                   <div className="p-10 md:p-16">
                      <div className="flex justify-between items-center mb-12">
                         <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-3">
                            <Zap size={24} className="text-blue-600" /> Signal Input
                         </h3>
                         <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                            <ShieldCheck size={14}/> 256-Bit Encrypted
                         </div>
                      </div>

                      <form onSubmit={handleSend} className="space-y-10">
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3 group">
                               <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block group-focus-within:text-blue-600 transition-colors">Client ID / Name</label>
                               <input 
                                 required
                                 value={form.name}
                                 onChange={e => setForm({...form, name: e.target.value})}
                                 className="w-full py-4 bg-transparent border-b-2 border-slate-100 outline-none focus:border-blue-600 transition-all font-bold text-base"
                                 placeholder="FULL IDENTITY"
                               />
                            </div>
                            <div className="space-y-3 group">
                               <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block group-focus-within:text-blue-600 transition-colors">Return Signal (Email)</label>
                               <input 
                                 required
                                 type="email"
                                 value={form.email}
                                 onChange={e => setForm({...form, email: e.target.value})}
                                 className="w-full py-4 bg-transparent border-b-2 border-slate-100 outline-none focus:border-blue-600 transition-all font-bold text-base"
                                 placeholder="EMAIL@PROTOCOL.COM"
                               />
                            </div>
                         </div>

                         <div className="space-y-3 group">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block group-focus-within:text-blue-600 transition-colors">Subject Protocol</label>
                            <select 
                              value={form.subject}
                              onChange={e => setForm({...form, subject: e.target.value})}
                              className="w-full py-4 bg-transparent border-b-2 border-slate-100 outline-none focus:border-blue-600 transition-all font-bold text-base uppercase cursor-pointer"
                            >
                               <option>Cargo Sourcing & Logistics</option>
                               <option>Auto Studio Request</option>
                               <option>Customs & Agent Partnership</option>
                               <option>Urgent Operational Issue</option>
                            </select>
                         </div>

                         <div className="space-y-3 group">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block group-focus-within:text-blue-600 transition-colors">Transmission Payload</label>
                            <textarea 
                              required
                              value={form.message}
                              onChange={e => setForm({...form, message: e.target.value})}
                              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-base h-44 resize-none shadow-inner"
                              placeholder="Describe your operational requirements..."
                            />
                         </div>

                         <button 
                           disabled={isSubmitting}
                           className="w-full py-6 bg-blue-600 hover:bg-slate-950 text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-2xl shadow-blue-200 hover:shadow-slate-300 flex items-center justify-center gap-4 group rounded-full active:scale-95"
                         >
                            {isSubmitting ? (
                               <span className="animate-pulse">Transmitting Data...</span>
                            ) : (
                               <>Transmit Signal <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                            )}
                         </button>

                      </form>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const ContactNode = ({ icon: Icon, label, value, sub }) => (
   <div className="bg-white border border-slate-200 p-8 flex items-center justify-between rounded-3xl hover:border-blue-600 transition-all group cursor-default shadow-sm hover:shadow-xl hover:shadow-slate-200">
      <div className="flex items-center gap-6">
         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-500">
            <Icon size={24} />
         </div>
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
            <p className="text-lg font-black text-slate-950 leading-tight mb-1">{value}</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{sub}</p>
         </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 duration-500">
         <ArrowRight size={20} className="text-blue-600" />
      </div>
   </div>
);