"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, MapPin, User, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const MALAYSIA_LOCATIONS = [
  'Kedah (Kota Setar)', 'Kedah (Kubang Pasu)', 'Kedah (Yan)', 'Perlis', 
  'Selangor (Sekinchan)', 'Selangor (Sabak Bernam)', 'Perak (Kerian)', 
  'Perak (Seberang Perak)', 'Penang (Seberang Perai)', 'Kelantan (Kemubu)',
  'Terengganu (Besut)', 'Pahang (Rompin)', 'Johor', 'Sabah', 'Sarawak'
];

const OnboardingPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cropType: 'Paddy',
    farmSize: '',
    irrigationType: 'Rainfed',
    soilCondition: 'Clay',
    fertilizerUsage: 'Organic',
    pestHistory: 'None'
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/auth');
      else if (user.displayName && !formData.name) {
        setFormData(prev => ({ ...prev, name: user.displayName || '' }));
      }
    });
    return () => unsubscribe();
  }, [router, formData.name]);

  const handleLocationChange = (val: string) => {
    setFormData({ ...formData, location: val });
    if (val.length > 0) {
      const filtered = MALAYSIA_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (loc: string) => {
    setFormData({ ...formData, location: loc });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          ...formData
        })
      });

      if (res.ok) {
        localStorage.setItem('afm_user', JSON.stringify(formData));
        router.push('/');
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col min-h-screen bg-background text-primary">
      {/* ... previous content ... */}
      <div className="flex flex-col gap-2 mb-10 mt-12">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mb-2">
          <Leaf size={28} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Autonomous Farm Manager</h1>
        <p className="text-secondary font-medium italic">Your AI-powered farm assistant. 🌾</p>
      </div>

      <Card padding="large" className="flex flex-col gap-6 overflow-visible">
        <h2 className="text-xl font-bold uppercase tracking-widest text-secondary/40">Set up your field</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-secondary tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
              <input 
                required
                type="text" 
                placeholder="e.g. Aman Gupta"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-secondary/30"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-xs font-black uppercase text-secondary tracking-widest">Location (Malaysia)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
              <input 
                required
                type="text" 
                placeholder="e.g. Kedah, Sekinchan"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-secondary/30"
                value={formData.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => formData.location && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-secondary/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {suggestions.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full px-6 py-4 text-left text-sm font-bold text-primary hover:bg-secondary/5 transition-colors border-b border-secondary/5 last:border-none"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent onBlur from stealing focus
                        selectSuggestion(loc);
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-secondary tracking-widest">Primary Crop</label>
            <select 
              className="w-full px-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none"
              value={formData.cropType}
              onChange={(e) => setFormData({...formData, cropType: e.target.value})}
            >
              <option value="Paddy">Paddy / Rice</option>
              <option value="Corn">Corn / Maize</option>
              <option value="Vegetables">Organic Vegetables</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Farm Size</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none"
                value={formData.farmSize}
                onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
              >
                <option value="">Select Size</option>
                <option value="1-2 Acres">1-2 Acres</option>
                <option value="3-5 Acres">3-5 Acres</option>
                <option value="6-10 Acres">6-10 Acres</option>
                <option value="11-20 Acres">11-20 Acres</option>
                <option value="20+ Acres">20+ Acres</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Irrigation</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none"
                value={formData.irrigationType}
                onChange={(e) => setFormData({...formData, irrigationType: e.target.value})}
              >
                <option value="Rainfed">Rainfed</option>
                <option value="Canal">Canal</option>
                <option value="Pump">Pump / Tube Well</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Soil Type</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none"
                value={formData.soilCondition}
                onChange={(e) => setFormData({...formData, soilCondition: e.target.value})}
              >
                <option value="Clay">Clay</option>
                <option value="Loam">Loam</option>
                <option value="Sandy">Sandy</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Fertilizer</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none"
                value={formData.fertilizerUsage}
                onChange={(e) => setFormData({...formData, fertilizerUsage: e.target.value})}
              >
                <option value="Organic">Organic</option>
                <option value="Chemical">Chemical</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Recent Pests</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Stem Borer, None"
              className="w-full px-4 py-4 rounded-2xl bg-secondary/5 border-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-secondary/30"
              value={formData.pestHistory}
              onChange={(e) => setFormData({...formData, pestHistory: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
            className="mt-4"
          >
            {loading ? 'Setting up...' : 'Start Farming'}
            {!loading && <ChevronRight size={20} />}
          </Button>
        </form>
      </Card>

      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-[10px] text-secondary/30 font-bold uppercase tracking-[0.2em]">
          Precision Agriculture · Privacy Protected
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
