import React, { useState } from 'react';
import { auth } from '../firebase'; // Ensure this points to your firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The App.jsx listener will handle the redirect automatically
    } catch (err) {
      console.error("Login Error:", err);
      setError("Access Denied: Invalid Credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-900/50">
            JB
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Access</h2>
          <p className="text-slate-400 text-sm mt-2">JayBesin Logistics Terminal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-3 border border-red-100 animate-in fade-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Admin Identity</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                placeholder="admin@jaybesinlogistics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Secure Passkey</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Authenticate <ChevronRight size={20}/></>}
          </button>
        </form>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-xs text-slate-400 font-medium">Secured by Google Identity Platform</p>
        </div>
      </div>
    </div>
  );
};

export default Login;