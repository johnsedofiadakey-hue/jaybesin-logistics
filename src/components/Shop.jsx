import React, { useState, useMemo } from 'react';
import { 
  Search, ShoppingCart, Filter, Plus, Minus, 
  Trash2, X, MessageSquare, CheckCircle, Package, 
  ShoppingBag, Tag, ChevronRight, Store
} from 'lucide-react';

/**
 * JAY-BESIN | SOURCING MART v5.0 (STABLE & CONNECTED)
 * -----------------------------------------------------------
 * - Crash Proof: Robust defaults for all data inputs.
 * - Admin Sync: Displays live inventory from Admin Panel.
 * - Checkout: WhatsApp integration with detailed order receipt.
 */

export default function Shop({ 
  products = [], 
  categories = [], 
  settings = {}, 
  cart = [], 
  setCart 
}) {
  // --- STATE MANAGEMENT ---
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- SAFE DATA HANDLING ---
  // Ensure we always have arrays to map over, preventing crashes
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? ['All', ...categories] : ['All'];

  // --- FILTERING ENGINE ---
  const filteredProducts = useMemo(() => {
    return safeProducts.filter(product => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [safeProducts, activeCategory, searchQuery]);

  // --- CART LOGIC ---
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true); // Auto-open cart on add
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // --- WHATSAPP CHECKOUT ---
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // 1. Build the Receipt
    let message = `*NEW ORDER - JAYBESIN MART*\n--------------------------------\n`;
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.name} (x${item.qty}) - $${(item.price * item.qty).toFixed(2)}\n`;
    });
    message += `--------------------------------\n`;
    message += `*TOTAL VALUE: $${cartTotal.toFixed(2)}*\n\n`;
    message += `Please confirm availability and shipping costs.`;

    // 2. Determine Number (Use Shop Specific or General Contact)
    const targetPhone = settings.shopWhatsapp || settings.contactPhone || "233553065304";
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    // 3. Launch
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-20">
      
      {/* --- HEADER & SEARCH --- */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
           
           {/* Title */}
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-blue-600 text-white p-2 rounded-lg"><Store size={20}/></div>
              <div>
                 <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">Global Sourcing Mart</h1>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Factory Direct Prices</p>
              </div>
           </div>

           {/* Search Bar */}
           <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg outline-none transition-all text-sm font-bold"
              />
           </div>

           {/* Cart Toggle (Mobile/Desktop) */}
           <button 
             onClick={() => setIsCartOpen(true)}
             className="relative p-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
           >
              <ShoppingCart size={18}/>
              <span className="text-xs font-bold uppercase hidden md:inline">View Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
           </button>
        </div>

        {/* Categories Bar */}
        <div className="max-w-7xl mx-auto px-6 flex gap-6 overflow-x-auto py-3 no-scrollbar">
           {safeCategories.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold uppercase tracking-wide whitespace-nowrap pb-1 border-b-2 transition-colors ${
                  activeCategory === cat 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
           ))}
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-8">
         {filteredProducts.length === 0 ? (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
               <Package size={64} className="mb-4 text-slate-300"/>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
               <p className="max-w-xs text-center text-sm">We couldn't find any items matching your search. Try adjusting your filters.</p>
               <button onClick={() => {setActiveCategory('All'); setSearchQuery('')}} className="mt-6 text-blue-600 font-bold text-sm hover:underline">Clear Filters</button>
            </div>
         ) : (
            // PRODUCT GRID
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
                     
                     {/* Image Area */}
                     <div className="relative h-48 bg-slate-100 overflow-hidden">
                        {product.image ? (
                           <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        ) : (
                           <div className="flex items-center justify-center h-full text-slate-300">
                              <ShoppingBag size={48} />
                           </div>
                        )}
                        {/* Landed Cost Badge */}
                        {product.isLandedCost && (
                           <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                              <CheckCircle size={10} /> LANDED COST
                           </div>
                        )}
                     </div>

                     {/* Details */}
                     <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">{product.category || 'General'}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-1">{product.description || "High quality industrial sourcing."}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                           <span className="text-xl font-black text-blue-600">${product.price}</span>
                           <button 
                             onClick={() => addToCart(product)}
                             className="bg-slate-900 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                             title="Add to Cart"
                           >
                              <Plus size={20} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* --- CART SLIDE-OVER --- */}
      {isCartOpen && (
         <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity" onClick={() => setIsCartOpen(false)} />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
               
               {/* Cart Header */}
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                     <ShoppingCart className="text-blue-600"/> Your Order
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-500 transition-colors">
                     <X size={24}/>
                  </button>
               </div>

               {/* Cart Items */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <ShoppingBag size={48} className="opacity-20"/>
                        <p className="font-bold text-sm">Your cart is empty.</p>
                        <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Start Browsing</button>
                     </div>
                  ) : (
                     cart.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center group">
                           {/* Thumb */}
                           <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                              {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-slate-300"/></div>}
                           </div>
                           
                           {/* Info */}
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate text-sm">{item.name}</h4>
                              <p className="text-xs text-slate-500 font-mono">${item.price}</p>
                           </div>

                           {/* Controls */}
                           <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                              <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><Minus size={12}/></button>
                              <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><Plus size={12}/></button>
                           </div>

                           <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                     ))
                  )}
               </div>

               {/* Footer / Checkout */}
               {cart.length > 0 && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Estimated</span>
                        <span className="text-2xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
                     </div>
                     <button 
                        onClick={handleCheckout}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs"
                     >
                        <MessageSquare size={18}/> Send Order via WhatsApp
                     </button>
                     <p className="text-[10px] text-center text-slate-400 mt-4">
                        Checkout sends your list to an agent for final invoice & shipping confirmation.
                     </p>
                  </div>
               )}
            </div>
         </>
      )}
    </div>
  );
}