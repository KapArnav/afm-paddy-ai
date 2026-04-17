import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children = null, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-6 py-4 rounded-2xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:brightness-110 card-shadow',
    secondary: 'bg-secondary text-white hover:brightness-110',
    accent: 'bg-accent text-primary hover:brightness-110',
    outline: 'border-2 border-primary text-primary bg-transparent',
    ghost: 'text-primary bg-transparent hover:bg-primary/5',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
