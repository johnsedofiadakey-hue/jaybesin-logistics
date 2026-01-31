import React, { useState } from 'react';
import { ShieldCheck, Lock, Loader2, ChevronRight, ArrowRight } from 'lucide-react';
import Admin from './components/Admin';

export const AdminLoginScreen = ({ settings, onLogin, setView }) => {
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      if (passcode === (settings?.adminPass || 'admin123')) {
        onLogin();
      } else {
        setLoginError(true);
        setIsProcessing(false);
        setPasscode('');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-xl w-full max-w-lg border border-slate-200">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black uppercase italic">Registry Login</h2>
        </div>
        <form onSubmit={handleAuth} className="space-y-8">
          <input 
            type="password" 
            placeholder="ENTER PASSCODE" 
            className="w-full pl-6 py-5 bg-slate-50 border-2 rounded-2xl outline-none text-center text-xl tracking-widest"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-4">
            {isProcessing ? <Loader2 className="animate-spin" /> : "AUTHENTICATE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;