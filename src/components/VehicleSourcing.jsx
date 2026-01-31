import React, { useState, useMemo } from 'react';
import { 
  Car, Fuel, Calendar, Gauge, Search, 
  ArrowRight, Filter, Star, ShieldCheck, 
  Zap, ChevronRight, X, Phone, ShoppingCart, MessageSquare
} from 'lucide-react';

/**
 * JAY-BESIN | VEHICLE SHOWROOM v2.2 (FINAL MERGE)
 * --------------------------------------------------
 * - Design: Premium Cinematic Dark Mode (Preserved).
 * - Data: Live connection to Admin Inventory.
 * - Action: WhatsApp Inquiry Integration.
 */

export default function VehicleSourcing({ setView, settings, vehicles = [] }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState(null); // For the details modal

  // --- LIVE DATA SOURCE ---
  // Using only real vehicles passed from App.jsx state (managed by Admin)
  const displayFleet = vehicles;

  // Filter Logic
  const filteredFleet = useMemo(() => {
    return displayFleet.filter(car => {
      const matchesCategory = activeCategory === 'All' || car.category === activeCategory;
      const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (car.vin && car.vin.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [displayFleet, activeCategory, searchTerm]);

  const categories = ['All', 'SUV', 'Saloon', 'Truck', 'Van', 'EV'];

  // --- WHATSAPP ACTION ---
  const handleInquiry = (car, type = 'order') => {
    const phone = settings.contactPhone?.replace(/[^0-9]/g, '') || "233553065304";
    let msg = `*AUTO INQUIRY - JAYBESIN*\n--------------------------------\n` +
              `Vehicle: ${car.name}\n` +
              `Year: ${car.year}\n` +
              `VIN: ${car.vin || 'N/A'}\n` +
              `Price: $${car.price}\n` +
              `--------------------------------\n`;
    
    if (type === 'order') {
        msg += `I am interested in purchasing this vehicle. Please provide the proforma invoice.`;
    } else {
        msg += `I would like to request a detailed inspection report for this vehicle.`;
    }
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-600 selection:text-white">
      
      {/* --- 1. CINEMATIC HERO --- */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover opacity-40"
            alt="Luxury Car Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-red-500/30 bg-red-900/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              <Star size={12} className="fill-red-400" />
              Premium Import Service
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-6">
              The Executive <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Fleet.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              Direct access to the Chinese automotive market. From high-performance EVs to heavy-duty industrial trucks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => document.getElementById('inventory').scrollIntoView({ behavior: 'smooth' })} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                View Inventory <ArrowRight size={18} />
              </button>
              <button onClick={() => setView('contact')} className="border border-slate-700 hover:border-white text-white px-8 py-4 rounded-lg font-bold transition-all">
                Custom Request
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. CONTROL BAR (Search & Filter) --- */}
      <div id="inventory" className="sticky top-20 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-4">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-white text-slate-950' 
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by model or brand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* --- 3. SHOWROOM GRID --- */}
      <section className="py-16 container mx-auto px-6 min-h-[50vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFleet.map((car) => (
            <div 
              key={car.id} 
              onClick={() => setSelectedCar(car)}
              className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-red-600/50 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-2 relative"
            >
              {/* Image Container */}
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={car.images && car.images[0] ? car.images[0] : 'https://via.placeholder.com/800x600?text=No+Image'} 
                  alt={car.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                
                {/* Badge Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                   {car.condition === 'Brand New' && (
                     <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">New Arrival</span>
                   )}
                   <span className="bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-slate-700">
                     {car.fuel}
                   </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">{car.name}</h3>
                  <p className="text-lg font-bold text-white font-mono">${Number(car.price).toLocaleString()}</p>
                </div>
                
                <div className="flex gap-4 text-xs text-slate-400 mb-6 border-b border-slate-800 pb-4">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {car.year}</span>
                  <span className="flex items-center gap-1"><Gauge size={14}/> {car.engine || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Car size={14}/> {car.category}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest group-hover:text-white transition-colors">View Details</span>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- EMPTY STATE (When no cars are added in Admin) --- */}
        {filteredFleet.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-800">
              <Car className="text-slate-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-2">Inventory Updating</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              We are currently updating our showroom with new arrivals. 
              Please check back soon or contact our sourcing team for custom orders.
            </p>
            <button onClick={() => setView('contact')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold transition-all">
              Contact Us Directly
            </button>
          </div>
        )}
      </section>

      {/* --- 4. CONCIERGE REQUEST (Footer Section) --- */}
      <section className="bg-slate-900 py-20 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-red-900 to-slate-900 rounded-3xl p-10 md:p-16 relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

             <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                 <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">Can't find what you need?</h2>
                 <p className="text-red-100 text-lg mb-8">
                   Our sourcing team in China can locate any specific make, model, or configuration you desire. 
                   Just tell us what you are looking for.
                 </p>
                 <button onClick={() => setView('contact')} className="bg-white text-red-900 px-8 py-4 rounded-lg font-bold flex items-center gap-2 hover:bg-red-50 transition-colors">
                   <Phone size={18} /> Contact Sourcing Team
                 </button>
               </div>
               <div className="w-full md:w-1/3 opacity-80">
                  <ShieldCheck size={120} className="text-red-400/30 mx-auto" />
                  <p className="text-center text-red-200/50 font-bold uppercase tracking-widest mt-4">Verified Suppliers Only</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- 5. DETAILS MODAL --- */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left: Image */}
            <div className="w-full md:w-1/2 relative bg-black">
              <img 
                src={selectedCar.images && selectedCar.images[0] ? selectedCar.images[0] : 'https://via.placeholder.com/800x600'} 
                className="w-full h-full object-cover" 
                alt={selectedCar.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-50 md:hidden"></div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-3xl font-black uppercase leading-none mb-2">{selectedCar.name}</h2>
                   <p className="text-red-500 font-bold text-xl font-mono">${Number(selectedCar.price).toLocaleString()}</p>
                 </div>
                 <button onClick={() => setSelectedCar(null)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                   <X size={20} />
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-800 p-3 rounded-lg">
                     <p className="text-xs text-slate-500 uppercase font-bold">Year</p>
                     <p className="font-bold text-white">{selectedCar.year}</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-lg">
                     <p className="text-xs text-slate-500 uppercase font-bold">Engine</p>
                     <p className="font-bold text-white">{selectedCar.engine}</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-lg">
                     <p className="text-xs text-slate-500 uppercase font-bold">Condition</p>
                     <p className="font-bold text-white">{selectedCar.condition}</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-lg">
                     <p className="text-xs text-slate-500 uppercase font-bold">Est. Shipping</p>
                     <p className="font-bold text-white">${selectedCar.shipping || 'TBD'}</p>
                  </div>
               </div>

               <div className="mb-8 flex-1">
                 <h4 className="text-sm font-bold uppercase text-slate-500 mb-2">Vehicle Summary</h4>
                 <p className="text-slate-300 leading-relaxed text-sm">
                   {selectedCar.description || "No specific description available. Please contact our team for full specifications and inspection reports."}
                 </p>
               </div>

               <div className="flex flex-col gap-3 mt-auto">
                 <button 
                    onClick={() => handleInquiry(selectedCar, 'order')} 
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                 >
                   <ShoppingCart size={18}/> Order Now
                 </button>
                 <button 
                    onClick={() => handleInquiry(selectedCar, 'inspection')} 
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg uppercase tracking-wider transition-all"
                 >
                   Request Inspection
                 </button>
               </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}