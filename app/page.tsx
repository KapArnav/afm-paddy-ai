"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, ChevronRight, Info, CheckCircle2, Sparkles } from 'lucide-react';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import RiskBadge from './components/ui/RiskBadge';
import WeatherWidget from './components/WeatherWidget';
import MarketWidget from './components/MarketWidget';
import Timeline from './components/Timeline';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { X } from 'lucide-react';
import { ActivePlan } from './types/farm';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [todayTask, setTodayTask] = useState("Routine field inspection and boundary check.");

  useEffect(() => {
    if (activePlan?.farmPlan?.timeline && activePlan?.appliedAt) {
      // @ts-expect-error - Firestore Timestamp cast
      const appliedDate = activePlan.appliedAt.seconds 
        // @ts-expect-error - Firestore Timestamp cast
        ? new Date(activePlan.appliedAt.seconds * 1000) 
        : new Date(activePlan.appliedAt as Date);
      
      const now = Date.now();
      const diffDays = Math.floor((now - appliedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const task = 
        activePlan.farmPlan.timeline.reduce((prev: { day: number, action: string } | null, curr: { day: number, action: string }) => {
        if (curr.day <= diffDays && curr.day > (prev?.day || -1)) return curr;
        return prev;
      }, null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (task) setTodayTask(task.action);
    }
  }, [activePlan]);

  useEffect(() => {
    if (searchParams.get('applied') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowAppliedToast(true);
      const timer = setTimeout(() => setShowAppliedToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push('/auth');
      } else {
        const savedUser = localStorage.getItem('afm_user');
        
        try {
          // Guard: Only fetch if we have a valid UID
          if (!authUser.uid) {
            setLoading(false);
            return;
          }

          const [userRes, planRes] = await Promise.all([
            !savedUser ? fetch(`/api/user`, {
              headers: { 'x-user-id': authUser.uid }
            }) : Promise.resolve(null),
            fetch(`/api/active-plan`, {
              headers: { 'x-user-id': authUser.uid }
            })
          ]);

          if (userRes && userRes.ok) {
            const data = await userRes.json();
            if (data.success && data.user) {
              localStorage.setItem('afm_user', JSON.stringify(data.user));
            } else {
              router.push('/onboarding');
              return;
            }
          } else if (!savedUser && userRes && !userRes.ok) {
            router.push('/onboarding');
            return;
          }

          if (planRes.ok) {
            const planData = await planRes.json();
            setActivePlan(planData.activePlan);
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Dashboard init error:", error);
          router.push('/onboarding'); // Safe fallback if profile is unreachable
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.2em]">Synchronizing Intelligence...</p>
      </div>
    );
  }

  const riskLevel = activePlan?.farmPlan?.farm_summary?.overall_risk || "Normal";
  const keyRecommendation = activePlan?.farmPlan?.farm_summary?.key_issue || "Maintain standard crop monitoring and moisture levels.";
  
  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-500">
      {showAppliedToast && (
        <div className="fixed top-6 left-6 right-6 z-[100] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={18} className="text-accent" />
            </div>
            <p className="text-sm font-bold">Plan successfully applied to your field</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-col">
          <h2 className="text-secondary font-bold text-xs uppercase tracking-[0.2em] leading-none mb-1">Current Intelligence</h2>
          <h1 className="text-2xl font-black text-primary">Farm Status Today</h1>
        </div>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Toggle notifications"
          className={`w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center relative
            ${showNotifications ? 'bg-primary text-white shadow-lg' : 'bg-white text-primary card-shadow'}`}
        >
          <Bell size={20} />
          {(activePlan?.alerts?.length || 0) > 0 && (
            <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full border-2 border-white 
              ${showNotifications ? 'bg-accent' : 'bg-alert'}`} />
          )}
        </button>
      </div>

      {showNotifications && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md mt-16 relative animate-in slide-in-from-top-4 duration-500 overflow-visible">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <h3 className="font-bold text-sm text-primary uppercase tracking-widest leading-none">Intelligence Alerts</h3>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {activePlan?.alerts && activePlan.alerts.length > 0 ? (
                activePlan.alerts.map((alert: string, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/5 border-l-4 border-alert flex items-start gap-3">
                    <p className="text-xs font-bold text-primary leading-tight">{alert}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-secondary/5 flex items-center justify-center text-secondary/30">
                    <Bell size={24} />
                  </div>
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">No active alerts</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowNotifications(false)}
              className="mt-6 w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors"
            >
              Clear View
            </button>
            
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
          </Card>
        </div>
      )}

      <Card padding="large" className="bg-primary text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Field Condition</span>
            <RiskBadge level={riskLevel} />
          </div>
          
          <div className="flex flex-col gap-1">
            <p className="text-sm opacity-80 font-medium tracking-tight">Today&apos;s Primary Task</p>
            <h3 className="text-xl font-bold leading-tight">
              {todayTask}
            </h3>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-accent">
            <Info size={14} />
            {activePlan ? "Based on active AI strategy" : "Based on standard monitoring"}
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <WeatherWidget />
        <MarketWidget />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-secondary uppercase tracking-widest tracking-tight">Critical Insight</h3>
        </div>
        <div className="p-5 bg-white rounded-3xl card-shadow border-l-4 border-accent flex flex-col gap-2">
           <h4 className="font-bold text-primary text-sm flex items-center gap-2">
             <Sparkles size={14} className="text-accent" />
             Strategic Path
           </h4>
           <p className="text-xs text-secondary/80 leading-relaxed font-medium italic">
             &quot;{keyRecommendation}&quot;
           </p>
        </div>
      </div>

      {activePlan && (
        <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm text-secondary uppercase tracking-widest leading-none">Strategy Roadmap</h3>
            <div className="px-2 py-1 bg-primary/10 rounded text-[10px] font-black text-primary leading-none uppercase">30 Day Path</div>
          </div>
          <Card>
            <Timeline items={activePlan.farmPlan.timeline} />
          </Card>
        </div>
      )}

      <Button 
        variant="accent" 
        fullWidth 
        className="mt-2 py-5"
        onClick={() => router.push('/generate')}
      >
        <span className="flex items-center gap-2">
          {activePlan ? "Update Farm Strategy" : "Generate First Plan"}
          <ChevronRight size={20} />
        </span>
      </Button>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="p-6 flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.2em]">Loading...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
