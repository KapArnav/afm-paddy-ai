import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  variant?: 'white' | 'glass';
}

const Card: React.FC<CardProps> = ({ 
  children = null, 
  className = '', 
  padding = 'medium',
  variant = 'white',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const variants = {
    white: 'bg-card',
    glass: 'glass',
  };

  return (
    <div className={`rounded-3xl card-shadow ${variants[variant]} ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
