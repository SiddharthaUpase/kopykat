import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/generate');
  } else {
    redirect('/login');
  }
}
