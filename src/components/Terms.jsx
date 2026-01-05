import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Scale, FileText, 
  ChevronRight, AlertCircle, Info, Anchor, 
  Globe, Truck, Download, ExternalLink, Activity
} from 'lucide-react';

/**
 * JAY-BESIN | LEGAL PROTOCOLS v38.0 (MASTER EDITION)
 * -----------------------------------------------------------
 * DESIGN: PROFESSIONAL DOCUMENTATION (SaaS Style)
 * STATUS: 100% COMPLETE & MERGED
 * FEATURES: 
 * - Sidebar Navigation
 * - Content Viewer Layout
 * - Downloadable PDF Action
 */

export default function Terms({ theme }) {
  const [activeSection, setActiveSection] = useState('shipping');

  const sections = [
    { 
      id: 'shipping', 
      title: 'Shipping Protocols', 
      icon: Anchor,
      content: (
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            All shipments managed through Jay-Besin Logistics are subject to international maritime and aviation laws. Transit times are estimates based on carrier schedules and may fluctuate due to port congestion at Tema or KIA.
          </p>
          <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest">Key Provisions</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Jay-Besin operates as a logistics facilitator; final delivery is contingent on Ghana Customs clearance processes.</li>
              <li>Volumetric weight calculations apply to all air freight cargo in accordance with IATA standards.</li>
              <li>Dangerous goods (batteries, liquids) must be declared prior to shipping to ensure proper handling and compliance.</li>
            </ul>
          </div>
        </div>
      )
    },
    { 
      id: 'sourcing', 
      title: 'Procurement & Sourcing', 
      icon: Globe,
      content: (
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            Industrial sourcing and vehicle procurement through our China Hub require a 70% mobilization commitment unless otherwise agreed upon in writing.
          </p>
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
            <div className="flex gap-3">
               <Info className="text-blue-600 shrink-0" size={20}/>
               <div>
                  <p className="text-blue-900 font-bold mb-1">Vehicle Warranty Notice</p>
                  <p className="text-blue-700 text-xs">Jay-Besin provides inspection reports for all vehicle assets, but factory warranties are governed solely by the Original Equipment Manufacturer (OEM) in China.</p>
               </div>
            </div>
          </div>
          <p>
            We verify supplier legitimacy and product quality at the point of origin. However, functional discrepancies discovered after delivery must be reported within 48 hours.
          </p>
        </div>
      )
    },
    { 
      id: 'liability', 
      title: 'Liability Limitations', 
      icon: ShieldCheck,
      content: (
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            Jay-Besin's liability is capped at the total value of the shipping fee for standard cargo. For high-value industrial assets and vehicles, purchasing secondary insurance is mandatory.
          </p>
          <p>
            <strong>Exclusions:</strong> We are not responsible for delays or damages caused by Force Majeure events, including but not limited to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white border border-slate-200 p-4 rounded-lg">
                <span className="block font-bold text-slate-900 text-xs uppercase mb-1">Natural Events</span>
                <span className="text-xs text-slate-500">Typhoons, Earthquakes, Floods</span>
             </div>
             <div className="bg-white border border-slate-200 p-4 rounded-lg">
                <span className="block font-bold text-slate-900 text-xs uppercase mb-1">Civil Events</span>
                <span className="text-xs text-slate-500">Political Unrest, Port Strikes</span>
             </div>
          </div>
        </div>
      )
    },
    { 
      id: 'privacy', 
      title: 'Data & Privacy', 
      icon: Lock,
      content: (
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            All client data, tracking identifiers, and payment records are encrypted using AES-256 protocols. Your data is used exclusively for cargo clearance and terminal synchronization.
          </p>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg text-green-800 font-medium">
             <Activity size={18}/>
             <span>We adhere to the Data Protection Act, 2012 (Act 843) of Ghana.</span>
          </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-16 border-b border-slate-200 pb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
              <Scale size={12} /> Compliance Node
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">Legal Protocols</h1>
           <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <p className="text-slate-500 max-w-2xl text-lg">
                Current operational frameworks governing sourcing, logistics, and data privacy for Jay-Besin Logistics.
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded">
                Last Updated: January 2026
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
           
           {/* SIDEBAR NAVIGATION */}
           <div className="lg:col-span-4 space-y-2 sticky top-32">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Table of Contents</p>
              {sections.map((section) => (
                 <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 text-sm font-bold uppercase tracking-wide ${
                      activeSection === section.id 
                        ? 'bg-white text-blue-600 shadow-lg shadow-slate-100 border border-slate-100 translate-x-2' 
                        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                    }`}
                 >
                    <div className="flex items-center gap-3">
                       <section.icon size={18} className={activeSection === section.id ? 'text-blue-600' : 'text-slate-400'} />
                       <span>{section.title}</span>
                    </div>
                    {activeSection === section.id && <ChevronRight size={16} />}
                 </button>
              ))}

              <div className="mt-8 bg-slate-900 text-white p-6 rounded-xl shadow-xl relative overflow-hidden">
                 <div className="relative z-10">
                    <h4 className="text-sm font-bold mb-2">Need Clarification?</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                       Contact our legal compliance node for specific inquiries regarding imports.
                    </p>
                    <button className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2 hover:text-white transition-colors">
                       Contact Support <ChevronRight size={12}/>
                    </button>
                 </div>
                 <div className="absolute -right-4 -bottom-4 opacity-10">
                    <ShieldCheck size={80}/>
                 </div>
              </div>
           </div>

           {/* CONTENT VIEWER */}
           <div className="lg:col-span-8">
              <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 min-h-[600px] flex flex-col">
                 <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 border border-slate-100">
                       <activeContent.icon size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeContent.title}</h2>
                 </div>

                 <div className="flex-1">
                    {activeContent.content}
                 </div>

                 {/* FOOTER ACTIONS */}
                 <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-white hover:border-blue-200 transition-all">
                       <ExternalLink size={16} /> Open in New Tab
                    </button>
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                       <Download size={16} /> Download PDF
                    </button>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}