'use client';

import { useRouter } from 'next/navigation';
import { Wrench } from 'phosphor-react';

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="text-3xl font-bold text-blue-600">😽 KopyKat</div>
          <div className="p-4 bg-white border-2 border-black shadow-brutal rounded-none">
            <Wrench size={48} className="text-blue-600 mx-auto mb-4" weight="duotone" />
            <h1 className="text-2xl font-bold text-zinc-900 mb-3">System Maintenance</h1>
            <p className="text-zinc-600">
              We're making KopyKat even better! Our system is currently undergoing maintenance. 
              Please check back soon for an improved content generation experience.
            </p>
          </div>
          <div className="text-sm text-zinc-500">
            Expected completion: Soon™
          </div>
        </div>
      </div>
    </div>
  );
} 