import NextAuth from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Create and export the route handler using imported authOptions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 