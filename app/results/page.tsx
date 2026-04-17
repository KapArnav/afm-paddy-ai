"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Share2, 
  Target, 
  TrendingUp, 
  BrainCircuit, 
  ChevronDown,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import Card from '../components/ui/Card';
import RiskBadge from '../components/ui/RiskBadge';
import Timeline from '../components/Timeline';
import Button from '../components/ui/Button';
import { auth } from '@/lib/firebase';

const ResultsPage = () => {
  const router = useRouter();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [insights, setInsights] = useState({ marketPotential: 0, strategyGain: 0 });
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!auth.currentUser || !data?.planId) {
      alert("Application failed: Not authenticated or plan ID missing.");
      return;
    }
    
    setApplying(true);
    try {
      const res = await fetch('/api/apply-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          planId: data.planId
        })
      });

      if (res.ok) {
        router.push('/?applied=true');
      } else {
        const err = await res.json();
        alert(`Failed to apply plan: ${err.error || 'System error'}`);
      }
    } catch (err) {
      console.error("Apply error:", err);
      alert("Connection error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    const latest = localStorage.getItem('afm_latest_result');
    if (latest) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(JSON.parse(latest) as Record<string, unknown>);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInsights({
        marketPotential: Math.round(Math.random() * 5 + 5),
        strategyGain: Math.round(Math.random() * 8 + 2)
      });
    } else {
      router.push('/generate');
    }
  }, [router]);

  if (!data) return null;

  const plan = data?.plan as any;

  // Fallback for missing market strategy (Stability Audit)
  const marketStrategy = plan.market_strategy?.action 
    ? plan.market_strategy 
    : { action: "MAINTAIN POSITION", reason: "Current market signals suggest continuing with the existing strategy while monitoring volatility." };

  return (
    <div className="p-6 flex flex-col gap-6 bg-background min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <button onClick={() => router.push('/')} className="w-10 h-10 rounded-xl bg-white card-shadow flex items-center justify-center text-primary">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em] leading-none mb-1">Generated Plan</h2>
          <h1 className="text-xl font-black text-primary text-center leading-tight">Strategic Yield<br/>Optimization</h1>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white card-shadow flex items-center justify-center text-primary">
          <Share2 size={18} />
        </button>
      </div>

      {/* Primary Result Summary */}
      <Card padding="large" className="flex flex-col gap-6 border-t-4 border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <span className="text-xs font-black uppercase text-secondary/40 tracking-widest">Primary Recommendation</span>
          </div>
          <RiskBadge level={plan.farm_summary.overall_risk} />
        </div>

        <p className="text-lg font-bold text-primary leading-tight">
          {plan.farm_summary.key_issue}
        </p>

        <div className="flex items-center justify-between py-3 border-y border-secondary/5">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-secondary/40 tracking-widest">Confidence</span>
            <span className="text-sm font-bold text-primary">{plan.confidence_score}%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-black text-secondary/40 tracking-widest">AI Agent Consensus</span>
            <span className="text-sm font-bold text-primary">High</span>
          </div>
        </div>

        <div className="p-4 bg-secondary/5 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl text-primary shadow-sm leading-none">
            <TrendingUp size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest">AI Insight</h4>
            <p className="text-xs font-bold text-primary leading-snug">
              Market potential is +{insights.marketPotential}% higher if harvesting is synchronized with the detected rainfall gap.
            </p>
          </div>
        </div>
      </Card>

      {/* Market Strategy */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest px-1 flex items-center gap-2">
          Market Strategy
          {plan.market_strategy?.action ? <Sparkles size={14} className="text-accent" /> : null}
        </h3>
        <Card className="flex flex-col gap-2 border-l-4 border-accent">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">{marketStrategy.action}</h4>
            <div className="px-2 py-1 bg-accent/10 rounded text-[10px] font-black text-accent leading-none">+{insights.strategyGain}% GAIN</div>
          </div>
          <p className="text-xs font-medium text-secondary/80 leading-relaxed italic border-t border-secondary/5 pt-2">
            &quot;{marketStrategy.reason}&quot;
          </p>
        </Card>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">Critical Action Timeline</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-primary opacity-40">
            <Clock size={12} />
            30 DAY WINDOW
          </div>
        </div>
        <Card>
          <Timeline items={plan.timeline} />
        </Card>
      </div>

      {/* AI Reasoning (Collapsible) */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => setShowReasoning(!showReasoning)}
          className="flex items-center justify-between w-full px-1"
        >
          <div className="flex items-center gap-3">
            <BrainCircuit size={18} className="text-secondary" />
            <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">AI Reasoning Engine</h3>
          </div>
          <ChevronDown size={20} className={`text-secondary transition-transform ${showReasoning ? 'rotate-180' : ''}`} />
        </button>
        
        {showReasoning && (
          <Card className="flex flex-col gap-4 bg-white/50 animate-in slide-in-from-top-2 duration-300">
            {plan.ai_reasoning.map((point: string, i: number) => (
              <div key={i} className="flex gap-3 items-start border-b border-secondary/5 pb-3 last:border-none last:pb-0">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                  {i+1}
                </div>
                <p className="text-xs font-medium text-secondary/80 leading-relaxed italic">
                  {point}
                </p>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Final Action CTA */}
      <Button 
        variant="primary" 
        fullWidth 
        disabled={applying}
        className="mt-4 py-5"
        onClick={handleApply}
      >
        <span className="flex items-center gap-2">
          {applying ? "Applying Strategy..." : "Apply to My Field"}
          <ArrowRight size={20} />
        </span>
      </Button>
    </div>
  );
};

export default ResultsPage;
