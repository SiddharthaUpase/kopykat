'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 