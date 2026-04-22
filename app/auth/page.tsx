"use client";

export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, User, Leaf, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!auth) throw new Error("Firebase Auth is not initialized.");
      let authUser;
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        authUser = userCred.user;
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCred.user, {
          displayName: formData.name
        });
        authUser = userCred.user;
      }

      // Check if user profile exists
      const userRes = await fetch('/api/user', {
        headers: { 'x-user-id': authUser.uid }
      });
      
      const userData = await userRes.json();
      if (userData.success && userData.user) {
        localStorage.setItem('afm_user', JSON.stringify(userData.user));
        router.push('/');
      } else {
        router.push('/onboarding');
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col min-h-screen bg-background text-primary">
      <div className="flex flex-col gap-2 mb-10 mt-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-14 h-14 bg-primary rounded-3xl flex items-center justify-center text-white mb-2 shadow-xl shadow-primary/20">
          <Leaf size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-none uppercase">Autonomous<br/>Farm Manager</h1>
        <p className="text-secondary font-bold text-sm tracking-widest uppercase opacity-60">Multi-Agent Intelligence</p>
      </div>

      <Card padding="large" className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center justify-between gap-4 border-b border-secondary/5 pb-4">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-2 text-xs font-black px-2 uppercase tracking-widest transition-all duration-300 ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-secondary/40'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-2 text-xs font-black px-2 uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-secondary/40'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label htmlFor="full-name" className="text-[10px] font-black uppercase text-secondary/60 tracking-[0.2em] pl-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  id="full-name"
                  required
                  type="text" 
                  placeholder="e.g. Aman Gupta"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-secondary/30 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[10px] font-black uppercase text-secondary/60 tracking-[0.2em] pl-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                id="email"
                required
                type="email" 
                placeholder="farm@manager.ai"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-secondary/30 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[10px] font-black uppercase text-secondary/60 tracking-[0.2em] pl-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                id="password"
                required
                type="password" 
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-secondary/30 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-alert/5 border border-alert/20 rounded-2xl text-alert">
              <AlertCircle size={18} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
            className="mt-4 py-5 font-black uppercase tracking-widest"
          >
            {loading ? (
               <div className="flex items-center gap-2">
                 <Sparkles className="animate-pulse" size={18} />
                 Securing Session...
               </div>
            ) : (
              <div className="flex items-center gap-2">
                {isLogin ? 'Initialize Dashboard' : 'Create Farm Identity'}
                <ChevronRight size={18} />
              </div>
            )}
          </Button>
        </form>
      </Card>

      <div className="mt-auto pt-12 pb-4 text-center">
        <p className="text-[9px] text-secondary/30 font-bold uppercase tracking-[0.3em] leading-relaxed">
          Pioneer In Agriculture Technology<br/>
          Secured By Firebase Cloud
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
