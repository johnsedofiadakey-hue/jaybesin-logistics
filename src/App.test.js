import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Globe, Fingerprint, Package, TrendingUp, 
  Anchor, Wind, AlertCircle, CheckCircle2, Database, 
  Palette, Printer, Trash2, Edit3, Plus, ShieldCheck, 
  MapPin, Briefcase, Clock, Ship, HardDrive
} from 'lucide-react';

/**
 * JAY-BESIN GROUP | PURE LOGISTICS TERMINAL
 * VERSION: 11.0.0 (SPECIALIZED BUILD)
 */

export default function App() {
  // 1. TERMINAL ENGINE STATE
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState({ primary: '#020617', secondary: '#D4AF37' });
  const [searchQuery, setSearchQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [calc, setCalc] = useState({ weight: 0, mode: 'Ocean' });
  const [billing, setBilling] = useState({ client: '', amount: '', ref: 'JB-REF-' + Math.floor(Math.random() * 100000) });

  // 2. INDUSTRIAL MANIFEST DATA
  const [manifest, setManifest] = useState([
    { id: 'JB-2025-001', client: 'Quantum Ghana Ltd', status: 'In Transit', origin: 'Guangzhou', dest: 'Tema', type: 'Ocean', weight: '45.2 CBM', milestone: 65, eta: '2025-12-30', details: 'Industrial Electronics' },
    { id: 'JB-2025-009', client: 'Osei Manufacturing', status: 'Customs Clearance', origin: 'Shanghai', dest: 'Kotoka', type: 'Air', weight: '1,200 KG', milestone: 92, eta: '2025-12-25', details: 'Precision Tooling' },
    { id: 'JB-2025-114', client: 'Besin Sourcing VIP', status: 'Departed Origin', origin: 'Dubai', dest: 'Tema', type: 'Ocean', weight: '12.0 CBM', milestone: 15, eta: '2026-01-20', details: 'Luxury Fit-outs' }
  ]);

  // 3. INTERNAL STYLING ENGINE
  const styles = {
    wrapper: { backgroundColor: theme.primary, minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' },
    nav: { position: 'fixed', top: 0, width: '100%', height: '90px', backgroundColor: 'rgba(2, 6, 23, 0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, display: 'flex', justifyContent: 'center' },
    container: { maxWidth: '1400px', width: '100%', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    card: { backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', padding: '40px', position: 'relative', overflow: 'hidden' },
    btnGold: { padding: '20px 40px', backgroundColor: theme.secondary, color: 'white', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px' }
  };

  // 4. LOGIC HANDLERS
  const handleTrackSearch = () => {
    const found = manifest.find(i => i.id.toUpperCase() === searchQuery.toUpperCase());
    setTrackResult(found || 'NOT_FOUND');
    if (found) setView('logistics');
  };

  const freightTotal = useMemo(() => {
    const rate = calc.mode === 'Air' ? 14.5 : 380; // Example GHS rates
    return (calc.weight * rate).toLocaleString();
  }, [calc]);

  return (
    <div style={styles.wrapper}>
      
      {/* --- ELITE LOGISTICS NAV --- */}
      <nav style={styles.nav}>
        <div style={styles.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }} onClick={() => setView('home')}>
            <div style={{ width: '45px', height: '45px', backgroundColor: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>JB</div>
            <div style={{ lineHeight: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', italic: 'true', letterSpacing: '-1px' }}>Jay-Besin</h2>
              <p style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', color: theme.secondary, letterSpacing: '0.4em' }}>Logistics Terminal</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '50px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            {['Home', 'Logistics', 'Tools'].map(item => (
              <span key={item} style={{ cursor: 'pointer', color: view === item.toLowerCase() ? theme.secondary : 'rgba(255,255,255,0.4)' }} onClick={() => setView(item.toLowerCase())}>{item}</span>
            ))}
            <Fingerprint size={18} style={{ color: theme.secondary, cursor: 'pointer' }} onClick={() => { if(prompt("ACCESS KEY:") === "admin123") {setIsAdmin(true); setView('admin');} }} />
          </div>
        </div>
      </nav>

      {/* --- VIEW ENGINE --- */}
      <div style={{ paddingTop: '90px' }}>
        <AnimatePresence mode="wait">
          
          {/* HOME: THE SATELLITE COMMAND */}
          {view === 'home' && (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <section style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                  <img src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=2500" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logistics Background" />
                </div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <p style={{ color: theme.secondary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1em', fontSize: '10px', marginBottom: '20px' }}>Global Supply Chain Intelligence</p>
                  <h1 style={{ fontSize: '12vw', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 0.8, letterSpacing: '-0.05em', marginBottom: '50px' }}>
                    JB <span style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>LOGISTICS</span>
                  </h1>
                  <button style={styles.btnGold} onClick={() => setView('logistics')}>Enter Terminal</button>
                </div>
              </section>

              {/* SEARCH TERMINAL */}
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 100 }}>
                <div style={{ maxWidth: '1100px', width: '90%', backgroundColor: '#0f172a', padding: '12px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '-50px', display: 'flex', gap: '15px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px', padding: '0 30px' }}>
                    <Search color={theme.secondary} />
                    <input style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', padding: '20px 0', outline: 'none', fontSize: '20px', fontWeight: 'bold' }} placeholder="SCAN MANIFEST SIGNATURE..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleTrackSearch()} />
                  </div>
                  <button style={{ ...styles.btnGold, borderRadius: '15px', padding: '0 50px' }} onClick={handleTrackSearch}>Initialize Scan</button>
                </div>
              </div>

              {/* WAREHOUSE FOCUS SECTION */}
              <section style={{ maxWidth: '1400px', margin: '150px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', padding: '0 40px', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '70px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 0.9, marginBottom: '30px' }}>Guangzhou <br/> <span style={{ color: theme.secondary }}>Node A-1</span></h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', lineHeight: 1.6, marginBottom: '40px' }}>Our primary China hub. Every parcel is consolidated and marked with tactical signatures for priority West African routing.</p>
                  <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '40px', color: 'black' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '20px' }}>Official Shipping Mark</p>
                    <div style={{ border: '4px dashed #cbd5e1', padding: '30px', textAlign: 'center' }}>
                      <p style={{ fontSize: '40px', fontWeight: 900 }}>BESIN / <span style={{ color: 'red' }}>CLIENT</span> / GH</p>
                    </div>
                  </div>
                </div>
                <div style={{ height: '600px', borderRadius: '40px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} alt="China Warehouse" />
                </div>
              </section>
            </motion.div>
          )}

          {/* LOGISTICS: THE MANIFEST VIEW */}
          {view === 'logistics' && (
            <motion.div key="l" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 40px' }}>
              <h2 style={{ fontSize: '70px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '60px' }}>Manifest <span style={{ color: theme.secondary }}>Terminal</span></h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '60px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div style={styles.card}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: theme.secondary, marginBottom: '20px', textTransform: 'uppercase' }}>Scan Database</p>
                    <input style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '22px', borderRadius: '15px', color: 'white', outline: 'none' }} placeholder="JB-CODE-XXXX" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
                    <button onClick={handleTrackSearch} style={{ ...styles.btnGold, width: '100%', marginTop: '20px', borderRadius: '15px' }}>Verify Signature</button>
                  </div>
                  <div style={styles.card}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '20px' }}>LIVE OPERATIONAL FEED</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.4 }}><span>RMB RATE:</span> <span>2.15 GHS</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.4 }}><span>NODE STATUS:</span> <span style={{ color: '#22c55e' }}>ONLINE</span></div>
                    </div>
                  </div>
                </div>

                <div>
                  <AnimatePresence mode="wait">
                    {trackResult === 'NOT_FOUND' ? (
                      <div style={{ ...styles.card, border: '1px solid #ef4444', textAlign: 'center' }}>
                        <AlertCircle color="#ef4444" size={50} style={{ marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '24px', fontWeight: 900 }}>SIGNATURE NOT REGISTERED</h3>
                      </div>
                    ) : trackResult ? (
                      <div style={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
                          <div>
                            <h3 style={{ fontSize: '50px', fontWeight: 900, color: theme.secondary, fontStyle: 'italic' }}>{trackResult.id}</h3>
                            <p style={{ fontWeight: 700, opacity: 0.4 }}>{trackResult.client}</p>
                          </div>
                          <div style={{ padding: '10px 20px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50px', fontSize: '10px', fontWeight: 900 }}>{trackResult.status}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
                          <div><p style={{ fontSize: '10px', opacity: 0.3, marginBottom: '5px' }}>ROUTE</p><p style={{ fontWeight: 700 }}>{trackResult.origin} → {trackResult.dest}</p></div>
                          <div><p style={{ fontSize: '10px', opacity: 0.3, marginBottom: '5px' }}>CAPACITY</p><p style={{ fontWeight: 700 }}>{trackResult.weight}</p></div>
                          <div><p style={{ fontSize: '10px', opacity: 0.3, marginBottom: '5px' }}>ETA</p><p style={{ fontWeight: 700 }}>{trackResult.eta}</p></div>
                          <div><p style={{ fontSize: '10px', opacity: 0.3, marginBottom: '5px' }}>CATEGORY</p><p style={{ fontWeight: 700 }}>{trackResult.details}</p></div>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${trackResult.milestone}%` }} transition={{ duration: 1.5 }} style={{ height: '100%', background: theme.secondary }} />
                        </div>
                        <p style={{ textAlign: 'right', marginTop: '15px', fontWeight: 900, color: theme.secondary, fontSize: '12px' }}>{trackResult.milestone}% TRANSIT COMPLETE</p>
                      </div>
                    ) : (
                      <div style={{ height: '100%', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                        <Globe size={100} style={{ marginBottom: '20px' }} />
                        <p style={{ fontWeight: 900, letterSpacing: '0.4em' }}>WAITING FOR SATELLITE PING</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOLS: CALCULATOR & ADDRESSES */}
          {view === 'tools' && (
            <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px' }}>
                <div style={styles.card}>
                  <h3 style={{ fontSize: '30px', fontWeight: 900, marginBottom: '40px', fontStyle: 'italic' }}>Freight Estimation Engine</h3>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <button onClick={() => setCalc({...calc, mode: 'Air'})} style={{ flex: 1, padding: '20px', background: calc.mode === 'Air' ? theme.secondary : 'transparent', border: '1px solid white', color: 'white', fontWeight: 900 }}>AIR (KG)</button>
                    <button onClick={() => setCalc({...calc, mode: 'Ocean'})} style={{ flex: 1, padding: '20px', background: calc.mode === 'Ocean' ? theme.secondary : 'transparent', border: '1px solid white', color: 'white', fontWeight: 900 }}>OCEAN (CBM)</button>
                  </div>
                  <p style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4, marginBottom: '10px' }}>CARGO VOLUME / WEIGHT</p>
                  <input type="number" style={{ width: '100%', background: 'black', padding: '30px', border: 'none', borderRadius: '15px', color: 'white', fontSize: '24px', fontWeight: 900 }} onChange={(e)=>setCalc({...calc, weight: e.target.value})} />
                  <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
                    <p style={{ fontSize: '10px', opacity: 0.4, marginBottom: '10px' }}>ESTIMATED GHS TOTAL</p>
                    <p style={{ fontSize: '60px', fontWeight: 900, color: theme.secondary }}>₵ {freightTotal}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div style={{ ...styles.card, background: 'white', color: 'black' }}>
                    <h3 style={{ fontWeight: 900, marginBottom: '20px' }}>WAREHOUSE NODE: GUANGZHOU</h3>
                    <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '30px' }}>Deliver all items to the following address for consolidation:</p>
                    <p style={{ fontWeight: 900, background: '#f1f5f9', padding: '20px', borderRadius: '10px' }}>Guangzhou Dist. B, Gate 42, Jay-Besin Cargo Node</p>
                  </div>
                  <div style={styles.card}>
                    <Ship style={{ color: theme.secondary, marginBottom: '20px' }} size={40} />
                    <h4 style={{ fontWeight: 900 }}>PRIORITY SHIPMENT</h4>
                    <p style={{ fontSize: '12px', opacity: 0.4, marginTop: '10px' }}>Jay-Besin offers direct LCL and FCL services with weekly departures.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADMIN: CONTROL CENTER */}
          {view === 'admin' && isAdmin && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '60px', fontWeight: 900, fontStyle: 'italic' }}>Terminal <span style={{ color: theme.secondary }}>Admin</span></h2>
                <button onClick={()=>{setIsAdmin(false); setView('home')}} style={{ border: '1px solid #ef4444', color: '#ef4444', padding: '15px 30px', fontWeight: 900, borderRadius: '10px', cursor: 'pointer' }}>LOCK ACCESS</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px' }}>
                <div style={styles.card}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', fontWeight: 900 }}><Database color={theme.secondary}/> MANIFEST CRM</h3>
                  {manifest.map(item => (
                    <div key={item.id} style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>{item.id} — <span style={{ opacity: 0.3 }}>{item.client}</span></span>
                      <div style={{ display: 'flex', gap: '20px', opacity: 0.4 }}><Edit3 size={18}/><Trash2 size={18}/></div>
                    </div>
                  ))}
                  <button style={{ width: '100%', padding: '20px', background: 'white', color: 'black', fontWeight: 900, border: 'none', marginTop: '30px', borderRadius: '15px' }}>ADD MANIFEST SIGNATURE</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div style={styles.card}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', fontWeight: 900 }}><Palette color={theme.secondary}/> DESIGN STUDIO</h3>
                    <p style={{ fontSize: '10px', opacity: 0.4, marginBottom: '15px' }}>ACCENT COLOR (GLOBAL SYNC)</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <input type="color" value={theme.secondary} onChange={(e)=>setTheme({...theme, secondary: e.target.value})} style={{ width: '80px', height: '80px', border: 'none', background: 'none', cursor: 'pointer' }} />
                      <p style={{ fontWeight: 900, fontSize: '20px' }}>{theme.secondary.toUpperCase()}</p>
                    </div>
                  </div>
                  <div style={{ ...styles.card, background: 'white', color: 'black' }}>
                    <h3 style={{ fontWeight: 900, marginBottom: '30px' }}>FINANCIAL STATEMENT</h3>
                    <input placeholder="CLIENT NAME" style={{ width: '100%', padding: '20px 0', border: 'none', borderBottom: '2px solid #ddd', outline: 'none', marginBottom: '20px', fontSize: '18px' }} onChange={(e)=>setBilling({...billing, client: e.target.value})} />
                    <input placeholder="TOTAL GHS" style={{ width: '100%', padding: '20px 0', border: 'none', borderBottom: '2px solid #ddd', outline: 'none', marginBottom: '30px', fontSize: '18px' }} onChange={(e)=>setBilling({...billing, amount: e.target.value})} />
                    <button onClick={()=>window.print()} style={{ width: '100%', padding: '25px', background: 'black', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}>GENERATE & PRINT <Printer size={20} style={{ marginLeft: '10px' }}/></button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- FOOTER --- */}
      <footer style={{ marginTop: '150px', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '100px 40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '40px', fontWeight: 900, fontStyle: 'italic', marginBottom: '20px' }}>JAY-BESIN <span style={{ color: theme.secondary }}>LOGISTICS</span></h2>
            <p style={{ maxWidth: '400px', opacity: 0.2, fontSize: '12px', lineHeight: 1.8 }}>Engineered for absolute reliability in the bridge between China and West Africa. Global tracking, consolidation, and prestige cargo handling.</p>
          </div>
          <div style={{ display: 'flex', gap: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '10px', fontWeight: 900, opacity: 0.3 }}>
              <span>AIR LOGISTICS</span>
              <span>OCEAN FREIGHT</span>
              <span>SOURCING HUB</span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', fontSize: '10px', fontWeight: 900 }}>
                <ShieldCheck size={16}/> SECURE SESSION
              </div>
              <p style={{ fontSize: '9px', opacity: 0.2 }}>NODE: 001-ACC // UTC-0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}