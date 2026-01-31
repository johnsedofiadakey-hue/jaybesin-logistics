import React, { useState } from 'react';
import { 
  Users, TrendingUp, ShieldCheck, CheckCircle, 
  Briefcase, DollarSign, ChevronRight, UserPlus,
  BarChart3, Globe, Zap, FileText, ArrowRight,
  Target, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase'; // Connect to Database

/**
 * JAY-BESIN | AGENT NETWORK v35.0 (ENTERPRISE CONNECTED)
 * -----------------------------------------------------------
 * DESIGN: Original Corporate Console (Preserved).
 * LOGIC: Connected to Firebase.
 * FEATURES: 
 * - Real-Time Income Simulator
 * - Multi-Step Technical Form
 * - Live Data Submission
 */

export default function AgentOnboarding({ setView, theme }) {
  const [step, setStep] = useState(1);
  const [volume, setVolume] = useState(25); // Default 25 CBM
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formState, setFormState] = useState({
    name: '', email: '', city: '', 
    focus: 'General Cargo', volume: '', agreed: false
  });

  // Commission Logic: Base $20/CBM + Volume Bonus
  const baseRate = 20;
  const bonus = volume > 50 ? 500 : 0;
  const estimatedCommission = (volume * baseRate) + bonus;

  const handleReset = () => {
    setSubmitted(false);
    setStep(1);
    setFormState({ name: '', email: '', city: '', focus: 'General Cargo', volume: '', agreed: false });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Send to Firebase
      await addDoc(collection(db, "agents"), {
        name: formState.name,
        email: formState.email,
        city: formState.city,
        focus: formState.focus,
        volume: formState.volume, // User's estimated volume text
        projectedCommission: estimatedCommission, // Calculated potential
        date: new Date().toISOString().split('T')[0],
        status: 'Pending Review'
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting agent application:", error);
      alert("Transmission Error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 border-b border-slate-200 pb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
              <Briefcase size={12} className="text-blue-400" /> Recruitment Protocol
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight mb-6">
              Affiliate <span className="text-blue-600">Network</span>
           </h1>
           <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
              Join the West African logistics grid. Monetize your network by referring importers to the Jay-Besin infrastructure.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* --- LEFT: VALUE PROPOSITION & CALCULATOR --- */}
           <div className="lg:col-span-5 space-y-8">
              
              {/* Income Simulator */}
              <div className="bg-slate-900 text-white p-8 rounded-lg shadow-2xl relative overflow-hidden group">
                 {/* Background Tech Pattern */}
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                 <div className="absolute top-0 right-0 p-6 opacity-10"><DollarSign size={100}/></div>

                 <div className="relative z-10">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                       <BarChart3 size={14}/> Earnings Simulator
                    </h3>
                    
                    <div className="mb-8">
                       <div className="flex justify-between text-xs font-bold uppercase mb-4 text-slate-400">
                          <span>Monthly Cargo Volume</span>
                          <span className="text-white">{volume} CBM</span>
                       </div>
                       <input 
                         type="range" 
                         min="5" max="200" 
                         value={volume} 
                         onChange={(e) => setVolume(e.target.value)}
                         className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                       />
                       <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                          <span>5 CBM</span>
                          <span>200 CBM</span>
                       </div>
                    </div>

                    <div className="text-center border-t border-slate-700 pt-8">
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Projected Monthly Payout</p>
                       <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl md:text-5xl font-black font-mono text-green-400 tracking-tighter">
                             ${estimatedCommission.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-500 self-end mb-2">USD</span>
                       </div>
                       {volume > 50 && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-yellow-400 uppercase bg-yellow-400/10 px-2 py-1 rounded">
                             <TrendingUp size={10} /> Includes High-Volume Bonus
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Benefits List */}
              <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                    Partner Advantages
                 </h3>
                 <div className="space-y-6">
                    <BenefitRow 
                       icon={Zap}
                       title="Fast Payouts" 
                       desc="Commissions processed weekly via Bank Transfer or Mobile Money."
                    />
                    <BenefitRow 
                       icon={Target}
                       title="Lead Tracking" 
                       desc="Access a dedicated dashboard to monitor your clients' cargo status."
                    />
                    <BenefitRow 
                       icon={ShieldCheck}
                       title="Verified Status" 
                       desc="Official certification as a Jay-Besin Logistics Partner."
                    />
                 </div>
              </div>

           </div>

           {/* --- RIGHT: APPLICATION CONSOLE --- */}
           <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                 
                 {/* Console Header */}
                 <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                       <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Agent Application</h3>
                       <p className="text-xs text-slate-500 font-medium">Secure Uplink • Phase {step}/3</p>
                    </div>
                    <div className="flex gap-1">
                       {[1, 2, 3].map(i => (
                          <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
                       ))}
                    </div>
                 </div>

                 {/* Console Body */}
                 <div className="p-8 md:p-12 flex-1 relative">
                    <AnimatePresence mode="wait">
                       {!submitted ? (
                          <motion.div
                             key="form"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             transition={{ duration: 0.3 }}
                             className="space-y-8"
                          >
                             {step === 1 && (
                                <div className="space-y-6">
                                   <div className="space-y-1">
                                      <h4 className="text-2xl font-bold text-slate-900">Identity Verification</h4>
                                      <p className="text-sm text-slate-500">Enter your legal details for the agent registry.</p>
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <FormInput label="Full Name / Entity" placeholder="ENTER NAME" value={formState.name} onChange={v => setFormState({...formState, name: v})} />
                                      <FormInput label="Email Address" placeholder="EMAIL@DOMAIN.COM" value={formState.email} onChange={v => setFormState({...formState, email: v})} />
                                   </div>
                                   <FormInput label="Operational City" placeholder="E.G. ACCRA, KUMASI" value={formState.city} onChange={v => setFormState({...formState, city: v})} />
                                </div>
                             )}

                             {step === 2 && (
                                <div className="space-y-6">
                                   <div className="space-y-1">
                                      <h4 className="text-2xl font-bold text-slate-900">Operational Profile</h4>
                                      <p className="text-sm text-slate-500">Tell us about your logistics experience.</p>
                                   </div>
                                   <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Focus</label>
                                      <select 
                                         value={formState.focus}
                                         onChange={e => setFormState({...formState, focus: e.target.value})}
                                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-600 font-bold text-sm uppercase transition-all"
                                      >
                                         <option>General Cargo Import</option>
                                         <option>Vehicle Dealership</option>
                                         <option>Industrial Procurement</option>
                                         <option>Air Freight Consolidation</option>
                                      </select>
                                   </div>
                                   <FormInput label="Est. Monthly Volume" placeholder="E.G. 20 CBM" value={formState.volume} onChange={v => setFormState({...formState, volume: v})} />
                                </div>
                             )}

                             {step === 3 && (
                                <div className="space-y-6">
                                   <div className="space-y-1">
                                      <h4 className="text-2xl font-bold text-slate-900">Final Authorization</h4>
                                      <p className="text-sm text-slate-500">Review terms and submit application.</p>
                                   </div>
                                   <div className="p-6 bg-slate-50 border border-slate-200 rounded-md">
                                      <div className="flex gap-4">
                                         <ShieldCheck className="text-blue-600 shrink-0" size={24} />
                                         <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            I verify that all provided information is accurate. I agree to operate within the Jay-Besin Logistics compliance framework and understand that fraudulent activity will result in immediate termination of the agent node.
                                         </p>
                                      </div>
                                   </div>
                                   <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                                      <input 
                                         type="checkbox" 
                                         checked={formState.agreed}
                                         onChange={e => setFormState({...formState, agreed: e.target.checked})}
                                         className="w-5 h-5 accent-blue-600"
                                      />
                                      <span className="text-xs font-bold text-slate-700 uppercase">I Accept the Master Protocol Terms</span>
                                   </label>
                                </div>
                             )}
                          </motion.div>
                       ) : (
                          <motion.div 
                             key="success"
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="text-center py-12"
                          >
                             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-green-600" size={40} />
                             </div>
                             <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">Application Received</h3>
                             <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm">
                                Your data has been encrypted and transmitted to HQ. Our onboarding team will contact you within 24 hours.
                             </p>
                             <button onClick={handleReset} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                                Start New Application
                             </button>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>

                 {/* Console Footer */}
                 {!submitted && (
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-between">
                       {step > 1 ? (
                          <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase hover:text-slate-900">Back</button>
                       ) : (<div></div>)}
                       
                       <button 
                          onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                          disabled={(step === 3 && !formState.agreed) || isSubmitting}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          {isSubmitting ? "Transmitting..." : (step === 3 ? "Submit Data" : "Next Phase")} <ArrowRight size={14} />
                       </button>
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

const BenefitRow = ({ icon: Icon, title, desc }) => (
   <div className="flex gap-4 group">
      <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center shrink-0 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">
         <Icon size={18} />
      </div>
      <div>
         <h4 className="text-sm font-bold text-slate-900 uppercase mb-1">{title}</h4>
         <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
   </div>
);

const FormInput = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
    <input 
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-600 font-bold text-sm uppercase transition-all placeholder:text-slate-300" 
      placeholder={placeholder} 
    />
  </div>
);