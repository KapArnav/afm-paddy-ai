"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { User, MapPin, Leaf, ShieldCheck, Mail, LogOut } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UserProfile } from '../types/farm';

type StoredUserProfile = UserProfile & { id?: string };

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<StoredUserProfile | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push('/auth');
      } else {
        try {
          if (!authUser.uid) return;
          
          const userSnap = await getDoc(doc(db, 'users', authUser.uid));
          if (userSnap.exists()) {
            const userData = {
              uid: authUser.uid,
              id: userSnap.id,
              ...userSnap.data(),
            } as StoredUserProfile;
            setUser(userData);
            localStorage.setItem('afm_user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Profile re-fetch error:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      localStorage.clear();
      router.push('/auth');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 bg-background min-h-screen">
      <div className="flex flex-col gap-2 mt-4">
        <h2 className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em] leading-none mb-1">Account</h2>
        <h1 className="text-xl font-black text-primary">Farm Profile</h1>
      </div>

      <Card className="flex flex-col items-center py-10 gap-4 bg-primary text-white">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
          <User size={40} />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black">{(auth?.currentUser?.displayName || user?.name || 'Farmer Name') as string}</h3>
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center justify-center gap-1">
            <MapPin size={12} /> {(user?.location || 'Location Not Set') as string}
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest px-1">Farm Details</h3>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-secondary/5 pb-3">
            <div className="flex items-center gap-3">
              <Leaf size={18} className="text-secondary" />
              <span className="text-sm font-bold text-primary">Main Crop</span>
            </div>
            <span className="text-sm font-black text-primary uppercase tracking-wider">{(user as { cropType?: string })?.cropType || 'Paddy'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-secondary/5 pb-3">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-secondary" />
              <span className="text-sm font-bold text-primary">Intelligence Access</span>
            </div>
            <span className="text-[10px] font-black text-[#2D6A4F] uppercase px-2 py-0.5 bg-[#2D6A4F]/10 rounded">PREMIUM</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-secondary" />
              <span className="text-sm font-bold text-primary">Account Email</span>
            </div>
            <span className="text-[10px] font-black text-primary opacity-60">{auth?.currentUser?.email || 'N/A'}</span>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Button variant="ghost" fullWidth className="text-alert" onClick={handleLogout}>
          <LogOut size={18} />
          Log Out Account
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
