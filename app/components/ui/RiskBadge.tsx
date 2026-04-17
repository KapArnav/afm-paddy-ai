import React from 'react';

interface RiskBadgeProps {
  level?: string; // Low, Medium, High
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level = 'low' }) => {
  const normalizedLevel = level.toLowerCase();
  
  const colors = {
    low: 'bg-[#E3F9F1] text-[#2D6A4F] border-[#B7E4C7]',
    medium: 'bg-[#FFF9E6] text-[#B8860B] border-[#FFE58F]',
    high: 'bg-[#FEEBEB] text-[#C44536] border-[#FFC1C1]',
  };

  const currentStyle = colors[normalizedLevel as keyof typeof colors] || colors.low;

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentStyle} inline-block`}>
      {level} Risk
    </div>
  );
};

export default RiskBadge;
