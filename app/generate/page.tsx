"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Brain, Sparkles, ChevronLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import UploadBox from '../components/ui/UploadBox';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const GeneratePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    growthStage: 'Tillering',
    pestPresence: false,
    optimizeFor: 'balanced',
    image: null as string | null
  });

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/auth');
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (typeof window === "undefined" || !auth?.currentUser) return;
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': auth.currentUser?.uid || ''
        },
        body: JSON.stringify({
          formData: {
            growthStage: formData.growthStage,
            pestPresence: formData.pestPresence,
          },
          optimizeFor: formData.optimizeFor,
          image: formData.image,
          imageMimeType: formData.image ? 'image/jpeg' : null,
          userId: auth.currentUser?.uid
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Save result for the next page
        localStorage.setItem('afm_latest_result', JSON.stringify(data));
        router.push('/results');
      } else {
        const errData = await res.json();
        const detail = errData.detail ? `\n\nDetail: ${errData.detail}` : '';
        alert(`Analysis failed: ${errData.error || 'Please check your API configuration'}${detail}`);
      }
    } catch (err) {
      console.error("Generation failed:", err);
      alert("System connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white card-shadow flex items-center justify-center text-primary">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em] leading-none mb-1">New Strategy</h2>
          <h1 className="text-xl font-black text-primary">Generate Strategy</h1>
        </div>
      </div>

      <p className="text-sm text-secondary/70 leading-relaxed font-medium px-1">
        Leverage our multi-agent autonomous system to generate a custom 30-day plan for your field.
      </p>

      {/* Visual Input */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest px-1">Vision Agent Input</h3>
        <UploadBox onImageSelect={(base64) => setFormData({...formData, image: base64})} />
      </div>

      {/* Field Parameters */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest px-1">Environment Parameters</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-secondary/40 tracking-widest pl-1">Growth Stage</label>
            <select 
              className="w-full px-4 py-4 rounded-2xl bg-white card-shadow border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none"
              value={formData.growthStage}
              onChange={(e) => setFormData({...formData, growthStage: e.target.value})}
            >
              <option value="Vegetative">Vegetative</option>
              <option value="Tillering">Tillering</option>
              <option value="Stem Elongation">Stem Elongation</option>
              <option value="Heading">Heading</option>
              <option value="Ripening">Ripening</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-2xl card-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/5 rounded-lg text-secondary">
                <Layers size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-primary">Active Pests?</span>
                <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">Manual Override</span>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={formData.pestPresence}
              onChange={(e) => setFormData({...formData, pestPresence: e.target.checked})}
              className="w-6 h-6 rounded-lg text-primary focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-secondary/40 tracking-widest pl-1">Focus Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {['balanced', 'yield', 'profit'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFormData({...formData, optimizeFor: mode})}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200
                    ${formData.optimizeFor === mode ? 'bg-primary text-white scale-105 shadow-lg' : 'bg-white text-secondary/60 hover:bg-secondary/5'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4">
        <Button 
          fullWidth 
          variant="primary" 
          disabled={loading}
          onClick={handleSubmit}
          className="py-5"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Sparkles className="animate-spin" size={20} />
              Running Multi-Agent Analysis...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Brain size={20} />
              Analyze & Generate Plan
            </div>
          )}
        </Button>
      </div>

      <div className="pb-8 text-center">
        <p className="text-[9px] text-secondary/30 font-bold uppercase tracking-[0.2em]">
          Synthesizing Data from 3 Autonomous Agents
        </p>
      </div>
    </div>
  );
};

export default GeneratePage;
