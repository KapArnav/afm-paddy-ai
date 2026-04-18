"use client";

import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ActivePlan } from '../types/farm';

const HistoryPage = () => {
  const router = useRouter();
  const [history, setHistory] = useState<ActivePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
      } else {
        try {
          const res = await fetch(`/api/farm-history`, {
            headers: { 'x-user-id': user.uid }
          });
            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                const sorted = (data.history || []).sort((a: ActivePlan, b: ActivePlan) => {
                  // @ts-expect-error - Firestore Timestamp cast
                  const timeA = a.createdAt?.seconds || 0;
                  // @ts-expect-error - Firestore Timestamp cast
                  const timeB = b.createdAt?.seconds || 0;
                  return timeB - timeA;
                });
                setHistory(sorted);
              }
            }
        } catch (error) {
          console.error("Failed to fetch history:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="p-6 flex flex-col gap-6 bg-background min-h-screen">
      <div className="flex flex-col gap-2 mt-4">
        <h2 className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em] leading-none mb-1">Archive</h2>
        <h1 className="text-xl font-black text-primary">Farm History</h1>
      </div>

      {loading ? (
        <Card className="h-40 animate-pulse bg-secondary/5" />
      ) : (
        <div className="flex flex-col gap-4">
          {history.length === 0 ? (
            <p className="text-secondary text-sm font-medium italic px-2">No historical plans found yet. Generate your first plan!</p>
          ) : (
             history.map((record) => (
               <Card 
                 key={record.id} 
                 className="flex flex-col gap-3 border-l-4 border-secondary opacity-80 hover:opacity-100 transition-all cursor-pointer hover:translate-x-1"
                 onClick={() => {
                   localStorage.setItem('afm_latest_result', JSON.stringify({
                     success: true,
                     plan: record.farmPlan,
                     alerts: record.alerts,
                     planId: record.id
                   }));
                   router.push('/results');
                 }}
               >
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-secondary/40 tracking-widest">Plan #{record.id.slice(0, 6)}</span>
                   <div className="flex items-center gap-1 text-[8px] font-black text-secondary">
                     <Clock size={10} />
                     {/* @ts-expect-error - Firestore Timestamp cast */}
                     {new Date((record.createdAt?.seconds || 0) * 1000).toLocaleDateString()}
                   </div>
                 </div>
                 <h4 className="font-bold text-primary">{record.farmPlan?.market_strategy?.action || "Generated Strategy"}</h4>
                 <p className="text-xs text-secondary/60 line-clamp-2">{record.farmPlan?.farm_summary?.key_issue}</p>
               </Card>
             ))
          )}
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
        <HistoryIcon size={48} strokeWidth={1} />
        <p className="text-xs font-black uppercase tracking-widest text-center">End of history</p>
      </div>
    </div>
  );
};

export default HistoryPage;
