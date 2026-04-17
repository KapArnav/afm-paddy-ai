"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Briefcase } from 'lucide-react';
import Card from './ui/Card';

interface MarketData {
  price_trend: 'increasing' | 'decreasing' | 'stable';
  demand: 'high' | 'medium' | 'low';
  recommendation: 'sell' | 'hold' | 'wait';
}

const MarketWidget = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card className="h-40 animate-pulse bg-secondary/5" />;
  if (!data) return null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp size={20} className="text-[#2D6A4F]" />;
      case 'decreasing': return <TrendingDown size={20} className="text-alert" />;
      default: return <Minus size={20} className="text-secondary" />;
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">Market Intelligence</h3>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${data.recommendation === 'sell' ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]' : 'bg-accent/10 text-accent'}`}>
          {data.recommendation} Advised
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-xs text-secondary/60 font-bold uppercase tracking-tight">Price Trend</span>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary/5 rounded-xl">
              {getTrendIcon(data.price_trend)}
            </div>
            <span className="text-lg font-bold text-primary capitalize">{data.price_trend}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 items-end">
          <span className="text-xs text-secondary/60 font-bold uppercase tracking-tight">Demand</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary capitalize">{data.demand}</span>
            <div className={`p-2 rounded-xl ${data.demand === 'high' ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]' : 'bg-secondary/5 text-secondary'}`}>
              <Briefcase size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 p-3 bg-primary text-white rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase">AI</div>
        <p className="text-xs font-medium leading-tight">
          Conditions favor a <span className="text-accent underline">&quot;{data.recommendation}&quot;</span> strategy based on current crop dynamics.
        </p>
      </div>
    </Card>
  );
};

export default MarketWidget;
