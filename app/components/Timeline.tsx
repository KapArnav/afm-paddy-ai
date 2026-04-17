import React from 'react';

interface TimelineItem {
  day: number;
  action: string;
  reason: string;
  priority: string;
  category: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-secondary/10">
      {items.map((item, index) => {
        const isHigh = item.priority === 'High';
        const isExpanded = expandedIndex === index;
        
        return (
          <div 
            key={index} 
            className={`flex gap-4 relative z-10 transition-all duration-300 cursor-pointer p-2 rounded-2xl
              ${isExpanded ? 'bg-secondary/5 -mx-2 translate-x-1' : 'hover:translate-x-1'}`}
            onClick={() => setExpandedIndex(isExpanded ? null : index)}
          >
            <div className={`mt-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white shrink-0
              ${isHigh ? 'border-alert text-alert' : 'border-secondary text-secondary'}`}>
              <div className={`w-2 h-2 rounded-full ${isHigh ? 'bg-alert' : 'bg-secondary'}`} />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase text-secondary/40 tracking-widest leading-none">Day {item.day}</span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight 
                  ${isHigh ? 'bg-alert/10 text-alert' : 'bg-secondary/10 text-secondary'}`}>
                  {item.category}
                </span>
              </div>
              <h4 className={`font-bold text-primary leading-snug transition-all ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                {item.action}
              </h4>
              
              {!isExpanded && (
                <p className="text-[10px] text-secondary/60 leading-relaxed font-medium italic line-clamp-1">
                  &quot;{item.reason}&quot;
                </p>
              )}

              {isExpanded && (
                <div className="mt-3 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex flex-col gap-2">
                    <span className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Implementation Steps</span>
                    <div className="flex flex-col gap-2">
                      {(item.steps || ["Assess field conditions", "Execute primary action", "Monitor results"]).map((step, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <div className="w-1 h-1 rounded-full bg-accent shrink-0" />
                          <p className="text-xs font-bold text-primary/80">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-secondary/5">
                    <span className="text-[8px] font-black uppercase text-secondary/40 tracking-widest leading-none">AI Strategic Reasoning</span>
                    <p className="text-xs text-secondary/70 leading-relaxed font-medium italic">
                      &quot;{item.reason}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
