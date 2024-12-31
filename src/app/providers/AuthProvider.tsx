'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    const isAuthRoute = pathname.startsWith('/(authenticated)') || pathname === '/generate' || pathname === '/posts' || pathname === '/calendar';
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!session && isAuthRoute) {
      router.push('/login');
    } else if (session && isAuthPage) {
      router.push('/generate');
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
} 