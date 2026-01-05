import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, Globe, 
  MessageSquare, Clock, CheckCircle2, 
  FileText, ArrowRight, ShieldCheck, 
  Zap, AlertCircle
} from 'lucide-react';

/**
 * JAY-BESIN | CONTACT CORE v35.0 (ENTERPRISE)
 * -----------------------------------------------------------
 * DESIGN: TACTICAL COMMUNICATION HUB
 * FEATURES: 
 * - Live Support Status Indicator
 * - Tactical Inquiry Form
 * - Global Node Visualization
 */

export default function Contact({ theme, settings }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', subject: 'General Inquiry' });
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setSent(true);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-slate-200 pb-10">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                 <MessageSquare size={12} className="text-blue-400" /> Uplink Secure
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase">
                 Communication <span className="text-blue-600">Grid</span>
              </h1>
              <p className="text-slate-500 mt-4 max-w-xl font-medium">
                 Initiate a direct signal to our operations center. Response latency is currently optimized at under 2 hours.
              </p>
           </div>
           
           {/* Live Status Panel */}
           <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Support Team</p>
                 <p className="text-lg font-black text-slate-900 uppercase">Online</p>
              </div>
              <div className="relative">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                 <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-20"></div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* --- LEFT: TELEMETRY & NODES --- */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Contact Grid */}
            <div className="grid grid-cols-1 gap-4">
               <ContactNode 
                 icon={Phone} 
                 label="Voice Protocol" 
                 value={settings.whatsappNumber ? `+${settings.whatsappNumber}` : "+233 24 412 3456"}
                 action="Call Now"
                 sub="Mon-Sat, 08:00 - 18:00 GMT"
               />
               <ContactNode 
                 icon={Mail} 
                 label="Digital Mail" 
                 value="ops@jaybesin.com"
                 action="Send Email"
                 sub="Priority for Agent Inquiries"
               />
               <ContactNode 
                 icon={MapPin} 
                 label="Headquarters" 
                 value="Cargo Village, KIA" 
                 action="View Map"
                 sub="Accra, Ghana • Gate 04"
              />
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-900 text-white p-8 rounded-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10"><Zap size={80}/></div>
               <div className="relative z-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-slate-700 pb-4">
                     Fast-Track Options
                  </h3>
                  <div className="space-y-4">
                     <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-blue-600 transition-colors border border-white/10 group/btn">
                        <span className="text-xs font-bold uppercase flex items-center gap-3">
                           <MessageSquare size={14}/> WhatsApp Direct
                        </span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                     </button>
                     <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-blue-600 transition-colors border border-white/10 group/btn">
                        <span className="text-xs font-bold uppercase flex items-center gap-3">
                           <FileText size={14}/> Corporate Profile
                        </span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                     </button>
                  </div>
               </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
               <div className="flex items-start gap-4">
                  <Clock className="text-blue-600 shrink-0" size={20} />
                  <div>
                     <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">Operational Uptime</h4>
                     <p className="text-xs text-blue-700 leading-relaxed">
                        Our digital terminals accept inquiries 24/7. Physical processing occurs during standard business hours (GMT).
                     </p>
                  </div>
               </div>
            </div>

          </div>

          {/* --- RIGHT: TRANSMISSION FORM --- */}
          <div className="lg:col-span-7">
             <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden min-h-[600px] flex flex-col relative">
                
                {/* Decorative Top Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                {sent ? (
                   <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                         <CheckCircle2 size={40} className="text-green-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">Transmission Complete</h3>
                      <p className="text-slate-500 max-w-xs mx-auto text-sm mb-8">
                         Your message packet has been securely routed to our operations desk. Ticket ID: #REQ-{Math.floor(Math.random()*9000)}
                      </p>
                      <button 
                        onClick={() => setSent(false)}
                        className="px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors"
                      >
                         Send New Message
                      </button>
                   </div>
                ) : (
                   <div className="p-8 md:p-12">
                      <div className="flex justify-between items-center mb-10">
                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Submit Inquiry</h3>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded">
                            <ShieldCheck size={12}/> SSL Encrypted
                         </div>
                      </div>

                      <form onSubmit={handleSend} className="space-y-8">
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Client Identity</label>
                               <input 
                                 required
                                 value={form.name}
                                 onChange={e => setForm({...form, name: e.target.value})}
                                 className="w-full p-4 bg-slate-50 border-b-2 border-slate-200 outline-none focus:border-blue-600 focus:bg-white transition-colors font-bold text-sm uppercase"
                                 placeholder="ENTER FULL NAME"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Return Frequency (Email)</label>
                               <input 
                                 required
                                 type="email"
                                 value={form.email}
                                 onChange={e => setForm({...form, email: e.target.value})}
                                 className="w-full p-4 bg-slate-50 border-b-2 border-slate-200 outline-none focus:border-blue-600 focus:bg-white transition-colors font-bold text-sm"
                                 placeholder="EMAIL@DOMAIN.COM"
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Subject Protocol</label>
                            <select 
                              value={form.subject}
                              onChange={e => setForm({...form, subject: e.target.value})}
                              className="w-full p-4 bg-slate-50 border-b-2 border-slate-200 outline-none focus:border-blue-600 focus:bg-white transition-colors font-bold text-sm uppercase cursor-pointer appearance-none"
                            >
                               <option>General Cargo Inquiry</option>
                               <option>Vehicle Sourcing Request</option>
                               <option>Customs Clearance Quote</option>
                               <option>Report Operational Issue</option>
                            </select>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Message Payload</label>
                            <textarea 
                              required
                              value={form.message}
                              onChange={e => setForm({...form, message: e.target.value})}
                              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition-colors font-medium text-sm h-40 resize-none"
                              placeholder="Describe your requirements in detail..."
                            />
                         </div>

                         <button 
                           disabled={isSubmitting}
                           className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 group"
                         >
                            {isSubmitting ? (
                               <span className="animate-pulse">Transmitting Data...</span>
                            ) : (
                               <>Transmit Signal <Send size={16} className="group-hover:translate-x-1 transition-transform" /></>
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

const ContactNode = ({ icon: Icon, label, value, sub, action }) => (
   <div className="bg-white border border-slate-200 p-6 flex items-center justify-between hover:border-blue-500 transition-all group cursor-default">
      <div className="flex items-center gap-5">
         <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Icon size={20} />
         </div>
         <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-base font-black text-slate-900 leading-none mb-1">{value}</p>
            <p className="text-[10px] text-slate-500 font-mono">{sub}</p>
         </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
         <ArrowRight size={16} className="text-blue-600" />
      </div>
   </div>
);