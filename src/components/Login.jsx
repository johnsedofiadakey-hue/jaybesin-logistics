import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, Lock, Loader2, ChevronRight, Mail } from 'lucide-react';

const Login = ({ onSuccess, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Login failed", err);
      setError('Access Denied: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]"></div>
      </div>

      <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10 font-bold uppercase">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-2 italic">Terminal Access</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              placeholder="OPERATOR ID (EMAIL)"
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="SECURITY KEY"
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                AUTHENTICATE <ChevronRight size={20} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setView && setView('home')}
            className="w-full text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all py-2"
          >
            Return to Public Node
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;