"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, History, User } from 'lucide-react';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Status', href: '/' },
    { icon: PlusCircle, label: 'Generate', href: '/generate' },
    { icon: History, label: 'History', href: '/history' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  // Hide nav on onboarding and auth
  if (pathname === '/onboarding' || pathname === '/auth') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-lg border-t border-[#1F3D3A]/5 flex items-center justify-center z-50 px-6">
      <div className="w-full max-w-[440px] flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-secondary/60 hover:text-secondary'}`}
            >
              <div className={`p-1 rounded-xl ${isActive ? 'bg-primary/5' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
