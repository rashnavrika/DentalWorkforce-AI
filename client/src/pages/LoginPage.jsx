import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, Eye, EyeOff, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@dentalworkforce.ai');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate email & password with Supabase/Backend
      // System automatically resolves user role from database record
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800 relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-2xl shadow-lg shadow-sky-500/30 text-white mb-3">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">DentalWorkforce AI</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Enterprise SSO & Capacity Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Organization Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Enter organization email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-sky-500 focus:ring-0" />
              Remember session
            </label>
            <span className="text-sky-400 font-medium">Automatic Role Detection</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating & Resolving Role...' : 'Sign In to Workforce Portal'}
          </button>
        </form>

        {/* Organization Accounts Reference */}
        <div className="mt-6 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-300 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-sky-400" /> Registered Organization Accounts:
          </p>
          <div className="grid grid-cols-1 gap-1 font-mono text-[10px] text-slate-300">
            <p>• <span className="text-sky-400">admin@dentalworkforce.ai</span> (HR Admin)</p>
            <p>• <span className="text-sky-400">planner@dentalworkforce.ai</span> (Workforce Planner)</p>
            <p>• <span className="text-sky-400">lead@dentalworkforce.ai</span> (Team Lead)</p>
            <p>• <span className="text-sky-400">dentist@dentalworkforce.ai</span> (Employee)</p>
            <p className="text-slate-500 font-sans mt-0.5">* Password for all organization accounts is <span className="text-white font-mono">Password123!</span></p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Supabase DB Authentication • Dynamic Role Resolution
          </p>
        </div>
      </div>
    </div>
  );
};
