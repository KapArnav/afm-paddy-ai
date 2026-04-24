"use client";

import React, { useEffect, useState } from 'react';
import { CloudRain, Droplets } from 'lucide-react';
import Card from './ui/Card';

interface WeatherData {
  temperature?: number;
  humidity?: number;
  rain_probability?: number;
  error?: string;
}

const WeatherWidget = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({ error: 'Weather unavailable' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card className="h-40 animate-pulse bg-secondary/5" />;
  if (!data) return null;

  const hasValidWeather =
    typeof data.temperature === 'number' &&
    typeof data.humidity === 'number' &&
    typeof data.rain_probability === 'number';

  if (!hasValidWeather) {
    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">Field Weather</h3>
          <div className="px-3 py-1 bg-secondary/10 rounded-lg text-secondary text-xs font-bold">OFFLINE</div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-primary">Weather unavailable</span>
          <span className="text-xs text-secondary/60 leading-relaxed">
            Live weather data could not be loaded right now. Check the weather API configuration and try again.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">Field Weather</h3>
        <div className="px-3 py-1 bg-accent/20 rounded-lg text-accent text-xs font-bold">LIVE</div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-4xl font-bold text-primary">{data.temperature}°C</span>
          <span className="text-xs text-secondary/60">Mostly Clear Skies</span>
        </div>
        <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
          <CloudRain size={24} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-secondary/5">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-secondary" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-secondary/40 leading-none">Humidity</span>
            <span className="text-xs font-bold text-primary">{data.humidity}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CloudRain size={16} className="text-secondary" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-secondary/40 leading-none">Rain Prob.</span>
            <span className="text-xs font-bold text-primary">{data.rain_probability}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
